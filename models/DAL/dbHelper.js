'use strict';

const mongoose = require('mongoose');
const config = require('../../config/config.js');

const initilize = () => {
    const db = mongoose.connection;

    db.on('error', function(){
        console.log('db error');
    });

    db.once('open', function(){
        console.log('db open');
    });

    process.on('SIGINT', function() {
        db.close(function() {
            console.log(' Mongoose connection disconnected app termination.');
            process.exit(0);
        });
    });

    mongoose.connect(config.mongoUrl);
};

module.exports = initilize;
