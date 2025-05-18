import express from 'express';
import { createRestaurant, getRestaurants, getRestaurantById, getRestaurantsByOwner, updateRestaurant, deleteRestaurant } from '../controllers/restaurantController';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware';

export const configureRestaurantRoutes = (router: express.Router): express.Router => {
  router.get('/user/my-restaurants', isAuthenticated, getRestaurantsByOwner);
  router.get('/', getRestaurants);
  router.get('/:id', getRestaurantById);
  router.post('/', isAuthenticated, createRestaurant);
  router.put('/:id', isAuthenticated, updateRestaurant);
  router.delete('/:id', isAuthenticated, deleteRestaurant);

  return router;
};