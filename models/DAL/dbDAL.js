'use strict';

const User = require('./user.js');
const Card = require('./card.js');
const co = require('co');

/**
 * [creates new user model for mongodb]
 * @param  {[string]} fbId         [user id from facebook]
 * @param  {[string]} fbProfileImg [facebook profileimage]
 * @param  {[string]} firstName    [first name]
 * @param  {[string]} lastName     [last name]
 * @return {[object]}              [user]
 */
const createNewUser = (fbId, fbProfileImg, firstName, lastName) => {
    return new User({
        fbId,
        fbProfileImg,
        name: {
            first: firstName,
            last: lastName
        }
    });
};

/**
 * [crates new card model for mongodb]
 * @param  {[string]} creatorId [id of creator of card]
 * @param  {[string]} name      [name of card]
 * @param  {[strinf]} avatar    [image for card]
 * @return {[object]}           [card]
 */
const createNewCard = (creatorId, name, avatar) => {
    return new Card({
        _creator: creatorId,
        name,
        avatar
    });
};

const createNewPlayerWithCard = (fbId, fbProfileImg, firstName, lastName) => {
    return new Promise((resolve, reject) => {
        co(function* (){
            const myUser = createNewUser(fbId, fbProfileImg, firstName, lastName);
            const myUserDoc = yield myUser.save();

            const myCard = createNewCard(myUserDoc._id, myUserDoc.name, myUserDoc.fbProfileImg);
            const myCardDoc = yield myCard.save();

            myUser.cards.push(myCard);
            return myUser.save();
        })
        .then(result => {
            resolve(result);
        }).catch(e => reject(e));
    });
};

exports.createNewPlayerWithCard = createNewPlayerWithCard;

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

exports.createNewCard = createNewCardSave;

/**
 * [retrives specifik user by fb id]
 * @param  {[string]} fbId [id from user on facebook]
 * @return {[object]}      [user props]
 */
const getUserByFbId = (fbId) => {
    return new Promise((resolve, reject) => {
        User
            .find({ fbId : fbId })
            .exec()
            .then(doc => resolve(doc))
            .catch(e => reject(e));
    });
};

exports.getUserByFbId = getUserByFbId;

/**
 * [gets all cards for user]
 * @param  {[string]} userId [id of user]
 * @return {[array]}        [array of all user cards]
 */
const getCardsByCreatorId = (userId) => {
    return new Promise((resolve, reject) => {
        Card
            .find({ _creator: userId })
            .exec()
            .then(doc => resolve(doc))
            .then(doc => reject(doc));
    });
};

exports.getCardsByCreatorId = getCardsByCreatorId;

/**
 * [retrives all cards in mongodb]
 * @return {[array]} [all cards in array]
 */
const getAllCards = () => {
    return new Promise((resolve, reject) => {
        Card
            .find({})
            .then(doc => resolve(doc))
            .catch(e => reject(e));
    });
};

exports.getAllCards = getAllCards;
