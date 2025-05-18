import { Request, Response } from 'express';
import Reservation from '../models/Reservation';
import TimeSlot from '../models/TimeSlot';
import Restaurant from '../models/Restaurant';
import asyncHandler from 'express-async-handler';

export const createReservation = asyncHandler(async (req: Request, res: Response) => {
  const { restaurant, timeSlot, guestName, guestEmail, guestPhone, partySize, specialRequests } = req.body;

  try {
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      res.status(404).json({ message: 'Restaurant not found' });
      return;
    }

    const timeSlotDoc = await TimeSlot.findById(timeSlot);
    if (!timeSlotDoc) {
      res.status(404).json({ message: 'Time slot not found' });
      return;
    }

    if (!timeSlotDoc.isActive) {
      res.status(400).json({ message: 'This time slot is no longer available' });
      return;
    }

    if (timeSlotDoc.availableSeats < partySize) {
      res.status(400).json({ message: 'Not enough available seats for this reservation' });
      return;
    }

    const reservation = await Reservation.create({
      restaurant,
      timeSlot,
      user: (req.user as any)._id,
      guestName,
      guestEmail,
      guestPhone,
      partySize,
      specialRequests,
      status: 'pending'
    });

    timeSlotDoc.availableSeats -= partySize;

    if (timeSlotDoc.availableSeats < timeSlotDoc.capacity) {
      timeSlotDoc.isActive = false;
    }

    await timeSlotDoc.save();

    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create reservation', error });
  }
});

export const getReservationsByRestaurant = asyncHandler(async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
      return;
    }

    if (restaurant.owner.toString() !== (req.user as any)._id.toString() && !(req.user as any).isAdmin) {
      res.status(403).json({ message: 'Not authorized to view reservations for this restaurant' });
      return;
    }

    const reservations = await Reservation.find({ restaurant: req.params.restaurantId })
      .populate('timeSlot')
      .populate('user', 'name email');

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export const getReservationById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('restaurant')
      .populate('timeSlot')
      .populate('user', 'name email');

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    const isOwner = reservation.user && reservation.user._id.toString() === (req.user as any)._id.toString();
    const restaurant = await Restaurant.findById(reservation.restaurant);
    const isRestaurantOwner = restaurant && restaurant.owner.toString() === (req.user as any)._id.toString();

    if (!isOwner && !isRestaurantOwner && !(req.user as any).isAdmin) {
      res.status(403).json({ message: 'Not authorized to view this reservation' });
      return;
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export const getReservationsByTimeSlot = asyncHandler(async (req: Request, res: Response) => {
  try {
    const reservations = await Reservation.find({ 
      timeSlot: req.params.timeSlotId 
    });
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export const getUserReservations = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Nincs bejelentkezve' });
      return;
    }

    const reservations = await Reservation.find({ user: (req.user as any)._id })
      .populate('restaurant')
      .populate('timeSlot')
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Szerver hiba', error });
  }
});

export const updateReservation = asyncHandler(async (req: Request, res: Response) => {
  const { status, partySize, specialRequests } = req.body;

  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    const isOwner = reservation.user && reservation.user.toString() === (req.user as any)._id.toString();
    const restaurant = await Restaurant.findById(reservation.restaurant);
    const isRestaurantOwner = restaurant && restaurant.owner.toString() === (req.user as any)._id.toString();

    if (!isOwner && !isRestaurantOwner && !(req.user as any).isAdmin) {
      res.status(403).json({ message: 'Not authorized to update this reservation' });
      return;
    }

    if (partySize && partySize !== reservation.partySize) {
      const timeSlot = await TimeSlot.findById(reservation.timeSlot);
      if (!timeSlot) {
        res.status(404).json({ message: 'Time slot not found' });
        return;
      }

      const seatsDifference = reservation.partySize - partySize;
      timeSlot.availableSeats += seatsDifference;

      if (timeSlot.availableSeats < 0) {
        res.status(400).json({ message: 'Not enough available seats for this change' });
        return;
      }

      if (timeSlot.availableSeats > 0 && !timeSlot.isActive) {
        timeSlot.isActive = true;
      }

      if (timeSlot.availableSeats > timeSlot.capacity) {
        timeSlot.availableSeats = timeSlot.capacity;
      }

      await timeSlot.save();
      reservation.partySize = partySize;
    }

    if (status && status !== reservation.status) {
      const timeSlot = await TimeSlot.findById(reservation.timeSlot);
      if (timeSlot) {
        if (status === 'cancelled') {
          timeSlot.availableSeats += reservation.partySize;
          timeSlot.isActive = true;
          if (timeSlot.availableSeats > timeSlot.capacity) {
            timeSlot.availableSeats = timeSlot.capacity;
          }
          await timeSlot.save();
        }
      }
    }

    if (status) reservation.status = status;
    if (specialRequests !== undefined) reservation.specialRequests = specialRequests;

    const updatedReservation = await reservation.save();

    res.json(updatedReservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export const deleteReservation = asyncHandler(async (req: Request, res: Response) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    const isOwner = reservation.user && reservation.user.toString() === (req.user as any)._id.toString();
    const restaurant = await Restaurant.findById(reservation.restaurant);
    const isRestaurantOwner = restaurant && restaurant.owner.toString() === (req.user as any)._id.toString();

    if (!isOwner && !isRestaurantOwner && !(req.user as any).isAdmin) {
      res.status(403).json({ message: 'Not authorized to delete this reservation' });
      return;
    }

    const timeSlot = await TimeSlot.findById(reservation.timeSlot);
    if (timeSlot) {
      timeSlot.availableSeats += reservation.partySize;

      timeSlot.isActive = true;

      if (timeSlot.availableSeats > timeSlot.capacity) {
        timeSlot.availableSeats = timeSlot.capacity;
      }
      await timeSlot.save();
    }

    await reservation.deleteOne();

    res.json({ message: 'Reservation removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});