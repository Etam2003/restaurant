import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant } from '../../models/restaurant';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = 'http://localhost:5000/api/restaurants';

  constructor(private http: HttpClient) { }

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl);
  }

  getRestaurantById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/${id}`);
  }

  getMyRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/user/my-restaurants`, { withCredentials: true });
  }

  createRestaurant(restaurantData: Restaurant): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.apiUrl, restaurantData, { withCredentials: true });
  }

  updateRestaurant(id: string, restaurantData: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.apiUrl}/${id}`, restaurantData, { withCredentials: true });
  }

  deleteRestaurant(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}