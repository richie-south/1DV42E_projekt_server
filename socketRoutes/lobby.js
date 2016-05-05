'use strict';
const db = require('../models/DAL/dbDAL.js');
const dbUser = require('../models/DAL/dbUser.js');
const dbCard = require('../models/DAL/dbCard.js');
const dbDAL = require('../models/DAL/dbDAL.js');

const lobby = class {
    constructor(io) {
        this.io = io;
    }

    // ads mock card to lobby
    mockLobby(){
        dbUser.getUserByFbId('FBIDIzabella1')
            .then(user => dbCard.getCardByCardId(user.cards[0]))
            .then(dbDAL.Lobby.addCard)
            .catch(e => console.log(e));
    }

    emitLobby() {
        return dbDAL.Lobby.getAllCards()
            .then(cards => cards.map(card => card.card))
            .then(cards => this.io.sockets.to('lobby').emit('update', cards))
            .catch(e => console.log(e));
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
        return dbCard.getCardByCardId(card._id)
            .then(card =>
                dbDAL.Lobby.addCard(card))
            .then(this.emitLobby.bind(this))
            .catch(e =>
                console.log('Could not add to lobby: ', e));
    }

    /**
     * [runs when someone wants to leave lobby]
     * @param  {[string]} fbId [facebook user id]
     */
    onLobbyLeave(fbId) {
        return dbUser.getUserByFbId(fbId)
            .then(user => db.getCardsByCreatorId(user.fbId))
            .then(cards => {
                return Promise.all(cards.map((card) =>
                    this.removeFromLobby(card._id)));
            })
            .then(this.emitLobby.bind(this))
            .catch((e) =>
                console.log('Could not remove alla cards from lobby: ', e));
    }

    /**
     * [runs when someone wants to remove card from lobby]
     * @param  {[object]} card [card object]
     */
    onRemoveCard(card){
        return dbCard.getCardByCardId(card._id)
            .then((card) => this.removeFromLobby(card._id))
            .then(this.emitLobby.bind(this))
            .catch((e) =>
                console.log('Could not remove card from lobby: ', e));
    }

    /**
     * [removes item at index from array]
     * @param  {[int]} index [index of item to remove]
     * @param  {[array]} array [array to remove item in]
     */
    removeFromLobby(id){
        return dbDAL.Lobby.removeCard(id);
    }

};

module.exports = lobby;
