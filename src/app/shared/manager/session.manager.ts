import { Injectable } from '@angular/core';
import { CookieManagerService } from './cookie.manager';

@Injectable()
export class SessionManagerService {

  constructor(private cookieManager: CookieManagerService) { }

  public login(token: string) {
    this.cookieManager.setCookie(CookieManagerService.COOKIE_SESSION, token, CookieManagerService.COOKIE_SESSION_EXPIRE_DAYS);
  }

  public logout() {
    this.cookieManager.deleteCookie(CookieManagerService.COOKIE_SESSION);
  }

  public isLogged(): boolean {
    return !!this.cookieManager.getCookie(CookieManagerService.COOKIE_SESSION);
  }

  public getToken(): string {
    return this.cookieManager.getCookie(CookieManagerService.COOKIE_SESSION);
  }
}
