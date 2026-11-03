/* ==========================================================================
   Recolecta+ · App ciudadana · Rastreo
   Prototipo: el seguimiento y los reportes son simulados, no se envían.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE_SESION = "recolecta.sesion";
  var CLAVE_REPORTES = "recolecta.reportes";
  var FOLIO_BASE = 2480;

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
    toast: document.getElementById("toast"),

    btnUsuario: document.getElementById("btnUsuario"),
    menu: document.getElementById("menuUsuario"),
    menuNombre: document.getElementById("menuNombre"),
    menuCorreo: document.getElementById("menuCorreo"),
    btnSalir: document.getElementById("btnSalir"),

    navItems: Array.prototype.slice.call(document.querySelectorAll("[data-vista]")),

    dlgReporte: document.getElementById("dlgReporte"),
    dlgReporteBajada: document.getElementById("dlgReporteBajada"),
    formReporte: document.getElementById("formReporte"),
    dlgReporteCerrar: document.getElementById("dlgReporteCerrar"),
    dlgReporteCancelar: document.getElementById("dlgReporteCancelar"),
    reporteTipo: document.getElementById("reporteTipo"),
    reporteComentarios: document.getElementById("reporteComentarios"),
    errorReporte: document.getElementById("errorReporte"),
    canecas: Array.prototype.slice.call(document.querySelectorAll(".rs-caneca[data-caneca]"))
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

  function horaActual() {
    try {
      return new Date().toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
    } catch (error) {
      return "";
    }
  }

  /* ----------------------------------------------------------- datos de sesión */

  var nombre = sesion.nombre || "Andrés Villalba";
  var correo = sesion.correo || "ciudadano@recolecta.co";

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

  el.dlgReporte.addEventListener("click", function (evento) {
    if (evento.target === el.dlgReporte) cerrarDialogo(el.dlgReporte);
  });

  /* -------------------------------------------------------- reportar caneca */

  var ICONO_CHECK =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" ' +
    'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9"/>' +
    '<path d="m8.4 12.4 2.6 2.6 4.8-5.2"/>' +
    "</svg>";

  var canecaActiva = null;

  function leerReportes() {
    try {
      var datos = JSON.parse(localStorage.getItem(CLAVE_REPORTES));
      return Array.isArray(datos) ? datos : [];
    } catch (error) {
      return [];
    }
  }

  function guardarReportes(lista) {
    try {
      localStorage.setItem(CLAVE_REPORTES, JSON.stringify(lista));
    } catch (error) {
      /* sin almacenamiento disponible */
    }
  }

  function siguienteFolio(lista) {
    var mayor = FOLIO_BASE;

    lista.forEach(function (reporte) {
      var numero = parseInt(String(reporte.folio || "").replace(/\D/g, ""), 10);
      if (!isNaN(numero) && numero > mayor) mayor = numero;
    });

    return "REP-" + (mayor + 1);
  }

  function limpiarError() {
    el.errorReporte.parentNode.classList.remove("cz-campo--error");
    el.errorReporte.textContent = "";
  }

  function cerrarPaneles() {
    el.canecas.forEach(function (caneca) {
      var panel = caneca.querySelector(".rs-caneca__panel");
      var acciones = caneca.querySelector(".rs-caneca__acciones");
      panel.setAttribute("aria-expanded", "false");
      acciones.hidden = true;
    });
  }

  function marcarReportada(caneca, reporte) {
    var boton = caneca.querySelector(".rs-reportar");
    var nota = caneca.querySelector(".rs-caneca__reportada");
    var pista = caneca.querySelector(".rs-caneca__pista");

    caneca.classList.add("is-reportada");

    if (boton) {
      boton.disabled = true;
      boton.textContent = "Reporte ya enviado";
    }

    if (pista) {
      pista.textContent = "Reportada · " + reporte.folio;
    }

    if (nota) {
      nota.innerHTML = ICONO_CHECK + "<span></span>";
      nota.querySelector("span").textContent =
        "Reporte " + reporte.folio + " enviado a Urbaser · " + (reporte.hora || "");
      nota.hidden = false;
    }
  }

  function abrirReporte(caneca) {
    var datos = caneca.dataset;

    canecaActiva = caneca;

    el.dlgReporteBajada.textContent =
      datos.caneca + " · " + datos.zona + " · " + datos.estado + " al " + datos.nivel + "% de llenado";

    var opcion = Array.prototype.filter.call(el.reporteTipo.options, function (item) {
      return item.value === datos.tipo;
    })[0];

    el.reporteTipo.value = opcion ? opcion.value : el.reporteTipo.options[0].value;

    limpiarError();
    abrirDialogo(el.dlgReporte);
    el.reporteTipo.focus();
  }

  el.canecas.forEach(function (caneca) {
    var panel = caneca.querySelector(".rs-caneca__panel");
    var acciones = caneca.querySelector(".rs-caneca__acciones");
    var boton = caneca.querySelector(".rs-reportar");

    panel.addEventListener("click", function () {
      var abierto = panel.getAttribute("aria-expanded") === "true";
      cerrarPaneles();

      if (!abierto) {
        panel.setAttribute("aria-expanded", "true");
        acciones.hidden = false;
      }
    });

    if (boton) {
      boton.addEventListener("click", function () {
        abrirReporte(caneca);
      });
    }
  });

  (function restaurarReportes() {
    var reportes = leerReportes();

    el.canecas.forEach(function (caneca) {
      var codigo = caneca.dataset.caneca;
      var ultimo = null;

      reportes.forEach(function (reporte) {
        if (reporte.caneca === codigo) ultimo = reporte;
      });

      if (ultimo) marcarReportada(caneca, ultimo);
    });
  })();

  el.dlgReporteCerrar.addEventListener("click", function () { cerrarDialogo(el.dlgReporte); });
  el.dlgReporteCancelar.addEventListener("click", function () { cerrarDialogo(el.dlgReporte); });

  el.reporteComentarios.addEventListener("input", limpiarError);

  el.formReporte.addEventListener("submit", function (evento) {
    evento.preventDefault();
    limpiarError();

    if (!canecaActiva) return;

    var comentario = el.reporteComentarios.value.trim();

    if (comentario.length < 6) {
      el.errorReporte.parentNode.classList.add("cz-campo--error");
      el.errorReporte.textContent = "Cuéntanos qué pasa con la caneca (mínimo 6 caracteres).";
      el.reporteComentarios.focus();
      return;
    }

    var datos = canecaActiva.dataset;
    var reportes = leerReportes();
    var reporte = {
      folio: siguienteFolio(reportes),
      caneca: datos.caneca,
      zona: datos.zona,
      estado: datos.estado,
      nivel: datos.nivel,
      direccion: "Calle 10 #34-12, " + datos.zona,
      tipo: el.reporteTipo.value,
      comentario: comentario,
      hora: horaActual(),
      fecha: new Date().toISOString(),
      origen: "ciudadano"
    };

    reportes.push(reporte);
    guardarReportes(reportes);

    marcarReportada(canecaActiva, reporte);
    canecaActiva = null;

    cerrarDialogo(el.dlgReporte);
    avisar("Reporte " + reporte.folio + " · " + datos.caneca + " · Urbaser lo revisará en tu ruta.");

    el.reporteComentarios.value = "";
    el.reporteTipo.selectedIndex = 0;
  });

  /* --------------------------------------------------------- navegación baja */

  var AVISOS_VISTA = {
    premios: "El catálogo de premios y canjes estará disponible muy pronto.",
    impacto: "Tu impacto ambiental detallado estará disponible muy pronto."
  };

  el.navItems.forEach(function (boton) {
    boton.addEventListener("click", function () {
      avisar(AVISOS_VISTA[boton.dataset.vista] || "Este módulo estará disponible muy pronto.");
    });
  });

  /* ------------------------------------------------------------------ teclado */

  document.addEventListener("keydown", function (evento) {
    if (evento.key !== "Escape") return;
    if (menuAbierto) abrirMenu(false);
  });
})();
