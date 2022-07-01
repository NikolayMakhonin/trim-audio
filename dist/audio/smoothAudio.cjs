'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var audio_helpers = require('./helpers.cjs');

function _smoothAudio({ samplesData, channelsCount, channel, startSamples, endSamples, }) {
    if (!startSamples && !endSamples) {
        return;
    }
    if (!startSamples) {
        startSamples = 0;
    }
    if (!endSamples) {
        endSamples = 0;
    }
    const samplesCount = Math.floor(samplesData.length / channelsCount);
    if (startSamples + endSamples > samplesCount) {
        const mult = samplesCount / (startSamples + endSamples);
        startSamples *= mult;
        endSamples *= mult;
    }
    if (startSamples) {
        for (let i = 0; i < startSamples; i++) {
            const mult = i / startSamples;
            samplesData[i * channelsCount + channel] *= mult;
        }
    }
    if (endSamples) {
        for (let i = 0; i < endSamples; i++) {
            const mult = i / endSamples;
            samplesData[(samplesCount - 1 - i) * channelsCount + channel] *= mult;
        }
    }
}
function smoothAudio({ samplesData, channelsCount, channels, startSamples, endSamples, }) {
    if (channels == null) {
        channels = audio_helpers.generateIndexArray(channelsCount);
    }
    const channelsLength = channels.length;
    if (channelsLength === 0) {
        return;
    }
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        _smoothAudio({
            samplesData,
            channelsCount,
            channel: channels[nChannel],
            startSamples,
            endSamples,
        });
    }
}

exports.smoothAudio = smoothAudio;
