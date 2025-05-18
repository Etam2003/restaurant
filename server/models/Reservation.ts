import mongoose, { Document, Schema } from 'mongoose';

export interface IReservation extends Document {
  restaurant: mongoose.Types.ObjectId;
  timeSlot: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  partySize: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema: Schema<IReservation> = new mongoose.Schema({
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant', 
    required: true 
  },
  timeSlot: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TimeSlot', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  guestName: { 
    type: String, 
    required: true 
  },
  guestEmail: { 
    type: String, 
    required: true 
  },
  guestPhone: { 
    type: String, 
    required: true 
  },
  partySize: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  specialRequests: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  }
}, { 
  timestamps: true 
});

const Reservation = mongoose.model<IReservation>('Reservation', reservationSchema);

export default Reservation;