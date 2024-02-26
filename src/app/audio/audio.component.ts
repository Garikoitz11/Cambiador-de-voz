import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements AfterViewInit {

  record: any;
  stop: any;
  soundClips: any;
  canvas: any;
  audioCtx: any;
  canvasCtx: any;
  mediaRecorder: any;
  isMediaSupported: boolean = false;
  stream: MediaStream = new MediaStream();

  analyser: any;
  dataArray: any;
  bufferLength: any;

  constructor() { }

  async ngAfterViewInit() {
    this.record = document.querySelector(".record");
    this.stop = document.querySelector(".stop");
    this.soundClips = document.querySelector(".sound-clips");
    this.canvas = document.querySelector(".visualizer");
    this.canvasCtx = this.canvas.getContext("2d");

    this.stop.disabled = false;

    try {
      this.isMediaSupported = !!await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      this.isMediaSupported = false;
    }

    if (this.isMediaSupported) {
      const constraints: MediaStreamConstraints = { audio: true, video: false };
      let chunks: any = [];

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      this.visualize(this.stream);

      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.onstop = (e: any) => {

        const clipName = prompt(
          "Introduce el nombre del audio",
          "AudioSinNombre"
        );

        const clipContainer = document.createElement("article");
        const clipLabel = document.createElement("p");
        const audio = document.createElement("audio");
        const deleteButton = document.createElement("button");

        clipContainer.classList.add("clip");
        audio.setAttribute("controls", "");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete";

        if (clipName === null) {
          clipLabel.textContent = "AudioSinNombre";
        } else {
          clipLabel.textContent = clipName;
        }

        clipContainer.appendChild(audio);
        clipContainer.appendChild(clipLabel);
        clipContainer.appendChild(deleteButton);
        this.soundClips.appendChild(clipContainer);

        audio.controls = true;

        const blob = new Blob(chunks, { type: this.mediaRecorder.mimeType });
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;

        deleteButton.onclick = (e: any) => {
          e.target.closest(".clip").remove();
        };

        clipLabel.onclick = () => {
          const existingName = clipLabel.textContent;
          const newClipName = prompt("Introduce el nombre del audio");
          if (newClipName === null) {
            clipLabel.textContent = existingName;
          } else {
            clipLabel.textContent = newClipName;
          }
        };
      };

      this.mediaRecorder.ondataavailable = (e: any) => {
        chunks.push(e.data);
      };
    }

  }

  recordMethod() {
    this.mediaRecorder.start();
    this.record.style.background = "red";

    this.stop.disabled = false;
    this.record.disabled = true;
  }

  stopMethod() {
    this.mediaRecorder.stop();

    this.record.style.background = "";
    this.record.style.color = "";

    this.stop.disabled = true;
    this.record.disabled = false;
  }

  visualize(stream: MediaStream) {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }

    const source = this.audioCtx.createMediaStreamSource(stream);

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    source.connect(this.analyser);

    this.draw();
  }

  draw = () => {
    const WIDTH = this.canvas.width;
    const HEIGHT = this.canvas.height;

    requestAnimationFrame(this.draw);

    this.analyser.getByteTimeDomainData(this.dataArray);

    this.canvasCtx.fillStyle = "rgb(200, 200, 200)";
    this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    this.canvasCtx.beginPath();

    let sliceWidth = (WIDTH * 1.0) / this.bufferLength;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      let v = this.dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        this.canvasCtx.moveTo(x, y);
      } else {
        this.canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
    this.canvasCtx.stroke();
  }

  drawV2 = () => {
    const WIDTH = this.canvas.width;
    const HEIGHT = this.canvas.height;

    requestAnimationFrame(this.drawV2);

    this.analyser.getByteTimeDomainData(this.dataArray);

    var cornerRadius = 20;

    this.canvasCtx.fillStyle = "rgb(200, 200, 200)";
    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(cornerRadius, 0);
    this.canvasCtx.arcTo(WIDTH, 0, WIDTH, HEIGHT, cornerRadius);
    this.canvasCtx.arcTo(WIDTH, HEIGHT, 0, HEIGHT, cornerRadius);
    this.canvasCtx.arcTo(0, HEIGHT, 0, 0, cornerRadius);
    this.canvasCtx.arcTo(0, 0, WIDTH, 0, cornerRadius);
    this.canvasCtx.closePath();
    this.canvasCtx.fill();

    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    this.canvasCtx.beginPath();

    let sliceWidth = (WIDTH * 1.0) / this.bufferLength;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      let v = this.dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        this.canvasCtx.moveTo(x, y);
      } else {
        this.canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
    this.canvasCtx.stroke();
  }

  drawV3() {
    const WIDTH = this.canvas.width;
    const HEIGHT = this.canvas.height;

    requestAnimationFrame(this.drawV3);

    this.analyser.getByteTimeDomainData(this.dataArray);

    const cornerRadius = 20;

    this.canvasCtx.fillStyle = "rgb(200, 200, 200)";
    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(cornerRadius, 0);
    this.canvasCtx.arcTo(WIDTH, 0, WIDTH, HEIGHT, cornerRadius);
    this.canvasCtx.arcTo(WIDTH, HEIGHT, 0, HEIGHT, cornerRadius);
    this.canvasCtx.arcTo(0, HEIGHT, 0, 0, cornerRadius);
    this.canvasCtx.arcTo(0, 0, WIDTH, 0, cornerRadius);
    this.canvasCtx.closePath();
    this.canvasCtx.fill();

    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    this.canvasCtx.beginPath();

    let sliceWidth = (WIDTH - 2 * cornerRadius) / this.bufferLength;
    let x = cornerRadius;

    for (let i = 0; i < this.bufferLength; i++) {
      let v = this.dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        this.canvasCtx.moveTo(x, y);
      } else {
        this.canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.canvasCtx.lineTo(WIDTH - cornerRadius, HEIGHT / 2);
    this.canvasCtx.stroke();

  }

}