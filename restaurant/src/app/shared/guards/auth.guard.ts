import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const user = this.authService.getCurrentUser();
    
    if (user) {
      if (route.data['adminOnly'] && !user.isAdmin) {
        this.router.navigate(['/']);
        return false;
      }
      
      return this.http.get<boolean>('http://localhost:5000/api/users/checkAuth', { withCredentials: true })
        .pipe(
          map(isLoggedIn => {
            if (!isLoggedIn) {
              this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
              return false;
            }
            return true;
          }),
          catchError(() => {
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return of(false);
          })
        );
    }
    
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}