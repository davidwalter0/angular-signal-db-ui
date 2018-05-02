import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { config } from './config';
import { User } from './admin.auth.config';
import { AdminAuthGuard } from './admin.auth.guard';
import { MatIconRegistry } from '@angular/material';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Signal Message';
  history = [];

  constructor(
    private oauthService: OAuthService,
    private router: Router,
    private adminAuthGuard: AdminAuthGuard,
    public snackBar: MatSnackBar,
  ) {
    this.oauthService.redirectUri = window.location.origin + '/home';
    this.oauthService.issuer = config.issuer;
    this.oauthService.clientId = config.clientid;
    this.oauthService.scope = 'openid profile email';
    this.oauthService.oidc = true;
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.showDebugInformation = true;
    this.oauthService.sessionChecksEnabled = true;
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  get debug_mode() {
    return config.DEBUG;
  }

  login() {
    this.oauthService.initImplicitFlow();
  }

  logout() {
    this.router.navigate(['/home']);
    this.history = [];
    this.oauthService.logOut();
    this.openSnackBar("Logout Complete!", "Logout");
  }

  get givenName() {
    const claims: any = this.oauthService.getIdentityClaims();
    if (!claims) {
      return null;
    }
    return claims.name;
  }

  get loggedin() {
    return this.oauthService.getIdentityClaims();
  }

  get origin() {
    return JSON.stringify(window.location.origin, null, "  ");
  }

  get location() {
    return JSON.stringify(window.location, null, "  ");
  }

  get cfg() {
    return JSON.stringify(config, null, "  ");
  }

  get oauthCfg() {
    return JSON.stringify(this.oauthService, null, "  ");
  }

  claim() {
    let token = this.oauthService.getIdentityClaims();
    if (!token) {
      return null;
    }
    return token;
  }

  get isAdmin() {
    return this.adminAuthGuard.isAdmin();
  }

  get admins(): Map<string, User> {
    return this.adminAuthGuard.administrators;
  }

  getKeys(map: Map<String, User>) {
    return Array.from(map.keys());
  }

  Keys() {
    return this.getKeys(this.adminAuthGuard.administrators);
  }

  v(k): User {
    return this.adminAuthGuard.administrators.get(k);
  }

  snackBarLoggedIn(): boolean {
    if (this.oauthService.hasValidIdToken()) {
      let claim = this.claim();
      if (claim) {
        let message = 'Logged in but name not found';
        if (claim.name) {
          message = `Logged in as ${claim.name}`;
        }
        this.openSnackBar(message, "Login");
        return true;
      }
    }
    this.openSnackBar("Not logged in", "Can't open page");
    return false;
  }

  validate_push(path) {
    if (this.snackBarLoggedIn()) {
      this.push(path);
    }
  }

  validate_pop() {
    this.snackBarLoggedIn();
    this.pop();
  }

  push(path) {
    this.history.push(window.location.pathname);
    this.router.navigate([path]);
    return path;
  }

  pop() {
    let path = '/home';
    if (this.history.length) {
      path = this.history.pop()
    }
    this.router.navigate([path]);
    return path;
  }

  path(match) {
    return window.location.pathname == match;
  }

  get isSmallScreen() {
    return this.adminAuthGuard.isSmallScreen;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
