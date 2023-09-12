import favoritos from "./favoritos";

document.addEventListener("DOMContentLoaded", () => {
  const revisar = document.querySelector("#revisar");

  if (revisar) {
    document.getElementById("revisar").addEventListener("click", () => {
      location.href = "/revisarPelis";
    });
  }
});
