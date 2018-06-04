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
function getArtist(req, res){
    var artistId = req.params.id;
    Artist.findById(artistId, (err, artist) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error en la peticion'})
        } else{
            if(!artist){
                res.status(404).send({message: 'El artista no existe'})
            } else {
                res.status(200).send({artist:artist})
            }
        }
    });
}


/**
 * Get all the artist with pagination
 * @param req
 * @param res
 */
function getArtists(req, res) {
    if(req.params.page){
        var page = req.params.page;
    } else{
        var page = 1;
    }

    var itemsPerPage = 3;

    Artist.find().sort('name').paginate(page, itemsPerPage, function (err, artists, total) {
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error en la peticion'})
        }else{
            if(!artists){
                res.send(404).send({message:'No hay artistas'});
            } else {
                res.status(200).send({
                    total: total,
                    pages: Math.ceil(total/itemsPerPage),
                    artist: artists
                });
            }
        }
    })
}


/**
 * Save one artist
 * @param req
 * @param res
 */
function saveArtist(req, res) {
    var artist = new Artist();
    var params = req.body;

    artist.name         = params.name;
    artist.description  = params.description;
    artist.image        = 'null';

    artist.save((err, artistStored) => {
       if(err){
           console.log(err);
           res.status(500).send({message: 'Error al guardar el artista'})
       }else {
           if(!artistStored){
               res.status(404).send({message: 'El artista no ha sido guardado'})
           } else{
               res.status(200).send({artist: artistStored})
           }
       }
    });
}


function updateArtist(req, res) {
    var artistId = req.params.id;

    var update = req.body;
    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
       if(err){
           console.log(err);
           res.status(500).send({message: 'Error al guardar el artista'})
       } else {
           if(!artistUpdated){
               res.status(404).send({message: 'El artista no ha sido actualizado'})
           }else{
               res.status(200).send({artist: artistUpdated})
           }
       }
    });
};


function deleteArtist(req,res) {
    var artistId = req.params.id;

    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
       if(err){
           console.log(err);
           res.status(500).send({message:'Hubo un error al remover al artista'})
       } else {
           if(!artistRemoved){
               res.status(404).send({message: 'El artista no ha sido elimiando'})
           } else {
               console.log(artistRemoved);

               //Eliminar los albumes del artista
               Album.find(artistRemoved._id).remove((err, albumRemoved) => {

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
                           Song.find(albumRemoved._id).remove((err, songRemoved) => {
                               if(err){
                                   console.log(err);
                                   res.status(500).send({message:'Hubo un error al remover la cancion'})
                               } else {
                                   if(!songRemoved){
                                       res.status(404).send({message: 'La cancion no ha sido eliminada'})
                                   } else {
                                       console.log(songRemoved);
                                      // res.status(200).send({song: songRemoved});
                                       res.status(200).send({Artist: artistRemoved});
                                   }
                               }
                           });
                       }
                   }

               });
           }
       }
    });
}

function uploadImage(req, res) {
    var artistId = req.params.id;
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
            Artist.findByIdAndUpdate(artistId, {image: imageDbName}, (err, artistUpdated) => {
                if(!artistUpdated){
                    res.status(404).send({message: 'No se ha podido actualizar el usuario'})
                } else {
                    res.status(200).send({artist: artistUpdated});
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
    var path_file = './uploads/artists/'+imageFile;

    fs.exists(path_file, function (exists) {
        if(exists){
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send({image:imageFile, message:'No existe la imagen....'})
        }
    });
}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
};