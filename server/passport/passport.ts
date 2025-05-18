import { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User';

export const configurePassport = (passport: PassportStatic): PassportStatic => {
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as any)._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id).select('-password');
      if (!user) {
        return done(null, false);
      }
      
      const userObject = {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      };
      
      done(null, userObject);
    } catch (error) {
      done(error, false);
    }
  });

  passport.use('local', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        
        if (!user) {
          return done(null, false, { message: 'Invalid email or password.' });
        }
        
        const isMatch = await user.comparePassword(password);
        
        if (isMatch) {
          return done(null, {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
          });
        } else {
          return done(null, false, { message: 'Invalid email or password.' });
        }
      } catch (error) {
        return done(error);
      }
    }
  ));

  return passport;
};