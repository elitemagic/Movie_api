const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

// Initialize express
const app = express();

// Body parser (USE request)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); //bodyParser middleware function

// Cors middleware allowing all Cross Origin Requests
const cors = require("cors");
app.use(cors());

// const cors = require('cors');
// app.use(cors({
//  origin: (origin, callback) => {
//    if(!origin) return callback(null, true);
//    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
//      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
//      return callback(new Error(message ), false);
//    }
//    return callback(null, true);
//  }
// }));

// Auth
let auth = require("./auth")(app);

// Logging
app.use(morgan("common"));

const passport = require("passport");

require("./passport");

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Directors;

// connection to middleware
accessLogStream = fs.createWriteStream(path.join(__dirname, "./log.txt.log"), {
  flags: "a",
});

const { check, validationResult } = require("express-validator");

// Database
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// mongoose.connect('mongodb://127.0.0.1:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

// message displayed on landing page
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

// API endpoints

// Return details of all movies
app.get(
  "/movies",
  //passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Return details of one movie by title
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error " + err);
      });
  }
);

// Return description of a type of genre
app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genreName })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error " + err);
      });
  }
);

// Return data about Director
app.get(
  "/movies/director/:directorName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.directorName })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        res.status(500).send("Error " + err);
      });
  }
);

// Return details of all users
app.get(
  "/users",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("Received request to create user with body:", req.body);
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// add a new user
app.post(
  "/users",
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = req.body.Password
      ? Users.hashPassword(req.body.Password)
      : undefined;

    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthdate: req.body.Birthdate,
          })
            .then((user) => {
              res.status(201).json(user);
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
  }
);

// update a user
app.put(
  "/users/:Username",
  [
    check("Username", "Username is required").optional().isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non-alphanumeric characters - not allowed."
    )
      .optional()
      .isAlphanumeric(),
    check("Password", "Password is required").optional().not().isEmpty(),
    check("Email", "Email does not appear to be valid").optional().isEmail(),
    check("Birthdate", "Birthdate is required").optional().notEmpty(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = req.body.Password
      ? Users.hashPassword(req.body.Password)
      : undefined;

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          ...(hashedPassword && { Password: hashedPassword }),
          Email: req.body.Email,
          Birthdate: req.body.Birthdate,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error updating user information");
        } else {
          console.log("Updated user:", updatedUser);
          res.status(200).json(updatedUser);
        }
      }
    );
  }
);

// Define a new route for the user profile view
app.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Retrieve the logged-in user's information from the database
      const user = await Users.findOne({ Username: req.user.username });

      // Render the user profile view and pass the user object to the template
      res.json(user);
    } catch (error) {
      // Handle any errors that occur during the retrieval of user information
      console.error(error);
      res
        .status(500)
        .send("An error occurred while retrieving user information");
    }
  }
);

// get user by name
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Add a movie to a user's list of favorites
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const promise = Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    ).exec();

    promise.then((updatedUser) => {
      res.json(updatedUser);
    });
  }
);

// Retrive a list of user's list of favorites
app.get(
  "/users/:Username/favoriteMovies",
  // passport.authenticate("jwt", { session: false })
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found.");
        } else {
          res.status(200).json(user.FavoriteMovies);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Delete favourite movie from users profile
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Delete a user by username
app.delete(
  "/users/:Username",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Serve static files
app.use("/documentation", express.static("public"));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke");
});

// Listen for requests

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});

// app.listen(8080, () => {
// console.log('Your app is listening on port 8080.');
// });
