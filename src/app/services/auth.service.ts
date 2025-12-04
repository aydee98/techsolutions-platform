import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User } from '../interfaces/user.interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Verificar si estamos en el navegador (no en SSR)
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string): Observable<boolean> {
    // Simulación de login
    const mockUser: User = {
      id: 1,
      username: 'admin',
      email: email,
      role: 'Admin',
      permissions: ['read', 'write', 'delete']
    };

    return of(true).pipe(
      delay(1000),
      map(() => {
        if (email === 'admin@techsolutions.com' && password === 'admin123') {
          this.currentUser = mockUser;
          
          // Solo usar localStorage si estamos en el navegador
          if (this.isBrowser()) {
            localStorage.setItem('auth_token', 'mock-jwt-token-12345');
            localStorage.setItem('user', JSON.stringify(mockUser));
          }
          
          return true;
        }
        return false;
      })
    );
  }

  logout(): void {
    this.currentUser = null;
    
    // Solo usar localStorage si estamos en el navegador
    if (this.isBrowser()) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  getCurrentUser(): User | null {
    if (!this.currentUser && this.isBrowser()) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    // Solo verificar en el navegador
    return this.isBrowser() && !!localStorage.getItem('auth_token');
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }
}