import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { configurePassport } from './passport/passport';
import { configureUserRoutes } from './routes/userRoutes';
import { configureRestaurantRoutes } from './routes/restaurantRoutes';
import { configureTimeSlotRoutes } from './routes/timeSlotRoutes';
import { configureReservationRoutes } from './routes/reservationRoutes';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-key';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      console.error('Detailed error:', error);
    } else {
      console.error('An unknown error has occurred: ', error);
    }
    process.exit(1);
  }
};

connectDB();

const app = express();

const corsOptions = {
  origin: 'http://localhost:4200',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const sessionOptions: session.SessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

configurePassport(passport);

app.get('/', (req, res) => {
  res.send('Restaurant API is running');
});

app.use('/api/users', configureUserRoutes(passport, express.Router()));
app.use('/api/restaurants', configureRestaurantRoutes(express.Router()));
app.use('/api/timeslots', configureTimeSlotRoutes(express.Router()));
app.use('/api/reservations', configureReservationRoutes(express.Router()));

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});