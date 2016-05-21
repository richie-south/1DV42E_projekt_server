'use strict';

const Card = require('./card.js');
const co = require('co');
const Colors = require('../color.js');
const colors = new Colors();
/**
 * [crates new card model for mongodb]
 * @param  {[string]} creatorId [id of creator of card]
 * @param  {[string]} name      [name of card]
 * @param  {[strinf]} avatar    [image for card]
 * @return {[object]}           [card]
 */
const createNewCard = (creatorId, name, avatar) =>
    new Card({
        _creator: creatorId,
        name,
        avatar,
        backgroundCardImg: colors.getRandomColor()
    });
/**
 * [creates new card and saves it]
 * @param  {[string]} creatorId [user id card will belong to]
 * @param  {[string]} name      [name of card]
 * @param  {[string]} avatar    [image for card]
 * @return {[oject]}           [card props]
 */
const createNewCardSave = (creatorId, name, avatar) => {
    return new Promise((resolve, reject) => {
        const myCard = createNewCard(creatorId, name, avatar);
        myCard
            .save()
            .then(doc => resolve(doc))
            .catch(e => reject(e));
    });
};

/**
 * [retrives all cards in mongodb]
 * @return {[array]} [all cards in array]
 */
const getAllCards = () => Card.find({});

/**
 * [returns one card with matching id]
 * @param  {[string]} id [id of a card]
 * @return {[object]}    [card object]
 */
const getCardByCardId = (id) => Card.findById(id);


/**
 * [same as getCardByCardId expet returns pure object and not a mongoose object]
 * @param  {[string]} id [id of a card]
 * @return {[object]}    [card object]
 */
const getCardByCardIdLean = (id) =>
    Card
        .findById(id)
        .lean()
        .exec();

module.exports = {
    createNewCard,
    createNewCardSave,
    getAllCards,
    getCardByCardId,
    getCardByCardIdLean
};
