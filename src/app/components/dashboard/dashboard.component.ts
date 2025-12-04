import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface'; // Añade esta importación

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <header class="navbar navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">TechSolutions Platform</a>
          <div class="d-flex align-items-center">
            <span class="text-white me-3">
              Bienvenido, {{user?.username}}
            </span>
            <button class="btn btn-outline-light btn-sm" (click)="logout()">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
      
      <div class="container-fluid mt-4">
        <div class="row">
          <div class="col-md-3">
            <div class="card">
              <div class="card-header">Menú</div>
              <div class="list-group list-group-flush">
                <a routerLink="/dashboard" class="list-group-item">Dashboard</a>
                <a routerLink="/products" class="list-group-item">Productos</a>
                <a routerLink="/orders" class="list-group-item">Pedidos</a>
                <a routerLink="/inventory" class="list-group-item">Inventario</a>
                <a routerLink="/payments" class="list-group-item">Pagos</a>
                <a *ngIf="hasAccessToReports()" routerLink="/reports" class="list-group-item">Reportes</a>
                <a routerLink="/settings" class="list-group-item">Configuración</a>
              </div>
            </div>
          </div>
          
          <div class="col-md-9">
            <div class="card">
              <div class="card-header">
                <h4>Dashboard</h4>
              </div>
              <div class="card-body">
                <h5>Bienvenido a la Plataforma de Gestión Empresarial</h5>
                <p>Usuario: {{user?.email}}</p>
                <p>Rol: {{user?.role}}</p>
                <p>Permisos: {{user?.permissions?.join(', ')}}</p>
                
                <div class="row mt-4">
                  <div class="col-md-4">
                    <div class="card text-white bg-primary">
                      <div class="card-body">
                        <h5 class="card-title">Productos</h5>
                        <p class="card-text">Gestiona tu catálogo de productos</p>
                        <a routerLink="/products" class="btn btn-light">Ir a Productos</a>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card text-white bg-success">
                      <div class="card-body">
                        <h5 class="card-title">Pedidos</h5>
                        <p class="card-text">Administra pedidos de clientes</p>
                        <a routerLink="/orders" class="btn btn-light">Ir a Pedidos</a>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card text-white bg-warning">
                      <div class="card-body">
                        <h5 class="card-title">Inventario</h5>
                        <p class="card-text">Controla tu stock y alertas</p>
                        <a routerLink="/inventory" class="btn btn-light">Ir a Inventario</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    
    .navbar {
      padding: 1rem;
    }
    
    .list-group-item {
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .list-group-item:hover {
      background-color: #f8f9fa;
    }
    
    .list-group-item.active {
      background-color: #007bff;
      border-color: #007bff;
    }
  `]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  hasAccessToReports(): boolean {
    return this.authService.hasRole('Manager') || this.authService.hasRole('Accountant');
  }
}