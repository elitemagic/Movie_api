const jwtSecret = "your_jwt_secret";
// This must match the key used in the JWTStrategy

const jwt = require("jsonwebtoken"),
  passport = require("passport");

// My local passport file
require("./passport");

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

module.exports = (router) => {
  router.post("/signup", (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthdate: req.body.Birthdate,
          })
            .then((user) => {
              let token = generateJWTToken(user.toJSON());
              return res.status(201).json({ user, token });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  });

  // POST login

  router.post("/login", (req, res) => {
    console.log("Request received in /login:", req.body);
    console.log("Trying to authenticate user...");
    passport.authenticate("local", { session: false }, (error, user, info) => {
      console.log("Error and user:", error, user);
      if (error || !user) {
        console.log("Error or user not found:", error, user);
        return res.status(401).json({
          message: "Something aint right",
          user: user,
        });
      }
      if (info && info.message === "Incorrect password.") {
        console.log("Incorrect password:", user);
        return res.status(401).json({
          message: "Incorrect password",
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          console.log("Successful login:", user.Username);
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        console.log("I have a user ", { user, token });
        return res.json({ user, token });
      });
    })(req, res);
  });
};
