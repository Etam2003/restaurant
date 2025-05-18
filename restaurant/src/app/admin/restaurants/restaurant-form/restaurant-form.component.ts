import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Restaurant, OpeningHour } from '../../../shared/models/restaurant';
import { RestaurantService } from '../../../shared/services/restaurant/restaurant.service';


@Component({
  selector: 'app-restaurant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './restaurant-form.component.html',
  styleUrl: './restaurant-form.component.scss'
})
export class RestaurantFormComponent implements OnInit {
  restaurantForm!: FormGroup;
  restaurantId: string | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  error = '';
  
  featureOptions = [
    'Parking',
    'Outdoor Seating',
    'Vegetarian Friendly',
    'Vegan Options',
    'Gluten-Free Options',
    'Wifi',
    'Pet Friendly',
    'Wheelchair Accessible',
    'Family Friendly',
    'Bar',
    'Live Music'
  ];
  
  daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    this.restaurantId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.restaurantId;
    
    if (this.isEditMode && this.restaurantId) {
      this.loadRestaurantData(this.restaurantId);
    } else {
      this.daysOfWeek.forEach(day => {
        this.addOpeningHour(day);
      });
    }
  }

  initForm(): void {
    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      description: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      website: [''],
      features: this.fb.array([]),
      openingHours: this.fb.array([])
    });
  
    this.featureOptions.forEach(feature => {
      this.featuresArray.push(this.fb.control(false));
    });
  }

  loadRestaurantData(id: string): void {
    this.loading = true;
    this.restaurantService.getRestaurantById(id).subscribe({
      next: (restaurant: Restaurant) => {
        this.restaurantForm.patchValue({
          name: restaurant.name,
          address: restaurant.address,
          description: restaurant.description,
          phone: restaurant.phone,
          email: restaurant.email,
          website: restaurant.website || ''
        });
        
        this.featureOptions.forEach((feature, index) => {
          if (restaurant.features.includes(feature)) {
            this.featuresArray.at(index).setValue(true);
          }
        });
        
        while (this.openingHoursArray.length) {
          this.openingHoursArray.removeAt(0);
        }
        
        restaurant.openingHours.forEach((hour: OpeningHour) => {
          this.openingHoursArray.push(this.fb.group({
            day: [hour.day, Validators.required],
            open: [hour.open, Validators.required],
            close: [hour.close, Validators.required]
          }));
        });
        
        const existingDays = restaurant.openingHours.map((hour: OpeningHour) => hour.day);
        this.daysOfWeek.forEach(day => {
          if (!existingDays.includes(day)) {
            this.addOpeningHour(day);
          }
        });
        
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load restaurant data.';
        console.error(error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.restaurantForm.invalid) {
      Object.keys(this.restaurantForm.controls).forEach(key => {
        const control = this.restaurantForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    const restaurantData = this.prepareRestaurantData();
    this.submitting = true;
    
    if (this.isEditMode && this.restaurantId) {
      this.updateRestaurant(this.restaurantId, restaurantData);
    } else {
      this.createRestaurant(restaurantData);
    }
  }

  prepareRestaurantData(): Restaurant {
    const formValue = this.restaurantForm.value;
    const selectedFeatures = this.featureOptions.filter((_, index) => formValue.features[index]);
    
    return {
      name: formValue.name,
      address: formValue.address,
      description: formValue.description,
      phone: formValue.phone,
      email: formValue.email,
      website: formValue.website || undefined,
      features: selectedFeatures,
      openingHours: formValue.openingHours
    };
  }

  createRestaurant(restaurantData: Restaurant): void {
    this.restaurantService.createRestaurant(restaurantData).subscribe({
      next: (restaurant: Restaurant) => {
        this.submitting = false;
        this.router.navigate(['/admin/restaurants']);
      },
      error: (error: any) => {
        this.error = 'Failed to create restaurant. Please try again.';
        console.error(error);
        this.submitting = false;
      }
    });
  }

  updateRestaurant(id: string, restaurantData: Restaurant): void {
    this.restaurantService.updateRestaurant(id, restaurantData).subscribe({
      next: (restaurant: Restaurant) => {
        this.submitting = false;
        this.router.navigate(['/admin/restaurants']);
      },
      error: (error: any) => {
        this.error = 'Failed to update restaurant. Please try again.';
        console.error(error);
        this.submitting = false;
      }
    });
  }

  addOpeningHour(day: string): void {
    this.openingHoursArray.push(this.fb.group({
      day: [day, Validators.required],
      open: ['09:00', Validators.required],
      close: ['22:00', Validators.required]
    }));
  }

  get featuresArray(): FormArray {
    return this.restaurantForm.get('features') as FormArray;
  }
  
  get openingHoursArray(): FormArray {
    return this.restaurantForm.get('openingHours') as FormArray;
  }
}