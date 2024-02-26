import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaptchaComponent } from './captcha.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import {MatButtonModule} from '@angular/material/button';
import { AngularMaterialModule } from '../material.module';


@NgModule({
  declarations: [
    CaptchaComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    MatButtonModule,
    AngularMaterialModule
  ],
  exports: [CaptchaComponent]
})
export class CaptchaModule { }
