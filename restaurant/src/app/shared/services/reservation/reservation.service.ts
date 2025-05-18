import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Reservation } from '../../models/restaurant';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:5000/api/reservations';

  constructor(private http: HttpClient) { }

  getReservationsByRestaurant(restaurantId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/restaurant/${restaurantId}`, { withCredentials: true });
  }

  getReservationsByTimeSlot(timeSlotId: string): Observable<Reservation[]> {
  return this.http.get<Reservation[]>(`${this.apiUrl}/timeslot/${timeSlotId}`, { withCredentials: true });
}

  getReservationById(id: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createReservation(reservationData: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservationData, { withCredentials: true });
  }

  updateReservation(id: string, reservationData: Partial<Reservation>): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}`, reservationData, { withCredentials: true });
  }

  deleteReservation(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getUserReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}`, { withCredentials: true });
  }
}