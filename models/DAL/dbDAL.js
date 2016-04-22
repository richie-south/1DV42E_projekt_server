'use strict';

const User = require('./user.js');
const Card = require('./card.js');
const dbUser = require('./dbUser.js');
const dbCard = require('./dbCard.js');
const co = require('co');

/**
 * [Creates a new user and asigns a new card to that user]
 * @param  {[string]} fbId         [facebook id of user to be]
 * @param  {[string]} fbProfileImg [url to a image]
 * @param  {[string]} firstName    [first name of user]
 * @param  {[string]} lastName     [last name of user]
 * @return {[object]}              [user object]
 */
const createNewPlayerWithCard = (fbId, fbProfileImg, firstName, lastName) => {
    return new Promise((resolve, reject) => {
        co(function* (){
            const myUser = dbUser.createNewUser(fbId, fbProfileImg, firstName, lastName);
            const myUserDoc = yield myUser.save();

            const myCard = dbCard.createNewCard(myUserDoc._id, firstName, myUserDoc.fbProfileImg);
            const myCardDoc = yield myCard.save();

            myUser.cards.push(myCard);
            return myUser.save();
        })
        .then(result => {
            resolve(result);
        }).catch(e => reject(e));
    });
};

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
 * [gets usr owned cards]
 * @param  {[string]} fbId [facebook id of user]
 * @return {[array]}      [array of card objects]
 */
const getUserCardsByFbId = (fbId) => {
    return new Promise(function(resolve, reject) {
        co(function* (){
            const cardIds = yield dbUser.getUserCardsIdByFbId(fbId);
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

/**
 * [transfers a card from a user to another user]
 * @param  {[string]} userOneFbId [facebook id of user, sends card]
 * @param  {[string]} cardId      [id of card to send]
 * @param  {[string]} userTwoFbId [facebook id of user, recives card]
 * @return {[object]}             [user object of the user that recived card]
 */
const sendCardFromUserToUser = (userOneFbId, cardId, userTwoFbId) => {
    return new Promise((resolve, reject) => {
        co(function* (){
            console.log('addade kort');
            const userA = yield dbUser.getUserByFbId(userOneFbId);
            const userB = yield dbUser.getUserByFbId(userTwoFbId);

            const userACards = yield dbUser.getUserCardsIdByFbId(userA.fbId);
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
            const cardToSend = yield dbCard.getCardByCardId(cardIdToSend);
            userB.cards.push(cardToSend);
            return userB.save();

        })
        .then(result => {
            resolve(result);
        }).catch(e => reject(e));
    });
};

module.exports = {
    createNewPlayerWithCard,
    getCardsByCreatorId,
    getUserCardsByFbId,
    sendCardFromUserToUser
};
