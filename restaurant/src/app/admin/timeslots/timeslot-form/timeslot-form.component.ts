import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Restaurant, TimeSlot } from '../../../shared/models/restaurant';
import { RestaurantService } from '../../../shared/services/restaurant/restaurant.service';
import { TimeSlotService } from '../../../shared/services/timeSlot/time-slot.service';


@Component({
  selector: 'app-timeslot-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './timeslot-form.component.html',
  styleUrl: './timeslot-form.component.scss'
})
export class TimeslotFormComponent implements OnInit {
  timeSlotForm!: FormGroup;
  timeSlotId: string | null = null;
  restaurantId: string | null = null;
  restaurant: Restaurant | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  error = '';
  
  minDate = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private timeSlotService: TimeSlotService,
    private restaurantService: RestaurantService
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    this.timeSlotId = this.route.snapshot.paramMap.get('id');
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantId');
    this.isEditMode = !!this.timeSlotId;
    
    if (this.isEditMode && this.timeSlotId) {
      this.loadTimeSlotData(this.timeSlotId);
    } else if (this.restaurantId) {
      this.loadRestaurantData(this.restaurantId);
      this.timeSlotForm.patchValue({ restaurant: this.restaurantId });
    } else {
      this.error = 'No restaurant ID provided';
    }
  }

  initForm(): void {
    this.timeSlotForm = this.fb.group({
      restaurant: ['', [Validators.required]],
      date: ['', [Validators.required]],
      startTime: ['18:00', [Validators.required]],
      endTime: ['20:00', [Validators.required]],
      capacity: [4, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  loadTimeSlotData(id: string): void {
    this.loading = true;
    this.timeSlotService.getTimeSlotById(id).subscribe({
      next: (timeSlot) => {
        const formattedDate = new Date(timeSlot.date).toISOString().split('T')[0];
        
        this.timeSlotForm.patchValue({
          restaurant: timeSlot.restaurant,
          date: formattedDate,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          capacity: timeSlot.capacity,
          isActive: timeSlot.isActive
        });
        
        this.loadRestaurantData(timeSlot.restaurant);
        
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load time slot data';
        console.error(error);
        this.loading = false;
      }
    });
  }

  loadRestaurantData(id: string): void {
    this.restaurantService.getRestaurantById(id).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
      },
      error: (error) => {
        this.error = 'Failed to load restaurant data';
        console.error(error);
      }
    });
  }

  onSubmit(): void {
    if (this.timeSlotForm.invalid) {
      Object.keys(this.timeSlotForm.controls).forEach(key => {
        const control = this.timeSlotForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    const timeSlotData = this.prepareTimeSlotData();
    this.submitting = true;
    
    if (this.isEditMode && this.timeSlotId) {
      this.updateTimeSlot(this.timeSlotId, timeSlotData);
    } else {
      this.createTimeSlot(timeSlotData);
    }
  }

  prepareTimeSlotData(): TimeSlot {
    const formValue = this.timeSlotForm.value;
    
    return {
      restaurant: formValue.restaurant,
      date: formValue.date,
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      capacity: formValue.capacity,
      availableSeats: formValue.capacity,
      isActive: formValue.isActive
    };
  }

  createTimeSlot(timeSlotData: TimeSlot): void {
    this.timeSlotService.createTimeSlot(timeSlotData).subscribe({
      next: (timeSlot) => {
        this.submitting = false;
        this.router.navigate(['/admin/timeslots', timeSlot.restaurant]);
      },
      error: (error) => {
        this.error = 'Failed to create time slot. Please try again.';
        console.error(error);
        this.submitting = false;
      }
    });
  }

  updateTimeSlot(id: string, timeSlotData: TimeSlot): void {
    this.timeSlotService.updateTimeSlot(id, timeSlotData).subscribe({
      next: (timeSlot) => {
        this.submitting = false;
        this.router.navigate(['/admin/timeslots', timeSlot.restaurant]);
      },
      error: (error) => {
        this.error = 'Failed to update time slot. Please try again.';
        console.error(error);
        this.submitting = false;
      }
    });
  }

  goBack(): void {
    const restaurantId = this.restaurant?._id || this.restaurantId;
    if (restaurantId) {
      this.router.navigate(['/admin/timeslots', restaurantId]);
    } else {
      this.router.navigate(['/admin/restaurants']);
    }
  }
}