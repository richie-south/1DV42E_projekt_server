'use strict';

const GameRound = require('./gameRound.js');
const co = require('co');

const newRoundData = (cardPosOne, cardPosTwo, cardPosThree) => {
    return new GameRound({
        cardPosOne,
        cardPosTwo,
        cardPosThree
    });
};


module.exports = {
    newRoundData
};
