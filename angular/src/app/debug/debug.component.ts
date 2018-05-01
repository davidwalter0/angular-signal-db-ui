import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AdminAuthGuard } from '../admin.auth.guard';

@Component({
  styleUrls: ['./debug.component.css'],
  templateUrl: './debug.component.html',
})
export class DebugComponent {
  private username: string;
  private password: string;
  private error: string;
  claims: any = null;

  constructor(
    private oauthService: OAuthService,
    private adminAuthGuard: AdminAuthGuard,
  ) {
    this.claims = this.oauthService.getIdentityClaims();
  }
  keys() {
    if (this.claims) {
      return Object.keys(this.claims);
    }
    return null;
  }
  get givenName() {
    if (!this.claims) {
      return null;
    }
    return this.claims.name;
  }

  get id_token() {
    let value = this.oauthService.getIdToken();
    return value;
  }

  get access_token() {
    let value = this.oauthService.getAccessToken();
    return value;
  }

  get id_token_expiration() {
    let value = this.oauthService.getIdTokenExpiration();
    return value;
  }

  get access_token_expiration() {
    let value = this.oauthService.getAccessTokenExpiration();
    return value;
  }

  get parsedToken() {
    let value = this.oauthService.getIdToken();
    const helper = new JwtHelperService();

    const decodedToken = helper.decodeToken(value);
    // const expirationDate = helper.getTokenExpirationDate(value);
    // const isExpired = helper.isTokenExpired(value);
    return JSON.stringify(decodedToken, null, "  ");
  }
  get isSmallScreen() {
    return this.adminAuthGuard.isSmallScreen;
  }

  isIn(key: string, list: string[]) {
    for (let item of list) {
      if (key.toLowerCase() == item) {
        return true
      }
    }
    return false
  }
}
