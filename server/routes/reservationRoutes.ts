import express from 'express';
import { createReservation, getReservationsByRestaurant, getReservationById, updateReservation, deleteReservation, getUserReservations, getReservationsByTimeSlot } from '../controllers/reservationController';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware';

export const configureReservationRoutes = (router: express.Router): express.Router => {
  router.get('/', isAuthenticated, getUserReservations);

  router.post('/', isAuthenticated, createReservation);
  router.get('/restaurant/:restaurantId', isAuthenticated, getReservationsByRestaurant);
  router.get('/:id', isAuthenticated, getReservationById);
  router.put('/:id', isAuthenticated, updateReservation);
  router.delete('/:id', isAuthenticated, deleteReservation);
  router.get('/timeslot/:timeSlotId', getReservationsByTimeSlot);

  return router;
};