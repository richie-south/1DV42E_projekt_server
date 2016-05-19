'use strict';
const db = require('../models/DAL/dbDAL.js');
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
        db.dbChallange.getChallangeById(roomId)
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
};

module.exports = Challange;
