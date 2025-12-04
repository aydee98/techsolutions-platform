import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="card">
        <div class="card-header">
          <h3>TechSolutions Platform</h3>
          <p>Iniciar Sesión</p>
        </div>
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                class="form-control"
                required
                email
                placeholder="admin&#64;techsolutions.com"
              >
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                class="form-control"
                required
                placeholder="admin123"
              >
            </div>
            <button
              type="submit"
              class="btn btn-primary w-100"
              [disabled]="loading"
            >
              <span *ngIf="!loading">Iniciar Sesión</span>
              <span *ngIf="loading">
                <span class="spinner-border spinner-border-sm" role="status"></span>
                Procesando...
              </span>
            </button>
          </form>
          
          <div class="mt-3 text-center">
            <small class="text-muted">Credenciales de prueba:</small>
            <div class="mt-1">
              <small>admin&#64;techsolutions.com / admin123</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .card {
      width: 100%;
      max-width: 400px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .card-header {
      background: #007bff;
      color: white;
      text-align: center;
      border-radius: 10px 10px 0 0 !important;
      padding: 2rem;
    }
    
    .card-header h3 {
      margin: 0;
      font-weight: 600;
    }
    
    .card-body {
      padding: 2rem;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.toastr.warning('Por favor, ingresa email y contraseña');
      return;
    }

    this.loading = true;
    
    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.toastr.success('Inicio de sesión exitoso');
          this.router.navigate(['/dashboard']);
        } else {
          this.toastr.error('Credenciales incorrectas');
        }
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Error en el servidor');
      }
    });
  }
}