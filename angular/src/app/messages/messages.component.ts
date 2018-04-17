import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';

import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PageEvent } from '@angular/material';
import { environment } from '../../environments/environment';
import { FlexLayoutModule } from "@angular/flex-layout";

@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
    host: string = environment.BACKEND_HOST;
    port: string = environment.BACKEND_PORT;
    issuer: string = environment.ISSUER;
    https: boolean = environment.HTTPS;
    PROTOCOL: string = "https";
    base_url: string = `${this.PROTOCOL}://${this.host}:${this.port}`;

    public messages: any;
    public text: string;

    public postIt: any;

    public body: boolean = true;
    public readable_date: boolean = true;
    public contact_name: boolean = true;
    public address: boolean = true;

    public constructor(private http: Http, private router: Router, private location: Location) {
        this.messages = [];

        this.postIt = {
            "text": "",
            "address": "",
            "contact_name": "",
            "readable_date": "",
            "body": "",
        }
    }

    public ngOnInit() {
        this.location.subscribe(() => {
            this.refresh();
        });
        this.refresh();
    }

    private refresh() {
        this.http.get(`${this.base_url}/messages`)
            .map(result => result.json())
            .subscribe(result => {
                this.messages = result;
            });
    }

    public search(event: any) {
        let url = `${this.base_url}/messages`;
        if (event.target.value) {
            url = `${this.base_url}/search/${event.target.value}`;
            this.postIt = {
                "text": `${event.target.value}`,
                "address": `${this.postIt.address}`,
                "contact_name": `${this.postIt.contact_name}`,
                "readable_date": `${this.postIt.readable_date}`,
                "body": `${this.postIt.body}`,
            };
            console.log(JSON.stringify(this.postIt))
            this.http.post(url, JSON.stringify(this.postIt))
                .map(result => result.json())
                .subscribe(result => {
                    console.log(result);
                    this.messages = result;
                });
        }
    }

    public create() {
        this.router.navigate(["create"]);
    }
}
