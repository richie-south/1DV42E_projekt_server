'use strict';
const userDAL = require('./models/DAL/dbHelper.js');
const db = require('./models/DAL/dbDAL.js');
userDAL();


const mockData = () => {
    db.createNewPlayerWithCard('bajs millan fb:id', 'http://i.imgur.com/BmgjTCh.jpg', 'millan', 'drake')
        .then(result => console.log(result))
        .catch(e => console.log('Error', e));
};

const getMockUserData = () => {
    db.getUserByFbId('bajs millan fb:id')
        .then(result => console.log(result))
        .catch(e => console.log(e));

};

const getMockAllCards = () => {
    db.getAllCards()
        .then(result => console.log(result))
        .catch(e => console.log(e));
};

mockData();
getMockUserData();
getMockAllCards();
