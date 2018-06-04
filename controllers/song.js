'use strict'

var fs                  = require('fs');
var path                = require('path');
var mongoosePagination  = require('mongoose-pagination');

var Artist  = require('../models/artist');
var Album   = require('../models/album');
var Song    = require('../models/song');


function getSong(req, res){
    var songId = req.params.id;

    Song.findById(songId).populate({path:'album'}).exec((err, song) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error en la peticion'})
        }else{
            if(!song){
                res.status(404).send({message:'No existe esa cancion en la base de datos'})
            } else{
                res.status(200).send({song: song})
            }
        }
    });
}

function getSongs(req, res) {
    var albumId = req.params.id;
    if(!albumId){
        var find = Song.find({}).sort('number');
    } else{
        var find = Song.find({album:albumId}).sort('number');
    }

    find.populate({
        path:'album',
        populate: {
            path: 'artist',
            model:'Artist'
        }
    }).exec((err, songs)=>{
        if(err){
            console.log(err);
            res.status(500).send({message:'Hubo un error en la peticion'})
        }else{
            if(!songs){
                res.status(404).send({message:'No hay canciones'})
            } else {
                res.status(200).send({songs: songs})
            }
        }
    })
}


function deleteSong(req, res){
    var songId = req.params.id;
    Song.findByIdAndRemove(songId, (err, songRemoved) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Hubo un error en el servidor'});
        } else {
            if(!songRemoved){
                res.status(404).send({message: 'No se ha podido eliminar la cancion'});
            } else {
                res.status(200).send({song: songRemoved});
            }
        }
    })
}

function saveSong(req, res) {
    var song = new Song();

    var params      = req.body;

    song.number     = params.number;
    song.name       = params.name;
    song.duration   = params.duration;
    song.file       = null;
    song.album      = params.album;

    song.save((err, songStored) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error en el servidor'})
        } else {
            if(!songStored){
                res.status(404).send({message:'No se ha guardado la cancion'})
            }else{
                res.status(200).send({song: songStored})
            }
        }
    })
}


function updateSong(req, res){
    var songId = req.params.id;

    var update = req.body;
    Song.findByIdAndUpdate(songId, update, (err, songUpdated) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error al guardar el artista'})
        } else {
            if(!songUpdated){
                res.status(404).send({message: 'El artista no ha sido actualizado'})
            }else{
                res.status(200).send({song: songUpdated})
            }
        }
    });
}

function uploadFile(req, res) {
    var songId = req.params.id;
    var file_name = 'No subido ...';

    if(req.files){
        var file_path = req.files.file.path; //El fichero que vamos a subir
        var file_split = file_path.split('\/');
        var upload_name = file_split[2];

        console.log(file_split);

        var ext_split = upload_name.split('\.');
        var file_name = ext_split[0];
        var file_ext = ext_split[1];
        var songDbName = file_name + '.' + file_ext;
        console.log(file_name);
        console.log(file_ext);

        if(file_ext == 'mp3' || file_ext == 'ogg'|| file_ext == 'm4a' ){
            Song.findByIdAndUpdate(songId, {file: songDbName}, (err, songUpdated) => {
                if(!songUpdated){
                    res.status(404).send({message: 'No se ha podido actualizar la cancion'})
                } else {
                    res.status(200).send({song: songUpdated});
                }
            })
        }else{
            res.status(200).send({message: 'Extension del archvio no valido'})
        }
    }else{
        res.status(200).send({message:'No se ha subido ninguna cancion'})
    }
}

function getSongFile(req, res){
    var songFile = req.params.songFile;
    var path_file = './uploads/songs/'+songFile;

    fs.exists(path_file, function (exists) {
        if(exists){
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send({image:songFile, message:'No existe el fichero de audio'})
        }
    });
}



module.exports = {
    getSong,
    saveSong,
    updateSong,
    getSongs,
    deleteSong,
    uploadFile,
    getSongFile
};