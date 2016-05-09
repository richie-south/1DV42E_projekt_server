'use strict';

const joinValidation = (a) => {
    if(!a.hasOwnProperty('add')){ throw 'missing add'; }
    if(!a.hasOwnProperty('card')){ throw 'missing card'; }
    if(!a.card.hasOwnProperty('_id')){ throw 'missing _id'; }
    if(!a.card.hasOwnProperty('name')){ throw 'missing name'; }
    if(!a.card.hasOwnProperty('avatar')){ throw 'missing avatar'; }
    if(!a.card.hasOwnProperty('stats')){ throw 'missing stats'; }
    if(!a.card.hasOwnProperty('_creator')){ throw 'missing _creator'; }
    return true;
};

exports.joinValidation = joinValidation;

const joinLobbyValidation = (a) => {
    if(!a.hasOwnProperty('room')) { throw ''; }
    if(!a.hasOwnProperty('fbId')) { throw ''; }
    return true;
};

exports.joinLobbyValidation = joinLobbyValidation;
