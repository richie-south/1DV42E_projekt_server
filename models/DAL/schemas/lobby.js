'use strict';

const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
// TODO: add long lat
const lobbySchema = mongoose.Schema({
    card: { type: Object, required: true },
});

lobbySchema.plugin(mongooseDelete);

module.exports = mongoose.model('Lobby', lobbySchema);
