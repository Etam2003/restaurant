import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth/auth.service';
import { RestaurantService } from '../shared/services/restaurant/restaurant.service';
import { Restaurant } from '../shared/models/restaurant';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  featuredRestaurants: Restaurant[] = [];
  loading = true;
  error = '';
  
  foodEmojis = ['🍔', '🍕', '🍣', '🍜', '🍲', '🍱', '🍝', '🍖', '🍗', '🥩', '🥗', '🌮', '🌯', '🍤', '🍛', '🥘'];
  restaurantEmojis: { [key: string]: string } = {};

  constructor(
    private authService: AuthService,
    private restaurantService: RestaurantService
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
    
    this.loadFeaturedRestaurants();
  }
  
  loadFeaturedRestaurants(): void {
    this.loading = true;
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        if (restaurants.length > 3) {
          const shuffled = [...restaurants].sort(() => 0.5 - Math.random());
          this.featuredRestaurants = shuffled.slice(0, 3);
        } else {
          this.featuredRestaurants = restaurants;
        }
        
        this.assignRandomEmojis();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load restaurants';
        console.error(error);
        this.loading = false;
      }
    });
  }
  
  assignRandomEmojis(): void {
    this.featuredRestaurants.forEach(restaurant => {
      if (!this.restaurantEmojis[restaurant._id!]) {
        const randomIndex = Math.floor(Math.random() * this.foodEmojis.length);
        this.restaurantEmojis[restaurant._id!] = this.foodEmojis[randomIndex];
      }
    });
  }
  
  getRandomEmoji(restaurantId: string): string {
    return this.restaurantEmojis[restaurantId] || '🍴';
  }
}