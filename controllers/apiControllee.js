const Peliculas = require("../models/Peliculas");

exports.peliculasRev = async (req, res) => {
  const pag = req.body.pag || 1;
  const cantidad = 4;
  const inicio = pag * cantidad - cantidad;
  const peliculasRevi = await Peliculas.findAll({
    limit: cantidad,
    offset: inicio,
    where: { revisado: 0 },
  });
  res.json(peliculasRevi);
};
