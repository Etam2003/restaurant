import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeSlot } from '../../models/restaurant';

@Injectable({
  providedIn: 'root'
})
export class TimeSlotService {
  private apiUrl = 'http://localhost:5000/api/timeslots';

  constructor(private http: HttpClient) { }

  getTimeSlotsByRestaurant(restaurantId: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.apiUrl}/restaurant/${restaurantId}`);
  }

  getTimeSlotById(id: string): Observable<TimeSlot> {
    return this.http.get<TimeSlot>(`${this.apiUrl}/${id}`);
  }

  createTimeSlot(timeSlotData: TimeSlot): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(this.apiUrl, timeSlotData, { withCredentials: true });
  }

  updateTimeSlot(id: string, timeSlotData: Partial<TimeSlot>): Observable<TimeSlot> {
    return this.http.put<TimeSlot>(`${this.apiUrl}/${id}`, timeSlotData, { withCredentials: true });
  }

  deleteTimeSlot(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}