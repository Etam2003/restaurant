import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeSlot extends Document {
  restaurant: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  availableSeats: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timeSlotSchema: Schema<ITimeSlot> = new mongoose.Schema({
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  capacity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  availableSeats: { 
    type: Number, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

timeSlotSchema.index({ restaurant: 1, date: 1, startTime: 1 }, { unique: true });

const TimeSlot = mongoose.model<ITimeSlot>('TimeSlot', timeSlotSchema);

export default TimeSlot;