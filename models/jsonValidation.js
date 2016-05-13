'use strict';

const joinValidation = (a) => {
    if(!a.hasOwnProperty('add')){ return false; }
    if(!a.hasOwnProperty('card')){ return false; }
    if(!a.card.hasOwnProperty('_id')){ return false; }
    if(!a.card.hasOwnProperty('name')){ return false; }
    if(!a.card.hasOwnProperty('avatar')){ return false; }
    if(!a.card.hasOwnProperty('stats')){ return false; }
    if(!a.card.hasOwnProperty('_creator')){ return false; }
    return true;
};

exports.joinValidation = joinValidation;

const joinLobbyValidation = (a) => {
    if(!a.hasOwnProperty('room')) { return false; }
    if(!a.hasOwnProperty('fbId')) { return false; }
    return true;
};

exports.joinLobbyValidation = joinLobbyValidation;


const testValidation = (a) => {
    if(!a.hasOwnProperty('test')) { return false; }
    if(!a.test) { return false; }
    return true;
};


exports.testValidation = testValidation;
