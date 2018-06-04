'use strict'

var express             = require('express');
var SongController      = require('../controllers/song');
var multipart           = require('connect-multiparty');

var api = express.Router();
var md_auth = require('../middlewares/authenticate');
var md_upload = multipart({uploadDir: './uploads/songs'});


api.get('/song/:id', md_auth.ensureAuth, SongController.getSong);
api.post('/song', md_auth.ensureAuth, SongController.saveSong);
api.put('/song/:id', md_auth.ensureAuth, SongController.updateSong);
api.delete('/song/:id', md_auth.ensureAuth, SongController.deleteSong);
api.get('/songs/:id?', md_auth.ensureAuth, SongController.getSongs);
api.post('/upload-file-song/:id', [md_auth.ensureAuth, md_upload], SongController.uploadFile);
api.get('/get-song-file/:songFile', SongController.getSongFile);


//Exports all the api methods
module.exports = api;