const Sequelize = require("sequelize");
const db = require("../config/db");
const Usuarios = require('./Usuarios');


const Generos = db.define(
  "generos",
  {
     id : {
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement : true
    }, 
    nombre : Sequelize.TEXT,
    slug : Sequelize.TEXT
}, {
timestamps : false
});


module.exports = Generos;
