import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms'

@Component({
  selector: 'app-captcha',
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.scss']
})

export class CaptchaComponent implements OnInit {

  protected aFormGroup!: FormGroup;
  siteKey: string = "6LcoRPwoAAAAAECKDY7ac-IM6bBeXRBxrZibXahN";

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.aFormGroup = this.formBuilder.group({
      recaptcha: ['', Validators.required]
    });
  }

  onClick(e: any) {
    if (this.aFormGroup.status == "VALID") {
      console.log("SIUUU");
    }
    else {
      console.log("NOOOO")
    }
  }
}
