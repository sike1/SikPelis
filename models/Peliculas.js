const Sequelize = require("sequelize");
const db = require("../config/db");
const slug = require('slug');
const shortid = require('shortid');
const Usuarios = require('./Usuarios');
const Generos = require('./Generos');



const Peliculas = db.define(
  "peliculas",
  {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    titulo: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    estreno: {
        type:Sequelize.DATEONLY,
    },
    sinopsis:{
        type:Sequelize.TEXT,
        allowNull: false,
    },
    imagen:{
        type:Sequelize.TEXT,
        allowNull: false,
    },
    duracion:{
        type:Sequelize.STRING,
        allowNull: false,
    },
    trailer:{
        type:Sequelize.TEXT,
        allowNull: false,
    },
    slug : {
        type: Sequelize.STRING,
    },

  }, {
    hooks: {
        async beforeCreate(pelicula) {
            const url = slug(pelicula.titulo).toLowerCase();
            pelicula.slug = `${url}-${shortid.generate()}`;
        }
    }
}
);

Peliculas.belongsTo(Usuarios);
Peliculas.belongsTo(Generos);




module.exports = Peliculas;
