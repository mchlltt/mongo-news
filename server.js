// Import dependencies.
var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// Tell Mongoose to use ES6 promises.
mongoose.Promise = Promise;

// Initialize app.
var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(path.join(__dirname, 'public')));

var PORT = process.env.PORT || 3000;

// Set handlebars as view engine.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Favicon
app.use(favicon(path.join(__dirname, 'public/assets/img', 'favicon.png')));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Import routes and give the server access to them.
var routes = require('./controllers/controller');
app.use('/', routes);

// Determine whether to use local or remote database connection.
var connectionString;
if (process.env.PORT) {
    connectionString = 'mongodb://heroku_bcn7xp6x:mm2gqc6e2ceapg54uhqshm8rbr@ds019471.mlab.com:19471/heroku_bcn7xp6x';
} else {
    connectionString = 'mongodb://localhost/mongonews';
}

// Start listening.
mongoose.connect(connectionString).then(function() {
    app.listen(PORT, function() {
        console.log('listening on port ' + PORT);
    });
});
