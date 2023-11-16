const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const querystring = require('querystring');


const pageHead = '<!DOCTYPE html>\n<html>\n<head>\n\t<meta charset="utf-8">\n\t<title>Joosep Madar , veebiprogrammeerimine 2023</title>\n</head>\n<body>';
const pagebanner = '\n\t<img src="banner.png" alt="Kursuse bänner">';
const pageBody = '\n\t<h1>Joosep Madar </h1>\n\t<p>See veebileht on valminud <a href="https://www.tlu.ee/" target="_blank">TLÜ</a> Digitehnoloogiate instituudi informaatika eriala õppetöö raames.</p>';
const pageTime = '<h2>Tänane kuupäev ja kellaaeg</h2><p id="datetime"></p><script>var currentDateTime = new Date();var formattedDateTime = currentDateTime.toLocaleString();document.getElementById("datetime").innerHTML = "Lehe avamise hetkel, oli kell: " + formattedDateTime;</script>';
const pageHome = '<p><a href="../">Tagasi avalehele</a></p>'
const pageFoot = '\n\t<hr></body>\n</html>';


http.createServer(function(req, res){
	let currentURL = url.parse(req.url, true);
	//console.log(currentURL);
	if(req.method === 'POST'){
		collectRequestData(req, result => {
            console.log(result);
			//kirjutame andmeid teksti faili:
			fs.open('public/namelog.txt', 'a', (err, file)=>{
				if(err){
					throw err;
				}
				else {
					fs.appendFile('public/namelog.txt', result.firstNameInput + ';', (err)=>{
						if(err){
							throw err;
						}
						else {
							console.log('faili kirjutati')
						}
					});
				}
				fs.close(file, (err)=>{
						if(err){
							throw err;
						}
					});
			});
			
			res.end(result.firstNameInput);
			//res.end('Tuligi POST!');
		});
	}
	else if (currentURL.pathname === "/"){
		console.log("Keegi on avalehel");
		res.writeHead(200, {"Content-type": "text/html"});
		res.write(pageHead);
		res.write(pagebanner);
		res.write(pageBody);
		res.write('\n\t<hr>\n\t<p><a href="addname">Lisa oma nimi!</a></p><p>     </p><p><a href="semesterprogress">Semestri progress</a></p><p>     </p><p><a href="tlupildid">TLÜ Pildid</a></p>');
		res.write(pageFoot);
		res.write(pageTime);
		//console.log("Keegi vaatab");
		return res.end();
	}
	
	else if (currentURL.pathname === "/addname"){
		console.log("Keegi on nime sisestamise lehel");
		res.writeHead(200, {"Content-type": "text/html"});
		res.write(pageHead);
		res.write(pagebanner);
		res.write(pageBody);
		res.write(pageHome)
		res.write('\n\t<hr>\n\t<h2>Lisa palun oma nimi</h2>');
		res.write('	<form method="POST"><label for="firstNameInput">Eesnimi:</label><input type="text" name="firstNameInput" id="firstNameInput" placeholder ="Sinu eesnimi ..."><br><label for="lastNameInput">Perekonnanimi:</label><input type="text" name="lastNameInput" id="lastNameInput" placeholder ="Sinu perekonnanimi ..."><br><input type="submit" name="nameSubmit" value="Salvesta"></form>')
		res.write(pageFoot);
		return res.end();
	}
	
	else if (currentURL.pathname === "/listnames"){
		let htmlOutput = '\n\t<p>Kahjuks أ¼htegi nime ei leitud</p>';
		fs.readFile("public/log.txt", "utf8", (err, data)=>{
			if(err){
				console.log(err);
				listAllNames(res, htmlOutput);
			}
			else {
				//console.log(data);
				let allData = data.split(";");
				let allNames = [];
				htmlOutput = '\n\t<ul>';
				for (person of allData){
					allNames.push(person.split(',')); 
				}
				//console.log(allNames);
				for (person of allNames){
					if(person[0]){
						htmlOutput += '\n\t\t<li>' + person[0] + ' ' + person[1] + ', salvestatud: ' + person[2] + '</li>';
					}
				}
				htmlOutput += '\n\t</ul>'
				listAllNames(res, htmlOutput);
			}
		});
	}
	
	else if (currentURL.pathname === "/semesterprogress"){
		console.log("Keegi on semestri progressi lehel");
		res.writeHead(200, { "Content-type": "text/html" });
		res.write(pageHead);
		res.write(pagebanner);
		res.write(pageBody);
		res.write(pageHome)
		res.write('\n\t<hr>\n\t<h2>Semestri Progress</h2>');
		
		const semesterBegin = new Date("08/28/2023");
		const semesterEnd = new Date("01/28/2024");
		const today = new Date();
		if (today < semesterBegin) {
			res.write('\n\t<p>2023/2024 õppeaasta sügissemester pole veel peale hakanud.</p>');
		}
		else if (today > semesterEnd) {
			res.write('\n\t<p>2023/2024 õppeaasta sügissemester on lõppenud.</p>');
		}
		else {
			let semesterLastedFor = Math.floor((today - semesterBegin) / (1000 * 60 * 60 * 24));
			let daysLeft = Math.floor((semesterEnd - today) / (1000 * 60 * 60 * 24));
			let weeksPassed = Math.floor(semesterLastedFor / 7);
			let weeksLeft = Math.floor(daysLeft / 7);
			res.write(`\n\t<p>Semester on kestnud ${semesterLastedFor} päeva.</p>`);
			res.write(`\n\t<p>Jäänud on ${daysLeft} päeva (${weeksLeft} nädalat).</p>`);
			const maxDays = Math.floor((semesterEnd - semesterBegin) / (1000 * 60 * 60 * 24));
			res.write(`\n\t<meter min="0" max="${maxDays}" value="${semesterLastedFor}"></meter>`);
		}
		
		res.write(pageFoot);
		return res.end();
	}
//<ul><li>tlu_1.jpg</li></ul>

	else if (currentURL.pathname === "/tlupildid"){
		console.log("Keegi on TLÜ piltide lehel");
		let htmlOutput = '\n\t<p>Pilti ei saa näidata</p>';
		let listOutput = '';
		fs.readdir('public/tluphotos', (err, fileList)=>{
			if(err) {
				throw err;
				tluPhotoPage(res, htmlOutput, listOutput);
			}
			else {
				fileList.sort((a, b) => {
					const numA = parseInt(a.match(/\d+/)[0]);
					const numB = parseInt(b.match(/\d+/)[0]);
					return numA - numB;
				});
				//teeme faililisti:
				//console.log(fileList);
				let photoNum = Math.floor(Math.random() * fileList.length);
				htmlOutput = '\n\t<img src="' + fileList[photoNum] + '" alt="TLÜ pilt">';
				//console.log(htmlOutput);
				listOutput = '\n\t<ul>';
				for (fileName of fileList){
					listOutput += '\n\t\t<li>' + fileName + '</li>';
				}
				listOutput += '\n\t</ul>';
				//console.log(listOutput);
				tluPhotoPage(res, htmlOutput, listOutput);
			}
		});
		
	}


	else if (currentURL.pathname === "/banner.png"){
		//console.log("Tahame pilti!");
		let bannerPath = path.join(__dirname, "public", "banner");
		//console.log(bannerPath + currentURL.pathname);
		fs.readFile(bannerPath + currentURL.pathname, (err, data)=>{
			if (err) {
				throw err;
			}
			else {
				res.writeHead(200, {"Content-type": "image/png"});
				res.end(data);
			}
		});
	}
	
	//else if (currentURL.pathname === "/tlu_39.jpg"){
	else if (path.extname(currentURL.pathname) === ".jpg"){
		console.log(path.extname(currentURL.pathname));
		//let filePath = path.join(__dirname, "public", "tluphotos/tlu_42.jpg");
		let filePath = path.join(__dirname, "public", "tluphotos");
		fs.readFile(filePath + currentURL.pathname, (err, data)=>{
			if(err){
				throw err;
			}
			else {
				res.writeHead(200, {"Content-Type": "image/jpeg"});
				res.end(data);
			}
		});
	} 

	
	else {
		res.end("ERROR 404");
	}
	

	//valmis, saada ära
}).listen(5120);

