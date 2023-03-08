const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const fs = require("fs");
const path = require("path");
const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Directors;

mongoose.connect('mongodb://127.0.0.1/cfDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
 });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true})); //bodyParser middle ware function

app.use(morgan("common"));

let auth = require('./auth')(app);

// To require passport module and import passport.js file
const passport = require('passport');
 require('./passport');


// Message displayed on landing page
app.get("/", (req, res) => {
    res.send("Welcome to myFlix!");
});

// Return details of all movies
app.get("/movies", passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

// Return details of one movie by title
app.get("/movies/:Title", (req, res) => {
  Movies.findOne ({ Title: req.params.Title})
  .then ((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

// Return description of a type of genre
app.get("/movies/genre/:genreName", (req, res) => {
  Movies.findOne ({ 'Genre.Name' : req.params.genreName })
  .then ((movie) => {
    res.json(movie.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' +  err);
  });
});

// Return data about Director
app.get("/movies/director/:directorName", (req,res) => {
  Movies.findOne ({ 'Director.Name' : req.params.directorName })
  .then ((movie) => {
    res.json(movie.Director);
  })
  .catch((err) => {
    res.status(500).send ('Error ' + err);
  });
}); 

// Return details of all users
app.get("/users", (req, res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  });
});


// add a new user
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + ' already exists');
      } else {
      Users
        .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// update a user via username
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, { $set: {
    Username: req.body.Username,
    Password: req.body.Password,
    Email: req.body.Email,
    Birthday: req.body.Birthday
  } 
},
{ new: true },
(err, updatedUser) => {
  if (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  } else {
    res.json(updatedUser);
  }
  });
});


// get user by name
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
  .then((users) => {
    res.json(users);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});



// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


// Delete favourite movie from users profile
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate ({Username: req.params.Username } , { $pull: {FavoriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
  });
});

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


app.use("/documentation", express.static("public"));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

