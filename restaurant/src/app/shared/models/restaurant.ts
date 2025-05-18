export interface Restaurant {
    _id?: string;
    name: string;
    address: string;
    description: string;
    phone: string;
    email: string;
    website?: string;
    features: string[];
    openingHours: OpeningHour[];
    owner?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface OpeningHour {
    day: string;
    open: string;
    close: string;
  }
  
  export interface TimeSlot {
    _id?: string;
    restaurant: string;
    date: Date | string;
    startTime: string;
    endTime: string;
    capacity: number;
    availableSeats: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
export interface Reservation {
  _id?: string;
  restaurant: string | {
    name: string;
    address: string;
    [key: string]: any;
  };
  timeSlot: string | {
    date: string | Date;
    startTime: string;
    endTime: string;
    [key: string]: any;
  };
  user?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  partySize: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
}