'use strict';

const abilityCalculator = require('./abilityCalculator.js');
const updateState = require('./updateObject.js').updateObjectProps;
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
 * [gets the last value in array]
 * @param  {[array]} a [array of anny value]
 * @return {[-]}   [last value in array]
 */
const getLastItemInArray = (a) => a[a.length - 1];

/**
 * [gets last item in arrays]
 * @param  {[array]} args [array of arguments]
 * @return {[array]}   [last item in arrays]
 */
const mapFunctionInArray = (a) => (...args) => args.map(a);
const getLastItemInArrays = mapFunctionInArray(getLastItemInArray);

/**
 * [calculates values for every abillity]
 * @param  {[object]}   stats         [object of values]
 * @param  {[number]}   types         [what type of abillity]
 * @param  {[bool]}   nextTypeValue [description]
 * @return {[number]}                 [value or abillity]
 */
const buildGetUnUsedType = (dbStatsMap, unusedType) => (stats, types, nextTypeValue) => (pos) => {
    if(types[pos] === unusedType){ return 0; }
	if(nextTypeValue && types[pos] === 1){
		return (stats[dbStatsMap[types[pos]]] + stats.attackBoost);
	}
	if(types[pos] === 0){ nextTypeValue = true; }

	return stats[dbStatsMap[types[pos]]];
};
const getTypeValues = buildGetUnUsedType(dbStatsMap, unusedType);

/**
 * [makes a map of type of abillity and its value]
 * @param  {[object]} cardStats    [object of values (stats of a card)]
 * @param  {[number]} ...args   [array of type abillity]
 * @return {[object]}              [object]
 */
const getRoundDamage = (cardStats, ...args) => {
    const typeValue = getTypeValues(cardStats, args);
    return args.map((a, i) => {
        return {
            type: a,
            value: typeValue(i)
        };
    });
};

const buildGetRounds = (a) => (cCardStats, cPosOneType, cPosTwoType, cPosThreeType) => (oCardStats, oPosOneType, oPosTwoType, oPosThreeType) =>
    [a(cCardStats, cPosOneType, cPosTwoType, cPosThreeType),
    a(oCardStats, oPosOneType, oPosTwoType, oPosThreeType)];
const getRounds = buildGetRounds(getRoundDamage);

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

    for (let i = 0; i < maxNrOfRounds; i++) {

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

const program = (challange) => {

    const [cRound, oRound] = getLastItemInArrays();
    //
    const [cRoundDamage, oRoundDamage] = getRounds()();
    //
    let gameSate = getInitialGameState();
    //
    return calculateRoundResult();
};


module.exports = {
    getRounds,
    getRoundDamage,
    getLastItemInArray,
    updateState
};
