import { generateIndexArray, correctSample, EPSILON } from './helpers.mjs';

function _normalizeAmplitudeWithWindow({ samplesData, channelsCount, channels, coef, maxMult, windowSamples, }) {
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
    if (maxMult == null) {
        maxMult = 1e16;
    }
    if (channels == null) {
        channels = generateIndexArray(channelsCount);
    }
    const channelsLength = channels.length;
    if (channelsLength === 0) {
        return;
    }
    let maxPrev = 0;
    let max = 0;
    let maxNext = 0;
    function _normalize(i) {
        let maxJ = Math.min(windowSamplesHalf, samplesCount - i + windowSamples2);
        for (let j = 0; j < maxJ; j++) {
            const index = (i - windowSamples2 + j) * channelsCount;
            const mult = Math.min(maxMult, max < EPSILON ? maxMult : coef / max);
            const multPrev = Math.min(maxMult, maxPrev < EPSILON ? maxMult : coef / maxPrev);
            const _mult = multPrev >= mult ? mult : multPrev + (mult - multPrev) * j / windowSamplesHalf;
            for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
                const channel = channels[nChannel];
                const value = samplesData[index + channel];
                samplesData[index + channel] = correctSample(value * _mult);
            }
        }
        const _windowSamplesHalf = windowSamples - windowSamplesHalf;
        maxJ = Math.min(_windowSamplesHalf, samplesCount - i + windowSamples2 - windowSamplesHalf);
        for (let j = 0; j < maxJ; j++) {
            const index = (i - windowSamples2 + j + windowSamplesHalf) * channelsCount;
            const mult = Math.min(maxMult, max < EPSILON ? maxMult : coef / max);
            const multNext = Math.min(maxMult, maxNext < EPSILON ? maxMult : coef / maxNext);
            const _mult = mult <= multNext ? mult : mult + (multNext - mult) * j / _windowSamplesHalf;
            for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
                const channel = channels[nChannel];
                const value = samplesData[index + channel];
                samplesData[index + channel] = correctSample(value * _mult);
            }
        }
    }
    for (let i = 0; i < samplesCount; i++) {
        if (i >= windowSamples2 && i % windowSamples === 0) {
            _normalize(i);
        }
        if (i % windowSamples === 0) {
            maxPrev = max;
            max = maxNext;
            maxNext = 0;
        }
        const index = i * channelsCount;
        for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
            const channel = channels[nChannel];
            const valueNext = samplesData[index + channel];
            const valueNextAbs = Math.abs(valueNext);
            if (valueNextAbs > maxNext) {
                maxNext = valueNextAbs;
            }
        }
    }
    const i = Math.ceil(samplesCount / windowSamples) * windowSamples;
    _normalize(i);
    maxPrev = max;
    max = maxNext;
    maxNext = 0;
    _normalize(i + windowSamples);
}
function normalizeAmplitudeWithWindow(args) {
    let { samplesData, channelsCount, channels, separateChannels, coef, maxMult, windowSamples, } = args;
    if (channels == null) {
        channels = generateIndexArray(channelsCount);
    }
    const channelsLength = channels.length;
    if (channelsLength !== 0) {
        if (separateChannels) {
            for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
                _normalizeAmplitudeWithWindow({
                    samplesData,
                    channelsCount,
                    channels: [channels[nChannel]],
                    coef,
                    maxMult,
                    windowSamples,
                });
            }
        }
        else {
            _normalizeAmplitudeWithWindow({
                samplesData,
                channelsCount,
                channels,
                coef,
                maxMult,
                windowSamples,
            });
        }
    }
}
const _normalizeAmplitudeWithWindowWorker = normalizeAmplitudeWithWindow;
const normalizeAmplitudeWithWindowWorker = function normalizeAmplitudeWithWindow(data, abortSignal) {
    _normalizeAmplitudeWithWindowWorker(data.data);
    return {
        data: data.data.samplesData,
        transferList: [data.data.samplesData.buffer],
    };
};

export { normalizeAmplitudeWithWindow, normalizeAmplitudeWithWindowWorker };
