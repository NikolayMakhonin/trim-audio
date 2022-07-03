'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const EPSILON = 1e-16;
function checkIsNumber(value) {
    if (typeof value !== 'number' || (value === value) === false) {
        throw new Error('value === ' + value);
    }
    return value;
}
function correctSample(value) {
    value = checkIsNumber(value);
    if (value > 1) {
        throw new Error('value === ' + value);
        // value = 1
    }
    if (value < -1) {
        throw new Error('value === ' + value);
        // value = -1
    }
    return value;
}
function generateIndexArray(length) {
    const array = [];
    for (let i = 0; i < length; i++) {
        array[i] = i;
    }
    return array;
}
function decibelToDispersion(decibel) {
    // see: https://en.wikipedia.org/wiki/Decibel
    const result = Math.pow(10, (decibel / 10));
    return result;
}

exports.EPSILON = EPSILON;
exports.checkIsNumber = checkIsNumber;
exports.correctSample = correctSample;
exports.decibelToDispersion = decibelToDispersion;
exports.generateIndexArray = generateIndexArray;
