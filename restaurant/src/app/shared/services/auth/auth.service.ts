import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User, LoginCredentials, RegisterCredentials } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/users';
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkLoginStatus();
  }

  private checkLoginStatus(): void {
    this.http.get<boolean>(`${this.apiUrl}/checkAuth`, { withCredentials: true })
      .subscribe({
        next: (isLoggedIn) => {
          if (isLoggedIn && !this.userSubject.value) {
            this.getUserProfile().subscribe(user => {
              this.userSubject.next(user);
              localStorage.setItem('user', JSON.stringify(user));
            });
          } else if (!isLoggedIn && this.userSubject.value) {
            this.userSubject.next(null);
            localStorage.removeItem('user');
          }
        },
        error: () => {
          this.userSubject.next(null);
          localStorage.removeItem('user');
        }
      });
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        tap((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        }),
        catchError(error => {
          console.error('Login error:', error);
          
          if (error.error && typeof error.error === 'object' && error.error.message) {
            return throwError(() => ({ error: error.error.message }));
          } else if (typeof error.error === 'string') {
            return throwError(() => ({ error: error.error }));
          } else if (error.status === 401) {
            return throwError(() => ({ error: 'Hibás email cím vagy jelszó!' }));
          } else {
            return throwError(() => ({ error: 'Hiba történt a bejelentkezés során. Kérjük, próbálja újra.' }));
          }
        })
      );
  }

  register(credentials: RegisterCredentials): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, credentials, { withCredentials: true })
      .pipe(
        tap((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        }),
        catchError(error => {
          console.error('Register error:', error);
          
          if (error.error && typeof error.error === 'object' && error.error.message) {
            return throwError(() => ({ error: error.error.message }));
          } else if (typeof error.error === 'string') {
            return throwError(() => ({ error: error.error }));
          } else {
            return throwError(() => ({ error: 'Hiba történt a regisztráció során. Kérjük, próbálja újra.' }));
          }
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          localStorage.removeItem('user');
          this.userSubject.next(null);
        }),
        catchError(error => {
          console.error('Logout error:', error);
          localStorage.removeItem('user');
          this.userSubject.next(null);
          return throwError(() => error);
        })
      );
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error('Get profile error:', error);
          return throwError(() => error);
        })
      );
  }

  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, userData, { withCredentials: true })
      .pipe(
        tap((updatedUser) => {
          const currentUser = this.getUserFromStorage();
          if (currentUser) {
            const updatedStoredUser = { ...currentUser, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(updatedStoredUser));
            this.userSubject.next(updatedStoredUser);
          }
        }),
        catchError(error => {
          console.error('Update profile error:', error);
          return throwError(() => error);
        })
      );
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  private getUserFromStorage(): User | null {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  get isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }
}