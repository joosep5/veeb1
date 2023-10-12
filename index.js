
const express = require('express');
const app = express();

app.set('view engene': 'ejs');

app.get('/', (req,res)=>{
	//res.send('See töötab');
	//res.download('index.js'); #(lingi avamisel saab kindla faili alla laadida)#
	res.render('index');
});

app.get('/test', (req,res)=>{
	res.send('Test töötab ka');
	//res.download('index.js'); #(lingi avamisel saab kindla faili alla laadida)#
});

app.listen(51020);