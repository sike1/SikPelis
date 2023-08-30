const moment = require("moment");
const Peliculas = require("../models/Peliculas");
const Usuarios = require("../models/Usuarios");



exports.administracion=async(req,res)=>{

    const  {pagina: paginaActual } = req.query

    const expresion = /^[1-9]$/

    if(!expresion.test(paginaActual)){
        return res.redirect("/administracion?pagina=1")
    }


    try {
        //limites y offset
        const limit = 4

        const offset = ((paginaActual * limit) - limit)

        const [peliculas,total] = await Promise.all([
                Peliculas.findAll({
                limit,
                offset,
                where:{usuarioId: req.usuario.id}}),
                Peliculas.count({
                    where:{
                        usuarioId: req.usuario.id
                    }
                })
            ])

        res.render("administracion",{
            pagina:"Panel de administracion",
            peliculas,
            moment,
            usuario:req.usuario,
            paginas: Math.ceil(total / limit),
            paginaActual,
            sitio: "administracion"

        })
        
    } catch (error) {
        console.log(error)
    }  
}

exports.formBuscarUsuario=(req,res)=>{
    
    res.render("nuevoAdmin",{
        pagina: "Hacer administrador",
        usuario: req.usuario
    })

}


exports.buscarYhacerAdmin=async(req, res)=>{

    const usuario = await Usuarios.findOne({where:{email:req.body.email}})

    if(!usuario){
        req.flash("error","Ese usuario no existe")
        return res.redirect("/nuevoAdmin")
    }
    if(usuario.admin === 1){
        req.flash("error","Ese usuario ya es admin")
        return res.redirect("/nuevoAdmin")
    }

    usuario.admin = 1

    await usuario.save()

    req.flash("exito","Este usuario es admin ahora")
    return res.redirect("/nuevoAdmin")


}


exports.formNoAdmin=(req,res)=>{

    res.render("noAdmin",{
        pagina:"Quitar administracion",
        usuario:req.usuario
    })

}


exports.buscarAdmin=async(req,res)=>{

    const usuario = await Usuarios.findOne({where:{email:req.body.email}})

    if(!usuario){
        req.flash("error", "El usuario no existe")
        return res.redirect("/noAdmin")
    }

    if(usuario.admin === 0){
        req.flash("error","El usuario no es admin")
        return res.redirect("/noAdmin")
    }

    usuario.admin = 0

    await usuario.save()

    req.flash("exito",`El usuario: ${usuario.email}, ya no es admin`)

    return res.redirect("/noAdmin")
}