const Generos = require("../models/Generos");
const Peliculas = require("../models/Peliculas");
const Usuarios = require("../models/Usuarios");
const Comentarios = require("../models/Comentarios");

const shortid = require("shortid");
const multer = require("multer");
const moment = require("moment");
const fs = require("fs");
const Sequelize = require("sequelize");

//configuracion multer
const configuracionMulter = {
  limits: { fileSize: 1000000 },
  storage: (fileStorage = multer.diskStorage({
    destination: (req, file, next) => {
      next(null, __dirname + "/../public/uploads/carteles");
    },
    filename: (req, file, next) => {
      const extension = file.mimetype.split("/")[1];
      next(null, `${shortid.generate()}.${extension}`);
    },
  })),
  fileFilter(req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      // el callback se ejecuta como true o false : true cuando la imagen se acepta
      cb(null, true);
    } else {
      cb(new Error("Formato No Válido"), false);
    }
  },
};

const upload = multer(configuracionMulter).single("imagen");

//subir imagen al servidor
exports.subirImagen = (req, res, next) => {
  upload(req, res, function (error) {
    if (error) {
      if (error instanceof multer.MulterError) {
        if (error.code == "LIMIT_FILE_SIZE") {
          req.flash("error", "Archivo muy grande. Max: 300Kb");
        } else {
          req.flash("error", error.message);
        }
      } else if (error.hasOwnProperty("message")) {
        req.flash("error", error.message);
      }
      res.redirect("back");
      return;
    } else {
      next();
    }
  });
};

exports.formNuevaPelicula = async (req, res) => {
  const generos = await Generos.findAll({ order: [["id", "ASC"]] });

  res.render("nuevaPelicula", {
    pagina: "Nueva película",
    generos,
    usuario: req.usuario,
  });
};

exports.nuevaPelicula = async (req, res, next) => {
  // Realizar las validaciones antes de intentar crear el usuario
  req.checkBody("titulo", "El titulo no puede ir vacío").notEmpty();
  req.checkBody("sinopsis", "La sinopsis no puede ir vacío").notEmpty();
  req.checkBody("duracion", "La duracion no puede ir vacía").notEmpty();
  req.checkBody("generoId", "El genero no puede ir vacío").notEmpty();

  // Leer los errores de express
  const erroresExpress = req.validationErrors();

  // Comprobar si hay errores de validación antes de crear el usuario
  if (erroresExpress) {
    // Si hay errores de validación, redirige a la página de registro con los errores mostrados
    const errExp = erroresExpress.map((err) => err.msg);
    req.flash("error", errExp);
    return res.redirect("/nuevaPelicula");
  }

  if (!req.file) {
    req.flash("error", "El cartel no puede ir vacio");
    return res.redirect("/nuevaPelicula");
  }

  const pelicula = req.body;

  pelicula.imagen = req.file.filename;

  pelicula.usuarioId = req.usuario.id;

  await Peliculas.create(pelicula);

  req.flash("exito", "Pelicula insertada, a la esperando a ser revisada");
  res.redirect("/administracion");

};

//mostrar peliculas
exports.mostrarPeliculas = async (req, res) => {
  const pelicula = await Peliculas.findOne({
    where: { slug: req.params.slug, revisado: 1 },
  });

  const comentarios = await Comentarios.findAll({
    where: {
      peliculaId: pelicula.id,
    },
    include: [
      {
        model: Usuarios,
        attributes: ["id", "nombre", "imagen"],
      },
    ],
  });

  res.render("frontend/mostrarPelicula", {
    pagina: pelicula.titulo,
    pelicula,
    moment,
    usuario: req.usuario,
    comentarios,
  });
};

exports.formEditarPelicula = async (req, res) => {
  const consultas = [];
  consultas.push(Peliculas.findByPk(req.params.id));
  consultas.push(Generos.findAll({ order: [["id", "ASC"]] }));

  const [pelicula, generos] = await Promise.all(consultas);

  res.render("editarPelicula", {
    pagina: "Editar pelicula",
    pelicula,
    generos,
    usuario: req.usuario,
  });
};

