'use strict';
const db = require('../models/DAL/dbDAL.js');

module.exports = class {
    constructor(io) {
        this.io = io;
        this.lobby = [];
    }

    emitLobby() {
        this.io.sockets.to('lobby').emit('update', this.lobby);
    }

    /**
     * [runs when somone wants to add card to lobby]
     * @param  {[object]} card [card object]
     */
    onLobbyAddCard(card) {
        this.onAddCardToLobby(card);
    }

    /**
     * [emits lobby if someone joins it]
     */
    onLobbyJoin() {
        this.emitLobby();
    }

    /**
     * [adds card to lobby]
     * @param  {[object]} card [card object]
     */
    onAddCardToLobby(card){
        db.getCardByCardId(card._id)
            .then((card) => {
                this.lobby.push(card);
                this.emitLobby();
            })
            .catch((e) =>
                console.log('Could not add to lobby: ', e));
    }

    /**
     * [runs when someone wants to leave lobby]
     * @param  {[string]} fbId [facebook user id]
     */
    onLobbyLeave(fbId) {
        db.getUserByFbId(fbId)
            .then(user => db.getCardsByCreatorId(user.fbId))
            .then(cards => {
                return cards.map(card => this.getIndexOfCardInLobby(this.lobby, card._id))
                .filter(i => i !== undefined);
            })
            .then(lobbyCardIds => {
                lobbyCardIds.forEach(id => {
                    this.removeFromLobby(id);
                });
                this.emitLobby();
            })
            .catch((e) =>
                console.log('Could not remove alla cards from lobby: ', e));
    }

    /**
     * [runs when someone wants to remove card from lobby]
     * @param  {[object]} card [card object]
     */
    onRemoveCard(card){
        db.getCardByCardId(card._id)
            .then((card) => {
                this.removeCard(card._id);
                this.emitLobby();
            })
            .catch((e) =>
                console.log('Could not remove card from lobby: ', e));
    }

    /**
     * [removes card from lobby]
     * @param  {[type]} cardId [description]
     * @return {[type]}        [description]
     */
    removeCard(cardId){
        const index = this.getIndexOfCardInLobby(this.lobby, cardId);
        this.removeFromLobby(this.lobby, index);
    }

    /**
     * [removes item at index from array]
     * @param  {[int]} index [index of item to remove]
     * @param  {[array]} array [array to remove item in]
     */
    removeFromLobby(array, index){
        array.splice(index, 1);
    }

    /**
     * [gets index of item in array]
     * @param  {[string]} cardId [id of card]
     * @return {[int]}        [index of item in array]
     */
    getIndexOfCardInLobby(array, cardId){
        return array
            .map((c, index) => {
        		if(c === cardId){
        			return index;
        		}
        	})
            .filter(i => i !== undefined)[0];
    }
};
