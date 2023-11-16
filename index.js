const express = require('express');
const fs = require("fs");
const app = express();
const bodyparser = require('body-parser');
const mysql = require('mysql2');
const timeInfo = require('./datetime_et');
const dbInfo = require('../../vp23config');
//Kuna Rinde kasutab ajutiselt Inga andmebaasi, siis:
const dataBase = 'if23_inga_pe_DM';
//fotode laadimiseks
const multer = require('multer');
//seadistame vahevara (middleware), mis läheb üleslaadimise kataloogi
const upload = multer({dest: './public/gallery/orig/'});
const mime = require('mime');
const sharp = require('sharp');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: false}));

//loon andmebaasiühenduse
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.password,
	database: dbInfo.configData.database
});

app.get('/', (req,res)=>{
	//res.send('See töötab');
	//res.download('index.js'); #(ligi avamisel saab kindla faili alla laadida)#
	res.render('index');
});

app.get('/timenow', (req,res)=>{
	const dateNow = timeInfo.dateETformatted();
	const timeNow = timeInfo.timeETformatted();
	//res.render('timenow');
	res.render('timenow', {nowD: dateNow, nowT: timeNow});
});

app.get('/wisdom', (req,res)=>{
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

app.get('/eestifilm', (req,res)=>{
	res.render('filmindex');
});

app.get('/eestifilm/filmiloend', (req,res)=>{
	let sql = 'SELECT title, production_year, duration FROM movie';
	let sqlResult = [];
	conn.query(sql, (err, result)=>{
		if (err){
			res.render('filmlist', {filmlist: result});
			//conn.end()
			throw err;
		}
		else {
			//console.log(result);
			res.render('filmlist', {filmlist: result});
			//conn.end();
		}
	});
});

app.get('/eestifilm/addfilmperson', (req,res)=>{
	res.render('addfilmperson');
});

app.post('/eestifilm/addfilmperson', (req,res)=>{
	//res.render('addfilmperson');
	//res.send(req.body);
	let notice = '';
	let sql = 'INSERT INTO person (first_name, last_name, birth_date) VALUES(?,)';
	conn.query(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput], (err, result)=>{
		if (err) {
			notice = 'Andmete salvestamine ebaõnnestus...';
			res.render('addfilmperson', {notice: notice});
			throw err;
		}
		else {
			notice = req.body.firstNameInput + ' ' + req.body.lastNameInput + ' salvestamine õnnestus!';
			res.render('addfilmperson', {notice: notice});
		}
	});
});

app.get('/eestifilm/singlemovie', (req, res) => {
  const countQuery = 'SELECT COUNT(id) AS movieCount FROM movie';

  conn.query(countQuery, (err, countResult) => {
    if (err) {
      res.render('singlemovie', { movieTitle: '', movieYear: '', maxMovieId: movieCount });
	  throw err;
    } else {
      const movieCount = countResult[0].movieCount;
      res.render('singlemovie', { movieTitle: '', movieYear: '', maxMovieId: movieCount });
    }
  });
});

app.post('/eestifilm/singlemovie', (req, res) => {
  let sql = 'SELECT * FROM movie WHERE id = ?';
  let movieId = req.body.movieId;

  conn.query(sql, [movieId], (err, results) => {
    if (err) {
	  throw err;
    } else {
		const maxMovieId = req.body.maxMovieId;
      if (results.length > 0) {
        const movie = results[0];
        res.render('singlemovie', { movieTitle: movie.title, movieYear: movie.production_year, maxMovieId: req.body.maxMovieId });
      } else {
		notice2 = 'Filmi ei leitud';
		res.render('singlemovie', { notice2: notice2});
        //res.status(404).send('Filmi ei leitud');
      }
    }
  });
});


app.get('/news', (req,res)=>{
	res.render('news');
});

app.get('/news/add', (req,res)=>{
	res.render('addnews');
});

app.post('/news/add', (req, res) => {
    let notice = '';
    let sql = 'INSERT INTO vpnews (title, content, expire, userid, added) VALUES(?,?,?,1, CURDATE())';
    
    conn.query(sql, [req.body.titleInput, req.body.contentInput, req.body.expireInput], (err, result) => {
        if (err) {
            notice = 'Uudise salvestamine ebaõnnestus...';
            res.render('addnews', { notice: notice });
            throw err;
        } else {
            notice = 'Uudise salvestamine õnnestus!';
            res.render('addnews', { notice: notice });
        }
    });
});

app.get('/news/read', (req,res)=>{
	//res.render('readnews');
	let notice = '';
    let timeNow = new Date();
    let formattedDate = timeNow.getFullYear() + '-' + (timeNow.getMonth() + 1).toString().padStart(2, '0') + '-' + timeNow.getDate().toString().padStart(2, '0');
	let sql = 'SELECT * FROM `vpnews` WHERE expire > ? AND deleted IS NULL ORDER BY id DESC';
	
	conn.query(sql, [formattedDate], (err, result) => {
        if (err) {
            notice = 'Uudiste lugemine ebaõnnestus...';
            res.render('readnews', { notice: notice });
            throw err;
        } else {
            const newsList = result;
            res.render('readnews', { newsList: newsList });
        }
    });
});

app.get('/news/read/:id', (req,res)=>{
	//res.render('readnews');
	//res.send('Tahame uudist, mille id on: ' + req.params.id);
	
	let notice = '';
    let newsId = req.params.id;
    let sql = 'SELECT * FROM `vpnews` WHERE id = ? AND deleted IS NULL';
    
    conn.query(sql, [newsId], (err, result) => {
        if (err) {
            notice = 'Uudise lugemine ebaõnnestus...';
            res.render('readonenews', { notice: notice });
            throw err;
        } else {
            const oneNews = result[0];
            res.render('readonenews', { oneNews: oneNews });
        }
    });
});

app.get('/news/read/:id/:lang', (req,res)=>{
	//res.render('readnews');
	console.log(req.params);
	console.log(req.query);
	res.send('Tahame uudist, mille id on: ' + req.params.id);
	
});

app.get('/photoupload', (req, res)=> {
	res.render('photoupload');
});

app.post('/photoupload', upload.single('photoInput'), (req, res)=> {
	let notice = '';
	console.log(req.file);
	console.log(req.body);
	//const mimeType = mime.getType(req.file.path);
	//console.log(mimeType);
	const fileName = 'vp_' + Date.now() + '.jpg';
	//fs.rename(req.file.path, './public/gallery/orig/' + req.file.originalname, (err)=> {
	fs.rename(req.file.path, './public/gallery/orig/' + fileName, (err)=> {
		console.log('Viga: ' + err);
	});
	const mimeType = mime.getType('./public/gallery/orig/' + fileName);
	console.log('Tأ¼أ¼p: ' + mimeType);
	//loon pildist pisipildi (thumbnail)
	sharp('./public/gallery/orig/' + fileName).resize(800,600).jpeg({quality : 90}).toFile('./public/gallery/normal/' + fileName);
	sharp('./public/gallery/orig/' + fileName).resize(100,100).jpeg({quality : 90}).toFile('./public/gallery/thumbs/' + fileName);
	
	
	let sql = 'INSERT INTO vp_gallery (filename, originalname, alttext, privacy, userid) VALUES (?,?,?,?,?)';
	const userid = 1;
	connection.query(sql, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userid], (err, result)=>{
		if(err) {
			throw err;
			notice = 'Foto andmete salvestamine ebaأµnnestus!' + err;
			res.render('photoupload', {notice: notice});
		}
		else {
			notice = 'Pilt "' + req.file.originalname + '" laeti أ¼les!';
			res.render('photoupload', {notice: notice});
		}
	});
	
	
});


app.get('/photogallery', (req, res)=> {
	
	res.render('photogallery');
});


app.post('/eestifilm/lisapersoon', (req, res)=>{
	console.log(req.body);
	let notice = '';
	let sql = 'INSERT INTO person (first_name, last_name, birth_date) VALUES (?,?,?)';
	conn.query(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput], (err, result)=>{
		if(err) {
			throw err;
			notice = 'Andmete salvestamine ebaõnnestus!' + err;
			res.render('eestifilmaddperson', {notice: notice});
		}
		else {
			notice = 'Filmitegelase ' + req.body.firstNameInput + ' ' + req.body.lastNameInput + ' salvestamine õnnestus!';
			res.render('eestifilmaddperson', {notice: notice});
		}
	});
});



app.listen(5120);