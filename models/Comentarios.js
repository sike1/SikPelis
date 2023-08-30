const Sequelize = require("sequelize");
const db = require("../config/db");
const Usuarios = require('./Usuarios');
const Peliculas = require("./Peliculas");


const Comentarios = db.define(
  "comentarios",
  {
    id : {
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement : true
    }, 
    mensaje : Sequelize.TEXT,
}, {
timestamps : false
});

Comentarios.belongsTo(Usuarios, {onDelete: 'CASCADE'})
Comentarios.belongsTo(Peliculas)


module.exports = Comentarios;


