const http = require('http'),
    express = require('express'),
    url = require('url'),
    morgan = require('morgan'),
    path = require('path'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    app = express();

app.use(bodyParser.json());

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

let users = [
    {
        id: '1',
        name: 'Nathan',
        favoriteMovies: []
    },
    {
        id: '2',
        name: 'Andrew',
        favoriteMovies: ["Nope"]
    }
];


let movies = [
    {
      Title: 'Tommy Boy',
      Director: {
        Name: 'Peter Segal',
        Bio: 'Blurb'
      },
      MainActor: 'Chris Farley',
      Genre: {
        Name: 'Comedy',
        Description: 'Funny'
      }
    },
    {
        Title: 'Office Space',
        Director: {
            Name: 'Mike Judge',
            Bio: 'Blurb'
          },
        MainActor: 'Ron Livingston',
        Genre: {
            Name: 'Comedy',
            Description: 'Funny'
        }
    },
    {
        Title: 'The Notebook',
        Director: {
            Name: 'Nick Cassavetes',
            Bio: 'Blurb'
          },
        MainActor: 'Rachel McAdams',
        Genre: {
            Name: 'Drama',
            Description: 'More serious'
        }
    },
    {
        Title: 'The Godfather',
        Director: {
            Name: 'Francis Ford Coppola',
            Bio: 'Blurb'
          },
        MainActor: 'Al Pacino',
        Genre: {
            Name: 'Drama',
            Description: 'More serious'
        }
    },
    {
        Title: 'The Matrix',
        Director: {
            Name: 'The Wachowskis',
            Bio: 'Blurb'
          },
        MainActor: 'Keanu Reeves',
        Genre: {
            Name: 'Action',
            Description: 'Exciting'
        }
    },
    {
        Title: 'Terminator 2',
        Director: {
            Name: 'James Cameron',
            Bio: 'Blurb'
          },
        MainActor: 'Arnold Schwarzenegger',
        Genre: {
            Name: 'Action',
            Description: 'Exciting'
        }
    },
    {
        Title: 'A nightmare on Elm Street',
        Director: {
            Name: 'Wes Craven',
            Bio: 'Blurb'
          },
        MainActor: 'Robert Englund',
        Genre: {
            Name: 'Horror',
            Description: 'Scary'
        }
    },
    {
        Title: 'Nope',
        Director: {
            Name: 'Jordan Peele',
            Bio: 'Blurb'
          },
        MainActor: 'Daniel Kaluuya',
        Genre: {
            Name: 'Horror',
            Description: 'Scary'
        }
    },
    {
        Title: 'Elf',
        Director: {
            Name: 'Jon Favreau',
            Bio: 'Blurb'
          },
        MainActor: 'Will Ferrell',
        Genre: {
            Name: 'Christmas',
            Description: 'In December'
        }
    },
    {
        Title: 'Die Hard',
        Director: {
            Name: 'John McTiernan',
            Bio: 'Blurb'
          },
        MainActor: 'Bruce Willis',
        Genre: {
            Name: 'Christmas',
            Description: 'In December'
        }
    }
];


// READ

app.get('/movies', (req, res) => {
    res.status(200).json(movies)
});

app.get('/movies/:title', (req, res) => {
    // const title = req.params.title;
    const { title } = req.params;
    const movie =movies.find ( movie => movie.Title === title );
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send(`no such movie`)
    }
});

app.get('/movies/genre/:genreName', (req, res) => {
    // const title = req.params.title;
    const { genreName } = req.params;
    const genre =movies.find ( movie => movie.Genre.Name === genreName ).Genre;
    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send(`no such genre`)
    }
});

app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director =movies.find ( movie => movie.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send(`no such director`)
    }
});


// Create

app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send(`users need names`)
    }
});

app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    
    let user = users.find(user => user.id == id );

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`)
    } else {
        res.status(400).send(`Users favorite movie not added`)
    }
});


// UPDATE

app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send(`User has not been updated`)
    }
});


// DELETE

app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    
    let user = users.find(user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);

        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`)
        
    } else {
        res.status(400).send(`Users favorite movie was not deleted`)
    }
});

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    
    let user = users.find(user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(` User ${id} has been deleted`)
    } else {
        res.status(400).send(`user not deleted`)
    }
});





// app.get('/documentation', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'documentation.html'));
// });
  
// app.get('/movies', (req, res) => {
//     res.json(movies);
// });

// app.get('/', (req, res) => {
//     res.send('Welcome to my api titled "myFlix"');
// });


app.use(morgan('combined', { stream: accessLogStream }));



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

