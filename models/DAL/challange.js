'use strict';

const mongoose = require('mongoose');

const challangeSchema = mongoose.Schema({
    challanger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challangerCard: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    challangerRounds: [ { type: mongoose.Schema.Types.ObjectId, ref: 'GameRound' } ],

    challangerProps: {
        healCards: { type: Number, min: 0, default: 4, required: true},
        attackCards: { type: Number, min: 0, default: 4, required: true },
        blockCards: { type: Number, min: 0, default: 4, required: true },
        maxLife: { type: Number, min: 100, default: 100, required: true },
        life: { type: Number, min: 0, default: 100, required: true }
    },

    // opponent
    opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    opponentCard: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    opponentRounds: [ { type: mongoose.Schema.Types.ObjectId, ref: 'GameRound' } ],

    opponentProps: {
        healCards: { type: Number, min: 0, default: 4, required: true},
        attackCards: { type: Number, min: 0, default: 4, required: true },
        blockCards: { type: Number, min: 0, default: 4, required: true },
        maxLife: { type: Number, min: 100, default: 100, required: true },
        life: { type: Number, min: 0, default: 100, required: true }
    },

    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Challange', challangeSchema);
