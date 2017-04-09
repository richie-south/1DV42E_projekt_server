'use strict';

const compose = (a, b) => (c) => a(b(c));
/**
 * [throws error if not number]
 * @param  {[number]} a [any value]
 * @return {[number]}   [same number]
 */
const isNumber = (a) => {
    if(typeof a !== 'number'){ throw new TypeError('argument not number'); }
    return a;
};

/**
 * [checks if a is less than 0 , throws error if true]
 * @param  {[number]} a [any value]
 * @return {[number]}   [same number]
 */
const isOverZero = (a) => {
	if(a < 0){ throw new TypeError('number below zero not allowed'); }
	return a;
};

const isNumberAndOverZero = compose(isNumber, isOverZero);

/**
 * [checks if parameters sent to this functions are valid]
 * @param  {Function} fn      [function to call with ...args]
 * @param  {[type]}   ...args [arguments in array]
 * @return {[type]}           [fn results]
 */
const validate = (validationFn) => (fn, ...args) => {
	args.forEach(validationFn);
	return fn(...args);
};

module.exports = {
    validateIsNumberAndOverZero: validate(isNumberAndOverZero)
};
