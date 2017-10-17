import { Injectable } from '@angular/core';

@Injectable()
export class CookieManagerService {

  // Name of cookie to set user consent
  public static COOKIE_CONSENT = 'cookie_consent';
  // Maximum legal duration is 13 months
  public static COOKIE_CONSENT_EXPIRE_DAYS = 300;
  // Name of cookie to set user consent
  public static COOKIE_SESSION = 'session_user';
  // Session for one half day
  public static COOKIE_SESSION_EXPIRE_DAYS = 0.5;

  private isConsented = false;

  constructor() {
    this.isConsented = this.getCookie(CookieManagerService.COOKIE_CONSENT) === '1';
  }

  public getCookie(name: string) {
    const ca: string[] = document.cookie.split(';');
    const caLen: number = ca.length;
    const cookieName = name + '=';
    let c: string;

    for (let i = 0; i < caLen; i += 1) {
      c = ca[i].trim();
      if (c.indexOf(cookieName) === 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return '';
  }

  public deleteCookie(name) {
    this.setCookie(name, '', -1);
  }

  public setCookie(name: string, value: string, expireDays: number, path: string = '') {
    const d: Date = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    const expires: string = 'expires=' + d.toUTCString();
    document.cookie = name + '=' + value + '; ' + expires + (path.length > 0 ? '; path=' + path : '');
  }

  public consent(isConsent: boolean) {
    this.isConsented = isConsent;
    if (isConsent) {
      this.setCookie(CookieManagerService.COOKIE_CONSENT, '1', CookieManagerService.COOKIE_CONSENT_EXPIRE_DAYS);
    } else {
      this.deleteCookie(CookieManagerService.COOKIE_CONSENT);
    }
  }

  public isCookieAccepted() {
    return this.isConsented;
  }
}
