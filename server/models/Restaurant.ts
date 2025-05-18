import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  address: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  features: string[];
  openingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema: Schema<IRestaurant> = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String },
  features: [{ type: String }],
  openingHours: [{
    day: { type: String, required: true },
    open: { type: String, required: true },
    close: { type: String, required: true }
  }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { 
  timestamps: true 
});

const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);

export default Restaurant;