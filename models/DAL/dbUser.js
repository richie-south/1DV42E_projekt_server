'use strict';
const User = require('./user.js');
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

module.exports = {
    createNewUser,
    getUserByFbId,
    getAllUsers,
    getUserCardsIdByFbId
};
