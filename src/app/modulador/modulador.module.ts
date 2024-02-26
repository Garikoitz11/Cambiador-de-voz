import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuladorComponent } from './modulador.component';



@NgModule({
  declarations: [
    ModuladorComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ModuladorComponent
  ]
})
export class ModuladorModule { }
