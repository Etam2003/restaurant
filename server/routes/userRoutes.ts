import express from 'express';
import { PassportStatic } from 'passport';
import { 
  getUserProfile, 
  registerUser, 
  updateUserProfile, 
  getAllUsers, 
  deleteUser, 
  checkAuth, 
  logoutUser 
} from '../controllers/userController';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware';

export const configureUserRoutes = (passport: PassportStatic, router: express.Router): express.Router => {
  router.post('/register', registerUser);
  
  router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Szerver hiba a bejelentkezés során.', error: err });
      }
      
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || 'Hibás email cím vagy jelszó.' 
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ 
            message: 'Hiba történt a bejelentkezés során.', 
            error: loginErr 
          });
        }
        
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  router.post('/logout', logoutUser);
  
  router.get('/checkAuth', checkAuth);
  
  router.route('/profile')
    .get(isAuthenticated, getUserProfile)
    .put(isAuthenticated, updateUserProfile);
  
  router.get('/getAllUsers', isAuthenticated, getAllUsers);
  
  router.delete('/deleteUser', isAuthenticated, isAdmin, deleteUser);
  
  return router;
};