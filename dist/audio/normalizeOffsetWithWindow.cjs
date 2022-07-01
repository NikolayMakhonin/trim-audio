'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var audio_helpers = require('./helpers.cjs');

function _normalizeOffsetWithWindow({ samplesData, channelsCount, channel, windowSamples, }) {
    const samplesCount = Math.floor(samplesData.length / channelsCount);
    if (windowSamples < 1) {
        throw new Error('windowSamples should be >= 1');
    }
    const samplesCountHalf = Math.floor(samplesCount / 2);
    if (windowSamples > samplesCountHalf) {
        windowSamples = samplesCountHalf;
    }
    const windowSamplesHalf = Math.ceil(windowSamples / 2);
    const windowSamples2 = windowSamples * 2;
    let offsetPrev = 0;
    let offset = 0;
    let offsetNext = 0;
    let sumNext = 0;
    function _normalize(i) {
        const _windowSamplesHalf = windowSamples - windowSamplesHalf;
        let offsetJ = Math.min(windowSamplesHalf, samplesCount - i + windowSamples2);
        for (let j = 0; j < offsetJ; j++) {
            const index = (i - windowSamples2 + j) * channelsCount;
            const _offset = offsetPrev + (offset - offsetPrev) * (j + _windowSamplesHalf) / windowSamples;
            const value = samplesData[index + channel];
            samplesData[index + channel] = audio_helpers.checkIsNumber(value + _offset);
        }
        offsetJ = Math.min(_windowSamplesHalf, samplesCount - i + windowSamples2 - windowSamplesHalf);
        for (let j = 0; j < offsetJ; j++) {
            const index = (i - windowSamples2 + j + windowSamplesHalf) * channelsCount;
            const _offset = offset + (offsetNext - offset) * j / windowSamples;
            const value = samplesData[index + channel];
            samplesData[index + channel] = audio_helpers.checkIsNumber(value + _offset);
        }
    }
    for (let i = 0; i < samplesCount; i++) {
        if (i % windowSamples === 0) {
            offsetNext = -sumNext / windowSamples;
        }
        if (i >= windowSamples2 && i % windowSamples === 0) {
            _normalize(i);
        }
        if (i % windowSamples === 0) {
            offsetPrev = i === windowSamples ? offsetNext : offset;
            offset = offsetNext;
            sumNext = 0;
        }
        const index = i * channelsCount;
        const valueNext = samplesData[index + channel];
        sumNext += valueNext;
    }
    offsetNext = -sumNext / (samplesCount % windowSamples || windowSamples);
    const i = Math.ceil(samplesCount / windowSamples) * windowSamples;
    _normalize(i);
    offsetPrev = i === windowSamples ? offsetNext : offset;
    offset = offsetNext;
    _normalize(i + windowSamples);
}
function normalizeOffsetWithWindow({ samplesData, channelsCount, channels, windowSamples, }) {
    if (channels == null) {
        channels = audio_helpers.generateIndexArray(channelsCount);
    }
    const channelsLength = channels.length;
    if (channelsLength === 0) {
        return;
    }
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        _normalizeOffsetWithWindow({
            samplesData,
            channelsCount,
            channel: channels[nChannel],
            windowSamples,
        });
    }
}

exports.normalizeOffsetWithWindow = normalizeOffsetWithWindow;
