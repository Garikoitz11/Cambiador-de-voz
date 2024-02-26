import { AfterViewInit, Component } from '@angular/core';
import { Jungle } from '../util/jungle';

@Component({
  selector: 'app-modulador',
  templateUrl: './modulador.component.html',
  styleUrls: ['./modulador.component.scss']
})
export class ModuladorComponent implements AfterViewInit {

  soundClips: any;
  mediaRecorder: any;
  audioContext: any;
  grabandoActualmente: boolean = false;

  constructor() {
    this.audioContext = new AudioContext();
  }

  ngAfterViewInit() {
    this.soundClips = document.querySelector(".sound-clips")
  }

  async Grabar() {
    if (this.grabandoActualmente) {
      return;
    }
    this.grabandoActualmente = true;

    let chunks: any = [];
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    this.mediaRecorder.start();

    this.mediaRecorder.ondataavailable = (e: any) => { chunks.push(e.data); };

    this.mediaRecorder.onstop = async () => {

      let blob = new Blob(chunks, { type: this.mediaRecorder.mimeType });
      let audioURL = window.URL.createObjectURL(blob);

      let arrayBuffer = await (await fetch(audioURL)).arrayBuffer();

      let globalAudioBuffer = await (new AudioContext()).decodeAudioData(arrayBuffer);

      this.loadTransform(globalAudioBuffer);

    }
  }

  Parar() {
    this.mediaRecorder.stop();
  }

  async loadTransform(globalAudioBuffer: any) {
    //Llama a la función para la distorsión de voz
    //let outputAudioBuffer = await this.anonymousTransform(globalAudioBuffer);
    let outputAudioBuffer = await this.pitchTransform(globalAudioBuffer, -1);
    //Convierte el AudioBuffer en un archivo WAV
    let outputWavBlob: any = await this.audioBufferToWaveBlob(outputAudioBuffer);
    //Crea una url de ese archivo
    let audioUrl = window.URL.createObjectURL(outputWavBlob);
    //Crea un elemento de audio y le mete la url, añadiendolo en el html
    const audioElement = document.createElement('audio');
    audioElement.src = audioUrl;
    audioElement.controls = true;
    this.soundClips.appendChild(audioElement);
    this.grabandoActualmente = false;
  }

