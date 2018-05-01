import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard';
import { AvailableRoutes } from './app.routing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CreateMessageComponent } from './create/create.component';
import { DebugComponent } from './debug/debug.component';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { MaterialModule } from './material.module';
import { MessagesComponent } from './messages/messages.component';
import { NgModule } from '@angular/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { RouterModule } from '@angular/router';
import { AdminAuthGuard } from './admin.auth.guard';
import { environment } from '../environments/environment';
import 'hammerjs';
import { PublicComponent } from './public/public.component';
import { LoggedinComponent } from './loggedin/loggedin.component';

@NgModule({
  declarations: [
    AppComponent,
    MessagesComponent,
    CreateMessageComponent,
    HomeComponent,
    DebugComponent,
    PublicComponent,
    LoggedinComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    HttpModule,
    RouterModule.forRoot(AvailableRoutes),
    BrowserAnimationsModule,
    OAuthModule.forRoot(),
    MaterialModule,
  ],
  providers: [AuthGuard, AdminAuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
