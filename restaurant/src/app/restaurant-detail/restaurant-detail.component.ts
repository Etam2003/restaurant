import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Restaurant, TimeSlot, Reservation } from '../shared/models/restaurant';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth/auth.service';
import { ReservationService } from '../shared/services/reservation/reservation.service';
import { RestaurantService } from '../shared/services/restaurant/restaurant.service';
import { TimeSlotService } from '../shared/services/timeSlot/time-slot.service';


@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './restaurant-detail.component.html',
  styleUrl: './restaurant-detail.component.scss'
})
export class RestaurantDetailComponent implements OnInit {
  restaurantId: string = '';
  restaurant: Restaurant | null = null;
  timeSlots: TimeSlot[] = [];
  filteredTimeSlots: TimeSlot[] = [];
  loading = true;
  reservationMode = false;
  selectedDate: string = '';
  selectedTimeSlot: TimeSlot | null = null;
  reservationForm!: FormGroup;
  error = '';
  success = '';
  submitting = false;
  user: User | null = null;
  foodEmoji: string = '🍴';
  
  foodEmojis = ['🍔', '🍕', '🍣', '🍜', '🍲', '🍱', '🍝', '🍖', '🍗', '🥩', '🥗', '🌮', '🌯', '🍤', '🍛', '🥘'];

  specialRequests = [
    { id: 'window', label: 'Window seat', selected: false },
    { id: 'quiet', label: 'Quiet area', selected: false },
    { id: 'outdoor', label: 'Outdoor seating', selected: false },
    { id: 'birthday', label: 'Birthday celebration', selected: false },
    { id: 'anniversary', label: 'Anniversary', selected: false },
    { id: 'business', label: 'Business meeting', selected: false }
  ];

  minDate = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restaurantService: RestaurantService,
    private timeSlotService: TimeSlotService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.restaurantId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.restaurantId) {
      this.error = 'No restaurant ID provided';
      this.loading = false;
      return;
    }

    this.foodEmoji = this.foodEmojis[Math.floor(Math.random() * this.foodEmojis.length)];
    
    this.loadRestaurantData();
    this.loadTimeSlots();
    
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.reservationForm.patchValue({
          guestName: user.name,
          guestEmail: user.email
        });
      }
    });
  }

  initForm(): void {
    this.reservationForm = this.fb.group({
      guestName: ['', [Validators.required]],
      guestEmail: ['', [Validators.required, Validators.email]],
      guestPhone: ['', [Validators.required]],
      partySize: [2, [Validators.required, Validators.min(1)]],
      specialRequests: ['']
    });
  }

  loadRestaurantData(): void {
    this.restaurantService.getRestaurantById(this.restaurantId).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load restaurant data';
        console.error(error);
        this.loading = false;
      }
    });
  }

  loadTimeSlots(): void {
    this.timeSlotService.getTimeSlotsByRestaurant(this.restaurantId).subscribe({
      next: (timeSlots) => {
        this.timeSlots = timeSlots.filter(slot => slot.isActive);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        this.timeSlots = this.timeSlots.filter(slot => {
          const slotDate = new Date(slot.date);
          slotDate.setHours(0, 0, 0, 0);
          return slotDate >= today;
        });
        
        this.filteredTimeSlots = [...this.timeSlots];
      },
      error: (error) => {
        this.error = 'Failed to load time slots';
        console.error(error);
      }
    });
  }

  onDateChange(): void {
    if (!this.selectedDate) {
      this.filteredTimeSlots = [...this.timeSlots];
      return;
    }

    const selectedDateObj = new Date(this.selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    this.filteredTimeSlots = this.timeSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);
      return slotDate.getTime() === selectedDateObj.getTime();
    });
    
    this.filteredTimeSlots.sort((a, b) => {
      const timeA = this.parseTime(a.startTime);
      const timeB = this.parseTime(b.startTime);
      return timeA - timeB;
    });
  }

  parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  selectTimeSlot(timeSlot: TimeSlot): void {
    this.selectedTimeSlot = timeSlot;
    this.reservationMode = true;
  }

  cancelReservation(): void {
    this.reservationMode = false;
    this.selectedTimeSlot = null;
    this.reservationForm.reset({
      partySize: 2
    });
    
    if (this.user) {
      this.reservationForm.patchValue({
        guestName: this.user.name,
        guestEmail: this.user.email
      });
    }
    
    this.specialRequests.forEach(req => req.selected = false);
  }

  toggleSpecialRequest(request: any): void {
    request.selected = !request.selected;
    this.updateSpecialRequests();
  }

  updateSpecialRequests(): void {
    const selectedRequests = this.specialRequests
      .filter(req => req.selected)
      .map(req => req.label);
    
    const customRequest = this.reservationForm.get('specialRequests')?.value;
    if (customRequest && !selectedRequests.includes(customRequest)) {
      selectedRequests.push(customRequest);
    }
    
    this.reservationForm.patchValue({
      specialRequests: selectedRequests.join(', ')
    });
  }

  submitReservation(): void {
    if (this.reservationForm.invalid || !this.selectedTimeSlot) {
      return;
    }

    if (this.selectedTimeSlot.availableSeats < this.reservationForm.value.partySize) {
      this.error = `Sorry, only ${this.selectedTimeSlot.availableSeats} seats available for this time slot.`;
      return;
    }

    this.submitting = true;
    this.error = '';
    this.success = '';

    const reservationData: Reservation = {
      restaurant: this.restaurantId,
      timeSlot: this.selectedTimeSlot._id!,
      guestName: this.reservationForm.value.guestName,
      guestEmail: this.reservationForm.value.guestEmail,
      guestPhone: this.reservationForm.value.guestPhone,
      partySize: this.reservationForm.value.partySize,
      specialRequests: this.reservationForm.value.specialRequests,
      status: 'pending'
    };

    this.reservationService.createReservation(reservationData).subscribe({
      next: (reservation) => {
        this.submitting = false;
        this.success = 'Reservation created successfully!';
        
        this.selectedTimeSlot!.availableSeats -= reservation.partySize;
        
          this.cancelReservation();
          this.router.navigate(['/profile']);
      },
      error: (error) => {
        this.submitting = false;
        this.error = error.error?.message || 'Failed to create reservation. Please try again.';
        console.error(error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}