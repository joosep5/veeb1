const express = require('express');
const timeInfo = require('./datetime_fnc');
const fs = require("fs");
const app = express();
const mysql = require("mysql2");
const dbInfo = require('../../vp23config.js');

app.set('view engine', 'ejs');
app.use(express.static('public'));
const conn = mysql.createConnection({
	host: dbInfo.configData.host, 
	user: dbInfo.configData.user, 
	password: dbInfo.configData.password,
	database: dbInfo.configData.database
	
});

app.get('/', (req, res)=>{
	//res.send('See töötab!');
	//res.download('index.js');
	res.render('index');
});

app.get('/timenow', (req, res)=>{
	const dateNow = timeInfo.dateETformatted();
	const timeNow = timeInfo.timeETformatted();
	//res.render('timenow');
	res.render('timenow', {nowD: dateNow, nowT: timeNow});
});

app.get('/wisdom', (req, res)=>{
	let folkWisdom = [];
	fs.readFile('public/txt/vanasonad.txt', 'utf8', (err, data)=>{
		if(err){
			throw err;
		}
		else {
			folkWisdom = data.split(';');
			res.render('justlist', {h1: 'Vanasõnad', wisdom: folkWisdom});
		}
	});
});

app.get('/nimed', (req,res)=>{
	let nimed = [];
	fs.readFile('public/txt/log.txt', 'utf8', (err, data)=>{
		if(err){
			throw err;
		}
		else {
			nimed = data.split(';');
			const nimedArray = [];
			for (const nimi of nimed) {
				const parts = nimi.split(',');
				const originalDate = parts[2];
				const dateParts = originalDate.split('/');
				const date = new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`);
				const formattedDate = `${date.getDate()}.${(date.getMonth() + 1)}.${date.getFullYear()}`;
				
				nimedArray.push({
					firstName: parts[0],
					lastName: parts[1],
					dateSaved: formattedDate
				});
			}
			res.render('nimed', {h1: 'Nimed', nimed: nimedArray});
		}
	});
});


app.get('/eestifilm', (req, res)=>{
	res.render('filmindex')
});

app.get('/eestifilm/filmiloend', (req, res)=>{
	let sql ='SELECT title, production_year FROM movie';
	let sqlResult = [];
	conn.query(sql, (err, result)=>{
		
		if(err){
			throw err;
		res.render('filmlist', {filmlist:sqlResult});
		}
		else{
		console.log(result);
		res.render('filmlist', {filmlist: sqlResult});
		}
	});
	
});

app.listen(5120);