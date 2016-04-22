'use strict';
// TODO: split file in three (dbCard, dbUser, dbDAL)
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

            const myCard = createNewCard(myUserDoc._id, firstName, myUserDoc.fbProfileImg);
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
            .findOne({ fbId : fbId })
            .exec()
            .then(doc => resolve(doc))
            .catch(e => reject(e));
    });
};

exports.getUserByFbId = getUserByFbId;

const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        User.find({}, function(err, users) {
                if(err){
                    reject(err);
                }
                resolve(users);
            });
    });
};

exports.getAllUsers = getAllUsers;

/**
 * [retrives all cards in mongodb, for development purpoes only]
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

const getCardByCardId = (id) => {
    return new Promise((resolve, reject) => {
        Card
            .findById(id)
            .then(card => resolve(card))
            .catch(e => reject(e));
    });
};

exports.getCardByCardId = getCardByCardId;


/** DEPRICATED
 * [gets all cards for user]
 * @param  {[string]} fbId [fbid of user]
 * @return {[array]}        [array of all user cards]
 */
const getCardsByCreatorId = (fbId) => {
    return new Promise((resolve, reject) => {
        co(function* (){
            const user = yield User
                    .findOne({ fbId: fbId})
                    .select('_id')
                    .exec();
            return Card.find({ _creator: user._id })
                        .exec();
        })
        .then(result => resolve(result))
        .catch(e => reject(e));
    });
};


/**
 * [gets all cards owned by user]
 * @param  {[string]} fbId [facebook id of a user]
 * @return {[array]}      [array of cards id]
 */
const getUserCardsIdByFbId = (fbId) => {
    return new Promise(function(resolve, reject) {
        co(function* (){
            const user = yield User
                    .findOne({ fbId: fbId})
                    .select({ cards: 1 });
            return user.cards;
        })
        .then((cards) => {
            resolve(cards);
        })
        .catch(e => reject(e));
    });
};

const getUserCardsByFbId = (fbId) => {
    return new Promise(function(resolve, reject) {
        co(function* (){
            const cardIds = yield getUserCardsIdByFbId(fbId);
            return Card.find({
                '_id': { $in: cardIds}
            });
        })
        .then((cards) => {
            resolve(cards);
        })
        .catch(e => reject(e));
    });
};

exports.getCardsByCreatorId = getUserCardsByFbId;

const sendCardFromUserToUser = (userOneFbId, cardId, userTwoFbId) => {
    return new Promise((resolve, reject) => {
        co(function* (){
            console.log('addade kort');
            const userA = yield getUserByFbId(userOneFbId);
            const userB = yield getUserByFbId(userTwoFbId);

            const userACards = yield getUserCardsIdByFbId(userA.fbId);
            const cardIdToSend = userACards.filter((card) => {
                if(card.toString() === cardId){
                    return card;
                }
            })[0];
            if(cardIdToSend === undefined){
                throw 'cardId dont belong to user';
            }

            const u = yield User.findOneAndUpdate(
                    { fbId: userOneFbId },
                    { $pull: { cards: cardIdToSend } });

            u.save();
            const cardToSend = yield getCardByCardId(cardIdToSend);
            userB.cards.push(cardToSend);
            return userB.save();

        })
        .then(result => {
            resolve(result);
        }).catch(e => reject(e));
    });
};

exports.sendCardFromUserToUser = sendCardFromUserToUser;
