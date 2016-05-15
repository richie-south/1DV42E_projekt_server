'use strict';
const db = require('../models/DAL/dbDAL.js');
const dbUser = require('../models/DAL/dbUser.js');
const dbCard = require('../models/DAL/dbCard.js');
const co = require('co');

const lobby = class {
    constructor(io) {
        this.io = io;
        //this.onRemoveCard({_id: "5703b3bbd61b52010ec3f591"});
        //this.onAddCardToLobby({_id: "5718df14579601d536e7cccc"}, 'socketSuperId');
        //this.mockLobby();
    }

    // ads mock card to lobby
    mockLobby(){
        dbUser.getUserByFbId('FBIDIzabella1')
            .then(user => dbCard.getCardByCardId(user.cards[0]))
            .then(db.Lobby.addCard)
            .catch(e => console.log(e));
    }

    emitLobby() {
        return db.Lobby.getAllCards()
            .then(cards => cards.map(card => card.card))
            .then(cards => this.io.sockets.to('lobby').emit('update', cards))
            .catch(e => console.log(e));
    }

    /**
     * [runs when somone wants to add card to lobby]
     * @param  {[object]} card [card object]
     */
    onLobbyAddCard(card, socketId) {
        this.onAddCardToLobby(card, socketId);
    }

    /**
     * [when user joins lobby, checks if anny of user cards is is lobby and updates those cards socketId prop]
     * @param  {[string]} fbId     [facebook id of user who joins]
     * @param  {[string]} socketId [socket   id of user who joins]
     */
    onLobbyJoin(fbId, socketId) {
        co(function* (){
            const myCards = yield db.getUserCardsByFbId(fbId);
            const isMyCardsInLobby = yield myCards
                .map(myCard => db.Lobby.getCardById(myCard._id));
            const myCardsInLobby = isMyCardsInLobby.filter(card => card !== undefined);

            return myCardsInLobby
                .map(lobbyCard =>
                    db.Lobby.updateSocketIdOnCard(lobbyCard.card._id, socketId));
        })
        .then((cards) => this.emitLobby())
        .catch(e => console.log('somthing went wrong while joining lobby: ', e));
    }

    /**
     * [adds card to lobby]
     * @param  {[object]} card [card object]
     */
    onAddCardToLobby(card, socketId){
        return dbCard.getCardByCardIdLean(card._id)
            .then(card => {
                card.socketId = socketId;
                return db.Lobby.addCard(card);
            })
            .then(this.emitLobby.bind(this))
            .catch(e =>
                console.log('Could not add to lobby: ', e));
    }

    /**
     * [runs when someone wants to leave lobby]
     * @param  {[string]} fbId [facebook user id]
     */
    onLobbyLeave(socketId) {
        return db.Lobby.getCardBySocketId(socketId)
            .then(result => Promise.all(result
                .map(lobbyCards => lobbyCards.card._id)
                .map(cardId => db.Lobby.removeCard(cardId)))
            )
            .then(result => this.emitLobby())
            .catch(e =>
                console.log('Could not remove alla cards from lobby: ', e));
    }

    /**
     * [runs when someone wants to remove card from lobby]
     * @param  {[object]} card [card object]
     */
    onRemoveCard(card){
        return dbCard.getCardByCardId(card._id)
            .then(card => this.removeFromLobby(card._id))
            .then(value => this.emitLobby())
            .catch((e) =>
                console.log('Could not remove card from lobby: ', e));
    }

    /**
     * [removes item at index from array]
     * @param  {[int]} index [index of item to remove]
     * @param  {[array]} array [array to remove item in]
     */
    removeFromLobby(id){
        return db.Lobby.removeCard(id);
    }

};

module.exports = lobby;
