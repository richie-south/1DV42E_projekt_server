'use strict';

const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
    _creator : { type: String, ref: 'User' },
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    backgroundCardImg: { type: String, required: true },
    stats: {
        lvl: { type: Number, min: 0, max: 30, default: 0},
        xp: { type: Number, default: 0},
        attack: { type: Number, default: 40 },
        block: { type: Number, default: 30 },
        heal: { type: Number, default: 20 },
        attackBoost: { type: Number, default: 10 },
        healBoost: { type: Number, default:  0 },
        blockBoost: { type: Number, default: 0 }
    },
    pastUsers: [
        { type: Number, ref: 'User' }
    ],
    createdAt: { type: Date, required: true, default: Date.now }
});

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;
