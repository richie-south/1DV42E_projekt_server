'use strict';

const joinValidation = (a) => {
    if(!a.hasOwnProperty('add')){ throw 'missing add'; }
    if(!a.hasOwnProperty('card')){ throw 'missing card'; }
    if(!a.card.hasOwnProperty('_id')){ throw 'missing _id'; }
    if(!a.card.hasOwnProperty('name')){ throw 'missing name'; }
    if(!a.card.hasOwnProperty('avatar')){ throw 'missing avatar'; }
    if(!a.card.hasOwnProperty('stats')){ throw 'missing stats'; }
    if(!a.card.hasOwnProperty('_creator')){ throw 'missing _creator'; }
    console.log('valid');
    return true;
};

exports.joinValidation = joinValidation;
