/* ==========================================================================
   Recolecta+ · Mi Impacto (app ciudadana)
   Prototipo: pantalla informativa con datos simulados.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE_SESION = "recolecta.sesion";

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
    btnUsuario: document.getElementById("btnUsuario"),
    menuUsuario: document.getElementById("menuUsuario"),
    menuNombre: document.getElementById("menuNombre"),
    menuCorreo: document.getElementById("menuCorreo"),
    btnMenuProgramar: document.getElementById("btnMenuProgramar"),
    btnSalir: document.getElementById("btnSalir")
  };

  function inicializarCuenta() {
    el.menuNombre.textContent = sesion.nombre || "Ciudadano";
    el.menuCorreo.textContent = sesion.correo || "";

    el.btnUsuario.addEventListener("click", function (evento) {
      evento.stopPropagation();
      var abierto = !el.menuUsuario.hidden;
      el.menuUsuario.hidden = abierto;
      el.btnUsuario.setAttribute("aria-expanded", String(!abierto));
    });

    document.addEventListener("click", function (evento) {
      if (!el.menuUsuario.hidden && !el.menuUsuario.contains(evento.target)) {
        el.menuUsuario.hidden = true;
        el.btnUsuario.setAttribute("aria-expanded", "false");
      }
    });

    el.btnMenuProgramar.addEventListener("click", function () {
      window.location.href = "ciudadano.html?nueva=1";
    });

    el.btnSalir.addEventListener("click", function () {
      localStorage.removeItem(CLAVE_SESION);
      window.location.replace("index.html");
    });
  }

  inicializarCuenta();
})();
