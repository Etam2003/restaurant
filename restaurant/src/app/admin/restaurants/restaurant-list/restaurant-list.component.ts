import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Restaurant } from '../../../shared/models/restaurant';
import { RestaurantService } from '../../../shared/services/restaurant/restaurant.service';


@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-list.component.html',
  styleUrl: './restaurant-list.component.scss'
})
export class RestaurantListComponent implements OnInit {
  restaurants: Restaurant[] = [];
  loading = true;
  error = '';

  constructor(private restaurantService: RestaurantService) { }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.restaurantService.getMyRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load restaurants. Please try again.';
        console.error(error);
        this.loading = false;
      }
    });
  }

  deleteRestaurant(id: string): void {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      this.restaurantService.deleteRestaurant(id).subscribe({
        next: () => {
          this.restaurants = this.restaurants.filter(restaurant => restaurant._id !== id);
        },
        error: (error) => {
          this.error = 'Failed to delete restaurant. Please try again.';
          console.error(error);
        }
      });
    }
  }
}