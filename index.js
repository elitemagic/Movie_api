const http = require('http'),
    url = require('url'),
    express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let movies = [
    {
      title: 'Tommy Boy',
      director: 'Peter Segal',
      mainActor: 'Chris Farley',
      genre: 'Comedy'
    },
    {
        title: 'Office Space',
        director: 'Mike Judge',
        mainActor: 'Ron Livingston',
        genre: 'Comedy'
    },
    {
        title: 'The Notebook',
        director: 'Nick Cassavetes',
        mainActor: 'Rachel McAdams',
        genre: 'Drama'
    },
    {
        title: 'The Godfather',
        director: 'Francis Ford Coppola',
        mainActor: 'Al Pacino',
        genre: 'Drama'
    },
    {
        title: 'The Matrix',
        director: 'The Wachowskis',
        mainActor: 'Keanu Reeves',
        genre: 'Action'
    },
    {
        title: 'Terminator 2',
        director: 'James Cameron',
        mainActor: 'Arnold Schwarzenegger',
        genre: 'Action'
    },
    {
        title: 'A nightmare on Elm Street',
        director: 'Wes Craven',
        mainActor: 'Robert Englund',
        genre: 'Horror'
    },
    {
        title: 'Nope',
        director: 'Jordan Peele',
        mainActor: 'Daniel Kaluuya',
        genre: 'Horror'
    },
    {
        title: 'Elf',
        director: 'Jon Favreau',
        mainActor: 'Will Ferrell',
        genre: 'Christmas'
    },
    {
        title: 'Die Hard',
        director: 'John McTiernan',
        mainActor: 'Bruce Willis',
        genre: 'Christmas'
    }
];

app.use(morgan('combined', {stream: accessLogStream}));


app.get('/movies', (req, res) => {
    res.json(movies);
});

app.get('/', (req, res) => {
    res.send('Welcome to my api titled "myFlix"');
});

app.get('/documentation.html', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
  });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

