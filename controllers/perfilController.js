const Usuario = require("../models/Usuarios")
const Pelicula = require("../models/Peliculas")
const moment = require("moment")
const shortid=require("shortid")
const multer=require("multer")
const fs = require("fs")
const Peliculas = require("../models/Peliculas")




//configuracion multer
const configuracionMulter ={
    limits : { fileSize : 1000000},
    storage: fileStorage = multer.diskStorage({
        destination:(req,file,next)=>{
            next(null,__dirname+"/../public/uploads/perfiles")
        },
        filename: (req,file,next)=>{
            const extension = file.mimetype.split("/")[1]
            next(null,`${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'),false);
        }
    }
  }
  
  
  const upload = multer(configuracionMulter).single("imagen")
  
  
  //subir imagen al servidor
  exports.subirImagen = (req, res, next)=>{
  
    upload(req,res,function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code == "LIMIT_FILE_SIZE"){
                        req.flash("error", "Archivo muy grande. Max: 300Kb")
                    } else {
                        req.flash("error", error.message)
                    }
            } else if(error.hasOwnProperty("message")) {
                req.flash("error", error.message)
            }
            res.redirect("back")
            return
        }else{
            next()
        }
    })
  }


exports.perfil=async(req,res)=>{
    const usuario = req.usuario

    const  {pagina: paginaActual } = req.query

    const expresion = /^[1-9]$/

    if(!expresion.test(paginaActual)){
        return res.redirect(`/perfil/${usuario.id}?pagina=1`)
    }

    try {
            //limites y offset
            const limit = 8

            const offset = ((paginaActual * limit) - limit)

            const favs = await Usuario.findOne({
                                                where:{id: usuario.id},
                                                attributes: ["pelisFavs"]
            })

            //extraer id de las peliculas favs
            const {pelisFavs} = favs

            //consultamos la informacion de las peliculas favs
            const [peliculas,total] = await Promise.all([ 
                                            Pelicula.findAll({
                                            limit,
                                            offset,    
                                            attributes:["titulo","imagen","estreno","slug"],
                                            where:{id: pelisFavs}}),
                                            Pelicula.count({where:{id: pelisFavs}})

            ])
            res.render("perfil",{
                pagina:`Perfil: ${usuario.nombre}`,
                usuario,
                peliculas,
                moment,
                paginas: Math.ceil(total / limit),
                paginaActual,
                sitio: `${usuario.id}`
            })
    } catch (error) {
        console.log(error)
    }
    
}

exports.formEditarPerfil=async(req,res)=>{

    res.render("editarPerfil",{
        pagina: "Editar Perfil",
        usuario:req.usuario
    })
}


//editar perfil
exports.editarPerfil=async(req,res)=>{

    req.checkBody("nombre", "El nombre no puede ir vacio").notEmpty();
    req.checkBody("email", "El email no puede ir vacio").notEmpty();


    
    const erroresExpress = req.validationErrors();

    // Comprobar si hay errores de validación
    if (erroresExpress) {
        // Si hay errores de validación, redirige a la página de registro con los errores mostrados
        const errExp = erroresExpress.map((err) => err.msg);
        req.flash("error", errExp);
        return res.redirect("/editarPerfil");
    } 


    const {nombre,email} = req.body
    const usuario = await Usuario.findByPk(req.usuario.id)


    //Compruebo si hay imagen en el req y si el usuario tenia imagen para a si eliminarla
    if(req.file && usuario.imagen){
      
        const imagenAnteriorPath = __dirname +`/../public/uploads/perfiles/${usuario.imagen}`
          //eliminar archivo cn fs
          fs.unlink(imagenAnteriorPath, (error)=> {
              if(error){
                  console.log(error)
              }
              return
          })
      }

      
    if(email === usuario.email){
        //asignamos el nuevo nombre al usuario
        usuario.nombre = nombre

    } else {

        const existe = await Usuario.findOne({where:{email}})
        
        if(existe){
            req.flash("error", "Ese correo ya esta en uso");
            return res.redirect("/editarPerfil");
        }else{
            usuario.nombre = nombre
            usuario.email = email
        }

    }
    //Comprobamos si se ha subido una imagen
    if(req.file){
        //asignamos esa imagen al usuario
        usuario.imagen = req.file.filename
    }

    await usuario.save()
    req.flash("exito", "Perfil Actualizado");
    return res.redirect("/editarPerfil");

}