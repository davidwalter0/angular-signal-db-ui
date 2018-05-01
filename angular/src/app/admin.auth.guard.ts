import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { Administration } from './admin.auth.config';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  Admins: any;

  constructor(private oauthService: OAuthService,
    private router: Router) {
    this.Admins = new Administration().Admins;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.oauthService.hasValidIdToken() && this.isAdmin()) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }

  isAdmin(): boolean {
    let claim = this.oauthService.getIdentityClaims();
    if (claim && claim['email'] && this.Admins.has(claim['email'])) {
      return true;
    }
    return false
  }

  get administrators() {
    return this.Admins;
  }

  get isSmallScreen() {
    return window.matchMedia("(max-width: 599px)").matches;
  }
}
