'use strict';

const abilityCalculator = require('./abilityCalculator.js');
const unusedType = 10;
const maxNrOfRounds = 3;

const GameCalculator = class {
    constructor(challange) {

        this.nextTypeValue = false;
        this.dbStatsMap = [
            'heal',
            'attack',
            'block'
        ];
    }

    isGameOver(roundResult, roundNr){
        if(roundResult[roundResult.length -1].cLife <= 0 ||
            roundResult[roundResult.length -1].oLife <= 0){
            return true;
        }
        return roundNr === maxNrOfRounds;
    }

    roundResult(challange){
        return this.calculateRoundResult(
            challange.challangerCard,
            challange.challangerProps,
            challange.challangerRounds,

            challange.opponentCard,
            challange.opponentProps,
            challange.opponentRounds);
    }

    getInitialState(cProps, oProps){
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
    }

    getRounds(){
        return [
            this.challangerRoundsDamage,
            this.opponentRoundsDamage
        ];
    }

    calculateRoundResult(cCard, cProps, cRounds, oCard, oProps, oRounds){
        let state = this.getInitialState(cProps, oProps);
        let results = [];
        const cRound = cRounds[cRounds.length-1];
        const oRound = oRounds[oRounds.length-1];

        let challangerRoundsDamage = this.getRoundDamage(
            cCard.stats,
            cRound.cardPosOne,
            cRound.cardPosTwo,
            cRound.cardPosThree);

        let opponentRoundsDamage = this.getRoundDamage(
            oCard.stats,
            oRound.cardPosOne,
            oRound.cardPosTwo,
            oRound.cardPosThree);
        // deep copy array
        this.challangerRoundsDamage = JSON.parse(JSON.stringify(challangerRoundsDamage));
        this.opponentRoundsDamage = JSON.parse(JSON.stringify(opponentRoundsDamage));

        for (let i = 0; i < 3; i++) {

            let [newState, rounds] = this.cardAgainstCard(
                cCard.stats,
                challangerRoundsDamage,
                challangerRoundsDamage[i].type,
                challangerRoundsDamage[i].value,

                oCard.stats,
                opponentRoundsDamage,
                opponentRoundsDamage[i].type,
                opponentRoundsDamage[i].value,
                state, i);

            if(rounds !== null){
                let [cRoundsD, oRoundsD] = rounds;
                challangerRoundsDamage = cRoundsD ? cRoundsD : challangerRoundsDamage;
                opponentRoundsDamage = oRoundsD ? oRoundsD : opponentRoundsDamage;
            }
            results.push(this.updateState(state, newState));
            state = this.updateState(state, newState);
        }
        return results;
    }

    updateState(state, newState){
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
    }

    cardAgainstCard(cCardStats, cRoundDamage, cCardType, cValue, oCardStats, oRoundDamage, oCardType, oValue, state, i){
        switch (true) {
            case (cCardType === oCardType):
				switch (cCardType) {
					case 0: // challanger heal opponent heal
                        return [abilityCalculator.doubbleHeal(
                            state.cLife, cValue, state.cMaxLife, state.cHealCards,
                            state.oLife, oValue, state.oMaxLife, state.oHealCards),
                        null];
					case 1: // challanger attack opponent attack
                        return [ abilityCalculator.doubbleAttack(
                            state.cLife, cValue, state.cAttackCards, state.oLife,
                            oValue, state.oAttackCards),
                        null];
					case 2: // challanger block opponent block
                        return [abilityCalculator.doubbleBlock(state.cBlockCards, state.oBlockCards), null];
				}
			break;
			case (cCardType === 0 && oCardType === 1): // challanger heal opponent block
                let healAttack = abilityCalculator.healOnAttack(state.cLife, oValue, state.oAttackCards, state.cHealCards);
                let cRD = cRoundDamage.slice(0);
                cRD[i].type = unusedType;
                return [healAttack, [
                    this.getRoundDamage(cCardStats, cRD[0].type, cRD[1].type, cRD[2].type),
                    null ]];
            case ( cCardType === 1 && oCardType === 0): // challanger attack opponent heal
                let attackHeal = abilityCalculator.attackOnHeal(state.oLife, cValue, state.oHealCards, state.cAttackCards);
                let oRD = oRoundDamage.slice(0);
                oRD[i].type = unusedType;
                return [attackHeal, [
                    null,
                    this.getRoundDamage(oCardStats, oRD[0].type, oRD[1].type, oRD[2].type),
                ]];
			case (cCardType === 0 && oCardType === 2): // challanger heal opponent block
                return [ abilityCalculator.healOnBlock(
                    state.cLife, cValue, state.cMaxLife, state.oBlockCards, state.cHealCards),
                    null ];
            case ( cCardType === 2 && oCardType === 0): // challanger block opponent heal
                return [ abilityCalculator.blockOnHeal(
                    state.oLife, oValue, state.oMaxLife, state.oHealCards, state.cBlockCards),
                    null ];
			case (cCardType === 1 && oCardType === 2): // challanger attack, opponent block
                    return [abilityCalculator.attackOnBlock(
                        cValue, state.oLife, oValue, state.cAttackCards, state.oBlockCards),
                    null];
            case (cCardType === 2 && oCardType === 1): // challanger block, opponent attack
                    return [abilityCalculator.blockOnAttack(
                        oValue, state.cLife, cValue, state.oBlockCards, state.cAttackCards),
                    null];
        }
    }

    getTypeValue(stats, type, done){
        if(type === unusedType){ return 0; }
        if(this.nextTypeValue && type === 1){
            if(done){ this.nextTypeValue = false; }
            return (stats[this.dbStatsMap[type]] + stats.attackBoost);
        }
        if(type === 0){ this.nextTypeValue = true; }
        if(done){ this.nextTypeValue = false; }

        return stats[this.dbStatsMap[type]];
    }

    getRoundDamage(cardStats, posOneType, posTwoType, posThreeType){
        return [
            {
                type: posOneType,
                value: this.getTypeValue(cardStats, posOneType, false)
            }, {
                type: posTwoType,
                value: this.getTypeValue(cardStats, posTwoType, false)
            }, {
                type: posThreeType,
                value: this.getTypeValue(cardStats, posThreeType, true)
            }
        ];
    }
};


module.exports = GameCalculator;
