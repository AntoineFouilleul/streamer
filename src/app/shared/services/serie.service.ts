import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Serie } from '../models/serie';
import { Saison } from '../models/saison';

@Injectable()
export class SerieService {
  constructor(private http: Http) {}

  getAll(): Observable<Serie[]> {
    return this.http.get('/rest/serie/', this.jwt())
      .map((response: Response): Serie[] => response.json())
      .map((data: any[]) => {
        const series = new Array<Serie>();
        for (const name in data) {
          if (data.hasOwnProperty(name)) {
            series.push(data[name]);
          }
        }
        return series;
      });
  }

  getById(id: number): Observable<Saison[]> {
    return this.http.get('/rest/serie/' + id, this.jwt())
      .map((response: Response) => response.json());
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
