const Usuarios = require("../models/Usuarios");
const { generarJWT } = require("../helpers/tokens");
const enviarEmail = require("../helpers/email");
const shortId = require("shortid");

exports.formIniciarSesion = (req, res) => {
  res.render("inicioSesion", {
    pagina: "Iniciar Sesion",
  });
};

exports.iniciarSesion = async (req, res) => {
  7;

  //Validamos los campos
  req.checkBody("email", "El email no puede ir vacío").notEmpty();
  req.checkBody("password", "La contraseña no puede ir vacía").notEmpty();

  const erroresExpress = req.validationErrors();

  // Comprobar si hay errores de validación
  if (erroresExpress) {
    // Si hay errores de validación, redirige a la página de registro con los errores mostrados
    const errExp = erroresExpress.map((err) => err.msg);
    req.flash("error", errExp);
    return res.redirect("/");
  }

  const { email, password } = req.body;

  const usuario = await Usuarios.findOne({ where: { email } });

  if (!usuario) {
    req.flash("error", "Ese usuario no exite");
    return res.redirect("/");
  }

  if (!usuario.validarPassword(password)) {
    req.flash("error", "La contraseña es erronea");
    return res.redirect("/");
  }

  if (usuario.activo === 0) {
    req.flash("error", "Tu cuenta no esta activada");
    return res.redirect("/");
  }

  //autenticar al usuario
  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });
  //almacenar en cookie

  if (usuario.admin === 1) {
    return res
      .cookie("_token", token, {
        httpOnly: true,
        //secure:true
      })
      .redirect("/administracion");
  } else {
    return res
      .cookie("_token", token, {
        httpOnly: true,
        //secure:true
      })
      .redirect("/home");
  }
};

//Formulario para cambiar la contraseña
exports.formCambiarPassword = (req, res) => {
  res.render("cambiarPassword", {
    pagina: "Cambiar Contraseña",
  });
};

//Cambiar contraseña
exports.cambiarPassword = async (req, res) => {
  //Validamos los campos
  req
    .checkBody("passwordAnt", "La contraseña anterior no puede ir vacía")
    .notEmpty();
  req
    .checkBody("passwordNue", "La contraseña nueva no puede ir vacía")
    .notEmpty();
  req.checkBody("confirmar", "Repetir contraseña no puede ir vacía").notEmpty();
  req
    .checkBody("confirmar", "Las contraseñas no coinciden")
    .equals(req.body.passwordNue);

  const erroresExpress = req.validationErrors();

  // Comprobar si hay errores de validación
  if (erroresExpress) {
    // Si hay errores de validación, redirige a la página de registro con los errores mostrados
    const errExp = erroresExpress.map((err) => err.msg);
    req.flash("error", errExp);
    return res.redirect("/cambiarPassword");
  }
  const { passwordAnt, passwordNue } = req.body;

  const usuario = await Usuarios.findByPk(req.usuario.id);

  if (!usuario.validarPassword(passwordAnt)) {
    req.flash("error", "La contraseña no coincide con la anterior");
    return res.redirect("/cambiarPassword");
  }

  usuario.password = usuario.hashPassword(passwordNue);
  usuario.save();

  req.flash(
    "exito",
    "La contraseña ha sido cambiada, por favor inicie sesion de nuevo"
  );
  return res.clearCookie("_token").redirect("/");
};

//olvido de password
exports.formOlvidePassword = (req, res) => {
  res.render("olvidePassword", {
    pagina: "Olvidaste tu Password",
  });
};

//enviar correo de olvide password
exports.olvidePassword = async (req, res) => {
  req.checkBody("email", "El email no puede ir vacío").notEmpty();
  const erroresExpress = req.validationErrors();

  // Comprobar si hay errores de validación
  if (erroresExpress) {
    // Si hay errores de validación, redirige a la página de registro con los errores mostrados
    const errExp = erroresExpress.map((err) => err.msg);
    req.flash("error", errExp);
    return res.redirect("/olvidePassword");
  }

  const usuario = await Usuarios.findOne({ where: { email: req.body.email } });

  if (!usuario) {
    req.flash("error", "Ese correo no exite");
    return res.redirect("/olvidePassword");
  }

  //Añadimos al usuario un token para poder cambiar la password
  usuario.token = shortId.generate();

  try {
    // Url de confirmación
    const url = `http://${req.headers.host}/resetPassword/${usuario.token}`;

    // Enviar email de confirmación
    await enviarEmail.enviarEmail({
      usuario,
      url,
      subject: "Recuperar tu cuenta de PeliSerie",
      archivo: "recuperarPassword",
    });

    await usuario.save();
    // Si no hay errores, se crea el usuario en la base de datos y se redirige a otra página, si es necesario.
    req.flash("exito", "Hemos enviado un correo para resetear tu contraseña");
    return res.redirect("/");
  } catch (error) {
    // Manejo de errores de Sequelize si ocurre algún problema con la creación del usuario
    req.flash("error", "Ha habido un error, intentelo de nuevo");
    res.redirect("/crearCuenta");
  }
};

//form para resetar la password
exports.formResetPassword = (req, res) => {
  res.render("resetPassword", {
    pagina: "Restablecer la contraseña",
  });
};

//Resetear password
exports.resetPassword = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: { token: req.params.token },
  });

  if (!usuario) {
    req.flash("error", "Ha habido un error, intentelo de nuevo");
    return res.redirect("/");
  }

  req.checkBody("password", "Repetir contraseña no puede ir vacía").notEmpty();
  req
    .checkBody("confirmar", "Las contraseñas no coinciden")
    .equals(req.body.password);

  const erroresExpress = req.validationErrors();

  // Comprobar si hay errores de validación
  if (erroresExpress) {
    // Si hay errores de validación, redirige a la página de registro con los errores mostrados
    const errExp = erroresExpress.map((err) => err.msg);
    req.flash("error", errExp);
    return res.redirect(`/resetPassword/${usuario.token}`);
  }

  usuario.password = usuario.hashPassword(req.body.password);
  usuario.token = "";

  await usuario.save();
  req.flash("exito", "Contraseña cambiada, ya puedes iniciar sesion");
  return res.redirect("/");
};

//cerrar Sesion
exports.cerrarSesion = (req, res) => {
  return res.clearCookie("_token").redirect("/");
};
