'use strict';
const db = require('../models/DAL/dbDAL.js');
const GameCalculator = require('../models/gameCalculator.js');
const co = require('co');



const Challange = class {
    constructor(io) {
        this.io = io;
    }

    /**
     * [sends message to specific socket client]
     * @param  {[string]} socketId [id of client]
     * @param  {[string]} roomId   [id of room]
     * @param  {[object]} socket   [socket object]
     */
    sendMessageToPlayer(socketId, roomId, socket){
        socket.broadcast.to('/#'+socketId).emit('newGame', {
            roomId
        });
    }

    /**
     * [crates a new game]
     * @param  {[string]} challangerCardId   [id of a card]
     * @param  {[string]} opponentCardId     [id of a card]
     * @param  {[string]} challangeUserFbId  [facebook id of user]
     * @param  {[object]} socket             [socket objet]
     * @return {[promise]}                    [resolves to id of new game]
     */
    newGame(challangerCardId, opponentCardId, challangeUserFbId, socket){
        return new Promise((resolve, reject) => {
            co(function* (){
                const [challangerCard, opponentCard, opponentSocketId, challanger] = yield [
                    db.dbCard.getCardByCardId(challangerCardId),
                    db.dbCard.getCardByCardId(opponentCardId),
                    db.Lobby.getCardById(opponentCardId),
                    db.dbUser.getUserByFbId(challangeUserFbId)
                ];
                const opponent = yield db.getUserByCardId(opponentCard._id);

                const game = db.dbChallange.newChallange(
                    challanger,
                    challangerCard,
                    opponent,
                    opponentCard
                );
                yield game.save();
                this.sendMessageToPlayer(opponentSocketId.card.socketId, game._id, socket);

                return game._id;
            }.bind(this))
            .then(roomId => resolve(roomId))
            .catch(e => reject(e));

        });
    }

    /**
     * [sends information about game]
     * @param  {[string]} roomId [room to sent to]
     * @param  {[type]} socket [socket object]
     */
    sendGameInfo(roomId, socket, challangerFbId = ''){
        db.dbChallange.getChallangeByIdLean(roomId)
            .then(challange => {
                this.io.in(roomId).emit('gameInfo', {
                    roomId,
                    challange,
                    id: challangerFbId
                });
            })
            .catch(e => console.log('error ', e));
    }

    /**
     * [send game data to other users, before round compeltion]
     * @param  {[string]} roomId [id of room to sent to]
     * @param  {[object]} data   [data to send]
     * @param  {[object]} socket [socket object]
     */
    prePlayData(roomId, data, socket){
        socket.broadcast.to(roomId).emit('prePlayData', { add: data.add, pos: data.pos});
        //this.io.sockets.in(roomId).emit('prePlayData', { add: data.add, pos: data.pos});
    }

    /**
     * [sends result of round]
     * @param  {[string]} roomId         [id of room to send to]
     * @param  {[bool]} gameOver       [if game is over or not]
     * @param  {[array]} roundResult    [result of round]
     * @param  {[string]} challangerFbId [fb id of challanger]
     * @param  {[array]} roundCards     [game card layouts]
     */
    sendRoundResult(roomId, gameOver, roundResult, challangerFbId, roundCards){
        this.io.sockets.in(roomId).emit('roundResult', { gameOver, roundResult, challangerFbId, roundCards });
    }

    playerLifeZero(roomId, cLife, oLife){
        return new Promise((resolve, reject) => {
            co(function* (){
                const challange = yield db.dbChallange.getChallangeById(roomId);
                if(cLife === 0){
                    yield db.sendCardFromUserToUser(
                        challange.challanger.fbId,
                        challange.challangerCard._id,
                        challange.opponent.fbId);
                }else{
                    yield db.sendCardFromUserToUser(
                        challange.opponent.fbId,
                        challange.opponentCard._id,
                        challange.challanger.fbId);
                }
            }.bind(this))
            .then(a => resolve(a))
            .catch(e => console.log(e));
        });
    }

    gameOver(roomId){
        return new Promise((resolve, reject) => {
            co(function* (){
                const challange = yield db.dbChallange.getChallangeById(roomId);

                const cLife = challange.challangerProps.life;
                const cMaxLife = challange.challangerProps.maxLife;
                const oLife = challange.opponentProps.life;
                const oMaxLife = challange.opponentProps.maxLife;

                const challangerXp = GameCalculator.calculateXpGain(cMaxLife, cLife, challange.challangerCard.stats.xp);
                const opponentXp = GameCalculator.calculateXpGain(oMaxLife, oLife, challange.opponentCard.stats.xp);

                yield db.dbCard.addXpToCard(challange.challangerCard._id, opponentXp);
                yield db.dbCard.addXpToCard(challange.opponentCard._id, challangerXp);

                if(!(cLife === 0 && oLife === 0) && (cLife === 0 || oLife === 0)){
                    yield this.playerLifeZero(roomId, cLife, oLife);
                }

            }.bind(this))
            .then(a => resolve(a))
            .catch(e => console.log(e));
        });
    }

    /**
     * [sets round against round and gets the result, sends result to clients]
     * @param  {[string]} roomId [id of challange and room]
     */
    startChallange(roomId){
        co(function* (){
            const [challange, challangeNoPoop] = yield [
                db.dbChallange.getChallangeById(roomId),
                db.dbChallange.getChallangeByIdNoPopulate(roomId)];

            const roundResult = GameCalculator.getRoundResult(challange);
            const cRound = GameCalculator.getLastItemInArray(challange.challangerRounds);
            const oRound = GameCalculator.getLastItemInArray(challange.opponentRounds);

            yield db.dbChallange.updateChallangeProps(roomId, roundResult[roundResult.length -1]);

            const isGameOver = GameCalculator.isGameOver(roundResult,
                challangeNoPoop.challangerRounds.length);

            this.sendRoundResult(roomId, isGameOver, roundResult, challange.challanger.fbId,
                GameCalculator.getRounds(
                    challange.challangerCard,
                    cRound.cardPosOne,
                    cRound.cardPosTwo,
                    cRound.cardPosThree,
                    challange.opponentCard,
                    oRound.cardPosOne,
                    oRound.cardPosTwo,
                    oRound.cardPosThree)
            );
            if(isGameOver){
                yield this.gameOver(roomId);
            }

        }.bind(this))
        .catch(e => console.log(e));
    }

    abortChallange(roomId){
        this.io.sockets.in(roomId).emit('gameEnded', { message: 'round not valid' });
    }

    // TODO:refactor this
    // TODO: Ansyng bugg, two users press done btn same time
    addRoundData(roomId, data){
        co(function* (){
            const [ challange, gameRound, challangeNoPoop ] = yield [
                db.dbChallange.getChallangeById(roomId),
                db.dbGameRound.newRoundData( data.cardTypes[0], data.cardTypes[1], data.cardTypes[2]),
                db.dbChallange.getChallangeByIdNoPopulate(roomId)
            ];
            const round = yield gameRound.save();

            if(!GameCalculator.isValidOptions(challange, data.cardTypes, data.fbId)){
                return this.abortChallange(roomId);
            }

            if(challange.challanger.fbId === data.fbId){
                challangeNoPoop.challangerRounds.push(round);
            }else{
                challangeNoPoop.opponentRounds.push(round);
            }
            yield challangeNoPoop.save();

            if(challangeNoPoop.challangerRounds.length === challangeNoPoop.opponentRounds.length){
                console.log('Lika långa');
                this.startChallange(roomId);
            }
        }.bind(this))
        .then()
        .catch(e => console.log(e));
    }
};

module.exports = Challange;
