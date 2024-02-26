export class Jungle {
    context: any;
    input: GainNode;
    output: GainNode;
    mod1: AudioBufferSourceNode;
    mod2: AudioBufferSourceNode;
    mod3: AudioBufferSourceNode;
    mod4: AudioBufferSourceNode;
    shiftDownBuffer: AudioBuffer
    shiftUpBuffer: AudioBuffer;
    mod1Gain: GainNode;
    mod2Gain: GainNode;
    mod3Gain: GainNode;
    mod4Gain: GainNode;
    modGain1: GainNode;
    modGain2: GainNode;
    delay1: DelayNode;
    delay2: DelayNode;
    fade1: AudioBufferSourceNode;
    fade2: AudioBufferSourceNode;
    fadeBuffer: AudioBuffer;
    mix1: GainNode;
    mix2: GainNode;
    t: any;
    t2: any;
    delayTime: number = 0.100;
    fadeTime: number = 0.050;
    bufferTime: number = 0.100;
    previousPitch: number = -1;

    constructor(ctx: any) {
        this.context = ctx;
        this.input = this.context.createGain();
        this.output = this.context.createGain();
        this.mod1 = this.context.createBufferSource();
        this.mod2 = this.context.createBufferSource();
        this.mod3 = this.context.createBufferSource();
        this.mod4 = this.context.createBufferSource();
        this.shiftDownBuffer = this.createDelayTimeBuffer(this.context, this.bufferTime, this.fadeTime, false);
        this.shiftUpBuffer = this.createDelayTimeBuffer(this.context, this.bufferTime, this.fadeTime, true);
        this.mod1.buffer = this.shiftDownBuffer;
        this.mod2.buffer = this.shiftDownBuffer;
        this.mod3.buffer = this.shiftUpBuffer;
        this.mod4.buffer = this.shiftUpBuffer;
        this.mod1.loop = true;
        this.mod2.loop = true;
        this.mod3.loop = true;
        this.mod4.loop = true;
        this.mod1Gain = this.context.createGain();
        this.mod2Gain = this.context.createGain();
        this.mod3Gain = this.context.createGain();
        this.mod3Gain.gain.value = 0;
        this.mod4Gain = this.context.createGain();
        this.mod4Gain.gain.value = 0;
        this.mod1.connect(this.mod1Gain);
        this.mod2.connect(this.mod2Gain);
        this.mod3.connect(this.mod3Gain);
        this.mod4.connect(this.mod4Gain);
        this.modGain1 = this.context.createGain();
        this.modGain2 = this.context.createGain();

        this.delay1 = this.context.createDelay();
        this.delay2 = this.context.createDelay();
        this.mod1Gain.connect(this.modGain1);
        this.mod2Gain.connect(this.modGain2);
        this.mod3Gain.connect(this.modGain1);
        this.mod4Gain.connect(this.modGain2);
        this.modGain1.connect(this.delay1.delayTime);
        this.modGain2.connect(this.delay2.delayTime);

        this.fade1 = this.context.createBufferSource();
        this.fade2 = this.context.createBufferSource();
        this.fadeBuffer = this.createFadeBuffer(this.context, this.bufferTime, this.fadeTime);
        this.fade1.buffer = this.fadeBuffer;
        this.fade2.buffer = this.fadeBuffer;
        this.fade1.loop = true;
        this.fade2.loop = true;

        this.mix1 = this.context.createGain();
        this.mix2 = this.context.createGain();
        this.mix1.gain.value = 0;
        this.mix2.gain.value = 0;

        this.fade1.connect(this.mix1.gain);
        this.fade2.connect(this.mix2.gain);

        // Connect processing graph.
        this.input.connect(this.delay1);
        this.input.connect(this.delay2);
        this.delay1.connect(this.mix1);
        this.delay2.connect(this.mix2);
        this.mix1.connect(this.output);
        this.mix2.connect(this.output);

        // Start
        this.t = this.context.currentTime + 0.050;
        this.t2 = this.t + this.bufferTime - this.fadeTime;
        this.mod1.start(this.t);
        this.mod2.start(this.t2);
        this.mod3.start(this.t);
        this.mod4.start(this.t2);
        this.fade1.start(this.t);
        this.fade2.start(this.t2);

        this.setDelay(this.delayTime);

    }

    createFadeBuffer(context: AudioContext, activeTime: number, fadeTime: number) {
        var length1 = activeTime * context.sampleRate;
        var length2 = (activeTime - 2 * fadeTime) * context.sampleRate;
        var length = length1 + length2;
        var buffer = context.createBuffer(1, length, context.sampleRate);
        var p = buffer.getChannelData(0);

        var fadeLength = fadeTime * context.sampleRate;

        var fadeIndex1 = fadeLength;
        var fadeIndex2 = length1 - fadeLength;

        // 1st part of cycle
        for (var i = 0; i < length1; ++i) {
            var value;

            if (i < fadeIndex1) {
                value = Math.sqrt(i / fadeLength);
            } else if (i >= fadeIndex2) {
                value = Math.sqrt(1 - (i - fadeIndex2) / fadeLength);
            } else {
                value = 1;
            }

            p[i] = value;
        }

        // 2nd part
        for (var i = length1; i < length; ++i) {
            p[i] = 0;
        }

        return buffer;
    }


    createDelayTimeBuffer(context: AudioContext, activeTime: number, fadeTime: number, shiftUp: boolean) {
        var length1 = activeTime * context.sampleRate;
        var length2 = (activeTime - 2 * fadeTime) * context.sampleRate;
        var length = length1 + length2;
        var buffer = context.createBuffer(1, length, context.sampleRate);
        var p = buffer.getChannelData(0);

        // 1st part of cycle
        for (var i = 0; i < length1; ++i) {
            if (shiftUp)
                // This line does shift-up transpose
                p[i] = (length1 - i) / length;
            else
                // This line does shift-down transpose
                p[i] = i / length1;
        }

        // 2nd part
        for (var i = length1; i < length; ++i) {
            p[i] = 0;
        }

        return buffer;
    }

    setDelay(delayTime: number) {
        this.modGain1.gain.setTargetAtTime(0.5 * delayTime, 0, 0.010);
        this.modGain2.gain.setTargetAtTime(0.5 * delayTime, 0, 0.010);
    }

    setPitchOffset(mult: number) {
        if (mult > 0) { // pitch up
            this.mod1Gain.gain.value = 0;
            this.mod2Gain.gain.value = 0;
            this.mod3Gain.gain.value = 1;
            this.mod4Gain.gain.value = 1;
        } else { // pitch down
            this.mod1Gain.gain.value = 1;
            this.mod2Gain.gain.value = 1;
            this.mod3Gain.gain.value = 0;
            this.mod4Gain.gain.value = 0;
        }
        this.setDelay(this.delayTime * Math.abs(mult));
        this.previousPitch = mult;
    }
}