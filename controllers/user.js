'use strict'

var bcrypt  = require('bcrypt-nodejs');
var User    = require('../models/user');
var jwt     = require('../services/jwt');
var fs      = require('fs');
var path    = require('path');

function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando una accion del controlador de usuario del api Rest con Node y Mongo',
    });
}

function saveUser(req, res) {
    var user = new User();

    var params = req.body; // Todos los datos que nos llegan por post
    console.log(params); //Debug


    user.name       = params.name;
    user.surname    = params.surname;
    user.email      = params.email;
    user.role       = 'ROLE_ADMIN';
    user.image      = 'null';

    //Guardar los datos en base de datos
    //1.Encriptar la contrasenia
    if(params.password){
        //Encriptar contrasenia y guardar datos
        bcrypt.hash(params.password, null,null, function (err, hash) {
            user.password = hash;

            if(err){
                console.log(err);
            } else {

                if(user.name != null && user.surname != null && user.email != null){
                    // Guarda el usuario
                    user.save((err, userStored) => {
                        if(err){
                            res.status(500).send({message:'Error al guardar al usuario'})
                        }else{
                            if(!userStored){
                                res.status(404).send({message: 'No se ha registrado el usuario'})
                            } else{
                                res.status(200).send({user:userStored})
                            }
                        }
                    });
                } else{
                    res.status(200).send({message: 'Rellena todos los campos'})
                }
            }
        })
    }else{
        res.status(500).send({message: 'Introduce la contraseña'})
    }

}

function loginUser(req, res){
    var params = req.body;
    var password = params.password;
    var email = params.email;

    //Se busca al usuario en la base de datos
    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if(err){
                res.status(500).send({message:'Error en la peticion'})
        } else{
            if(!user){
                res.status(404).send({message: 'El usuario no existe'})
            }else{
                //Comprobar contraseña
                bcrypt.compare(password, user.password, function (err, check) {
                    if(check) {
                        //Devolver los datos del usuario logeado
                        if(params.gethash){
                            //Devolver un token de jwt
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        }else{
                            res.status(200).send({user})
                        }
                    } else {
                        res.status(404).send({message: 'El usuario no ha podido logearse'})
                    }
                })
            }
        }
    });
}


function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if(err){
            res.status(500).send({message: 'Error al actualizar el usuario'})
        } else {
            if(!userUpdated){
                res.status(404).send({message: 'No se ha podido actualizar el usuario'})
            } else {
                res.status(200).send({user: userUpdated});
            }
        }
    })
}


function uploadImage(req, res) {
    var userId = req.params.id;
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

        if(file_ext == 'png' || file_ext == 'jpg'){
            User.findByIdAndUpdate(userId, {image: imageDbName}, (err, userUpdated) => {
                if(!userUpdated){
                    res.status(404).send({message: 'No se ha podido actualizar el usuario'})
                } else {
                    res.status(200).send({image:imageDbName, userUpdated});
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
    var path_file = './uploads/users/'+imageFile;

    fs.exists(path_file, function (exists) {
        if(exists){
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send({image:imageFile, message:'No existe la imagen....'})
        }
    });
}


module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};