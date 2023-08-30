const jwt = require("jsonwebtoken")
const Usuarios = require("../models/Usuarios")




exports.protegerRuta = async (req, res, next)=>{
    //verificar si hay un token
    const {_token} = req.cookies
    if(!_token){
        return res.redirect("/")
    }

    //comprobar que el token sea valido
    try {

        const decoded = jwt.verify(_token,process.env.JWT_SECRET)
        const usuario = await Usuarios.scope("eliminarPassword").findByPk(decoded.id)

        //almacenar el usuario en el Req
        if(usuario){

            req.usuario = usuario

        }else{
            return res.redirect("/")
        }

        return next()
    } catch (error) {
        return res.clearCookie("_token").redirect("/")
    }
}


exports.protegerRutaAdmin = async (req, res, next)=>{
    //compruebo que si el usuario es admin o no 
    const usuario = req.usuario

    if(usuario.admin !== 1){
        return res.redirect("/home")
    }
    next()
}


exports.protegerRutaSuperAdmin = async (req, res, next)=>{
    //compruebo que si el usuario es admin o no 
    const usuario = req.usuario

    if(usuario.superAdmin !== 1){
        return res.redirect("/home")
    }
    next()
}