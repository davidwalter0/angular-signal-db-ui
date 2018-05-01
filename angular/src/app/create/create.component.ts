import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Http } from '@angular/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { config } from '../config';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})

export class CreateMessageComponent implements OnInit {
  host: string = config.BACKEND_HOST;
  port: string = config.BACKEND_PORT;
  https: boolean = config.HTTPS;
  PROTOCOL: string = "https";
  base_url: string = `${this.PROTOCOL}://${this.host}:${this.port}`;

  public message: any;

  public constructor(private location: Location, private http: Http) {
    this.message = {
      "address": "",
      "contact_name": "",
      "readable_date": Date.now(),
      "subject": "",
      "body": "",
    }
  }

  public ngOnInit() { }

  public save() {
    let url = `${this.base_url}/messages`;
    if (this.message.address && this.message.contact_name && this.message.body) {
      this.message.readable_date = new Date().toUTCString();
      this.http.post(url, JSON.stringify(this.message))
        .subscribe(result => {
          this.location.back();
        });
    }
  }
}
