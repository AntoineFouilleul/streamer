import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

@Injectable()
export class HistroryService {
  constructor(private http: Http) {}

  getHistory(): Observable<any[]> {
    return this.http.get('/rest/history', this.jwt())
      .map((response: Response): any[] => response.json());
  }

  // private helper methods

  private jwt(): RequestOptions {
    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      const headers = new Headers({
        'Authorization': 'Bearer ' + currentUser.token
      });
      return new RequestOptions({
        headers: headers
      });
    }
  }
}
