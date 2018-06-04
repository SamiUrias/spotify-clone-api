'use strict'

var fs                  = require('fs');
var path                = require('path');
var mongoosePagination  = require('mongoose-pagination');

var Artist  = require('../models/artist');
var Album   = require('../models/album');
var Song    = require('../models/song');

/**
 * Get one artist by id
 * @param req
 * @param res
 */
function getAlbum(req, res) {
    var albumId = req.params.id;
    Album.findById(albumId).populate({path: 'artist'}).exec((err, album) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error en la peticion'})
        } else {
            if(!album) {
                res.status(404).send({message: 'El album no existe'})
            } else {
                res.status(200).send({album: album});
            }
        }
    });

}


function getAlbums(req, res){
    var artistId = req.params.artist;
    if(!artistId){
        var find = Album.find({}).sort('title');
        //Scar todos los albums de la base de datos
    } else {
        // Sacar los albums de un artista concreto de la base de datos
        var find = Album.find({artist: artistId}).sort('year');
    }

    find.populate({path:'artist'}).exec((err, albums) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Hubo un error en la peticion'});
        } else {
            if(!albums){
                res.status(404).send({message:'No hay albums en la base de datos'});
            } else{
                res.status(200).send({albums:albums});
            }
        }
    });
}

function saveAlbum(req, res) {
    var album = new Album();

    var params          = req.body;

    album.title         = params.title;
    album.description   = params.description;
    album.year          = params.year;
    album.image         = 'null';
    album.artist        = params.artist;

    album.save((err, albumStored) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error al guardar el album'})
        } else {
            if(!albumStored){
                res.staus(404).send({message: 'No se ha guardado el album'})
            }else {
                res.status(200).send({album: albumStored})
            }
        }
    });
}

function updateAlbum(req, res){
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
       if(err){
           res.status(500).send({message:'Hubo un error en el servidor'})
       } else {
           if(!albumUpdated){
               res.status(404).send({message: 'El album no existe'})
           } else {
               res.status(200).send({album:albumUpdated})
           }
       }
    });
}


function deleteAlbums(req, res) {
    var albumId = req.params.id;

    Album.findByIdAndRemove(albumId, (err, albumRemoved) => {

        if(err){
            console.log(err);
            res.status(500).send({message:'Hubo un error al remover el album'})
        } else {
            if(!albumRemoved){
                res.status(404).send({message: 'El album no ha sido elimiando'})
            } else {
                console.log(albumRemoved);
                //res.status(200).send({album: albumRemoved});

                //Eliminar los albumes del artista
                Song.findByIdAndRemove(albumRemoved._id, (err, songRemoved) => {
                    if(err){
                        console.log(err);
                        res.status(500).send({message:'Hubo un error al remover la cancion'})
                    } else {
                        if(!songRemoved){
                            res.status(404).send({message: 'La cancion no ha sido eliminada o este album no tiene canciones'})
                        } else {
                            console.log(songRemoved);
                            // res.status(200).send({song: songRemoved});
                            res.status(200).send({album: albumRemoved});
                        }
                    }
                });
            }
        }

    });
}

function uploadImage(req, res) {
    var albumId = req.params.id;
    var file_name = 'No subido ...';

    if(req.files){
        var file_path = req.files.image.path; //El fichero que vamos a subir
        var file_split = file_path.split('\/');
        var upload_name = file_split[2];

        console.log(file_split);

        var ext_split = upload_name.split('\.');
        var file_name = ext_split[0];
        var file_ext = ext_split[1];
        var imageDbName = file_name + '.' + file_ext;
        console.log(file_name);
        console.log(file_ext);

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg'){
            Album.findByIdAndUpdate(albumId, {image: imageDbName}, (err, albumUpdated) => {
                if(!albumUpdated){
                    res.status(404).send({message: 'No se ha podido actualizar el album'})
                } else {
                    res.status(200).send({album: albumUpdated});
                }
            })
        }else{
            res.status(200).send({message: 'Extension del archvio no valido'})
        }
    }else{
        res.status(200).send({message:'No se ha subido ninguna imagen'})
    }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/albums/'+imageFile;

    fs.exists(path_file, function (exists) {
        if(exists){
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send({image:imageFile, message:'No existe la imagen....'})
        }
    });
}

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbums,
    uploadImage,
    getImageFile
};