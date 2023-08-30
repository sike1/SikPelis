const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");
const usuarioController = require("../controllers/usuariosController");
const authController = require("../controllers/authController");
const peliculasControllers = require("../controllers/peliculasController");
const adminControllers = require("../controllers/adminController");
const perfilController = require("../controllers/perfilController");

const {
  protegerRuta,
  protegerRutaAdmin,
  protegerRutaSuperAdmin
} = require("../middleware/protegerRuta");

module.exports = function () {
  //Home
  router.get("/home", protegerRuta, homeController.home);

  //crear cuenta
  router.get("/crearCuenta", usuarioController.formCrearCuenta);
  router.post("/crearCuenta", usuarioController.crearCuenta);
  //confirmar Cuenta
  router.get("/confirmarCuenta/:email", usuarioController.confirmarCuenta);
  //Eliminar Cuenta
  router.get("/eliminarCuenta",protegerRuta, usuarioController.formEliminarCuenta)
  router.get("/eliminarCuenta/:email",protegerRuta, usuarioController.eliminarCuenta)

  //Inicio  de sesion
  router.get("/", authController.formIniciarSesion);
  router.post("/", authController.iniciarSesion);

  //Cambiar Contraseña
  router.get(
    "/cambiarPassword",
    protegerRuta,
    authController.formCambiarPassword
  );
  router.post("/cambiarPassword", protegerRuta, authController.cambiarPassword);

  //olvido de contraseña
  router.get("/olvidePassword", authController.formOlvidePassword);
  router.post("/olvidePassword", authController.olvidePassword);

  //resetearPassword
  router.get("/resetPassword/:token", authController.formResetPassword);
  router.post("/resetPassword/:token", authController.resetPassword);

  //Cerrar Sesion
  router.get("/cerrarSesion", authController.cerrarSesion);

  /*Administracion*/
  router.get(
    "/administracion",
    protegerRuta,
    protegerRutaAdmin,
    adminControllers.administracion
  );

  //Form hacer Admin
  router.get("/nuevoAdmin", protegerRuta,
                            protegerRutaAdmin,
                            protegerRutaSuperAdmin, 
                            adminControllers.formBuscarUsuario);

  //Hacer Admin
  router.post("/nuevoAdmin", protegerRuta,
                             protegerRutaAdmin, 
                             protegerRutaSuperAdmin,
                             adminControllers.buscarYhacerAdmin);

  router.get("/noAdmin", protegerRuta,
                            protegerRutaAdmin,
                            protegerRutaSuperAdmin, 
                            adminControllers.formNoAdmin);

  //Quitar Admin
  router.post("/noAdmin",  protegerRuta,
                              protegerRutaAdmin, 
                              protegerRutaSuperAdmin,
                              adminControllers.buscarAdmin);

  //Peliculas
  router.get(
    "/nuevaPelicula",
    protegerRuta,
    protegerRutaAdmin,
    peliculasControllers.formNuevaPelicula
  );
  router.post(
    "/nuevaPelicula",
    protegerRuta,
    protegerRutaAdmin,
    peliculasControllers.subirImagen,
    peliculasControllers.nuevaPelicula
  );
  //Comentarios de peliculas
  router.post(
    "/comentario/:id",
    protegerRuta,
    peliculasControllers.enviarComentario
  );
  //Eliminar Comentario
  router.post(
    "/eliminarComentario/:id",
    protegerRuta,
    peliculasControllers.eliminarComentario
  );

  //Editar Peliculas
  router.get(
    "/editarPelicula/:id",
    protegerRuta,
    protegerRutaAdmin,
    peliculasControllers.formEditarPelicula
  );
  router.post(
    "/editarPelicula/:id",
    protegerRuta,
    protegerRutaAdmin,
    peliculasControllers.subirImagen,
    peliculasControllers.editarPelicula
  );

  //Eliminar peliculas
  router.get(
    "/eliminarPelicula/:id",
    protegerRuta,
    protegerRutaAdmin,
    peliculasControllers.formEliminarPelicula
  );
  router.post(
    "/eliminarPelicula/:id",
    protegerRuta,
    protegerRutaAdmin,
    peliculasControllers.eliminarPelicula
  );

  //Añadir a favoritos
  router.post(
    "/pelicula/:slug",
    protegerRuta,
    protegerRutaAdmin,
    peliculasControllers.peliculaFav
  );

  //Perfil
  router.get("/perfil/:id", protegerRuta, perfilController.perfil);
  //EditarPerfil
  router.get("/editarPerfil/", protegerRuta, perfilController.formEditarPerfil);
  router.post(
    "/editarPerfil/",
    protegerRuta,
    perfilController.subirImagen,
    perfilController.editarPerfil
  );

  /*FrontEnd*/
  //Mostrar peliculas
  router.get(
    "/pelicula/:slug",
    protegerRuta,
    peliculasControllers.mostrarPeliculas
  );
  //Busqueda por titulo o genero o ambas
  router.get("/busqueda",protegerRuta, homeController.busqueda)

  //Busqueda por genero
  router.get("/genero/:slug",protegerRuta, homeController.busquedaGenero)



  return router;
};
