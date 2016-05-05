'use strict';

const Lobby = require('./lobby.js');
const co = require('co');

const removeCard = (id) => {
    return new Promise(function(resolve, reject) {
        Lobby.findOne({ 'card._id': id })
            .exec()
            .then((a) => {
                a.remove();
                resolve(true);
            });
    });
};

const createNew = (card) => {
    return new Lobby({
        card
    });
};

const addCard = (card) => {
    return new Promise(function(resolve, reject) {
        const l = createNew(card);
        l.save()
            .then(doc => resolve(doc))
            .catch(e => reject(e));
    });
};

const getAllCards = () => {
    return new Promise((resolve, reject) => {
        Lobby
            .find({})
            .then(doc => resolve(doc))
            .catch(e => reject(e));
    });
};

const getSpecificCard = () => {
    // TODO: implement this function
};

module.exports = {
    removeCard,
    addCard,
    getAllCards,
    getSpecificCard
};
