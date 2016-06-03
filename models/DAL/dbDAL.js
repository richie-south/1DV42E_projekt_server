'use strict';

const User = require('./schemas/user.js');
const Card = require('./schemas/card.js');
const dbUser = require('./dbUser.js');
const dbCard = require('./dbCard.js');
const Lobby = require('./dbLobby.js');
const dbChallange = require('./dbChallange.js');
const dbGameRound = require('./dbGameRound.js');
const co = require('co');

/**
 * [Creates a new user and asigns a new card to that user]
 * @param  {[string]} fbId         [facebook id of user to be]
 * @param  {[string]} fbProfileImg [url to a image]
 * @param  {[string]} firstName    [first name of user]
 * @param  {[string]} lastName     [last name of user]
 * @return {[promise]}              [resolves to user object]
 */
const createNewPlayerWithCard = (fbId, fbProfileImg, firstName, lastName) =>
    new Promise((resolve, reject) => {
        co(function* (){
            const myUser = dbUser.createNewUser(fbId, fbProfileImg, firstName, lastName);
            const myUserDoc = yield myUser.save();

            const myCard = dbCard.createNewCard(myUserDoc._id, firstName, myUserDoc.fbProfileImg);
            const myCardDoc = yield myCard.save();

            myUser.cards.push(myCard);
            return myUser.save();
        })
        .then(result => resolve(result))
        .catch(e => reject(e));
    });

/** DEPRICATED
 * [gets all cards for user]
 * @param  {[string]} fbId [fbid of user]
 * @return {[promise]}        [resolves to array of all user cards]
 */
const getCardsByCreatorId = (fbId) =>
    new Promise((resolve, reject) => {
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

/**
 * [gets usr owned cards]
 * @param  {[string]} fbId [facebook id of user]
 * @return {[promise]}      [resolves to array of card objects]
 */
const getUserCardsByFbId = (fbId) =>
    new Promise((resolve, reject) => {
        co(function* (){
            const cardIds = yield dbUser.getUserCardsIdByFbId(fbId);
            return Card.find({
                '_id': { $in: cardIds}
            });
        })
        .then(cards => resolve(cards))
        .catch(e => reject(e));
    });

/**
 * [removes a card from a user]
 * @param  {[string]} fbId   [facebook id of a user]
 * @param  {[string]} cardId [id of a card]
 * @return {[promise]}        [resolves to result of save]
 */
const pullCardFromUser = (fbId, cardId) =>
    new Promise((resolve, reject) => {
        return User.findOneAndUpdate( { fbId: fbId },
            { $pull: { cards: cardId } })
            .then(u => u.save())
            .then(result => resolve(result))
            .catch(e => reject(e));
    });


const getUserByCardId = (cardId) =>
    User.findOne({ 'cards': cardId })
        .exec();

/**
 * [adds a card to user mongo object]
 * @param  {[string]} fbId   [facebook id of a user]
 * @param  {[string]} cardId [id of a card]
 * @return {[promise]}        [resolves result of save]
 */
const addCardToUser = (fbId, cardId) =>
    new Promise((resolve, reject) => {
        co(function* (){
            const [ user, card ] = yield [
                dbUser.getUserByFbId(fbId),
                dbCard.getCardByCardId(cardId)
            ];
            user.cards.push(card);
            return user.save();
        })
        .then(result => resolve(result))
        .catch(e => reject(e));
    });

/**
 * [adds a user to cards past users]
 * @param  {[string]} fbId   [facebook id of a ]
 * @param  {[string]} cardId [card id of a card]
 * @return {[promise]}       [resolves to result of card save]
 */
const addUserToCardPastUsers = (fbId, cardId) =>
    new Promise((resolve, reject) => {
        co(function* (){
            const [ user, card ] = yield [
                dbUser.getUserByFbId(fbId),
                dbCard.getCardByCardId(cardId)
            ];

            card.pastUsers.push(user);
            return card.save();
        })
        .then(result => resolve(result))
        .catch(e => reject(e));
    });

/**
 * [transfers a card from a user to another user]
 * @param  {[string]} userOneFbId [facebook id of user, sends card]
 * @param  {[string]} cardId      [id of card to send]
 * @param  {[string]} userTwoFbId [facebook id of user, recives card]
 * @return {[promise]}             [resolves to saved result of userB]
 */
const sendCardFromUserToUser = (userAFbId, cardId, userBFbId) =>
    new Promise((resolve, reject) => {
        co(function* (){
            // retrives the two users
            const [ userA, userB ] = yield [
                dbUser.getUserByFbId(userAFbId),
                dbUser.getUserByFbId(userBFbId)
            ];
            // gets userA cards
            const userACards = yield dbUser.getUserCardsIdByFbId(userA.fbId);
            console.log(userACards);
            // checks if cardId belongs to userA
            const cardIdToSend = userACards.filter(card => {
                if(card.toString() === cardId.toString()){
                    return card;
                }
            })[0];

            // valid cardId
            if(cardIdToSend === undefined || cardIdToSend === null){
                throw 'cardId dont belong to user';
            }
            yield pullCardFromUser(userA.fbId, cardIdToSend);
            yield addUserToCardPastUsers(userA.fbId, cardIdToSend);
            return addCardToUser(userB.fbId, cardIdToSend);
        })
        .then(result => resolve(result))
        .catch(e => reject(e));
    });

module.exports = {
    Lobby,
    dbChallange,
    dbUser,
    dbCard,
    dbGameRound,
    createNewPlayerWithCard,
    getCardsByCreatorId,
    getUserCardsByFbId,
    sendCardFromUserToUser,
    pullCardFromUser,
    addCardToUser,
    addUserToCardPastUsers,
    getUserByCardId
};
