import favoritos from "./favoritos";

document.addEventListener("DOMContentLoaded", () => {
  const revisar = document.querySelector("#revisar");

  if (revisar) {
    document.getElementById("revisar").addEventListener("click", () => {
      location.href = "/revisarPelis";
    });
  }
});

const $ = (str) => document.getElementById(str);
const div = $("contenedor");
const ul = $("lista");

let wait = false;
let listItemFinal = null;
const observandoListItem = (listItem) => {
  if (listItem[0].isIntersecting) {
    obtenerPelis();
  }
};

const setting = {
  thershol: 1,
};

let observador = new IntersectionObserver(observandoListItem, setting);
const obtenerPelis = async () => {
  if (wait) return;
  wait = true;
  let pag = parseInt(ul.dataset.p) || 1;
  const FD = new FormData();
  FD.append("pag", pag);
  try {
    const url = "/api/peliculasRev";
    const respuesta = await fetch(url, {
      method: "POST",
      body: FD,
    });

    const pelisNoRe = await respuesta.json();

    pelisNoRe.forEach((peli) => {
      const li = document.createElement("li");
      li.innerHTML = peli.titulo;
      ul.appendChild(li);
    });

    if (listItemFinal) {
      observador.unobserve(listItemFinal);
    }

    listItemFinal = ul.lastElementChild;
    observador.observe(listItemFinal);
    wait = false;
    ul.dataset.p = ++pag;
  } catch (error) {
    console.log(error);
  }
};

obtenerPelis();
