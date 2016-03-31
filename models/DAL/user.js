'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fbId: { type: String, required: true },
    fbProfileImg: { type: String, required: true },
    name: {
        first: { type: String, required: true },
        last: { type: String, required: true }
    },
    cards: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Card' } ],
    createdAt: { type: Date, required: true, default: Date.now }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
