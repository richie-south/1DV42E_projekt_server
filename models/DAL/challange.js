'use strict';

const mongoose = require('mongoose');

const challangeSchema = mongoose.Schema({
    props: {
        healCards: { type: Number, min: 4, default: 4, required: true},
        attackCards: { type: Number, min: 4, default: 4, required: true },
        blockCards: { type: Number, min: 4, default: 4, required: true },
        maxLife: { type: Number, min: 100, default: 100, required: true },
        life: { type: Number, min: 0, default: 100, required: true }
    },

    challanger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challangerCard: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },

    opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    opponentCard: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },

    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Challange', challangeSchema);
