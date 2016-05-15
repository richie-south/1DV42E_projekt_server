'use strict';

const Lobby = require('./lobby.js');
const co = require('co');

/**
 * [removes specifik card by id in lobby]
 * @param  {[string]} id [id of a card]
 * @return {[promise]}    [success or fail]
 */
const removeCard = (id) => {
    return new Promise(function(resolve, reject) {
        Lobby.findOne({ 'card._id': id })
            .exec()
            .then(a => a.remove())
            .then(value => resolve(value))
            .catch(e => reject(e));
    });
};

/**
 * [creats a new lobby card]
 * @param  {[object]} card [card instanse of mongoose schema Card]
 * @return {[object]}      [new instanse of lobby]
 */
const createNew = (card) => {
    return new Lobby({
        card
    });
};

/**
 * [adds card to lobbu]
 * @param  {[object]} card [object of a card that has an instanse of mongoose schema Card]
 * @return {[promise]}      [succsess or fail]
 */
const addCard = (card) => {
    return new Promise(function(resolve, reject) {
        const l = createNew(card);
        l.save()
            .then(doc => resolve(doc))
            .catch(e => reject(e));
    });
};

/**
 * [returns all card i lobby]
 * @return {[promise]} [resolve all cards]
 */
const getAllCards = () => {
    return Lobby.find({});
};

/**
 * [finds specifik card in lobby by id]
 * @param  {[string]} id [id of a card in lobby]
 * @return {[object]}    [object of card in lobby]
 */
const getCardById = (id) => {
    // would like to use simpler form and get data dirr from mongoDb
    // return Lobby.findOne({ 'card._id': id}).exec(); // wont work :S
    return new Promise(function(resolve, reject) {
        co(function* (){
            const allCards = yield getAllCards();

            return allCards
                .filter(lobbyCard => {
                    if(lobbyCard.card._id.toString() === id.toString()){
                        return lobbyCard;
                    }
                })[0];
        })
        .then(doc => resolve(doc))
        .catch(e => reject(e));
    });
};


const getCardBySocketId = (socketId) => {
    return new Promise(function(resolve, reject) {
        co(function* (){
            const allCards = yield getAllCards();
            return allCards
                .filter(lobbyCard => {
                    if(lobbyCard.card.socketId === socketId){
                        return lobbyCard;
                    }
                });
        })
        .then(doc => resolve(doc))
        .catch(e => reject(e));
    });
};

/**
 * [updates socket id property of cards in lobby]
 * @param  {[string]} cardId   [id of a card]
 * @param  {[string]} socketId [new socket id to update card to]
 * @return {[promise]}         [resolves to updated information]
 */
const updateSocketIdOnCard = (cardId, socketId) => {
    return new Promise(function(resolve, reject) {
        co(function* (){
            const card = yield getCardById(cardId);
            return Lobby.update({ _id: card._id }, { 'card.socketId': socketId })
                .exec();
        })
        .then(doc => resolve(doc))
        .catch(e => reject(e));
    });
};

module.exports = {
    removeCard,
    addCard,
    getAllCards,
    getCardById,
    updateSocketIdOnCard,
    getCardBySocketId
};
