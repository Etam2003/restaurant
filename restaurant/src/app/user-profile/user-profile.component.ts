import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { first } from 'rxjs/operators';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth/auth.service';
import { ReservationService } from '../shared/services/reservation/reservation.service';
import { Reservation } from '../shared/models/restaurant';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user: User | null = null;
  loading = true;
  updating = false;
  submitted = false;
  error = '';
  success = '';
  reservations: Reservation[] = [];
  loadingReservations = true;
  reservationError = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private reservationService: ReservationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]]
    });

    this.authService.getUserProfile()
      .pipe(first())
      .subscribe({
        next: (user) => {
          this.user = user;
          this.profileForm.patchValue({
            name: user.name,
            email: user.email
          });
          this.loading = false;
          this.loadUserReservations();
        },
        error: (error) => {
          this.error = 'Failed to load user profile.';
          this.loading = false;
        }
      });
  }

  get f() {
    return this.profileForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.profileForm.invalid) {
      return;
    }

    this.updating = true;
    const updateData: Partial<User> = {};

    if (this.f['name'].value !== this.user?.name) {
      updateData.name = this.f['name'].value;
    }

    if (this.f['email'].value !== this.user?.email) {
      updateData.email = this.f['email'].value;
    }

    if (this.f['password'].value) {
      updateData.password = this.f['password'].value;
    }

    if (Object.keys(updateData).length === 0) {
      this.success = 'No changes made.';
      this.updating = false;
      return;
    }

    this.authService.updateUserProfile(updateData)
      .pipe(first())
      .subscribe({
        next: (user) => {
          this.success = 'Profile successfully updated!';
          this.updating = false;
        },
        error: error => {
          this.error = error.error || 'An error occurred while updating the profile.';
          this.updating = false;
        }
      });
  }

  loadUserReservations(): void {
    this.loadingReservations = true;
    this.reservationService.getUserReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.loadingReservations = false;
      },
      error: (error) => {
        this.reservationError = 'Failed to load your reservations';
        console.error(error);
        this.loadingReservations = false;
      }
    });
  }

  viewAllReservations(): void {
    this.router.navigate(['/reservations']);
  }

  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  getReservationDate(reservation: Reservation): string {
    if (typeof reservation.timeSlot === 'object' && reservation.timeSlot !== null) {
      return this.formatDate(reservation.timeSlot.date);
    }
    return 'N/A';
  }

  getRestaurantName(reservation: Reservation): string {
    if (typeof reservation.restaurant === 'object' && reservation.restaurant !== null) {
      return reservation.restaurant.name || 'Restaurant';
    }
    return 'Restaurant';
  }

  getTimeSlotStartTime(reservation: Reservation): string {
    if (typeof reservation.timeSlot === 'object' && reservation.timeSlot !== null) {
      return reservation.timeSlot.startTime || '';
    }
    return '';
  }

  cancelReservation(reservationId: string): void {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.reservationService.updateReservation(reservationId, { status: 'cancelled' }).subscribe({
        next: () => {
          const reservation = this.reservations.find(r => r._id === reservationId);
          if (reservation) {
            reservation.status = 'cancelled';
          }
        },
        error: (error) => {
          this.reservationError = 'Failed to cancel reservation';
          console.error(error);
        }
      });
    }
  }
}