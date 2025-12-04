import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] || [];
  
  const user = authService.getCurrentUser();
  
  if (!user) {
    router.navigate(['/login']);
    return false;
  }
  
  if (requiredRoles.length === 0 || requiredRoles.includes(user.role)) {
    return true;
  }
  
  // Redirigir a dashboard si no tiene permisos
  router.navigate(['/dashboard']);
  return false;
};