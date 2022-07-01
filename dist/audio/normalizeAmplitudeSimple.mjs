import { generateIndexArray, EPSILON, correctSample } from './helpers.mjs';

function getMaxAmplitude({ samplesData, channelsCount, channels, }) {
    if (channels == null) {
        channels = generateIndexArray(channelsCount);
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
        channels = generateIndexArray(channelsCount);
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
            samplesData[index + channel] = correctSample(value * mult);
        }
    }
}
function _normalizeAmplitudeSimple({ samplesData, channelsCount, channels, coef, }) {
    const max = getMaxAmplitude({
        samplesData,
        channelsCount,
        channels,
    });
    if (max > EPSILON) {
        multAmplitude({
            samplesData,
            channelsCount,
            channels,
            mult: coef / max,
        });
    }
}
function normalizeAmplitudeSimple({ samplesData, channelsCount, channels, separateChannels, coef, }) {
    if (channels == null) {
        channels = generateIndexArray(channelsCount);
    }
    const channelsLength = channels.length;
    if (channelsLength === 0) {
        return;
    }
    if (separateChannels) {
        for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
            _normalizeAmplitudeSimple({
                samplesData,
                channelsCount,
                channels: [channels[nChannel]],
                coef,
            });
        }
        return;
    }
    _normalizeAmplitudeSimple({
        samplesData,
        channelsCount,
        channels,
        coef,
    });
}

export { normalizeAmplitudeSimple };
