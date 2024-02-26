import { Component } from '@angular/core';
import { SnotifireService } from 'ngx-snotifire';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pruebas-angular';
  constructor(readonly snotifireService: SnotifireService) {
  }

  hacer() {
    debugger;
    this.snotifireService.success("Example body content");    
  }

}
