'use strict';

module.exports = class {
    constructor(io) {
        this.io = io;
        this.lobby = [];
        this.resetLobby();
    }

    resetLobby(){
        this.lobby = [
            { backgroundCardImg: 'defaultCardImg',
                stats:
                 { lvl: 0,
                   xp: 0,
                   attack: 40,
                   block: 30,
                   heal: 20,
                   attackBoost: 10,
                   healBoost: 0,
                   blockBoost: 0 },
                pastUsers: [],
                createdAt: new Date(),
                __v: 0,
                avatar: 'en bild',
                name: 'Super kalle',
                _creator: 'kalles_id',
                _id: 'kalles_kort_id' }
        ];
    }

    emitLobby() {
        this.io.sockets.to('lobby').emit('update', this.lobby);
    }

    onLobbyJoin(card) {
        this.onAddCardToLoby(card);
        this.emitLobby();
    }

    onAddCardToLoby(card){
        this.lobby.push(card);
    }

    onLobbyLeave(card) {
        this.lobby.map((c, index) => {
            if(c._id === card._id){
                this.lobby.splice(index, 1);
            }
        });
        this.emitLobby();
    }
};
