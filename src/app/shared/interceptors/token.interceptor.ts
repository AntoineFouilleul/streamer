import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

/* Service */
import { SessionManagerService } from '../manager/session.manager';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private sessionManagerService: SessionManagerService, private router: Router) { }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Auth JWT Token add', request);
    // Manage all request to add JWT Token
    if (this.sessionManagerService.isLogged()) {
      // immutable request so clone object
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.sessionManagerService.getToken()}`,
        }
      });
    }

    // Manage all responses to redirect in case of 401 Unauthorized
    return next.handle(request).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response if you want
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }
}
