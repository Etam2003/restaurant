import { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';
import asyncHandler from 'express-async-handler';


export const createRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { name, address, description, phone, email, website, features, openingHours } = req.body;
  
  try {
    const restaurant = await Restaurant.create({
      name,
      address,
      description,
      phone,
      email,
      website,
      features,
      openingHours,
      owner: (req.user as any)._id
    });
    
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create restaurant', error });
  }
});


export const getRestaurants = asyncHandler(async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find({});
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


export const getRestaurantById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


export const getRestaurantsByOwner = asyncHandler(async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find({ owner: (req.user as any)._id });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


export const updateRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { name, address, description, phone, email, website, features, openingHours } = req.body;
  
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
      return;
    }
    
    if (restaurant.owner.toString() !== (req.user as any)._id.toString() && !(req.user as any).isAdmin) {
      res.status(403).json({ message: 'Not authorized to update this restaurant' });
      return;
    }
    
    restaurant.name = name || restaurant.name;
    restaurant.address = address || restaurant.address;
    restaurant.description = description || restaurant.description;
    restaurant.phone = phone || restaurant.phone;
    restaurant.email = email || restaurant.email;
    restaurant.website = website || restaurant.website;
    restaurant.features = features || restaurant.features;
    restaurant.openingHours = openingHours || restaurant.openingHours;
    
    const updatedRestaurant = await restaurant.save();
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


export const deleteRestaurant = asyncHandler(async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
      return;
    }
    
    if (restaurant.owner.toString() !== (req.user as any)._id.toString() && !(req.user as any).isAdmin) {
      res.status(403).json({ message: 'Not authorized to delete this restaurant' });
      return;
    }
    
    await restaurant.deleteOne();
    res.json({ message: 'Restaurant removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});