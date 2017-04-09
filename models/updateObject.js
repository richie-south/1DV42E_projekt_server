'use strict';

/**
 * [gets a new updated object]
 * @param  {[object]} state    [origin object]
 * @param  {[object]} newState [new object updates]
 * @return {[object]}          [full object with new state values]
 */
const updateObjectProps = (state, newState) => {
    if(newState === null){ return state; }
    const myState = {};
    for (let property in state) {
        if (state.hasOwnProperty(property)) {
            if (newState.hasOwnProperty(property)) {
                myState[property] = newState[property];
            }else {
                myState[property] = state[property];
            }
        }
    }
    return myState;
};

module.exports = {
    updateObjectProps
};
