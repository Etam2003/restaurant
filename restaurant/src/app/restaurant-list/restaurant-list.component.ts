import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Restaurant } from '../shared/models/restaurant';
import { RestaurantService } from '../shared/services/restaurant/restaurant.service';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './restaurant-list.component.html',
  styleUrl: './restaurant-list.component.scss'
})
export class RestaurantListComponent implements OnInit {
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  filterFeature = '';

  foodEmojis = ['🍔', '🍕', '🍣', '🍜', '🍲', '🍱', '🍝', '🍖', '🍗', '🥩', '🥗', '🌮', '🌯', '🍤', '🍛', '🥘'];
  restaurantEmojis: { [key: string]: string } = {};

  constructor(
    private restaurantService: RestaurantService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.assignRandomEmojis();
        this.filteredRestaurants = [...this.restaurants];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load restaurants. Please try again.';
        console.error(error);
        this.loading = false;
      }
    });
  }

  assignRandomEmojis(): void {
    this.restaurants.forEach(restaurant => {
      if (!this.restaurantEmojis[restaurant._id!]) {
        const randomIndex = Math.floor(Math.random() * this.foodEmojis.length);
        this.restaurantEmojis[restaurant._id!] = this.foodEmojis[randomIndex];
      }
    });
  }

  getRandomEmoji(restaurantId: string): string {
    return this.restaurantEmojis[restaurantId] || '🍴';
  }

  viewRestaurant(restaurantId: string): void {
    this.router.navigate(['/restaurant', restaurantId]);
  }

  searchRestaurants(): void {
    if (!this.searchTerm && !this.filterFeature) {
      this.filteredRestaurants = [...this.restaurants];
      return;
    }

    this.filteredRestaurants = this.restaurants.filter(restaurant => {
      const matchesSearch = !this.searchTerm || 
        restaurant.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesFeature = !this.filterFeature || 
        restaurant.features.some(feature => 
          feature.toLowerCase().includes(this.filterFeature.toLowerCase()));
      
      return matchesSearch && matchesFeature;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterFeature = '';
    this.filteredRestaurants = [...this.restaurants];
  }
}