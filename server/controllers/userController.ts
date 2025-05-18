import { Request, Response } from 'express';
import User from '../models/User';
import asyncHandler from 'express-async-handler';

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'You are not logged in.' });
    return;
  }

  try {
    const user = await User.findById((req.user as any)._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'No user found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'This email address is already registered.' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin: false
    });

    if (user) {
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error when logging in.', error: err });
        }
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin
        });
      });
    } else {
      res.status(400).json({ message: 'Invalid user data.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'You are not logged in.' });
    return;
  }

  try {
    const user = await User.findById((req.user as any)._id);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin
      });
    } else {
      res.status(404).json({ message: 'No user found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.query.id);
    
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User successfully deleted.' });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

export const checkAuth = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.status(200).json(true);
  } else {
    res.status(200).json(false);
  }
};

export const logoutUser = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during check-out.', error: err });
    }
    res.status(200).json({ message: 'Successful check-out.' });
  });
};