'use strict';

const router = require('express').Router();
const db = require('../models/DAL/dbDAL.js');

const jwt    = require('jsonwebtoken');
const config = require('../config/config.js');

/*const authenticate = (user) => {
    console.log(user);
    if(!user){
        throw 'invalid fbId';
    }

    /*const token = jwt.sign(user, app.get('superSecret'), {
        expiresInMinutes: 1440 // expires in 24 hours
    });*/

    // return the information including token as JSON
    /*res.json({
      success: true,
      message: 'Enjoy your token!',
      token: token
  });*/

/*    return { poop: 'hej'};
};

router.route('/authenticate')
    .post((req, res) => {

        if(!req.body.hasOwnProperty('fbid')){
            res.status(400).send({ status: 'failed', message: 'invalid props' });
        }

        db.getUserByFbId(req.body.fbid)
            .then(result => authenticate(result))
            .then(result => res.json(result))
            .catch(e => res.status(404).send({ status: 'failed', message: e}));
    });


router.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + '/api');
});*/

module.exports = router;
