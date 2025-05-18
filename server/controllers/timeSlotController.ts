import { Request, Response } from 'express';
import TimeSlot from '../models/TimeSlot';
import Restaurant from '../models/Restaurant';
import asyncHandler from 'express-async-handler';


export const createTimeSlot = asyncHandler(async (req: Request, res: Response) => {
    const { restaurant, date, startTime, endTime, capacity } = req.body;

    try {
        const restaurantDoc = await Restaurant.findById(restaurant);

        if (!restaurantDoc) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        if (restaurantDoc.owner.toString() !== (req.user as any)._id.toString() && !(req.user as any).isAdmin) {
            res.status(403).json({ message: 'Not authorized to create time slots for this restaurant' });
            return;
        }

        const existingTimeSlot = await TimeSlot.findOne({
            restaurant,
            date: new Date(date),
            startTime
        });

        if (existingTimeSlot) {
            res.status(400).json({ message: 'This time slot already exists' });
            return;
        }

        const timeSlot = await TimeSlot.create({
            restaurant,
            date: new Date(date),
            startTime,
            endTime,
            capacity,
            availableSeats: capacity,
            isActive: true
        });

        res.status(201).json(timeSlot);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create time slot', error });
    }
});


export const getTimeSlotsByRestaurant = asyncHandler(async (req: Request, res: Response) => {
    try {
        const timeSlots = await TimeSlot.find({
            restaurant: req.params.restaurantId

        }).sort({ date: 1, startTime: 1 });

        res.json(timeSlots);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

export const getTimeSlotById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const timeSlot = await TimeSlot.findById(req.params.id);

        if (timeSlot) {
            res.json(timeSlot);
        } else {
            res.status(404).json({ message: 'Time slot not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


export const updateTimeSlot = asyncHandler(async (req: Request, res: Response) => {
    const { startTime, endTime, capacity, isActive } = req.body;

    try {
        const timeSlot = await TimeSlot.findById(req.params.id);

        if (!timeSlot) {
            res.status(404).json({ message: 'Time slot not found' });
            return;
        }

        const restaurant = await Restaurant.findById(timeSlot.restaurant);

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        if (restaurant.owner.toString() !== (req.user as any)._id.toString() && !(req.user as any).isAdmin) {
            res.status(403).json({ message: 'Not authorized to modify this time slot' });
            return;
        }

        if (startTime) timeSlot.startTime = startTime;
        if (endTime) timeSlot.endTime = endTime;

        if (capacity && capacity !== timeSlot.capacity) {
            const availabilityRatio = timeSlot.availableSeats / timeSlot.capacity;
            timeSlot.capacity = capacity;

            timeSlot.availableSeats = Math.round(capacity * availabilityRatio);

            if (timeSlot.availableSeats < 0) timeSlot.availableSeats = 0;
        }

        if (isActive !== undefined) timeSlot.isActive = isActive;

        const updatedTimeSlot = await timeSlot.save();
        res.json(updatedTimeSlot);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


export const deleteTimeSlot = asyncHandler(async (req: Request, res: Response) => {
    try {
        const timeSlot = await TimeSlot.findById(req.params.id);

        if (!timeSlot) {
            res.status(404).json({ message: 'Time slot not found' });
            return;
        }

        const restaurant = await Restaurant.findById(timeSlot.restaurant);

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        if (restaurant.owner.toString() !== (req.user as any)._id.toString() && !(req.user as any).isAdmin) {
            res.status(403).json({ message: 'Not authorized to delete this time slot' });
            return;
        }

        await timeSlot.deleteOne();
        res.json({ message: 'Time slot removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});