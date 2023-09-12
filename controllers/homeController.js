const { promises } = require("nodemailer/lib/xoauth2");
const Generos = require("../models/Generos");
const Peliculas = require("../models/Peliculas");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.home = async (req, res) => {
  const generos = await Generos.findAll({ order: [["id", "ASC"]] });
  const peliculas = await Peliculas.findAll({
    limit: 4,
    where: { estreno: { [Op.gte]: moment(new Date()).format("YYYY-MM-DD") },revisado: 1 },
    order: [["estreno", "DESC"]],
  });

  res.render("home", {
    pagina: "Incio",
    usuario: req.usuario,
    generos,
    moment,
    peliculas,
  });
};

exports.busqueda = async (req, res) => {
  const { titulo, genero, pagina: paginaActual } = req.query;

  const expresion = /^[1-9]$/;

  if (!genero) {
    if (!expresion.test(paginaActual)) {
      return res.redirect(`/busqueda?titulo=${titulo}&genero=&pagina=1`);
    }
  } else {
    if (!expresion.test(paginaActual)) {
      return res.redirect(
        `/busqueda?titulo=${titulo}&genero=${genero}&pagina=1`
      );
    }
  }

  try {
    //limites y offset
    const limit = 8;

    const offset = paginaActual * limit - limit;

    let peliculas;
    let total;

    if (!genero) {
      [peliculas, total] = await Promise.all([
        Peliculas.findAll({
          limit,
          offset,
          order: [["estreno", "DESC"]],
          where: { titulo: { [Op.iLike]: "%" + titulo + "%" },revisado: 1 },
        }),
        Peliculas.count({
          where: { titulo: { [Op.iLike]: "%" + titulo + "%" },revisado: 1 },
        }),
      ]);
    } else {
      [peliculas, total] = await Promise.all([
        Peliculas.findAll({
          limit,
          offset,
          order: [["estreno", "DESC"]],
          where: {
            titulo: { [Op.iLike]: "%" + titulo + "%" },
            generoId: { [Op.eq]: genero },
            revisado: 1
          },
        }),
        Peliculas.count({
          where: {
            titulo: { [Op.iLike]: "%" + titulo + "%" },
            generoId: { [Op.eq]: genero },
            revisado: 1
          },
        }),
      ]);
    }

    res.render("busqueda", {
      pagina: "Resultado de la busqueda",
      peliculas,
      usuario: req.usuario,
      moment,
      paginaActual,
      total,
      paginas: Math.ceil(total / limit),
      sitio: !genero
        ? `busqueda?titulo=${titulo}&genero=`
        : `busqueda?titulo=${titulo}&genero=${genero}`,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.busquedaGenero = async (req, res) => {
  const { slug } = req.params;
  const { pagina: paginaActual } = req.query;
  const expresion = /^[1-9]$/;

  try {
    const limit = 8;
    const offset = paginaActual * limit - limit;
    const genero = await Generos.findOne({ where: { slug } });

    if (!expresion.test(paginaActual)) {
      return res.redirect(`/genero/${genero.slug}?pagina=1`);
    }

    const [peliculas, total] = await Promise.all([
      Peliculas.findAll({
        limit,
        offset,
        order: [["estreno", "DESC"]],
        where: { generoId: genero.id, revisado: 1 },
        
      }),
      Peliculas.count({ where: { generoId: genero.id, revisado: 1 } }),
    ]);
    console.log(peliculas)
    res.render("busquedaGenero", {
      pagina: `Busqueda Genero: ${genero.nombre}`,
      peliculas,
      usuario: req.usuario,
      moment,
      paginaActual,
      total,
      paginas: Math.ceil(total / limit),
      sitio: `/genero/${genero.slug}`,
    });
  } catch (error) {
    consgole.log(error);
  }
};
