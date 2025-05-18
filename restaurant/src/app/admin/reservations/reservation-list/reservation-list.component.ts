import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Restaurant, Reservation } from '../../../shared/models/restaurant';
import { ReservationService } from '../../../shared/services/reservation/reservation.service';
import { RestaurantService } from '../../../shared/services/restaurant/restaurant.service';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent implements OnInit {
  restaurantId: string = '';
  restaurant: Restaurant | null = null;
  reservations: Reservation[] = [];
  loading = true;
  error = '';
  statusFilter = 'all';
  
  statusOptions = [
    { value: 'all', label: 'All Reservations' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit(): void {
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantId') || '';
    if (!this.restaurantId) {
      this.error = 'No restaurant ID provided';
      this.loading = false;
      return;
    }

    this.loadRestaurantData();
    this.loadReservations();
  }

  loadRestaurantData(): void {
    this.restaurantService.getRestaurantById(this.restaurantId).subscribe({
      next: (restaurant: Restaurant) => {
        this.restaurant = restaurant;
      },
      error: (error: any) => {
        this.error = 'Failed to load restaurant data';
        console.error(error);
      }
    });
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getReservationsByRestaurant(this.restaurantId).subscribe({
      next: (reservations: Reservation[]) => {
        this.reservations = reservations;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load reservations';
        console.error(error);
        this.loading = false;
      }
    });
  }

  getFilteredReservations(): Reservation[] {
    if (this.statusFilter === 'all') {
      return this.reservations;
    }
    return this.reservations.filter(reservation => reservation.status === this.statusFilter);
  }

  updateReservationStatus(reservation: Reservation, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed'): void {
    this.reservationService.updateReservation(reservation._id!, { status: newStatus }).subscribe({
      next: (updatedReservation: Reservation) => {
        const index = this.reservations.findIndex(r => r._id === reservation._id);
        if (index !== -1) {
          this.reservations[index].status = updatedReservation.status;
        }
      },
      error: (error: any) => {
        this.error = 'Failed to update reservation status';
        console.error(error);
      }
    });
  }

  deleteReservation(reservationId: string): void {
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.reservationService.deleteReservation(reservationId).subscribe({
        next: () => {
          this.reservations = this.reservations.filter(r => r._id !== reservationId);
        },
        error: (error: any) => {
          this.error = 'Failed to delete reservation';
          console.error(error);
        }
      });
    }
  }

  getTimeSlotDate(timeSlot: any): string {
    if (timeSlot && timeSlot.date) {
      return this.formatDate(timeSlot.date);
    }
    return 'N/A';
  }

  getTimeSlotStartTime(timeSlot: any): string {
    if (timeSlot && timeSlot.startTime) {
      return this.formatTime(timeSlot.startTime);
    }
    return 'N/A';
  }

  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  }
}