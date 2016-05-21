'use strict';

const mongoose = require('mongoose');

const gameRoundSchema = mongoose.Schema({
    cardPosOne: { type: Number, required: true },

    cardPosTwo: { type: Number, required: true },

    cardPosThree: { type: Number, required: true },

    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('GameRound', gameRoundSchema);
