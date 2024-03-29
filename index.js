const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const MemoryStore = require('memorystore')(session)
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config({ path: "variables.env" });
const expressValidator = require("express-validator");

//cnfig y modelos bd
const db = require("./config/db");
require("./models/Usuarios");
require("./models/Peliculas");
require("./models/Generos");
require("./models/Comentarios");

db.sync()
  .then(() => console.log("DB Conectada"))
  .catch((error) => console.log(error));

//Aplicacion principal
const app = express();

//Routing
const router = require("./routes");
const apiRouter = require("./routes/apiRouters");

// Habilitar lectura de datos de formularios
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

//Habilitar express validator
app.use(expressValidator());

//Habilitar EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

//Ubicacion vistas
app.set("views", path.join(__dirname, "./views"));

//Habilitar cookie-Parser
app.use(cookieParser());

//crear La sesion

app.use(session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
  key: process.env.KEY,
  resave: false,
  secret: process.env.SECRET,
  saveUninitialized: false
}))

//agrega flash
app.use(flash());

//Middleware
app.use((req, res, next) => {
  res.locals.usuario = { ...req.usuario } || null;
  res.locals.mensajes = req.flash();
  next();
});

//archivos estaticos
app.use(express.static("public"));



//Routing
app.use("/", router());
app.use("/api", apiRouter());

//agrega puerto
app.listen(process.env.PORT, () => {
  console.log("Servidor funcionando");
});
