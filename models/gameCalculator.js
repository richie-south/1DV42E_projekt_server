'use strict';

const abilityCalculator = require('./abilityCalculator.js');
const unusedType = 10;
const maxNrOfRounds = 3;
const dbStatsMap = [ 'heal', 'attack', 'block' ];
const attack = 1;
const heal = 0;
const block = 2;

/**
 * [gets the initial game state]
 * @param  {[object]} cProps [propertys for a player]
 * @param  {[object]} oProps [propertys for a player]
 * @return {[object]}        [game state]
 */
const getInitialGameState = (cProps, oProps) => {
    return {
        cMaxLife: cProps.maxLife,
        cLife: cProps.life,
        cHealCards: cProps.healCards,
        cAttackCards: cProps.attackCards,
        cBlockCards: cProps.blockCards,

        oMaxLife: oProps.maxLife,
        oLife: oProps.life,
        oHealCards: oProps.healCards,
        oAttackCards: oProps.attackCards,
        oBlockCards: oProps.blockCards,
    };
};

/**
 * [sets the initial state for the game]
 * @param  {[object]} state    [current state]
 * @param  {[object]} newState [part of new state values]
 * @return {[object]}          [full state with new state values]
 */
const updateState = (state, newState) => {
    if(newState === null){ return state; }
    let myState = {};
    myState.cMaxLife = newState.cMaxLife || newState.cMaxLife === 0 ? newState.cMaxLife : state.cMaxLife;
    myState.cLife = newState.cLife || newState.cLife === 0 ? newState.cLife : state.cLife;
    myState.cHealCards = newState.cHealCards || newState.cHealCards === 0 ? newState.cHealCards : state.cHealCards;
    myState.cAttackCards = newState.cAttackCards || newState.cAttackCards === 0 ? newState.cAttackCards : state.cAttackCards;
    myState.cBlockCards = newState.cBlockCards || newState.cBlockCards === 0 ? newState.cBlockCards : state.cBlockCards;

    myState.oMaxLife = newState.oMaxLife || newState.oMaxLife === 0 ? newState.oMaxLife : state.oMaxLife;
    myState.oLife = newState.oLife || newState.oLife === 0 ? newState.oLife : state.oLife;
    myState.oHealCards = newState.oHealCards || newState.oHealCards === 0 ? newState.oHealCards : state.oHealCards;
    myState.oAttackCards = newState.oAttackCards || newState.oAttackCards === 0 ? newState.oAttackCards : state.oAttackCards;
    myState.oBlockCards = newState.oBlockCards || newState.oBlockCards === 0 ? newState.oBlockCards : state.oBlockCards;
    return myState;
};

/**
 * [calculates values for every abillity]
 * @param  {[object]}   stats         [object of values]
 * @param  {[number]}   types         [what type of abillity]
 * @param  {bool} done          [if calculations is done]
 * @param  {[bool]}   nextTypeValue [description]
 * @return {[number]}                 [value or abillity]
 */
const getTypeValue = (stats, types, done, nextTypeValue) =>
    (pos) => {
		if(types[pos] === unusedType){ return 0; }
		if(nextTypeValue && types[pos] === 1){
			if(done){ nextTypeValue = false; }
			return (stats[dbStatsMap[types[pos]]] + stats.attackBoost);
		}
		if(types[pos] === 0){ nextTypeValue = true; }
		if(done){ nextTypeValue = false; }

		return stats[dbStatsMap[types[pos]]];
	};

/**
 * [makes a map of type of abillity and its value]
 * @param  {[object]} cardStats    [object of values
 * @param  {[number]} posOneType   [type of abillity]
 * @param  {[number]} posTwoType   [type of abillity]
 * @param  {[number]} posThreeType [type of abillity]
 * @return {[object]}              [object]
 */
const getRoundDamage = (cardStats, posOneType, posTwoType, posThreeType) => {
    let typeValue = getTypeValue(cardStats, [posOneType, posTwoType, posThreeType], false, false);
    return [
        {
            type: posOneType,
            value: typeValue(0)
        }, {
            type: posTwoType,
            value: typeValue(1)
        }, {
            type: posThreeType,
            value: typeValue(2)
        }
    ];
};

const getRounds = (cCardStats, cPosOneType, cPosTwoType, cPosThreeType,  oCardStats, oPosOneType, oPosTwoType, oPosThreeType) => {
    return [
        getRoundDamage(cCardStats, cPosOneType, cPosTwoType, cPosThreeType),
        getRoundDamage(oCardStats, oPosOneType, oPosTwoType, oPosThreeType)
    ];
};

/**
 * [gets abillity values and decides what abbility function to run]
 * @param  {[object]} cCardStats   [stats for challanger chard]
 * @param  {[object]} cRoundDamage [holding value and type]
 * @param  {[number]} cCardType    [type of card]
 * @param  {[number]} cValue       [value of cRoundDamage]
 * @param  {[object]} oCardStats   [stats for opponent card]
 * @param  {[object]} oRoundDamage [holding value and type]
 * @param  {[number]} oCardType    [type of card]
 * @param  {[number]} oValue       [value of oRoundDamage]
 * @param  {[object]} state        [full state of game]
 * @param  {[number]} i            [iteration nr]
 * @return {[object]}              [new state and posible new roundDamage]
 */
