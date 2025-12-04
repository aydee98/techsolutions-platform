import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet], // ¡AÑADE RouterOutlet AQUÍ!
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'TechSolutions Platform';
  
  currentUser = {
    name: 'admin',
    email: 'admin@techsolutions.com',
    role: 'Admin',
    permissions: ['read', 'write', 'delete']
  };

  activeTab = 'dashboard';
  
  menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard', visible: true },
    { id: 'products', label: 'Productos', icon: '📦', route: '/products', visible: true },
    { id: 'orders', label: 'Pedidos', icon: '📋', route: '/orders', visible: true },
    { id: 'inventory', label: 'Inventario', icon: '📊', route: '/inventory', visible: true },
    { id: 'payments', label: 'Pagos', icon: '💳', route: '/payments', visible: true },
    { id: 'reports', label: 'Reportes', icon: '📈', route: '/reports', visible: true },
    { id: 'settings', label: 'Configuración', icon: '⚙️', route: '/settings', visible: true }
  ];

  features = [
    {
      id: 'products',
      title: 'Productos',
      description: 'Gestiona tu catálogo de productos',
      icon: '📦',
      route: '/products',
      color: '#3498db',
      visible: true
    },
    {
      id: 'orders',
      title: 'Pedidos',
      description: 'Administra pedidos de clientes',
      icon: '📋',
      route: '/orders',
      color: '#2ecc71',
      visible: true
    },
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Controla tu stock y alertas',
      icon: '📊',
      route: '/inventory',
      color: '#e74c3c',
      visible: true
    }
  ];

  private routerSubscription!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveTabFromUrl(event.url);
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateActiveTabFromUrl(url: string): void {
    const urlSegment = url.split('/')[1] || 'dashboard';
    this.activeTab = urlSegment;
  }

  setActiveTab(tabId: string): void {
    const menuItem = this.menuItems.find(item => item.id === tabId);
    if (menuItem) {
      this.activeTab = tabId;
      this.router.navigate([menuItem.route]);
    }
  }

  logout(): void {
    console.log('Cerrando sesión...');
    // Simulación de logout
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.router.navigate(['/login']);
    alert('Sesión cerrada exitosamente');
  }

  onFeatureClick(featureId: string): void {
    this.setActiveTab(featureId);
  }

  getNavItemClass(itemId: string): string {
    return this.activeTab === itemId ? 'nav-item active' : 'nav-item';
  }

  getVisibleMenuItems() {
    return this.menuItems.filter(item => item.visible);
  }

  getVisibleFeatures() {
    return this.features.filter(feature => feature.visible);
  }
}