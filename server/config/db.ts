import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('MONGO_URI környezeti változó nincs megadva!');
      process.exit(1);
    }
    
    console.log('Kapcsolódás a MongoDB-hez...');
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Atlas kapcsolódva: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Hiba: ${error.message}`);
      console.error('Részletes hiba:', error);
    } else {
      console.error('Ismeretlen hiba történt: ', error);
    }
    process.exit(1);
  }
};

export default connectDB;