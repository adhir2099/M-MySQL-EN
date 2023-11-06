const express = require('express');
const router = express.Router();
const path = require('path');

module.exports = function(connection) {

	router.get('/', (request, response) => {
		response.sendFile(path.join(__dirname, '../index.html'));
	});

	router.get('/fetchData', (request, response) => {
		const { draw, start, length, order, columns, search } = request.query;

		let column_index = order && order[0] && order[0].column;

		let column_name = '';

		let column_sort_order = '';

		if(order === undefined){
			column_name = column_index ? columns[column_index] : 'id';

        	column_sort_order = 'desc';
		}else{
			column_index = request.query.order[0]['column'];
	
			column_name = request.query.columns[column_index]['data'];
	
			column_sort_order = request.query.order[0]['dir'];
		}
		
		const search_value = search.value;

		const search_query = search_value ? ` WHERE name LIKE '%${search_value}%' OR email LIKE '%${search_value}%'` : '';

		const query1 = `SELECT id, name, email FROM user ${search_query} ORDER BY ${column_name} ${column_sort_order} LIMIT ${start}, ${length}`;

		const query2 = `SELECT COUNT(*) AS Total FROM user`;

		const query3 = `SELECT COUNT(*) AS Total FROM user ${search_query}`;

		connection.query(query1, (dataError, dataResult) => {

			connection.query(query2, (totalDataError, totalDataResult) => {

				connection.query(query3, (totalFilterDataError, totalFilterDataResult) => {

					response.json({
						draw : request.query.draw,
						recordsTotal : totalDataResult[0]['Total'],
						recordsFiltered : totalFilterDataResult[0]['Total'],
						data : dataResult
					});

				})

			})

		})
	});

	router.post('/submitData', (request, response) => {
		const id = request.body.id;
		const name = request.body.name;
		const email = request.body.email;
		const action = request.body.action;

		let query;
		let data;
		let message;

		if(action === 'Insert'){
			query = `INSERT INTO user (name, email) VALUES (?, ?)`;
			data = [name, email];
			message = 'User has been added';
		}

		if(action === 'Edit'){
			query = `UPDATE user SET name = ?, email = ? WHERE id = ?`;
			data = [name, email, id];
			message = 'User has been updated';
		}

		if(action === 'Delete'){
			query = `DELETE FROM user WHERE id = ?`;
			data = [id];
			message = 'User has been deleted';
		}

		connection.query(query, data, (error, result) => {
			response.json({'message' : message});
		});
	});

	router.get('/fetchData/:id', (request, response) => {
		const query = `SELECT * FROM user WHERE id = ?`;

		connection.query(query, [request.params.id], (error, result) => {
			response.json(result[0]);
		});
	});

	return router;
};