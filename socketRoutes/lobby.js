'use strict';

module.exports = class {
    constructor(io) {
        this.io = io;
        this.lobby = [];
    }

    emitLobby() {
        this.io.sockets.to('lobby').emit('update', this.lobby);
    }

    onLobbyAddCard(card) {
        this.onAddCardToLoby(card);
        this.emitLobby();
    }

    onLobbyJoin() {
        this.emitLobby();
        console.log(this.lobby);
    }

    onAddCardToLoby(card){
        this.lobby.push(card);
    }

    onLobbyLeave(card) {

        this.emitLobby();
        //console.log(this.lobby);
    }

    onRemoveCard(card){
        this.removeCard(card._id);
        this.emitLobby();
    }

    removeCard(id){
        this.lobby.map((c, index) => {
            if(c._id === id){
                this.lobby.splice(index, 1);
            }
        });
    }
};
