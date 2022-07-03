'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var audio_helpers = require('./helpers.cjs');

function getMaxAmplitude({ samplesData, channelsCount, channels, }) {
    if (channels == null) {
        channels = audio_helpers.generateIndexArray(channelsCount);
    }
    const channelsLength = channels.length;
    if (channelsLength === 0) {
        return 0;
    }
    const samplesCount = Math.floor(samplesData.length / channelsCount);
    let max = 0;
    for (let i = 0; i < samplesCount; i++) {
        const index = i * channelsCount;
        for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
            const channel = channels[nChannel];
            const value = samplesData[index + channel];
            const valueAbs = Math.abs(value);
            if (valueAbs > max) {
                max = valueAbs;
            }
        }
    }
    return max;
}
function multAmplitude({ samplesData, channelsCount, channels, mult, }) {
    if (channels == null) {
        channels = audio_helpers.generateIndexArray(channelsCount);
    }
    const channelsLength = channels.length;
    if (channelsLength === 0) {
        return;
    }
    const samplesCount = Math.floor(samplesData.length / channelsCount);
    for (let i = 0; i < samplesCount; i++) {
        const index = i * channelsCount;
        for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
            const channel = channels[nChannel];
            const value = samplesData[index + channel];
            samplesData[index + channel] = audio_helpers.correctSample(value * mult);
        }
    }
}
function _normalizeAmplitudeSimple({ samplesData, channelsCount, channels, coef, }) {
    const max = getMaxAmplitude({
        samplesData,
        channelsCount,
        channels,
    });
    if (max > audio_helpers.EPSILON) {
        multAmplitude({
            samplesData,
            channelsCount,
            channels,
            mult: coef / max,
        });
    }
}
function normalizeAmplitudeSimple(args) {
    let { samplesData, channelsCount, channels, separateChannels, coef, } = args;
    if (channels == null) {
        channels = audio_helpers.generateIndexArray(channelsCount);
    }
    const channelsLength = channels.length;
    if (channelsLength !== 0) {
        if (separateChannels) {
            for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
                _normalizeAmplitudeSimple({
                    samplesData,
                    channelsCount,
                    channels: [channels[nChannel]],
                    coef,
                });
            }
        }
        else {
            _normalizeAmplitudeSimple({
                samplesData,
                channelsCount,
                channels,
                coef,
            });
        }
    }
}
const _normalizeAmplitudeSimpleWorker = normalizeAmplitudeSimple;
const normalizeAmplitudeSimpleWorker = function normalizeAmplitudeSimple(data, abortSignal) {
    _normalizeAmplitudeSimpleWorker(data.data);
    return {
        data: data.data.samplesData,
        transferList: [data.data.samplesData.buffer],
    };
};

exports.normalizeAmplitudeSimple = normalizeAmplitudeSimple;
exports.normalizeAmplitudeSimpleWorker = normalizeAmplitudeSimpleWorker;
