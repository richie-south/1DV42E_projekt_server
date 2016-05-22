'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const aC = require('./models/abilityCalculator.js');



describe('abillity calculations', function () {

    // attack
    it('attack 40 on 100 life', function(){
        expect(aC.attack(100, 40)).to.equal(60);
    });

    it('attack 1 on 100 life', function(){
        expect(aC.attack(100, 1)).to.not.equal(100);
    });

    it('attack 1000 on 100 life', function(){
        expect(aC.attack(100, 1000)).to.equal(0);
    });

    it('attack 0 on 100 life', function(){
        expect(aC.attack(100, 0)).to.equal(100);
    });

    // heal
    it('heal 20 on 80 life', function(){
        expect(aC.heal(20, 80, 100)).to.equal(100);
    });

    it('heal 1 on 80 life', function(){
        expect(aC.heal(1, 80, 100)).to.not.equal(80);
    });

    it('heal 500 on 80 life', function(){
        expect(aC.heal(500, 80, 100)).to.equal(100);
    });

    it('heal 0 on 80 life', function(){
        expect(aC.heal(0, 80, 100)).to.equal(80);
    });

    // block
    it('block 30 on 40 attack life 100', function(){
        expect(aC.block(100, 40, 30)).to.equal(90);
    });

    it('block 1 on 40 attack life 100', function(){
        expect(aC.block(100, 40, 1)).to.not.equal(60);
    });

    it('block 40 on 40 attack life 100', function(){
        expect(aC.block(100, 40, 40)).to.equal(100);
    });

    it('block 50 on 40 attack life 100', function(){
        expect(aC.block(100, 40, 50)).to.equal(100);
    });

    it('block 1 on 40 attack life 100', function(){
        expect(aC.block(100, 40, 1)).to.equal(61);
    });


    // doubble's
    // attack
    it('challanger life 100, attackValue 40 nr of cards 4 opponent life 100, attackValue 50 nr of cards 2', function(){
        expect(aC.doubbleAttack(100, 40, 4, 100, 50, 2)).to.eql({ cAttackCards: 3, cLife: 75, oAttackCards: 1, oLife: 80 });
    });

    it('challanger life 100, attackValue 0 nr of cards 3 opponent life 80, attackValue 0 nr of cards 1', function(){
        expect(aC.doubbleAttack(75, 0, 3, 80, 0, 1)).to.eql({ cAttackCards: 2, cLife: 75, oAttackCards: 0, oLife: 80 });
    });

    it('challanger life 100, attackValue 200 nr of cards 4 opponent life 100, attackValue 40 nr of cards 2', function(){
        expect(aC.doubbleAttack(100, 200, 4, 100, 40, 4)).to.eql({ cAttackCards: 3, cLife: 80, oAttackCards: 3, oLife: 0 });
    });

    // heal
    it('challanger 10 life, 20 heal 100 max 4 cards opoonent 100 life, 20 heal, 100max 1card', function(){
        expect(aC.doubbleHeal(10, 20, 100, 4, 100, 20, 100, 1)).to.eql({ cHealCards: 3, cLife: 30, oHealCards: 0, oLife: 100 });
    });

    it('challanger 90 life, 100 heal 100 max 4 cards opoonent 100 life, 20 heal, 100max 1card', function(){
        expect(aC.doubbleHeal(90, 100, 100, 4, 100, 100, 100, 1)).to.eql({ cHealCards: 3, cLife: 100, oHealCards: 0, oLife: 100 });
    });

    // block
    it('challanger cards 4 opoonent cards 1', function(){
        expect(aC.doubbleBlock(4, 1)).to.eql({ cBlockCards: 3, oBlockCards: 0 });
    });
});