exports.editarPelicula = async (req, res) => {
  const { titulo, estreno, sinopsis, duracion, genero, trailer } = req.body;

  const pelicula = await Peliculas.findByPk(req.params.id);

  pelicula.titulo = titulo;
  pelicula.estreno = estreno;
  pelicula.sinopsis = sinopsis;
  pelicula.duracion = duracion;
  pelicula.genero = genero;
  pelicula.trailer = trailer;

  if (req.file) {
    const imagenAnteriorPath =
      __dirname + `/../public/uploads/carteles/${pelicula.imagen}`;
    //eliminar archivo cn fs
    fs.unlink(imagenAnteriorPath, (error) => {
      if (error) {
        console.log(error);
      }
      return;
    });

    pelicula.imagen = req.file.filename;
  }

  await pelicula.save();
  req.flash("exito", "Pelicula actualizada");
  res.redirect("/administracion");
};

//Formulario para eliminar peliculas
exports.formEliminarPelicula = async (req, res, next) => {
  const pelicula = await Peliculas.findByPk(req.params.id);

  if (!pelicula) {
    req.flash("error", "Pelicula no encontrada");
    res.redirect("/administracion");
    return next();
  }

  res.render("eliminarPelicula", {
    pagina: `Eliminar Pelicula: ${pelicula.titulo}`,
    usuario: req.usuario,
  });
};

//Eliminar una pelicula
exports.eliminarPelicula = async (req, res) => {
  const pelicula = await Peliculas.findByPk(req.params.id);

  if(pelicula.imagen){
    const imagenAnteriorPath = __dirname +`/../public/uploads/carteles/${pelicula.imagen}`
      //eliminar archivo cn fs
      fs.unlink(imagenAnteriorPath, (error)=> {
          if(error){
              console.log(error)
          }
          return
      })
  }

  await pelicula.destroy();

  req.flash("exito", "Pelicula Eliminada");
  res.redirect("/administracion");
};

exports.peliculaFav = async (req, res) => {
  const { accion } = req.body;
  const pelicula = await Peliculas.findOne({
    where: { slug: req.params.slug },
  });

  //Comparamos que lleva el accion para saber si añado a fav o lo eliminode fav
  if (accion === "favorito") {
    //agregamos a fav
    Usuarios.update(
      {
        pelisFavs: Sequelize.fn(
          "array_append",
          Sequelize.col("pelisFavs"),
          pelicula.id
        ),
      },
      { where: { id: req.usuario.id } }
    );
    //mensaje
    res.send("Pelicula añadida a Favoritos");
  } else {
    //eliminamos de fav
    Usuarios.update(
      {
        pelisFavs: Sequelize.fn(
          "array_remove",
          Sequelize.col("pelisFavs"),
          pelicula.id
        ),
      },
      { where: { id: req.usuario.id } }
    );
    //mensaje
    res.send("Pelicula eliminada de Favoritos");
  }
};

exports.enviarComentario = async (req, res) => {
  //Iniciamos un objeto cn el mensaje recogido del body
  const comentario = req.body;
  //Buscamos la pelicula
  const pelicula = await Peliculas.findByPk(req.params.id);
  //Añadimos el id de usuario y el id de la pelicula
  comentario.usuarioId = req.usuario.id;
  comentario.peliculaId = pelicula.id;

  //Guardamos el comentario en BD
  await Comentarios.create(comentario);
  //Mensaje de confirmacion
  req.flash("exito", "Comentario Enviado");
  //redireccionamos
  res.redirect(`/pelicula/${pelicula.slug}`);
};

exports.eliminarComentario = async (req, res) => {
  const comentario = await Comentarios.findByPk(req.params.id);
  const pelicula = await Peliculas.findByPk(comentario.peliculaId);

  await comentario.destroy();
  //Mensaje de confirmacion
  req.flash("exito", "Comentario Eliminado");
  //redireccionamos
  res.redirect(`/pelicula/${pelicula.slug}`);
};
