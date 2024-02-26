import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CaptchaModule } from './captcha/captcha.module';
import { AriaModule } from './aria/aria.module';
import { NgxSnotifireModule, SnotifireService, ToastDefaults } from 'ngx-snotifire';
import { AudioModule } from './audio/audio.module';
import { AudioDistorsionadoModule } from './audio-distorsionado/audio-distorsionado.module';
import { ModuladorModule } from './modulador/modulador.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CaptchaModule,
    AriaModule,
    NgxSnotifireModule,
    AudioModule,
    AudioDistorsionadoModule,
    ModuladorModule
  ],
  providers: [{ provide: "snotifireConfig", useValue: ToastDefaults },
    SnotifireService,],
  bootstrap: [AppComponent]
})
export class AppModule { }
