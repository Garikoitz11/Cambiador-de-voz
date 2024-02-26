import { Component } from '@angular/core';
import { SnotifireService } from 'ngx-snotifire';

@Component({
  selector: 'app-aria',
  templateUrl: './aria.component.html',
  styleUrls: ['./aria.component.scss']
})
export class AriaComponent {

  constructor() {}

  marcarComoInvalido() {
    // Obtén el elemento del campo de entrada
    debugger;
    // let campo = document.getElementById("miCampo");
    // if (campo) {
    //   // Establece aria-invalid en true
    //   campo.setAttribute("aria-invalid", "true");

    // }
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = 'Se ha cambiado de página';
    }

  }

}
