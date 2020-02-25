"use strict";
/**
 * Copyright (c) 2019 Alexander Reardon
 */
Object.defineProperty(exports, "__esModule", { value: true });
function arrayEqual(newInputs, lastInputs) {
    // no checks needed if the inputs length has changed
    if (newInputs.length !== lastInputs.length) {
        return false;
    }
    // Using for loop for speed. It generally performs better than array.every
    // https://github.com/alexreardon/memoize-one/pull/59
    for (let i = 0; i < newInputs.length; i++) {
        // using shallow equality check
        if (newInputs[i] !== lastInputs[i]) {
            return false;
        }
    }
    return true;
}
exports.arrayEqual = arrayEqual;
function memoizeOne(resultFn, isEqual = arrayEqual) {
    let lastThis;
    let lastArgs = [];
    let lastResult;
    let calledOnce = false;
    // breaking cache when context (this) or arguments change
    function memoized(...newArgs) {
        if (calledOnce && lastThis === this && isEqual(newArgs, lastArgs)) {
            return lastResult;
        }
        // Throwing during an assignment aborts the assignment: https://codepen.io/alexreardon/pen/RYKoaz
        // Doing the lastResult assignment first so that if it throws
        // nothing will be overwritten
        lastResult = resultFn.apply(this, newArgs);
        calledOnce = true;
        lastThis = this;
        lastArgs = newArgs;
        return lastResult;
    }
    return memoized;
}
exports.memoizeOne = memoizeOne;
