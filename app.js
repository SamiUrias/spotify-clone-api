'use strict'

var express     = require('express');
var bodyParser  = require ('body-parser');

var app = express();


//Cargar rutas
var user_routes     = require('./routes/user');
var artist_router   = require('./routes/artist');
var album_router    = require('./routes/album');
var song_router     = require('./routes/song');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Configurar cabeceras http
app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();

});


//Carga de rutas base
// app.use('/api', user_routes); //Middleware para que todas las direcciones tenga que utilizar api
app.use('/api', user_routes);   //Middleware para que todas las direcciones tenga el controlador de usuarios
app.use('/api', artist_router); //Middleware para que todas las direcciones tenga el controlador de artist
app.use('/api', album_router);  //Middleware para que todas las direcciones tenga el controlador de album
app.use('/api', song_router);  //Middleware para que todas las direcciones tenga el controlador de album

app.get('/pruebas', function (req, res) {
    res.status(200).send({message: 'Bienvenido al curso de Victor Robles'});
});


module.exports = app;