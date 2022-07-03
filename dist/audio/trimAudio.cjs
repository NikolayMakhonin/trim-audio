'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var audio_helpers = require('./helpers.cjs');

function searchContent(args) {
    let { samplesData, channelsCount, samplesCount, channels, windowSamples, backward, minContentSamples, minContentDispersion, maxSilenceSamples, start, endExclusive, } = args;
    if (windowSamples < 2) {
        throw new Error('windowSamples should be >= 2');
    }
    if (windowSamples > samplesCount) {
        windowSamples = samplesCount;
    }
    if (channels == null) {
        channels = audio_helpers.generateIndexArray(channelsCount);
    }
    const channelsLength = channels.length;
    if (channelsLength === 0) {
        return 0;
    }
    if (start == null) {
        start = 0;
    }
    if (endExclusive == null) {
        endExclusive = samplesCount;
    }
    let contentStartIndex = 0;
    let contentStartEnd = 0;
    let sum = 0;
    let sumSqr = 0;
    let totalSilenceLength = 0;
    for (let i = 0; i < endExclusive; i++) {
        for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
            const channel = channels[nChannel];
            const index = (backward ? samplesCount - 1 - i : i) * channelsCount + channel;
            const value = samplesData[index];
            sum += value;
            sumSqr += value * value;
        }
        if (i >= windowSamples) {
            for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
                const channel = channels[nChannel];
                const prevIndex = (backward
                    ? samplesCount - 1 - (i - windowSamples)
                    : (i - windowSamples)) * channelsCount + channel;
                const prevValue = samplesData[prevIndex];
                sum -= prevValue;
                sumSqr -= prevValue * prevValue;
            }
        }
        if (i >= windowSamples - 1) {
            const count = windowSamples * channelsLength;
            const avg = sum / count;
            const sqrAvg = sumSqr / count;
            const dispersion = (sqrAvg - avg * avg); // * count / (count - 1)
            if (i + 1 - contentStartEnd > maxSilenceSamples + windowSamples) {
                contentStartEnd = 0;
            }
            if (dispersion >= minContentDispersion - audio_helpers.EPSILON) {
                if (contentStartEnd === 0) {
                    contentStartIndex = i + 1 - windowSamples;
                    totalSilenceLength = 0;
                }
                contentStartEnd = i + 1;
                if (contentStartEnd - contentStartIndex - totalSilenceLength >= minContentSamples) {
                    return contentStartIndex;
                }
            }
            else if (i + 2 - contentStartIndex > windowSamples * 2) {
                totalSilenceLength++;
            }
        }
    }
    if (contentStartEnd === 0 || contentStartEnd - contentStartIndex < minContentSamples) {
        return endExclusive;
    }
    return contentStartIndex;
}
const _searchContentWorker = searchContent;
const searchContentWorker = function searchContent(data, abortSignal) {
    const result = _searchContentWorker(data.data);
    return {
        data: {
            samplesData: data.data.samplesData,
            result,
        },
        transferList: [data.data.samplesData.buffer],
    };
};
function trimAudio(args) {
    const { samplesData, channelsCount, channels, start, end, } = args;
    const samplesCount = Math.floor(samplesData.length / channelsCount);
    let trimStart = !start ? 0 : searchContent({
        samplesData,
        channelsCount,
        samplesCount,
        channels,
        windowSamples: start.windowSamples,
        backward: false,
        minContentSamples: start.minContentSamples,
        minContentDispersion: start.minContentDispersion,
        maxSilenceSamples: start.maxSilenceSamples,
    });
    let trimEndExclusive = !end ? samplesCount : samplesCount - 1 - searchContent({
        samplesData,
        channelsCount,
        samplesCount,
        channels,
        windowSamples: end.windowSamples,
        backward: true,
        minContentSamples: end.minContentSamples,
        minContentDispersion: end.minContentDispersion,
        maxSilenceSamples: end.maxSilenceSamples,
        endExclusive: start
            && Math.min(samplesCount, samplesCount - trimStart),
    }) + 1;
    if (trimStart >= trimEndExclusive) {
        return new Float32Array(0);
    }
    if (start === null || start === void 0 ? void 0 : start.space) {
        trimStart = Math.max(0, trimStart - start.space);
    }
    if (end === null || end === void 0 ? void 0 : end.space) {
        trimEndExclusive = Math.min(samplesCount, trimEndExclusive + end.space);
    }
    return new Float32Array(samplesData.buffer, trimStart * channelsCount * 4, (trimEndExclusive - trimStart) * channelsCount);
}
const _trimAudioWorker = trimAudio;
const trimAudioWorker = function trimAudio(data, abortSignal) {
    const result = _trimAudioWorker(data.data);
    return {
        data: {
            samplesData: data.data.samplesData,
            result,
        },
        transferList: result.buffer !== data.data.samplesData.buffer
            ? [result.buffer, data.data.samplesData.buffer]
            : [result.buffer],
    };
};

exports.searchContent = searchContent;
exports.searchContentWorker = searchContentWorker;
exports.trimAudio = trimAudio;
exports.trimAudioWorker = trimAudioWorker;
