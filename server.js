var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var port = 8000;

var app = express();

mongoose.connect('mongodb://localhost/dogsDb');

var DogSchema = new mongoose.Schema({
	name: String,
	age: Number,
	breed: String,
	weight: Number, 
})
var Dog = mongoose.model('Dog', DogSchema);

app.use(bodyParser.urlencoded({extended: true}));
app.use('/static', express.static(path.join(__dirname, '/static')));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// GET '/' Displays all of the mongooses.
app.get('/', function(req, res) {
	Dog.find({}, function(err, allDogs) {
		if (err) {
			console.log(err); 
		} else {
			res.render('index', {dogs: allDogs});
		}
	})
});

// GET '/mongooses/new' Displays a form for making a new mongoose.
app.get('/dogs/new', function(req, res) {
	res.render('new');
});

// POST '/mongooses' Should be the action attribute for the form in the above route (GET '/mongooses/new').
app.post('/dogs', function(req, res) {
	Dog.create(req.body, function(err) {
		if (err) {
			res.json(err);
			res.redirect('/dogs/new');
		} else {
			// Later redirect to new dog
			res.redirect('/');
		}
	});
})

// GET '/mongooses/:id' Displays information about one mongoose.
app.get('/dogs/:id', function(req, res) {
	Dog.find({_id: req.params.id}, function(err, selectedDog) {
		if (err) {
			res.json(err);
		} else {
			res.render('show', {dog: selectedDog[0]});
		}
	});
});

// GET '/mongooses/:id/edit' Should show a form to edit an existing mongoose.
app.get('/dogs/:id/edit', function(req, res) {
	Dog.find({_id: req.params.id}, function(err, selectedDog) {
		if (err) {
			res.json(err);
		} else {
			res.render('edit', {dog: selectedDog[0]});
		}
	});
});

// POST '/mongooses/:id' Should be the action attribute for the form in the above route (GET '/mongooses/:id/edit').
app.post('/dogs/:id', function(req, res) {
	Dog.update({_id: req.params.id}, {$set: req.body}, function(err) {
		if (err) {
			res.json(err);
		} else {
			Dog.find({_id: req.params.id}, function(err, selectedDog) {
				if (err) {
					res.json(err);
				} else {
					res.redirect('/dogs/'+req.params.id);
				}
			})
		}
	});	
});

// POST '/mongooses/:id/destroy' Should delete the mongoose from the database by ID.
app.post('/dogs/:id/destroy', function(req, res) {
	Dog.remove({_id: req.params.id}, function(err) {
		if (err) {
			res.json(err);
		} else {
			res.redirect('/');
		}
	});
});

var server = app.listen(port, function() {
	console.log(`Listening on port ${port}`);
})