import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-audio-distorsionado',
  templateUrl: './audio-distorsionado.component.html',
  styleUrls: ['./audio-distorsionado.component.scss']
})
export class AudioDistorsionadoComponent implements OnInit, AfterViewInit {

  audioContext: any;
  pitchShifterProcessor: any;
  audioActual: any;

  myWorkletNode: any;
  mediaRecorder: any;

  bufferSalida: any[] = [];

  soundClips: any;
  sampleRate: any;

  constructor() {
  }

  ngOnInit(): void {
    this.audioContext = new AudioContext();
    this.sampleRate = this.audioContext.sampleRate;
  }

  ngAfterViewInit() {
    this.soundClips = document.querySelector(".sound-clips")
  }

  hannWindow(length: number) {
    let window = new Float32Array(length);
    for (var i = 0; i < length; i++) {
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
    }
    return window;
  }

  linearInterpolation(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  play() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
      this.audioActual = this.audioContext.createMediaStreamSource(stream);

      const grainSize = 512;
      const pitchRatio = 1.8;
      const overlapRatio = 0.3;

      if (this.pitchShifterProcessor) {
        this.pitchShifterProcessor.disconnect();
      }

      this.pitchShifterProcessor = this.audioContext.createScriptProcessor(grainSize, 1, 1);

      this.pitchShifterProcessor.buffer = new Float32Array(grainSize * 2);
      this.pitchShifterProcessor.grainWindow = this.hannWindow(grainSize);

      this.pitchShifterProcessor.onaudioprocess = (event: any) => {
        debugger;
        // console.log("HOLA");
        let inputData = event.inputBuffer.getChannelData(0);
        let outputData = event.outputBuffer.getChannelData(0);

        for (let i = 0; i < inputData.length; i++) {
          inputData[i] *= this.pitchShifterProcessor.grainWindow[i];
          this.pitchShifterProcessor.buffer[i] = this.pitchShifterProcessor.buffer[i + grainSize];
          this.pitchShifterProcessor.buffer[i + grainSize] = 0.0;
        }

        let grainData = new Float32Array(grainSize * 2);
        for (let i = 0, j = 0.0; i < grainSize; i++, j += pitchRatio) {
          let index = Math.floor(j) % grainSize;
          let a = inputData[index];
          let b = inputData[(index + 1) % grainSize];
          grainData[i] += this.linearInterpolation(a, b, j % 1.0) * this.pitchShifterProcessor.grainWindow[i];
        }

        for (let i = 0; i < grainSize; i += Math.round(grainSize * (1 - overlapRatio))) {
          for (let j = 0; j <= grainSize; j++) {
            this.pitchShifterProcessor.buffer[i + j] += grainData[j];
          }
        }

        for (let i = 0; i < grainSize; i++) {
          outputData[i] = this.pitchShifterProcessor.buffer[i];
        }
      };

      this.audioActual.connect(this.pitchShifterProcessor);

      this.pitchShifterProcessor.connect(this.audioContext.destination);
    });

  }

  grabarYReproducirAudio() {
    // Obtener acceso al micrófono
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        // Crear un nodo de fuente de medios a partir del flujo de medios del micrófono
        var fuenteDeAudio = this.audioContext.createMediaStreamSource(stream);

        // Crear un nodo de procesador de script para procesar el audio
        var procesadorDeAudio = this.audioContext.createScriptProcessor(4096, 1, 1);

        // Conectar el nodo de fuente de medios al nodo de procesador de script
        fuenteDeAudio.connect(procesadorDeAudio);

        // Conectar el nodo de procesador de script a la salida de audio del contexto
        procesadorDeAudio.connect(this.audioContext.destination);


        // Establecer la función de procesamiento de audio
        procesadorDeAudio.onaudioprocess = (event: any) => {
          var entrada = event.inputBuffer.getChannelData(0);
          var salida = event.outputBuffer.getChannelData(0);

          // Procesar el audio aquí (por ejemplo, aplicar efectos de audio)

          // Copiar la entrada a la salida (en este ejemplo, simplemente lo pasamos sin cambios)
          for (var i = 0; i < entrada.length; i++) {
            salida[i] = entrada[i];
          }
        };

        // Parar la reproducción después de un tiempo (por ejemplo, 5 segundos)
        setTimeout(function () {
          stream.getTracks().forEach(function (track) {
            track.stop();
          });
        }, 5000);
      })
      .catch(function (error) {
        console.error('Error al obtener acceso al micrófono:', error);
      });
  }

  playConAudioWorklet() {
    // Crear un contexto de audio
    const audioContext = new AudioContext();

    // Obtener acceso al micrófono del usuario
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        // Crear un nodo de MediaStreamAudioSourceNode para capturar el audio del micrófono
        const microphoneNode = audioContext.createMediaStreamSource(stream);

        // Registrar el procesador de audio personalizado
        audioContext.audioWorklet.addModule('/assets/my-audio-processor.js')
          .then(() => {
            // Crear un nodo de AudioWorkletNode con el procesador personalizado
            this.myWorkletNode = new AudioWorkletNode(audioContext, 'my-audio-processor');

            // Conectar el nodo del micrófono al nodo de AudioWorkletNode
            microphoneNode.connect(this.myWorkletNode);

            // Conectar el nodo de AudioWorkletNode al destino de audio
            this.myWorkletNode.connect(audioContext.destination);
          })
          .catch(error => {
            console.error('Error al cargar el procesador de audio personalizado:', error);
          });
      })
      .catch(error => {
        console.error('Error al obtener acceso al micrófono:', error);
      });
  }

  playV2() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
      this.audioActual = this.audioContext.createMediaStreamSource(stream);

      const grainSize = 512;
      const pitchRatio = 1.8;
      const overlapRatio = 0.3;

      if (this.pitchShifterProcessor) {
        this.pitchShifterProcessor.disconnect();
      }

      this.pitchShifterProcessor = this.audioContext.createScriptProcessor(grainSize, 1, 1);

      this.pitchShifterProcessor.buffer = new Float32Array(grainSize * 2);
      this.pitchShifterProcessor.grainWindow = this.hannWindow(grainSize);

      this.pitchShifterProcessor.onaudioprocess = (event: any) => {

        let inputData = event.inputBuffer.getChannelData(0);
        let outputData = event.outputBuffer.getChannelData(0);

        for (let i = 0; i < inputData.length; i++) {
          inputData[i] *= this.pitchShifterProcessor.grainWindow[i];
          this.pitchShifterProcessor.buffer[i] = this.pitchShifterProcessor.buffer[i + grainSize];
          this.pitchShifterProcessor.buffer[i + grainSize] = 0.0;
        }

        let grainData = new Float32Array(grainSize * 2);
        for (let i = 0, j = 0.0; i < grainSize; i++, j += pitchRatio) {
          let index = Math.floor(j) % grainSize;
          let a = inputData[index];
          let b = inputData[(index + 1) % grainSize];
          grainData[i] += this.linearInterpolation(a, b, j % 1.0) * this.pitchShifterProcessor.grainWindow[i];
        }

        for (let i = 0; i < grainSize; i += Math.round(grainSize * (1 - overlapRatio))) {
          for (let j = 0; j <= grainSize; j++) {
            this.pitchShifterProcessor.buffer[i + j] += grainData[j];
          }
        }

        this.bufferSalida.push([...this.pitchShifterProcessor.buffer]);

      };

      this.audioActual.connect(this.pitchShifterProcessor);

      this.pitchShifterProcessor.connect(this.audioContext.destination);
    });

  }

  stopV2() {
    // Crear un búfer de audio WAV a partir de los datos almacenados en bufferSalida
    const wavBuffer = this.createWAVBuffer(this.bufferSalida, this.sampleRate); // Suponiendo que bufferSalida contiene datos de audio y sampleRate es la frecuencia de muestreo
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    const audioElement = document.createElement('audio');

    // Establecer el atributo src como la URL del Blob
    audioElement.src = URL.createObjectURL(wavBlob);

    // Establecer atributos adicionales según sea necesario
    audioElement.controls = true; // Agregar controles de reproducción

    // Obtener la referencia a la sección con la clase "sound-clips"

    // Agregar el elemento de audio al DOM dentro de la sección "sound-clips"
    this.soundClips.appendChild(audioElement);
  }

  // Crear un búfer de audio WAV
  createWAVBuffer(audioData: any, sampleRate: any) {
    let totalSamples = 0;

    // Calcular el número total de muestras de audio en todos los subarrays de audioData
    for (let i = 0; i < audioData.length; i++) {
      totalSamples += audioData[i].length;
    }

    const buffer = new ArrayBuffer(44 + totalSamples * 2); // Tamaño del búfer WAV
    const view = new DataView(buffer);

    // Escribir encabezados WAV
    this.writeString(view, 0, 'RIFF'); // RIFF chunk descriptor
    view.setUint32(4, 36 + totalSamples * 2, true); // Tamaño del archivo WAV - 36 bytes para el subchunk2Size
    this.writeString(view, 8, 'WAVE'); // WAV format

    this.writeString(view, 12, 'fmt '); // fmt subchunk
    view.setUint32(16, 16, true); // Tamaño del fmt subchunk
    view.setUint16(20, 1, true); // Formato de audio (PCM)
    view.setUint16(22, 1, true); // Número de canales (mono)
    view.setUint32(24, sampleRate * 1.3, true); // Frecuencia de muestreo
    view.setUint32(28, sampleRate * 2, true); // Tasa de bytes (sampleRate * 2 * numChannels)
    view.setUint16(32, 2, true); // Block align (numChannels * bytesPerSample)
    view.setUint16(34, 16, true); // Bits por muestra

    this.writeString(view, 36, 'data'); // data subchunk
    view.setUint32(40, totalSamples * 2, true); // Tamaño del subchunk2 (datos de audio)

    // Escribir datos de audio
    for (let i = 0; i < audioData.length; i++) {
      const samples = audioData[i]; // Obtener el subarray de muestras
      for (let j = 0; j < samples.length; j++) {
        const sample = samples[j];
        view.setInt16(44 + (i * samples.length + j) * 2, sample * 0x7FFF, true); // Convertir y escribir en el ArrayBuffer
      }
    }

    return buffer;
  }

  // Función auxiliar para escribir cadenas en el DataView
  writeString(view: any, offset: any, string: any) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

}