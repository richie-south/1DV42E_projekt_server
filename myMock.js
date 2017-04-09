'use strict';
const db = require('./models/DAL/dbDAL.js');
const dbCard = require('./models/DAL/dbCard.js');
const dbUser = require('./models/DAL/dbUser.js');
const Colors = require('./models/color.js');
const Card = require('./models/DAL/schemas/card.js');
const Lobby = require('./models/DAL/dbLobby.js');
const Challange = require('./socketRoutes/challange.js');
const GameCalculator = require('./models/gameCalculator.js');
const co = require('co');

const challange = new Challange();

const fixForGetSpecifikCard = () => {
    db.Lobby.getCardById('5718df14579601d536e7cccc')
        .then(result => console.log(result))
        .catch(e => console.log(e));
};
//fixForGetSpecifikCard();


const mockData = () => {
    db.createNewPlayerWithCard('FBIDJonsa', 'http://dummyimage.com/480x400/349/000000',
     'Jonas', 'Queen')
        .then(result => console.log(result))
        .catch(e => console.log('Error', e));
};

const getMockUserData = (id) => {
    db.dbUser.getUserByFbId(id)
        .then(result => JSON.stringify(console.log(result), null, 2))
        .catch(e => console.log(e));
};

getMockUserData('102194300204285');

const getMockAllCards = () => {
    dbCard.getAllCards()
        .then(result => console.log(result))
        .catch(e => console.log(e));
};

const getAllUsers = () => {
    dbUser.getAllUsers()
        .then(value => console.log(value))
        .catch(e => console.log(e));
};
//getAllUsers();

const randomColorTest = () => {
    const c = Colors.getRandomColor();
    console.log(c);
};

const updateColor = (id) => {
    const colors = new Colors();
    Card.update({ _id: id }, {
        backgroundCardImg: colors.getRandomColor(),
    }, {multi: false})
    .then(value => dbCard.getAllCards())
    .then(value => console.log(value))
    .catch(e => {
        console.log(e);
    });
};

const addToPastUsers = () => {
    db.addUserToCardPastUsers(
        'bajs millan fb:id',
        '5704fcbc838e8e20191c784d'
    )
    .then(value => console.log(value))
    .catch(e => console.log(e));
};

const getUserByCardId = (id) => {
    db.getUserByCardId(id)
    .then(value => console.log(value))
    .catch(e => console.log('error', e));
};

const getChallange = () => {
    db.dbChallange.getChallangeById('5738c9e0ddaf09c77737b76f')
    .then(value => console.log(value));
};

const getAllChallanges = () => {
    db.dbChallange.getAllChallanges()
    .then(value => console.log(value.length));
};

//getAllChallanges()


const makeNewChallange = () => {
    co(function* (){
        const [challangerCard, opponentCard] = yield [
            db.dbCard.getCardByCardId('5703b3bbd61b52010ec3f591'),
            db.dbCard.getCardByCardId('57386d04639fc48469fb9d35')
        ];

        const [challanger, opponent] = yield [
            db.dbUser.getUserByFbId('10206232596794517'),
            db.dbUser.getUserByFbId('119056678508957'),
        ];

        const game = db.dbChallange.newChallange(
            challanger,
            challangerCard,
            opponent,
            opponentCard
        );
        yield game.save();
        console.log(game);

        return game._id;
    }.bind(this))
    .then(roomId => console.log(roomId))
    .catch(e => console.log(e));
};

const ch = (id) => {
    challange.addRoundData(id, {
        fbId: '10206232596794517',
        cardTypes: [
            1,
            2,
            1
        ]
    });
};

const testOfRules = () => {
    db.dbChallange.getChallangeById('573f1f3f24afabd447f5155d')
        .then(challange => {
            const gameCalculator = new GameCalculator(challange);
            return gameCalculator.roundResult(challange);
        })
        .then(result => console.log(result))
        .catch(e => console.log('errpr, ', e));


};

const getCardsInChallange = () => {
    db.dbChallange.getCardsInChallange('573f1f3f24afabd447f5155d')
    .then(value => console.log(value))
    .catch(e => console.log('error:', e));
};

//getCardsInChallange();

//testOfRules();
//ch('573f1f3f24afabd447f5155d');
//
//getChallange('5738cbc61485bd5f78165317');
//getAllChallanges();
//makeNewChallange();

//errorTest();
//getUserByCardId('57386d04639fc48469fb9d35');
//getUserByCardId('5703b3bbd61b52010ec3f591');

//addToPastUsers();

// mockData();
// getMockUserData();
// getMockAllCards();


// bajs millan fb:id
