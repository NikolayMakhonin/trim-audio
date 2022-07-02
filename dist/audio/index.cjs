'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var audio_trimAudio = require('./trimAudio.cjs');
var audio_normalizeOffsetSimple = require('./normalizeOffsetSimple.cjs');
var audio_normalizeAmplitudeSimple = require('./normalizeAmplitudeSimple.cjs');
var audio_normalizeAmplitudeWithWindow = require('./normalizeAmplitudeWithWindow.cjs');
var audio_normalizeOffsetWithWindow = require('./normalizeOffsetWithWindow.cjs');
var audio_smoothAudio = require('./smoothAudio.cjs');
require('./helpers.cjs');



exports.trimAudio = audio_trimAudio.trimAudio;
exports.normalizeOffsetSimple = audio_normalizeOffsetSimple.normalizeOffsetSimple;
exports.normalizeAmplitudeSimple = audio_normalizeAmplitudeSimple.normalizeAmplitudeSimple;
exports.normalizeAmplitudeWithWindow = audio_normalizeAmplitudeWithWindow.normalizeAmplitudeWithWindow;
exports.normalizeOffsetWithWindow = audio_normalizeOffsetWithWindow.normalizeOffsetWithWindow;
exports.smoothAudio = audio_smoothAudio.smoothAudio;
