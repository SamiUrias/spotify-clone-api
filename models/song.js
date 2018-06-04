'use strict'

var mongoose    = require('mongoose');


var Schema = mongoose.Schema;

var SongSchema = Schema({
    number: String, //El orden de la cancion en el album
    name: String,
    duration: String,
    file: String,
    album: { type: Schema.ObjectId, ref: 'Album'},
});

module.exports = mongoose.model('Song', SongSchema);