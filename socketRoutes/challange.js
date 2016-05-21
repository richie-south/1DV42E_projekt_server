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
                const [challangerCard, opponentCard, opponentSocketId] = yield [
                    db.dbCard.getCardByCardId(challangerCardId),
                    db.dbCard.getCardByCardId(opponentCardId),
                    db.Lobby.getCardById(opponentCardId)
                ];

                const [challanger, opponent] = yield [
                    db.dbUser.getUserByFbId(challangeUserFbId),
                    db.getUserByCardId(opponentCard._id)
                ];

                const game = db.dbChallange.newChallange(
                    challanger,
                    challangerCard,
                    opponent,
                    opponentCard
                );
                yield game.save();
                this.sendMessageToPlayer(opponentSocketId.card.socketId, game._id, socket);

                console.log(game._id);
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

    prePlayData(roomId, data, socket){
        socket.broadcast.to(roomId).emit('prePlayData', { add: data.add, pos: data.pos});
        //this.io.sockets.in(roomId).emit('prePlayData', { add: data.add, pos: data.pos});
    }

    calculateRoundResult(challange){
        const gameCalculator = new GameCalculator(challange);
    }

    addRoundData(roomId, data, socket){
        co(function* (){
            const [ challange, gameRound, challangeNoPoop ] = yield [
                db.dbChallange.getChallangeById(roomId),
                db.dbGameRound.newRoundData(
                        data.cardTypes[0],
                        data.cardTypes[1],
                        data.cardTypes[2]),
                db.dbChallange.getChallangeByIdNoPopulate(roomId)
            ];
            const round = yield gameRound.save();

            if(challange.challanger.fbId === data.fbId){
                challangeNoPoop.challangerRounds.push(round);
            }else{
                challangeNoPoop.opponentRounds.push(round);
            }
            const saveResult = yield challangeNoPoop.save();

            /*console.log('saveResult: ', saveResult);
            console.log('cLength: ', challange.challangerRounds.length);
            console.log('oLength: ', challange.opponentRounds.length);*/

            if(challangeNoPoop.challangerRounds.length === challangeNoPoop.opponentRounds.length){
                console.log('Lika långa');
                /*yield this.calculateRoundResult(
                    challange,
                    challange.challangerCard,
                    challange.challangerRounds,
                    challange.opponentCard,
                    challange.opponentRounds
                );*/
            }

        }.bind(this))
        .then(result => console.log(result))
        .catch(e => console.log(e));
    }
};

module.exports = Challange;
