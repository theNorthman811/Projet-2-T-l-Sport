// In olympic.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { olympic } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<olympic[] | null>(null);

  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<olympic[]> {
    return this.http.get<olympic[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error: HttpErrorResponse, caught: Observable<olympic[]>) => {
        console.error(error);
        this.olympics$.next(null);
        return caught;
      })
    );
  }

  getOlympics(): Observable<olympic[] | null> {
    return this.olympics$.asObservable();
  }

  getCountryDetails(countryId: number): Observable<olympic | undefined> {
    return this.olympics$.pipe(
      map((data: olympic[] | null) => data?.find((country) => country.id === countryId)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
