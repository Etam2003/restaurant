import express from 'express';
import {
  createTimeSlot,
  getTimeSlotsByRestaurant,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot
} from '../controllers/timeSlotController';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware';

export const configureTimeSlotRoutes = (router: express.Router): express.Router => {
  router.get('/restaurant/:restaurantId', getTimeSlotsByRestaurant);
  router.get('/:id', getTimeSlotById);
  
  router.post('/', isAuthenticated, createTimeSlot);
  router.put('/:id', isAuthenticated, updateTimeSlot);
  router.delete('/:id', isAuthenticated, deleteTimeSlot);
  
  return router;
};