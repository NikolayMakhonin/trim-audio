'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var audio_trimAudio = require('./audio/trimAudio.cjs');
var audio_normalizeOffsetSimple = require('./audio/normalizeOffsetSimple.cjs');
var audio_normalizeAmplitudeSimple = require('./audio/normalizeAmplitudeSimple.cjs');
var audio_normalizeAmplitudeWithWindow = require('./audio/normalizeAmplitudeWithWindow.cjs');
var audio_normalizeOffsetWithWindow = require('./audio/normalizeOffsetWithWindow.cjs');
var audio_smoothAudio = require('./audio/smoothAudio.cjs');
require('./audio/helpers.cjs');



exports.trimAudio = audio_trimAudio.trimAudio;
exports.normalizeOffsetSimple = audio_normalizeOffsetSimple.normalizeOffsetSimple;
exports.normalizeAmplitudeSimple = audio_normalizeAmplitudeSimple.normalizeAmplitudeSimple;
exports.normalizeAmplitudeWithWindow = audio_normalizeAmplitudeWithWindow.normalizeAmplitudeWithWindow;
exports.normalizeOffsetWithWindow = audio_normalizeOffsetWithWindow.normalizeOffsetWithWindow;
exports.smoothAudio = audio_smoothAudio.smoothAudio;
