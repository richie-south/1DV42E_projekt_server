'use strict';

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
        myState.cMaxLife = newState.cMaxLife ? newState.cMaxLife : state.cMaxLife;
        myState.cLife = newState.cLife ? newState.cLife : state.cLife;
        myState.cHealCards = newState.cHealCards ? newState.cHealCards : state.cHealCards;
        myState.cAttackCards = newState.cAttackCards ? newState.cAttackCards : state.cAttackCards;
        myState.cBlockCards = newState.cBlockCards ? newState.cBlockCards : state.cBlockCards;

        myState.oMaxLife = newState.oMaxLife ? newState.oMaxLife : state.oMaxLife;
        myState.oLife = newState.oLife ? newState.oLife : state.oLife;
        myState.oHealCards = newState.oHealCards ? newState.oHealCards : state.oHealCards;
        myState.oAttackCards = newState.oAttackCards ? newState.oAttackCards : state.oAttackCards;
        myState.oBlockCards = newState.oBlockCards ? newState.oBlockCards : state.oBlockCards;
        return myState;
    }

    cardAgainstCard(cCardStats, cRoundDamage, cCardType, cValue, oCardStats, oRoundDamage, oCardType, oValue, state, i){

        switch (true) {
            case (cCardType === oCardType):
				switch (cCardType) {
					case 0:
                        return [ this.doubbleHeal(
                                this.heal( state.cLife, cValue, state.cMaxLife),
                                this.heal( state.oLife, oValue, state.oMaxLife), state),
                            null ];
					case 1:
                        return [ this.doubbleAttack(
                                this.attack( state.cLife, (oValue / 2)),
                                this.attack( state.oLife, (cValue / 2)), state),
                            null ];
					case 2:
                        return [this.doubbleBlock(state), null];
				}
			break;
			case (cCardType === 0 && oCardType === 1):
                let healAttack = this.healOnAttack(this.attack(state.cLife, oValue), state);
                let cRD = cRoundDamage.splice(0);
                cRD[i].type = unusedType;

                return [healAttack, [
                    this.getRoundDamage(cCardStats, cRD[0].type, cRD[1].type, cRD[2].type),
                    null ]];
            case ( cCardType === 1 && oCardType === 0):
                let attackHeal = this.attackOnHeal(this.attack(state.oLife, cValue), state);
                let oRD = oRoundDamage.splice(0);
                oRD[i].tyoe = unusedType;
                return [attackHeal, [
                    null,
                    this.getRoundDamage(oCardStats, oRD[0].type, oRD[1].type, oRD[2].type),
                ]];
			case (cCardType === 0 && oCardType === 2):
                return [ this.healOnBlock(
                        this.heal( state.cLife, cValue, state.cMaxLife), state),
                    null ];
            case ( cCardType === 2 && oCardType === 0):
                return [ this.blockOnHeal(
                        this.heal(state.olife, oValue, state.oMaxLife), state),
                    null ];
			case (cCardType === 1 && oCardType === 2):
                return [ this.attackOnBlock(
                        this.block(state.oLife, cValue, oValue), state),
                    null ];
            case (cCardType === 2 && oCardType === 1):
                return [ this.blockOnAttack(
                        this.block(state.cLife, oValue, cValue), state),
                    null ];
        }
    }

    healOnAttack(life, state){
        return {
            cHealCards: (state.cHealCards -1),
            cLife: life,

            oAttackCards: (state.oAttackCards -1)
        };
    }

    attackOnHeal(life, state){
        return {
            cAttackCards: (state.cAttackCards -1),

            oHealCards: (state.oHealCards -1),
            oLife: life
        };
    }

    blockOnHeal(life, state){
        return {
            cBlockCards: (state.cBlockCards -1),

            oHealCards: (state.oHealCards -1),
            oLife: life
        };
    }

    healOnBlock(life, state){
        return {
            oBlockCards: (state.oBlockCards -1),

            cHealCards: (state.cHealCards -1),
            cLife: life
        };
    }

    attackOnBlock(life, state){
        return {
            cAttackCards: (state.cAttackCards -1),
            oBlockCards: (state.oBlockCards -1),
            oLife: life
        };
    }

    blockOnAttack(life, state){
        return {
            oAttackCards: (state.oAttackCards -1),
            cBlockCards: (state.cBlockCards -1),
            cLife: life
        };
    }

    doubbleBlock(state){
        return {
            cBlockCards: (state.cBlockCards -1),
            oBlockCards: (state.oBlockCards -1)
        };
    }

    block(life, attack, block){
        return this.attack(life, (attack - block));
    }

    doubbleAttack(attackOne, attackTwo, state){
        return {
            cAttackCards: (state.cAttackCards -1),
            cLife: attackOne,

            oLife: attackTwo,
            oAttackCards: (state.oAttackCards -1)
        };
    }

    attack(life, value){
        return (life - value) < 0 ? 0 : (life - value);
    }

    doubbleHeal(healOne, healTwo, state){
        return {
            cLife: healOne,
            cHealCards: (state.cHealCards -1),

            oLife: healTwo,
            oHealCards: (state.oHealCards -1)
        };
    }

    heal(life, value, max){
        return (max - life) < value ? max : (life + value);
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
