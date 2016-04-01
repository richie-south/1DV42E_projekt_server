'use strict';
// TODO: check up post validation
const router = require('express').Router();
const db = require('../models/DAL/dbDAL.js');

router.route('/user/create')
    .post((req, res) => {
        let bodyStr = '';
        req.on('data', (chunk) => { // quick fix, body-parser wont work
            bodyStr += chunk.toString();
            const userData = JSON.parse(bodyStr);

            if(!userData.hasOwnProperty('fbId') ||
                !userData.hasOwnProperty('fbProfileImg') ||
                !userData.hasOwnProperty('firstName') ||
                !userData.hasOwnProperty('lastName')){
                    res.status(400).send('400');
            }

            db.createNewPlayerWithCard(
                userData.fbId,
                userData.fbProfileImg,
                userData.firstName,
                userData.lastName)
                .then(result => {
                    console.log(result); // TODO: remove test log
                    res.json(result);
                })
                .catch(e => res.status(500).send('500'));
        });
    });


router.route('/user/:fbid')
    .get((req, res) => {
        db.getUserByFbId(req.params.fbid)
            .then(result => res.json(result))
            .catch(e => res.status(404).send('404'));
    });

router.route('/user/cards/:fbid')
    .get((req, res) => {
        db.getCardsByCreatorId(req.params.fbid)
            .then(result => {
                console.log(result);
                res.json(result);
            })
            .catch(e => res.status(404).send('404'));
    });

module.exports = router;
