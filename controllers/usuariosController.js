const Usuarios = require("../models/Usuarios")
const enviarEmail = require("../helpers/email")


exports.formCrearCuenta=(req,res)=>{

    res.render("crearCuenta",{
        pagina: "Crear Cuenta"
    })

}


exports.crearCuenta= async(req,res)=>{

    // Realizar las validaciones antes de intentar crear el usuario
    req.checkBody("nombre", "El nombre no puede ir vacío").notEmpty();
    req.checkBody("email", "El email no puede ir vacío").notEmpty();
    req.checkBody("password", "La contraseña no puede ir vacía").notEmpty();
    req.checkBody("confirmar", "Repetir Contraseña no puede ir vacío").notEmpty();
    req
    .checkBody("confirmar", "La Contraseña es diferente")
    .equals(req.body.password);
    // Leer los errores de express
  const erroresExpress = req.validationErrors();

  // Comprobar si hay errores de validación antes de crear el usuario
  if (erroresExpress) {
    // Si hay errores de validación, redirige a la página de registro con los errores mostrados
    const errExp = erroresExpress.map((err) => err.msg);
    req.flash("error", errExp);
    return res.redirect("/crearCuenta");
  } 
    const usuario = req.body

    const existe =await Usuarios.findOne({where:{email:usuario.email}})

    if(existe){
        req.flash("error", "Este Email ya existe");
        return res.redirect("/crearCuenta");
    }


    try {
      await Usuarios.create(usuario);
      // Url de confirmación
      const url = `http://${req.headers.host}/confirmarCuenta/${usuario.email}`;

      // Enviar email de confirmación
      await enviarEmail.enviarEmail({
          usuario,
          url, 
          subject : 'Confirma tu cuenta de PeliSerie',
          archivo : 'confirmarCuenta'
      });
      // Si no hay errores, se crea el usuario en la base de datos y se redirige a otra página, si es necesario.
      req.flash("exito", "Cuenta creada, hemos enviado un correo para que confirmes tu cuenta");
      res.redirect("/");
    } catch (error) {
      // Manejo de errores de Sequelize si ocurre algún problema con la creación del usuario
        req.flash("error", "Ha habido un error, intentelo de nuevo");
        res.redirect("/crearCuenta");
  }
}

exports.confirmarCuenta=async(req,res)=>{

  const usuario=await Usuarios.findOne({where:{email : req.params.email}})

  if(!usuario){
    req.flash("error", "Ha habido un error, intentelo de nuevo");
    return res.redirect("/");
  }

  usuario.activo = 1

  await usuario.save()

  req.flash("exito", "Tu cuenta ha sido confirmada correctamente");
  return res.redirect("/");
}


exports.formEliminarCuenta=async(req,res)=>{

  const usuario = await Usuarios.findByPk(req.usuario.id)
  
  try {
    // Url de eliminacion
    const url = `http://${req.headers.host}/eliminarCuenta/${usuario.email}`;

    // Enviar email de eliminacion
    await enviarEmail.enviarEmail({
        usuario,
        url, 
        subject : 'Elimina tu cuenta de PeliSerie',
        archivo : 'eliminarCuenta'
    });
    // Si no hay errores, se crea el usuario en la base de datos y se redirige a otra página, si es necesario.
    req.flash("exito", "Hemos enviado un correo para que elimines tu cuenta");
    res.redirect("/");
  } catch (error) {
    // Manejo de errores de Sequelize si ocurre algún problema con la creación del usuario
      req.flash("error", "Ha habido un error, intentelo de nuevo");
      res.redirect("/editarPerfil");
  }

}

exports.eliminarCuenta=async(req,res)=>{
  const usuario = await Usuarios.findOne({where:{email:req.params.email}})

  if(!usuario){
    req.flash("error", "Ha habido un error, intentelo de nuevo");
    return res.redirect("/");
  }

  usuario.destroy()
  res.clearCookie("_token")
  req.flash("exito", "Tu cuenta ha sido eliminada");
  return res.redirect("/");
}




