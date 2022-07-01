'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var audio_helpers = require('./helpers.cjs');

function getOffset({ samplesData, channelsCount, channel, }) {
    const samplesCount = Math.floor(samplesData.length / channelsCount);
    let sum = 0;
    for (let i = 0; i < samplesCount; i++) {
        const index = i * channelsCount;
        const value = samplesData[index + channel];
        sum += value;
    }
    return sum / samplesCount;
}
function addOffset({ samplesData, channelsCount, channel, offset, }) {
    const samplesCount = Math.floor(samplesData.length / channelsCount);
    for (let i = 0; i < samplesCount; i++) {
        const index = i * channelsCount;
        const value = samplesData[index + channel];
        samplesData[index + channel] = audio_helpers.correctSample(value + offset);
    }
}
function _normalizeOffsetSimple({ samplesData, channelsCount, channel, }) {
    const offset = getOffset({
        samplesData,
        channelsCount,
        channel,
    });
    addOffset({
        samplesData,
        channelsCount,
        channel,
        offset: -offset,
    });
}
function normalizeOffsetSimple({ samplesData, channelsCount, channels, }) {
    if (channels == null) {
        channels = audio_helpers.generateIndexArray(channelsCount);
    }
    const channelsLength = channels.length;
    if (channelsLength === 0) {
        return;
    }
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        _normalizeOffsetSimple({
            samplesData,
            channelsCount,
            channel: channels[nChannel],
        });
    }
}

exports.normalizeOffsetSimple = normalizeOffsetSimple;
