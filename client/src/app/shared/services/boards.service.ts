import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardInterface } from '../types/board.interface';
import { environment } from 'src/environments/environment.development';

@Injectable()
export class BoardsService {
  constructor(private http: HttpClient) {}

  getBoards(): Observable<BoardInterface[]> {
    const url = environment.apiUrl + '/boards';

    return this.http.get<BoardInterface[]>(url);
  }
}
