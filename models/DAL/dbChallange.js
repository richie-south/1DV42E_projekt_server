'use strict';

const Challange = require('./challange.js');
const co = require('co');

/**
 * [makes new challange mongoose object]
 * @param  {[mongoose user Object]} challanger     [description]
 * @param  {[mongoose card Object]} challangerCard [description]
 * @param  {[mongoose user Object]} opponent       [description]
 * @param  {[mongoose card Object]} opponentCard   [description]
 * @return {[object]}                [result of new]
 */
const newChallange = (challanger, challangerCard, opponent, opponentCard) =>
    new Challange({
        challanger,
        challangerCard,
        opponent,
        opponentCard
    }); 

/**
 * [retrives callange object from id]
 * @param  {[string]} id [id of object]
 * @return {[prmise]}    [resolves to object of a challange]
 */
const getChallangeById = (id) =>
    Challange.findOne({ _id: id })
        .populate('challangerCard')
        .populate('challanger')
        .populate('opponent')
        .populate('opponentCard')
        .populate('challangerRounds')
        .populate('opponentRounds')
        .exec();

const getChallangeByIdNoPopulate = (id) =>
    Challange.findOne({ _id: id })
        .exec();

/**
 * [retrives callange object from id, lean from]
 * @param  {[string]} id [id of object]
 * @return {[prmise]}    [resolves to object of a challange]
 */
const getChallangeByIdLean = (id) =>
    Challange.findOne({ _id: id })
        .populate('challangerCard')
        .populate('challanger')
        .populate('opponent')
        .populate('opponentCard')
        .lean()
        .exec();

const getAllChallanges = () => Challange.find({});

module.exports = {
    newChallange,
    getChallangeById,
    getChallangeByIdLean,
    getChallangeByIdNoPopulate,
    getAllChallanges
};
