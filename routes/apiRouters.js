const express = require("express");
const { peliculasRev } = require("../controllers/apiControllee");

const router = express.Router();

module.exports = function () {
  router.post("/peliculasRev", peliculasRev);

  return router;
};
