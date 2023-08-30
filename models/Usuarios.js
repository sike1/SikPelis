const Sequelize = require("sequelize");
const db = require("../config/db");
const bcrypt = require("bcryptjs");

const Usuarios = db.define(
  "usuarios",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: Sequelize.STRING(60),
    imagen: Sequelize.STRING(60),
    email:{
      type: Sequelize.STRING(30),
      allowNull: false,
      unique: true,
  },
    password: {
      type: Sequelize.STRING(60),
      allowNull: false,
    },
    activo: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    token: {
      type: Sequelize.STRING,
      defaultValue: "",
    },
    admin:{
        type: Sequelize.INTEGER,
        default:0
    },
    superAdmin:{
      type: Sequelize.INTEGER,
      default:0
  },
    pelisFavs : {
      type: Sequelize.ARRAY(Sequelize.UUID),
      defaultValue : []
  },
   
  },
  {
    hooks: {
      beforeCreate(usuario) {
        usuario.password = Usuarios.prototype.hashPassword(usuario.password)
      },
    },
    scopes:{
      eliminarPassword:{
        attributes:{
          exclude: ["password","activo","token"]
        }
      }
    }
  }
);

//metodo para comparar password
Usuarios.prototype.validarPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
//metodo para hashear password
Usuarios.prototype.hashPassword = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10),null)
}


module.exports = Usuarios;