function tluPhotoPage(res, htmlOutput, listOutput){
		res.writeHead(200, {"Content-type": "text/html"});
		res.write(pageHead);
		res.write(pagebanner);
		res.write(pageBody);
		res.write(pageHome)
		res.write('<hr>');
		res.write(htmlOutput);
		if(listOutput != ''){
			res.write(listOutput);
		}
		//res.write('<img src="https://greeny.cs.tlu.ee/~Joosep/public_html/www/public/tluphotos/tlu_29.jpg" alt="TLÜst pilt">');
		//res.write('<img src="https://greeny.cs.tlu.ee/~rinde/media/photos/TLU_600x400/tlu_29.jpg" alt="TLÜst pilt">');
		res.write(pageFoot);
		return res.end();
}

function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if(request.headers['content-type'] === FORM_URLENCODED) {
        let receivedData = '';
        request.on('data', chunk => {
            receivedData += chunk.toString();
        });
        request.on('end', () => {
            callback(querystring.decode(receivedData));
        });
    }
    else {
        callback(null);
    }
}

function listAllNames(res, htmlOutput){
	res.writeHead(200, {"Content-Type": "text/html"});
	res.write(pageHead);
	res.write(pageBanner);
	res.write(pageBody);
	res.write('\n\t<h2>Kأµik sisestatud nimed</h2>');
	res.write(htmlOutput);
	res.write('\n\t <p><a href="/">Tagasi avalehele</a>!</p>');
	res.write(pageFoot);
	//et see kأµik valmiks ja أ¤ra saadetaks
	return res.end();
}
	
// valmis, saada ära
