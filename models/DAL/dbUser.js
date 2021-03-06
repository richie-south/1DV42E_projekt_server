'use strict';
const User = require('./schemas/user.js');
const co = require('co');

/**
 * [creates new user model for mongodb]
 * @param  {[string]} fbId         [user id from facebook]
 * @param  {[string]} fbProfileImg [facebook profileimage]
 * @param  {[string]} firstName    [first name]
 * @param  {[string]} lastName     [last name]
 * @return {[object]}              [user]
 */
const createNewUser = (fbId, fbProfileImg, firstName, lastName) =>
    new User({
        fbId,
        fbProfileImg,
        name: {
            first: firstName,
            last: lastName
        }
    });

/**
 * [retrives specifik user by fb id]
 * @param  {[string]} fbId [id from user on facebook]
 * @return {[object]}      [user props]
 */
const getUserByFbId = (fbId) =>
    User
        .findOne({ fbId : fbId })
        .exec();

const getAllUserDataByFbId = (fbId) =>
    User
        .findOne({ fbId : fbId })
        .populate('cards')
        .populate({
        	path: 'cards',
        	populate: { path:  'pastUsers',
    		model: 'User' }
      })
        .exec();

/**
 * [gets all users]
 * @return {[promise]} [all user objects]
 */
const getAllUsers = () => User.find({});

/**
 * [gets all cards owned by user]
 * @param  {[string]} fbId [facebook id of a user]
 * @return {[array]}      [array of cards id]
 */
const getUserCardsIdByFbId = (fbId) =>
    new Promise((resolve, reject) => {
        co(function* (){
            const user = yield User
                    .findOne({ fbId: fbId})
                    .select({ cards: 1 });
            if(user === undefined || user === null){ throw 'user of null or undefined'; }
            return user.cards;
        })
        .then((cards) => {
            resolve(cards);
        })
        .catch(e => reject(e));
    });

module.exports = {
    createNewUser,
    getUserByFbId,
    getAllUsers,
    getUserCardsIdByFbId,
    getAllUserDataByFbId
};
