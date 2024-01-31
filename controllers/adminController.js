const moment = require("moment");
const Peliculas = require("../models/Peliculas");
const Usuarios = require("../models/Usuarios");
const enviarEmail = require("../helpers/email");

exports.administracion = async (req, res) => {
  const { pagina: paginaActual } = req.query;

  const expresion = /^[1-9]$/;

  if (!expresion.test(paginaActual)) {
    return res.redirect("/administracion?pagina=1");
  }

  try {
    //limites y offset
    const limit = 4;

    const offset = paginaActual * limit - limit;
    const [peliculas, total, revisar] = await Promise.all([
      Peliculas.findAll({
        limit,
        offset,
        where: { usuarioId: req.usuario.id, revisado: 1 },
      }),
      Peliculas.count({
        where: {
          usuarioId: req.usuario.id,
          revisado: 1,
        },
      }),
      Peliculas.count({
        where: {
          revisado: 0,
        },
      }),
    ]);

    res.render("administracion", {
      pagina: "Panel de administracion",
      peliculas,
      moment,
      usuario: req.usuario,
      paginas: Math.ceil(total / limit),
      paginaActual,
      sitio: "administracion",
      revisar,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.formBuscarUsuario = (req, res) => {
  res.render("nuevoAdmin", {
    pagina: "Hacer administrador",
    usuario: req.usuario,
  });
};

exports.buscarYhacerAdmin = async (req, res) => {
  const usuario = await Usuarios.findOne({ where: { email: req.body.email } });

  if (!usuario) {
    req.flash("error", "Ese usuario no existe");
    return res.redirect("/nuevoAdmin");
  }
  if (usuario.admin === 1) {
    req.flash("error", "Ese usuario ya es admin");
    return res.redirect("/nuevoAdmin");
  }

  usuario.admin = 1;

  await usuario.save();

  req.flash("exito", "Este usuario es admin ahora");
  return res.redirect("/nuevoAdmin");
};

exports.formNoAdmin = (req, res) => {
  res.render("noAdmin", {
    pagina: "Quitar administracion",
    usuario: req.usuario,
  });
};

exports.buscarAdmin = async (req, res) => {
  const usuario = await Usuarios.findOne({ where: { email: req.body.email } });

  if (!usuario) {
    req.flash("error", "El usuario no existe");
    return res.redirect("/noAdmin");
  }

  if (usuario.admin === 0) {
    req.flash("error", "El usuario no es admin");
    return res.redirect("/noAdmin");
  }

  usuario.admin = 0;

  await usuario.save();

  req.flash("exito", `El usuario: ${usuario.email}, ya no es admin`);

  return res.redirect("/noAdmin");
};

//Muestro las peliculas que estan por revisar
exports.mostrarPelisParaRevisar = async (req, res) => {
  const { pagina: paginaActual } = req.query;

  const expresion = /^[1-9]$/;

  if (!expresion.test(paginaActual)) {
    return res.redirect("/revisarPelis?pagina=1");
  }

  try {
    //limites y offset
    const limit = 4;

    const offset = paginaActual * limit - limit;

    const [peliculas, total] = await Promise.all([
      Peliculas.findAll({
        limit,
        offset,
        where: { revisado: 0 },
      }),
      Peliculas.count({
        where: {
          revisado: 0,
        },
      }),
    ]);
    res.render("revisarPelis", {
      pagina: "Revisar Peliculas",
      usuario: req.usuario,
      peliculas,
      paginas: Math.ceil(total / limit),
      paginaActual,
      sitio: "revisarPelis",
    });
  } catch (error) {
    console.log(error);
  }
};

//Muestro toda la informacion de la pelicula a revisar
exports.revisarPelicula = async (req, res) => {
  const pelicula = await Peliculas.findByPk(req.params.id);

  res.render("mostrarPeliculaRe", {
    pagina: pelicula.titulo,
    usuario: req.usuario,
    pelicula,
    moment,
  });
};

//Si esta todo bien publico la pelicula
exports.publicarPeli = async (req, res) => {
  const pelicula = await Peliculas.findByPk(req.params.id);

  if (!pelicula) {
    req.flash("error", "Han habido un error");
    return res.redirect("/revisarPelis");
  }

  pelicula.revisado = 1;

  await pelicula.save();

  req.flash("exito", "Pelicula Publicada");
  res.redirect("/revisarPelis");
};

//Si la info de la pelicual noes correcta enviaremos un correo a usuario que realizo la insersion de la pelicula para que la corrija
exports.corregirPeli = async (req, res) => {
  const pelicula = await Peliculas.findByPk(req.params.id, {
    include: [
      {
        model: Usuarios,
      },
    ],
  });

  try {
    // Url de confirmación
    const url = `http://${req.headers.host}/editarPelicula/${pelicula.id}`;

    // Enviar email de confirmación
    await enviarEmail.enviarEmail({
      usuario: pelicula.usuario,
      url,
      pelicula: pelicula.titulo,
      subject: `Corriga la pelicula: ${pelicula.titulo}`,
      archivo: "corregirPelicula",
    });

    req.flash("exito", "Email enviado");
    res.redirect("/revisarPelis");
  } catch (error) {
    console.log(error);
  }
};


exports.pelisNoRevisadas = async (req, res) => {
  const { pagina: paginaActual } = req.query;

  const expresion = /^[1-9]$/;

  if (!expresion.test(paginaActual)) {
    return res.redirect("/pelisSinRevisar?pagina=1");
  }

  try {
    //limites y offset
    const limit = 4;

    const offset = paginaActual * limit - limit;

    const [peliculas, total] = await Promise.all([
      Peliculas.findAll({
        limit,
        offset,
        where: { revisado: 0,
                 usuarioId: req.usuario.id 
                },
      }),
      Peliculas.count({
        where: {
          revisado: 0,
        },
      }),
    ]);
    res.render("pelisSinRevisar", {
      pagina: "Peliculas sin revisar",
      usuario: req.usuario,
      peliculas,
      paginas: Math.ceil(total / limit),
      paginaActual,
      sitio: "pelisSinRevisar",
    });
  } catch (error) {
    console.log(error);
  }
};