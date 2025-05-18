import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { AdminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./home/home.component').then((c) => c.HomeComponent) 
  },
  {
    path: 'restaurants',
    loadComponent: () => import('./restaurant-list/restaurant-list.component').then((c) => c.RestaurantListComponent)
  },
  {
    path: 'restaurant/:id',
    loadComponent: () => import('./restaurant-detail/restaurant-detail.component').then((c) => c.RestaurantDetailComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./register/register.component').then((c) => c.RegisterComponent) 
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./user-profile/user-profile.component').then((c) => c.UserProfileComponent), 
    canActivate: [AuthGuard] 
  },
  {
    path: 'reservations',
    loadComponent: () => import('./user-reservations/user-reservations.component').then((c) => c.UserReservationsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then((c) => c.AdminDashboardComponent), 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'admin/restaurants', 
    loadComponent: () => import('./admin/restaurants/restaurant-list/restaurant-list.component').then((c) => c.RestaurantListComponent), 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'admin/restaurants/create', 
    loadComponent: () => import('./admin/restaurants/restaurant-form/restaurant-form.component').then((c) => c.RestaurantFormComponent), 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'admin/restaurants/edit/:id', 
    loadComponent: () => import('./admin/restaurants/restaurant-form/restaurant-form.component').then((c) => c.RestaurantFormComponent), 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'admin/timeslots/:restaurantId', 
    loadComponent: () => import('./admin/timeslots/timeslot-list/timeslot-list.component').then((c) => c.TimeslotListComponent), 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'admin/timeslots/create/:restaurantId', 
    loadComponent: () => import('./admin/timeslots/timeslot-form/timeslot-form.component').then((c) => c.TimeslotFormComponent), 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'admin/timeslots/edit/:id', 
    loadComponent: () => import('./admin/timeslots/timeslot-form/timeslot-form.component').then((c) => c.TimeslotFormComponent), 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'admin/reservations/:restaurantId', 
    loadComponent: () => import('./admin/reservations/reservation-list/reservation-list.component').then((c) => c.ReservationListComponent), 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];