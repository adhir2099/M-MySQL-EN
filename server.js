const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();

app.use(bodyParser.urlencoded({ extended : true }));
app.use('/assets', express.static('assets'));

const connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'test'
});

connection.connect((error) => {
	if(error){
		console.log('Error connecting to DB:', err);
		return;
	}
	console.log('Successful connection');
});

//optional, just to make sure your server is running
app.listen(3033, () => {
	console.log('Server is listening on port 3033');
});

// Require the route files
const indexRoutes = require('./endpoints/Endpoints')(connection);

// Use the route files
app.use('/', indexRoutes);