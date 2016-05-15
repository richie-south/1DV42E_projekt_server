'use strict';
// TODO: check up post validation
const router = require('express').Router();
const db = require('../models/DAL/dbDAL.js');
const colors = require('colors');

// create new user
router.route('/user/create')
    .post((req, res) => {

        if(!req.body.hasOwnProperty('fbId') ||
            !req.body.hasOwnProperty('fbProfileImg') ||
            !req.body.hasOwnProperty('firstName') ||
            !req.body.hasOwnProperty('lastName')){
                res.status(400).send({ status: 'failed', message: 'invalid props' });
        }

        db.createNewPlayerWithCard(
            req.body.fbId,
            req.body.fbProfileImg,
            req.body.firstName,
            req.body.lastName)
            .then(result => {
                console.log('created new user'.green);
                console.log(result); // TODO: remove test log
                res.json(result);
            })
            .catch(e => res.status(500).send('500'));
    });

// get user
router.route('/user/:fbid')
    .get((req, res) => {
        db.dbUser.getUserByFbId(req.params.fbid)
            .then(result => res.json(result))
            .catch(e => res.status(404).send('404'));
    });

// get user cards
router.route('/user/cards/:fbid')
    .get((req, res) => {
        db.getUserCardsByFbId(req.params.fbid)
            .then(result => res.json(result))
            .catch(e => res.status(404).send('404'));
    });


// remove this later
router.route('/users')
    .get((req, res) => {
        db.getAllUsers()
            .then(result => res.json(result))
            .catch(e => res.status(404).send('404'));
    });


module.exports = router;