  async audioBufferToWaveBlob(audioBuffer: any) {

    return new Promise(function (resolve, reject) {

      let waveWorkerString = `

self.onmessage = function( e ){
  var wavPCM = new WavePCM( e['data']['config'] );
  wavPCM.record( e['data']['pcmArrays'] );
  wavPCM.requestData();
};

var WavePCM = function( config ){
  this.sampleRate = config['sampleRate'] || 48000;
  this.bitDepth = config['bitDepth'] || 16;
  this.recordedBuffers = [];
  this.bytesPerSample = this.bitDepth / 8;
};

WavePCM.prototype.record = function( buffers ){
  this.numberOfChannels = this.numberOfChannels || buffers.length;
  var bufferLength = buffers[0].length;
  var reducedData = new Uint8Array( bufferLength * this.numberOfChannels * this.bytesPerSample );

  // Interleave
  for ( var i = 0; i < bufferLength; i++ ) {
    for ( var channel = 0; channel < this.numberOfChannels; channel++ ) {

      var outputIndex = ( i * this.numberOfChannels + channel ) * this.bytesPerSample;
      var sample = buffers[ channel ][ i ];

      // Check for clipping
      if ( sample > 1 ) {
        sample = 1;
      }

      else if ( sample < -1 ) {
        sample = -1;
      }

      // bit reduce and convert to uInt
      switch ( this.bytesPerSample ) {
        case 4:
          sample = sample * 2147483648;
          reducedData[ outputIndex ] = sample;
          reducedData[ outputIndex + 1 ] = sample >> 8;
          reducedData[ outputIndex + 2 ] = sample >> 16;
          reducedData[ outputIndex + 3 ] = sample >> 24;
          break;

        case 3:
          sample = sample * 8388608;
          reducedData[ outputIndex ] = sample;
          reducedData[ outputIndex + 1 ] = sample >> 8;
          reducedData[ outputIndex + 2 ] = sample >> 16;
          break;

        case 2:
          sample = sample * 32768;
          reducedData[ outputIndex ] = sample;
          reducedData[ outputIndex + 1 ] = sample >> 8;
          break;

        case 1:
          reducedData[ outputIndex ] = ( sample + 1 ) * 128;
          break;

        default:
          throw "Only 8, 16, 24 and 32 bits per sample are supported";
      }
    }
  }

  this.recordedBuffers.push( reducedData );
};

WavePCM.prototype.requestData = function(){
  var bufferLength = this.recordedBuffers[0].length;
  var dataLength = this.recordedBuffers.length * bufferLength;
  var headerLength = 44;
  var wav = new Uint8Array( headerLength + dataLength );
  var view = new DataView( wav.buffer );

  view.setUint32( 0, 1380533830, false ); // RIFF identifier 'RIFF'
  view.setUint32( 4, 36 + dataLength, true ); // file length minus RIFF identifier length and file description length
  view.setUint32( 8, 1463899717, false ); // RIFF type 'WAVE'
  view.setUint32( 12, 1718449184, false ); // format chunk identifier 'fmt '
  view.setUint32( 16, 16, true ); // format chunk length
  view.setUint16( 20, 1, true ); // sample format (raw)
  view.setUint16( 22, this.numberOfChannels, true ); // channel count
  view.setUint32( 24, this.sampleRate, true ); // sample rate
  view.setUint32( 28, this.sampleRate * this.bytesPerSample * this.numberOfChannels, true ); // byte rate (sample rate * block align)
  view.setUint16( 32, this.bytesPerSample * this.numberOfChannels, true ); // block align (channel count * bytes per sample)
  view.setUint16( 34, this.bitDepth, true ); // bits per sample
  view.setUint32( 36, 1684108385, false); // data chunk identifier 'data'
  view.setUint32( 40, dataLength, true ); // data chunk length

  for (var i = 0; i < this.recordedBuffers.length; i++ ) {
    wav.set( this.recordedBuffers[i], i * bufferLength + headerLength );
  }

  self.postMessage( wav, [wav.buffer] );
  self.close();
};`;


      var worker = new Worker(URL.createObjectURL(new Blob([waveWorkerString], { type: 'application/javascript; charset=utf-8' })));

      worker.onmessage = function (e) {
        var blob = new Blob([e.data.buffer], { type: "audio/wav" });
        resolve(blob);
      };

      let pcmArrays = [];
      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        pcmArrays.push(audioBuffer.getChannelData(i));
      }

      worker.postMessage({
        pcmArrays,
        config: { sampleRate: audioBuffer.sampleRate }
      });

    });
  }

  async anonymousTransform(audioBuffer: any, distortionAmount = 100) {
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);

    // Source
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    // Wave shaper
    let waveShaper = ctx.createWaveShaper();
    waveShaper.curve = makeDistortionCurve(distortionAmount);
    function makeDistortionCurve(amount: any) {
      var k = typeof amount === 'number' ? amount : 50;
      var n_samples = 44100;
      var curve = new Float32Array(n_samples);
      var deg = Math.PI / 180;
      var x;
      for (let i = 0; i < n_samples; ++i) {
        x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
      }
      return curve;
    }

    // Reverb
    // let convolver = ctx.createConvolver();
    // convolver.buffer = await ctx.decodeAudioData(await (await fetch("/audio/impulse-responses/portable-radio.wav")).arrayBuffer());

    // Wobble
    let oscillator = ctx.createOscillator();
    oscillator.frequency.value = 50;
    oscillator.type = 'sawtooth';
    // ---
    let oscillatorGain = ctx.createGain();
    oscillatorGain.gain.value = 0.005;
    // ---
    let delay = ctx.createDelay();
    delay.delayTime.value = 0.01;

    // White noise
    let noise = ctx.createBufferSource();
    let noiseBuffer = ctx.createBuffer(1, 32768, ctx.sampleRate);
    let noiseData = noiseBuffer.getChannelData(0);
    for (var i = 0; i < 32768; i++) {
      noiseData[i] = Math.random() * Math.random() * Math.random() * Math.random() * Math.random() * Math.random() * 0.6;
    }
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Create graph
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
    // ---
    source.connect(delay)
    delay.connect(waveShaper);
    //delay.connect(convolver);
    //convolver.connect(waveShaper);
    waveShaper.connect(ctx.destination);
    // ---
    noise.connect(ctx.destination);

    // Render
    oscillator.start(0);
    noise.start(0);
    source.start(0);
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  }

  async pitchTransform(audioBuffer: any, pitchMod: any/*nagive=lower, positive=higher*/) {
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);

    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    let pitchChangeEffect = new Jungle(ctx);

    let compressor = ctx.createDynamicsCompressor();

    source.connect(pitchChangeEffect.input)
    pitchChangeEffect.output.connect(compressor)
    pitchChangeEffect.setPitchOffset(pitchMod);

    compressor.connect(ctx.destination);

    source.start(0);
    return await ctx.startRendering();
  }

}