const cardAgainstCard = (cCardStats, cRoundDamage, cCardType, cValue, oCardStats, oRoundDamage, oCardType, oValue, state, i) => {
    switch (true) {
        case (cCardType === oCardType):
            switch (cCardType) {
                case heal: // challanger heal opponent heal
                    return [abilityCalculator.doubbleHeal(
                        state.cLife, cValue, state.cMaxLife, state.cHealCards,
                        state.oLife, oValue, state.oMaxLife, state.oHealCards),
                    null];
                case attack: // challanger attack opponent attack
                    return [ abilityCalculator.doubbleAttack(
                        state.cLife, cValue, state.cAttackCards, state.oLife,
                        oValue, state.oAttackCards),
                    null];
                case block: // challanger block opponent block
                    return [abilityCalculator.doubbleBlock(state.cBlockCards, state.oBlockCards), null];
            }
        break;
        case (cCardType === heal && oCardType === attack): // challanger heal opponent block
            let healAttack = abilityCalculator.healOnAttack(state.cLife, oValue, state.oAttackCards, state.cHealCards);
            let cRD = cRoundDamage.slice(0);
            cRD[i].type = unusedType;
            return [healAttack, [
                getRoundDamage(cCardStats, cRD[0].type, cRD[1].type, cRD[2].type),
                null ]];
        case ( cCardType === attack && oCardType === heal): // challanger attack opponent heal
            let attackHeal = abilityCalculator.attackOnHeal(state.oLife, cValue, state.oHealCards, state.cAttackCards);
            let oRD = oRoundDamage.slice(0);
            oRD[i].type = unusedType;
            return [attackHeal, [
                null,
                getRoundDamage(oCardStats, oRD[0].type, oRD[1].type, oRD[2].type),
            ]];
        case (cCardType === heal && oCardType === block): // challanger heal opponent block
            return [ abilityCalculator.healOnBlock(
                state.cLife, cValue, state.cMaxLife, state.oBlockCards, state.cHealCards),
                null ];
        case ( cCardType === block && oCardType === heal): // challanger block opponent heal
            return [ abilityCalculator.blockOnHeal(
                state.oLife, oValue, state.oMaxLife, state.oHealCards, state.cBlockCards),
                null ];
        case (cCardType === attack && oCardType === block): // challanger attack, opponent block
                return [abilityCalculator.attackOnBlock(
                    cValue, state.oLife, oValue, state.cAttackCards, state.oBlockCards),
                null];
        case (cCardType === block && oCardType === attack): // challanger block, opponent attack
                return [abilityCalculator.blockOnAttack(
                    oValue, state.cLife, cValue, state.oBlockCards, state.cAttackCards),
                null];
    }
};

/**
 * [calculates result(life, cards) of a game round]
 * @param  {[type]} cCard                  [card object]
 * @param  {[type]} challangerRoundsDamage [result from getRoundDamage]
 * @param  {[type]} oCard                  [card object]
 * @param  {[type]} opponentRoundsDamage   [result from getRoundDamage]
 * @param  {[type]} gameState              [state of the game, result of getInitialGameState]
 * @return {[array]}                        [arrya of reuslts of card agains card]
 */
const calculateRoundResult = (cCard, challangerRoundsDamage, oCard, opponentRoundsDamage, gameState) => {
    let results = [];

    for (let i = 0; i < 3; i++) {

        let [newState, rounds] = cardAgainstCard(
            cCard.stats,
            challangerRoundsDamage,
            challangerRoundsDamage[i].type,
            challangerRoundsDamage[i].value,

            oCard.stats,
            opponentRoundsDamage,
            opponentRoundsDamage[i].type,
            opponentRoundsDamage[i].value,
            gameState, i);

        if(rounds !== null){
            let [cRoundsD, oRoundsD] = rounds;
            challangerRoundsDamage = cRoundsD ? cRoundsD : challangerRoundsDamage;
            opponentRoundsDamage = oRoundsD ? oRoundsD : opponentRoundsDamage;
        }
        results.push(updateState(gameState, newState));
        gameState = updateState(gameState, newState);
    }
    return results;
};

/**
 * [gets the last value in array]
 * @param  {[array]} a [array of anny value]
 * @return {[-]}   [last value in array]
 */
const getLastItemInArray = (a) => a[a.length - 1];

/**
 * [Calculates result of latest game round]
 * @param  {[object]} challange [instance of at challange]
 * @return {[array]}           [array with all the game values]
 */
const getRoundResult = (challange) => {
    let cRound = getLastItemInArray(challange.challangerRounds);
    let oRound = getLastItemInArray(challange.opponentRounds);
    return calculateRoundResult(
        challange.challangerCard,
        getRoundDamage(
            challange.challangerCard.stats,
            cRound.cardPosOne,
            cRound.cardPosTwo,
            cRound.cardPosThree),

        challange.opponentCard,
        getRoundDamage(
            challange.opponentCard.stats,
            oRound.cardPosOne,
            oRound.cardPosTwo,
            oRound.cardPosThree),
        getInitialGameState(challange.challangerProps, challange.opponentProps));
};

/**
 * [checks if game is over]
 * @param  {[]} roundResult [description]
 * @param  {[]} roundNr     [description]
 * @return {[type]}             [description]
 */
const isGameOver = (roundResult, roundNr) => {
    let latestRound = getLastItemInArray(roundResult);
    if(latestRound.cLife <= 0 || latestRound.oLife <= 0){
        return true;
    }
    return roundNr === maxNrOfRounds;
};


module.exports = {
    isGameOver,
    getRoundResult,
    getRounds,
    getLastItemInArray
};
