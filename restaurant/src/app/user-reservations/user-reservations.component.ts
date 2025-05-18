import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../shared/models/user';
import { Reservation } from '../shared/models/restaurant';
import { ReservationService } from '../shared/services/reservation/reservation.service';
import { AuthService } from '../shared/services/auth/auth.service';

@Component({
  selector: 'app-user-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-reservations.component.html',
  styleUrl: './user-reservations.component.scss'
})
export class UserReservationsComponent implements OnInit {
  user: User | null = null;
  reservations: Reservation[] = [];
  loading = true;
  error = '';

  constructor(
    private authService: AuthService,
    private reservationService: ReservationService
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.loadUserReservations();
      } else {
        this.loading = false;
      }
    });
  }

  loadUserReservations(): void {
    this.loading = true;
    this.reservationService.getUserReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.loading = false;
      },
      error: (error) => {
        console.error('Hiba a foglalások betöltésekor:', error);
        this.error = 'Nem sikerült betölteni a foglalásokat. Kérjük, próbálja újra később.';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('hu-HU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      console.error('Dátum formázási hiba:', e);
      return 'Érvénytelen dátum';
    }
  }

  getReservationDate(reservation: Reservation): string {
    if (!reservation || !reservation.timeSlot) return 'N/A';
    
    if (typeof reservation.timeSlot === 'object' && reservation.timeSlot !== null && reservation.timeSlot.date) {
      return this.formatDate(reservation.timeSlot.date);
    }
    return 'N/A';
  }

  getRestaurantName(reservation: Reservation): string {
    if (!reservation || !reservation.restaurant) return 'Étterem';
    
    if (typeof reservation.restaurant === 'object' && reservation.restaurant !== null) {
      return reservation.restaurant.name || 'Étterem';
    }
    return 'Étterem';
  }

  getRestaurantAddress(reservation: Reservation): string {
    if (!reservation || !reservation.restaurant) return '';
    
    if (typeof reservation.restaurant === 'object' && reservation.restaurant !== null && reservation.restaurant.address) {
      return reservation.restaurant.address;
    }
    return '';
  }

  hasRestaurantAddress(reservation: Reservation): boolean {
    return typeof reservation.restaurant === 'object' && 
           reservation.restaurant !== null && 
           !!reservation.restaurant.address;
  }

  getTimeSlotStartTime(reservation: Reservation): string {
    if (!reservation || !reservation.timeSlot) return '';
    
    if (typeof reservation.timeSlot === 'object' && reservation.timeSlot !== null) {
      return reservation.timeSlot.startTime || '';
    }
    return '';
  }

  getTimeSlotEndTime(reservation: Reservation): string {
    if (!reservation || !reservation.timeSlot) return '';
    
    if (typeof reservation.timeSlot === 'object' && reservation.timeSlot !== null) {
      return reservation.timeSlot.endTime || '';
    }
    return '';
  }

  cancelReservation(reservationId: string): void {
    if (!reservationId) {
      this.error = 'Érvénytelen foglalás azonosító';
      return;
    }
    
    if (confirm('Biztosan törölni szeretné ezt a foglalást?')) {
      this.reservationService.updateReservation(reservationId, { status: 'cancelled' }).subscribe({
        next: () => {
          const reservation = this.reservations.find(r => r._id === reservationId);
          if (reservation) {
            reservation.status = 'cancelled';
          }
        },
        error: (error) => {
          this.error = 'Nem sikerült törölni a foglalást. Kérjük, próbálja újra később.';
          console.error('Hiba a foglalás törlésekor:', error);
        }
      });
    }
  }
}