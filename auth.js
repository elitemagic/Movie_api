const jwtSecret = 'your_jwt_secret';
// This must match the key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

// My local passport file
require('./passport');


let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}


// POST login
module.exports = (router) => {
    router.post('/login', (req, res) => {
      console.log('Request received in /login:', req.body);
      passport.authenticate('local', { session: false }, (error, user, info) => {
        if (error || !user) {
          console.log('Error or user not found:', error, user);
          return res.status(400).json({
            message: 'Something is not right',
            user: user
          });
        }
        req.login(user, { session: false }, (error) => {
          if (error) {
            console.log('Successful login:', user.Username);
            res.send(error);
          }
          let token = generateJWTToken(user.toJSON());
          console.log("I have a user ", { user, token });
          return res.json({ user, token });
        });
      })(req, res);
    });
};

