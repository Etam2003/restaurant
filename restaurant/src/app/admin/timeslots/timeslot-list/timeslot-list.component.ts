import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Restaurant, TimeSlot } from '../../../shared/models/restaurant';
import { RestaurantService } from '../../../shared/services/restaurant/restaurant.service';
import { TimeSlotService } from '../../../shared/services/timeSlot/time-slot.service';
import { ReservationService } from '../../../shared/services/reservation/reservation.service';


@Component({
  selector: 'app-timeslot-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './timeslot-list.component.html',
  styleUrl: './timeslot-list.component.scss'
})
export class TimeslotListComponent implements OnInit {
  restaurantId: string = '';
  restaurant: Restaurant | null = null;
  timeSlots: TimeSlot[] = [];
  loading = true;
  error = '';
  selectedDate: string = '';
  filteredTimeSlots: TimeSlot[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private timeSlotService: TimeSlotService,
    private restaurantService: RestaurantService,
    private reservationService: ReservationService
  ) {}

  timeSlotReservations: {[timeSlotId: string]: boolean} = {};


  ngOnInit(): void {
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantId') || '';
    if (!this.restaurantId) {
      this.error = 'No restaurant ID provided';
      this.loading = false;
      return;
    }

    this.selectedDate = '';
    
    this.loadRestaurantData();
    this.loadTimeSlots();
  }

  loadRestaurantData(): void {
    this.restaurantService.getRestaurantById(this.restaurantId).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
      },
      error: (error) => {
        this.error = 'Failed to load restaurant data';
        console.error(error);
      }
    });
  }

  loadTimeSlots(): void {
  this.loading = true;
  this.timeSlotService.getTimeSlotsByRestaurant(this.restaurantId).subscribe({
    next: (timeSlots) => {
      this.timeSlots = timeSlots;
      this.filterTimeSlots();
      
      this.timeSlots.forEach(slot => {
        if (slot._id) {
          this.checkTimeSlotHasReservations(slot._id);
        }
      });
      
      this.loading = false;
    },
    error: (error) => {
      this.error = 'Failed to load time slots';
      console.error(error);
      this.loading = false;
    }
  });
}

checkTimeSlotHasReservations(timeSlotId: string): void {
  this.reservationService.getReservationsByTimeSlot(timeSlotId).subscribe({
    next: (reservations) => {
      this.timeSlotReservations[timeSlotId] = reservations.some(r => 
        r.status !== 'cancelled'
      );
    },
    error: (error) => {
      console.error(`Error checking reservations for time slot ${timeSlotId}`, error);
      this.timeSlotReservations[timeSlotId] = true;
    }
  });
}

toggleTimeSlotStatus(timeSlot: TimeSlot): void {
  if (!timeSlot.isActive && this.timeSlotReservations[timeSlot._id!]) {
    this.error = 'Cannot activate time slot with existing reservations';
    return;
  }

  const updatedStatus = !timeSlot.isActive;
  this.timeSlotService.updateTimeSlot(timeSlot._id!, { isActive: updatedStatus }).subscribe({
    next: (updatedTimeSlot) => {
      const index = this.timeSlots.findIndex(ts => ts._id === timeSlot._id);
      if (index !== -1) {
        this.timeSlots[index].isActive = updatedTimeSlot.isActive;
        this.filterTimeSlots();
      }
    },
    error: (error) => {
      this.error = 'Failed to update time slot status';
      console.error(error);
    }
  });
}

  filterTimeSlots(): void {
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
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      return 0;
    });
  }

  onDateChange(): void {
    this.filterTimeSlots();
  }

  deleteTimeSlot(timeSlotId: string): void {
    if (confirm('Are you sure you want to delete this time slot?')) {
      this.timeSlotService.deleteTimeSlot(timeSlotId).subscribe({
        next: () => {
          this.timeSlots = this.timeSlots.filter(ts => ts._id !== timeSlotId);
          this.filterTimeSlots();
        },
        error: (error) => {
          this.error = 'Failed to delete time slot';
          console.error(error);
        }
      });
    }
  }

  navigateToCreateTimeSlot(): void {
    this.router.navigate(['/admin/timeslots/create', this.restaurantId]);
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
}