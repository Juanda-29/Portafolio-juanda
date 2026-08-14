document.addEventListener("DOMContentLoaded", async () => {

  actualizarContadores();

  const contenedorUsuarios = document.getElementById("contenedorUsuarios");
  const contenedorFavoritos = document.getElementById("contenedorFavoritos");
  const perfilFoto = document.getElementById("perfilFoto");

  // Página principal: traer usuarios desde la API
  if (contenedorUsuarios) {

    try {

      const respuesta = await axios.get("https://randomuser.me/api/?results=100&seed=grilla");
      const usuarios = respuesta.data.results;

      localStorage.setItem("totalUsuarios", usuarios.length);
      document.getElementById("totalTexto").textContent = usuarios.length + " usuarios";
      actualizarContadores();

      usuarios.forEach(usuario => crearCard(usuario, contenedorUsuarios));

      const buscador = document.getElementById("buscador");
      buscador.addEventListener("keyup", () => {
        filtrarCards(buscador.value, contenedorUsuarios);
      });

    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  }

  // Página de favoritos
  if (contenedorFavoritos) {
    cargarFavoritos(contenedorFavoritos);
  }

  // Página de perfil
  if (perfilFoto) {
    cargarPerfil();
  }

});


// Crea una card de usuario y la agrega al contenedor
function crearCard(usuario, contenedor) {

  const card = document.createElement("div");
  card.className = "user-card";

  const imagen = document.createElement("img");
  imagen.src = usuario.picture.large;
  imagen.alt = "Foto de " + usuario.name.first;

  const nombre = document.createElement("h2");
  nombre.textContent = usuario.name.first + " " + usuario.name.last;

  const pais = document.createElement("p");
  pais.textContent = usuario.location.country;

  const estrella = document.createElement("button");
  estrella.className = "estrella";
  if (esFavorito(usuario)) estrella.classList.add("activo");

  estrella.addEventListener("click", (evento) => {
    evento.stopPropagation();
    cambiarFavorito(usuario, estrella);

    // Si estamos en la página de favoritos y se acaba de desmarcar,
    // la tarjeta ya no debe seguir apareciendo ahí
    const paginaFavoritos = document.getElementById("contenedorFavoritos");
    if (paginaFavoritos && !estrella.classList.contains("activo")) {
      card.remove();

      if (paginaFavoritos.children.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "sin-favoritos";
        mensaje.textContent = "Todavía no tienes usuarios favoritos.";
        paginaFavoritos.appendChild(mensaje);
      }
    }
  });

  card.addEventListener("click", () => {
    localStorage.setItem("usuarioSeleccionado", JSON.stringify(usuario));
    window.location.href = "perfil.html";
  });

  card.appendChild(estrella);
  card.appendChild(imagen);
  card.appendChild(nombre);
  card.appendChild(pais);

  contenedor.appendChild(card);
}


// Filtra las cards visibles según el texto escrito en el buscador
function filtrarCards(texto, contenedor) {

  const cards = contenedor.querySelectorAll(".user-card");
  texto = texto.toLowerCase();

  cards.forEach(card => {
    const nombre = card.querySelector("h2").textContent.toLowerCase();
    card.style.display = nombre.includes(texto) ? "" : "none";
  });
}


// Agrega o quita un usuario de favoritos
function cambiarFavorito(usuario, boton) {

  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  const existe = favoritos.some(fav => fav.login.uuid === usuario.login.uuid);

  if (existe) {
    favoritos = favoritos.filter(fav => fav.login.uuid !== usuario.login.uuid);
    boton.classList.remove("activo");
  } else {
    favoritos.push(usuario);
    boton.classList.add("activo");
  }

  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  actualizarContadores();
}


function esFavorito(usuario) {
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  return favoritos.some(fav => fav.login.uuid === usuario.login.uuid);
}


function cargarFavoritos(contenedor) {

  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  if (favoritos.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.className = "sin-favoritos";
    mensaje.textContent = "Todavía no tienes usuarios favoritos.";
    contenedor.appendChild(mensaje);
    return;
  }

  favoritos.forEach(usuario => crearCard(usuario, contenedor));
}


// Actualiza los números que aparecen junto a las pestañas Todos / Favoritos
function actualizarContadores() {

  const total = localStorage.getItem("totalUsuarios") || "";
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  const contadorTodos = document.getElementById("contadorTodos");
  const contadorFavoritos = document.getElementById("contadorFavoritos");

  if (contadorTodos) contadorTodos.textContent = total ? `(${total})` : "";
  if (contadorFavoritos) contadorFavoritos.textContent = `(${favoritos.length})`;
}


function cargarPerfil() {

  const usuario = JSON.parse(localStorage.getItem("usuarioSeleccionado"));

  if (!usuario) {
    window.location.href = "cards.html";
    return;
  }

  document.getElementById("perfilFoto").src = usuario.picture.large;
  document.getElementById("perfilNombre").textContent = usuario.name.first + " " + usuario.name.last;
  document.getElementById("perfilUsuario").textContent = "@" + usuario.login.username;
  document.getElementById("perfilCorreo").textContent = usuario.email;
  document.getElementById("perfilTelefono").textContent = usuario.phone;
  document.getElementById("perfilEdad").textContent = usuario.dob.age + " años";
  document.getElementById("perfilGenero").textContent = usuario.gender === "male" ? "Masculino" : "Femenino";
  document.getElementById("perfilUbicacion").textContent = usuario.location.city + ", " + usuario.location.country;

  const estrella = document.getElementById("estrellaPerfil");
  if (esFavorito(usuario)) estrella.classList.add("activo");

  estrella.addEventListener("click", () => {
    cambiarFavorito(usuario, estrella);
  });

  document.getElementById("volver").addEventListener("click", () => {
    window.history.back();
  });
}