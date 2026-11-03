/* ==========================================================================
   Recolecta+ · App ciudadana (inicio)
   Prototipo: los datos viven en el navegador y las solicitudes no se envían.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE_SESION = "recolecta.sesion";
  var PUNTOS = 1480;
  var PUNTOS_SEMANA = 120;

  /* ------------------------------------------------------------------ sesión */

  function leerSesion() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_SESION));
    } catch (error) {
      return null;
    }
  }

  var sesion = leerSesion();

  if (!sesion || !sesion.rol) {
    window.location.replace("index.html");
    return;
  }

  if (sesion.rol !== "ciudadano") {
    window.location.replace("panel.html");
    return;
  }

  var el = {
    lienzo: document.getElementById("lienzo"),
    saludo: document.getElementById("nombreCorto"),
    puntos: document.getElementById("puntos"),
    puntosSemana: document.getElementById("puntosSemana"),
    toast: document.getElementById("toast"),

    btnUsuario: document.getElementById("btnUsuario"),
    menu: document.getElementById("menuUsuario"),
    menuNombre: document.getElementById("menuNombre"),
    menuCorreo: document.getElementById("menuCorreo"),
    btnSalir: document.getElementById("btnSalir"),

    btnCanjear: document.getElementById("btnCanjear"),
    btnTarjetaCanjear: document.getElementById("btnTarjetaCanjear"),
    btnActiva: document.getElementById("btnActiva"),
    btnProgramar: document.getElementById("btnProgramar"),
    btnProgramarTexto: document.getElementById("btnProgramarTexto"),
    estadoSolicitud: document.getElementById("estadoSolicitud"),

    btnEscanear: document.getElementById("btnEscanear"),
    listaActividad: document.getElementById("listaActividad"),

    btnFab: document.getElementById("btnFab"),
    navItems: Array.prototype.slice.call(document.querySelectorAll("[data-vista]")),

    dlgReco: document.getElementById("dlgRecoleccion"),
    formReco: document.getElementById("formRecoleccion"),
    dlgRecoCerrar: document.getElementById("dlgRecoCerrar"),
    dlgRecoCancelar: document.getElementById("dlgRecoCancelar"),
    recoMaterial: document.getElementById("recoMaterial"),
    recoDireccion: document.getElementById("recoDireccion"),
    recoDia: document.getElementById("recoDia"),
    recoFranja: document.getElementById("recoFranja"),
    errorDireccion: document.getElementById("errorDireccion"),

    dlgEscanear: document.getElementById("dlgEscanear"),
    dlgEscanearCerrar: document.getElementById("dlgEscanearCerrar"),
    dlgEscanearCancelar: document.getElementById("dlgEscanearCancelar"),
    btnSimularEscaneo: document.getElementById("btnSimularEscaneo")
  };

  /* --------------------------------------------------------------- utilidades */

  var temporizadorToast = null;

  function avisar(mensaje) {
    el.toast.textContent = mensaje;
    el.toast.classList.add("is-visible");

    window.clearTimeout(temporizadorToast);
    temporizadorToast = window.setTimeout(function () {
      el.toast.classList.remove("is-visible");
    }, 3400);
  }

  function iniciales(nombre) {
    var partes = String(nombre || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!partes.length) return "RA";
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();

    return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
  }

  function primerNombre(nombre) {
    var parte = String(nombre || "").trim().split(/\s+/)[0] || "vecino";
    return parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase();
  }

  function miles(valor) {
    try {
      return valor.toLocaleString("es-CO");
    } catch (error) {
      return String(valor);
    }
  }

  function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  /* ----------------------------------------------------------- datos de sesión */

  var nombre = sesion.nombre || "Andrés Villalba";
  var correo = sesion.correo || "ciudadano@recolecta.co";

  el.saludo.textContent = primerNombre(nombre);
  el.puntos.textContent = miles(PUNTOS);
  el.btnUsuario.textContent = iniciales(nombre);
  el.btnUsuario.setAttribute("aria-label", "Menú de la cuenta de " + primerNombre(nombre));
  el.menuNombre.textContent = nombre;
  el.menuCorreo.textContent = correo;

  /* ------------------------------------------------------- menú de la cuenta */

  var menuAbierto = false;

  function abrirMenu(abierto) {
    menuAbierto = abierto;
    el.menu.hidden = !abierto;
    el.btnUsuario.setAttribute("aria-expanded", String(abierto));
  }

  el.btnUsuario.addEventListener("click", function (evento) {
    evento.stopPropagation();
    abrirMenu(!menuAbierto);

    if (menuAbierto) {
      el.btnSalir.focus();
    }
  });

  el.menu.addEventListener("click", function (evento) {
    evento.stopPropagation();
  });

  document.addEventListener("click", function () {
    if (menuAbierto) abrirMenu(false);
  });

  el.btnSalir.addEventListener("click", function () {
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch (error) {
      /* sin almacenamiento disponible */
    }
    window.location.href = "index.html";
  });

  /* ------------------------------------------------------------------ diálogos */

  function abrirDialogo(dialogo) {
    if (typeof dialogo.showModal === "function") {
      dialogo.showModal();
    } else {
      dialogo.setAttribute("open", "");
    }
  }

  function cerrarDialogo(dialogo) {
    if (typeof dialogo.close === "function") {
      dialogo.close();
    } else {
      dialogo.removeAttribute("open");
    }
  }

  [el.dlgReco, el.dlgEscanear].forEach(function (dialogo) {
    dialogo.addEventListener("click", function (evento) {
      if (evento.target === dialogo) cerrarDialogo(dialogo);
    });
  });

  /* ------------------------------------------------- programar recolección */

  function limpiarErrorDireccion() {
    el.errorDireccion.parentNode.classList.remove("cz-campo--error");
    el.errorDireccion.textContent = "";
  }

  function abrirRecoleccion() {
    limpiarErrorDireccion();
    el.recoDireccion.value = "";
    abrirDialogo(el.dlgReco);
    el.recoMaterial.focus();
  }

  function validarRecoleccion() {
    limpiarErrorDireccion();

    if (el.recoDireccion.value.trim().length < 6) {
      el.errorDireccion.parentNode.classList.add("cz-campo--error");
      el.errorDireccion.textContent = "Escribe una dirección válida para la recogida.";
      el.recoDireccion.focus();
      return false;
    }

    return true;
  }

  el.btnProgramar.addEventListener("click", abrirRecoleccion);
  el.btnFab.addEventListener("click", abrirRecoleccion);
  el.dlgRecoCerrar.addEventListener("click", function () { cerrarDialogo(el.dlgReco); });
  el.dlgRecoCancelar.addEventListener("click", function () { cerrarDialogo(el.dlgReco); });

  el.recoDireccion.addEventListener("input", limpiarErrorDireccion);

  el.formReco.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (!validarRecoleccion()) return;

    var material = el.recoMaterial.value;
    var dia = capitalizar(el.recoDia.value);
    var franja = el.recoFranja.value;

    el.estadoSolicitud.hidden = false;
    el.estadoSolicitud.textContent = "Programada · " + dia + " · " + franja + " · " + material;
    el.btnProgramarTexto.textContent = "Programar otra recolección";

    cerrarDialogo(el.dlgReco);
    avisar("Recolección programada: " + el.recoDia.value + " · " + franja);
  });

  /* ------------------------------------------------------- escanear código */

  var CANECAS = [
    { id: "C-12", lugar: "Parque Laureles" },
    { id: "C-19", lugar: "Ronda del Sinú" },
    { id: "C-07", lugar: "Mercado Central" },
    { id: "C-04", lugar: "Barrio Monteverde" }
  ];
  var siguienteCaneca = 0;

  var ICONO_RECICLAJE =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M7 19H4.8a1.8 1.8 0 0 1-1.6-.9 1.8 1.8 0 0 1 0-1.8L7.2 9.5"/>' +
    '<path d="M11 19h8.2a1.8 1.8 0 0 0 1.6-.9 1.8 1.8 0 0 0 0-1.8l-1.2-2.1"/>' +
    '<path d="m14 16-3 3 3 3"/>' +
    '<path d="M8.3 13.6 7.2 9.5 3.1 10.6"/>' +
    '<path d="m9.3 5.8 1.1-1.9a1.8 1.8 0 0 1 1.6-.9 1.8 1.8 0 0 1 1.5.9l3.9 6.8"/>' +
    '<path d="m13.4 9.6 4.1 1.1 1.1-4.1"/>' +
    "</svg>";

  function horaActual() {
    try {
      return new Date().toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
    } catch (error) {
      return "";
    }
  }

  function sumarPuntos(cantidad) {
    PUNTOS += cantidad;
    PUNTOS_SEMANA += cantidad;
    el.puntos.textContent = miles(PUNTOS);
    el.puntosSemana.textContent = "+" + miles(PUNTOS_SEMANA) + " pts esta semana";
  }

  function agregarActividad(titulo, cuando, puntos, icono) {
    var fila = document.createElement("li");
    fila.className = "cz-actividad__fila is-nueva";

    var cajaIcono = document.createElement("span");
    cajaIcono.className = "cz-actividad__icono";
    cajaIcono.setAttribute("aria-hidden", "true");
    cajaIcono.innerHTML = icono || ICONO_RECICLAJE;

    var texto = document.createElement("span");
    texto.className = "cz-actividad__texto";

    var tituloFila = document.createElement("strong");
    tituloFila.textContent = titulo;

    var fecha = document.createElement("small");
    fecha.textContent = cuando;

    texto.appendChild(tituloFila);
    texto.appendChild(fecha);

    var valor = document.createElement("span");
    valor.className = "cz-actividad__puntos";
    valor.textContent = "+" + puntos;

    var unidad = document.createElement("small");
    unidad.textContent = "pts";
    valor.appendChild(unidad);

    fila.appendChild(cajaIcono);
    fila.appendChild(texto);
    fila.appendChild(valor);

    el.listaActividad.insertBefore(fila, el.listaActividad.firstElementChild);

    window.setTimeout(function () {
      fila.classList.remove("is-nueva");
    }, 1900);
  }

  el.btnEscanear.addEventListener("click", function () {
    abrirDialogo(el.dlgEscanear);
    el.btnSimularEscaneo.focus();
  });

  el.dlgEscanearCerrar.addEventListener("click", function () { cerrarDialogo(el.dlgEscanear); });
  el.dlgEscanearCancelar.addEventListener("click", function () { cerrarDialogo(el.dlgEscanear); });

  el.btnSimularEscaneo.addEventListener("click", function () {
    var caneca = CANECAS[siguienteCaneca % CANECAS.length];
    siguienteCaneca += 1;

    cerrarDialogo(el.dlgEscanear);
    sumarPuntos(25);
    agregarActividad("Reciclaje en caneca " + caneca.id, "Hoy · " + horaActual(), 25);

    avisar("Caneca " + caneca.id + " · " + caneca.lugar + " · +25 Puntos Verdes");

    window.setTimeout(function () {
      el.listaActividad.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 320);
  });

  /* --------------------------------------------------------- navegación baja */

  var AVISOS_VISTA = {
    premios: "El catálogo de premios y canjes estará disponible muy pronto.",
    impacto: "Tu impacto ambiental detallado estará disponible muy pronto."
  };

  el.navItems.forEach(function (boton) {
    boton.addEventListener("click", function () {
      var vista = boton.dataset.vista;

      if (vista === "inicio") {
        el.lienzo.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      avisar(AVISOS_VISTA[vista] || "Este módulo estará disponible muy pronto.");
    });
  });

  /* -------------------------------------------------------------- otros CTA */

  function avisarCanje() {
    avisar("Tienes " + miles(PUNTOS) + " Puntos Verdes. El catálogo de premios estará disponible muy pronto.");
  }

  el.btnCanjear.addEventListener("click", avisarCanje);
  el.btnTarjetaCanjear.addEventListener("click", avisarCanje);

  el.btnActiva.addEventListener("click", function () {
    window.location.href = "rastreo.html";
  });

  /* ------------------------------------------- llegada desde el FAB de rastreo */

  var parametros = new URLSearchParams(window.location.search);

  if (parametros.get("nueva") === "1") {
    abrirRecoleccion();
  }

  /* ------------------------------------------------------------------ teclado */

  document.addEventListener("keydown", function (evento) {
    if (evento.key !== "Escape") return;
    if (menuAbierto) abrirMenu(false);
  });
})();
