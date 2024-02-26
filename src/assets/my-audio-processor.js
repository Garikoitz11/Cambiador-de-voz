class MyAudioProcessor extends AudioWorkletProcessor {

    constructor() {
        super();
        this.grainSize = 512;
        this.pitchRatio = 1.8;
        this.overlapRatio = 0.3;
        this.grainWindow = this.hannWindow(this.grainSize);
        this.buffer = new Float32Array(this.grainSize * 2); //el buffer es de 1024 oeri el outputdata de 128
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        const inputData = input[0];
        const outputData = output[0];

        // for (let i = 0; i < inputData.length; i++) {
        //     inputData[i] *= this.grainWindow[i];
        //     this.buffer[i] = this.buffer[i + this.grainSize];
        //     this.buffer[i + this.grainSize] = 0.0;
        // }

        // const grainData = new Float32Array(this.grainSize * 2);
        // for (let i = 0, j = 0.0; i < this.grainSize; i++, j += this.pitchRatio) {
        //     const index = Math.floor(j) % this.grainSize;
        //     const a = inputData[index];
        //     const b = inputData[(index + 1) % this.grainSize];
        //     grainData[i] += this.linearInterpolation(a, b, j % 1.0) * this.grainWindow[i];
        // }

        // for (let i = 0; i < this.grainSize; i += Math.round(this.grainSize * (1 - this.overlapRatio))) {
        //     for (let j = 0; j <= this.grainSize; j++) {
        //         this.buffer[i + j] += grainData[j];
        //     }
        // }

        // for (let i = 0; i < this.grainSize; i++) {
        //     outputData[i] = this.buffer[i];
        // }

        for (let i = 0; i < inputData.length; i++) {
            outputData[i] = inputData[i];
        }

        return true;
    }

    linearInterpolation(a, b, t) {
        return a + (b - a) * t;
    }

    hannWindow(size) {
        const window = new Float32Array(size);
        for (let i = 0; i < size; ++i) {
            window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
        }
        return window;
    }

}


registerProcessor('my-audio-processor', MyAudioProcessor);
