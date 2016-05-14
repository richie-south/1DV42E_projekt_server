'use strict';
const db = require('../models/DAL/dbDAL.js');
const dbUser = require('../models/DAL/dbUser.js');
const dbCard = require('../models/DAL/dbCard.js');
const co = require('co');

const Challange = class {
    constructor(io) {
        this.io = io;
    }

    newGame(challangerCardId, opponentCardId){

    }
};

module.exports = Challange;
