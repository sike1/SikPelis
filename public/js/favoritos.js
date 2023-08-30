import axios from "axios"

document.addEventListener("DOMContentLoaded",()=>{
   const favoritos = document.querySelector("#fav")
   
   if(favoritos){
    favoritos.addEventListener("submit",addFav)
   }
})


function addFav(e){
    e.preventDefault();
    const btn = document.querySelector("#fav input[type='submit']")
    let accion = document.querySelector("#accion").value

    const datos={
        accion
    }

    axios.post(this.action,datos).then(respuesta=>{

       if(accion==="favorito"){
        document.querySelector("#accion").value = "quitar"
        btn.value="Quitar de favoritos"
        btn.classList.remove("btn-fav")
        btn.classList.add("btn-fav-rojo")
       }else{
        document.querySelector("#accion").value = "favorito"
        btn.value="Añadir a favoritos"
        btn.classList.remove("btn-fav-rojo")
        btn.classList.add("btn-fav")
       }
    })
}