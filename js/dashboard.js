/* ==========================================================================
   Recolecta+ · Panel de control operativo
   Prototipo: los datos viven en memoria del navegador.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE_SESION = "recolecta.sesion";
  var CLAVE_REPORTES = "recolecta.reportes";

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

  if (sesion.rol === "ciudadano") {
    window.location.replace("ciudadano.html");
    return;
  }

  var el = {
    avatar: document.getElementById("avatar"),
    usuarioNombre: document.getElementById("usuarioNombre"),
    usuarioCargo: document.getElementById("usuarioCargo"),
    cuerpoTabla: document.getElementById("cuerpoTabla"),
    contador: document.getElementById("contador"),
    tabs: Array.prototype.slice.call(document.querySelectorAll(".tab")),
    hace: document.getElementById("hace"),
    btnRefrescar: document.getElementById("btnRefrescar"),
    btnSalir: document.getElementById("btnSalir"),
    btnAlertas: document.getElementById("btnAlertas"),
    panelAlertas: document.getElementById("panelAlertas"),
    btnMenu: document.getElementById("btnMenu"),
    sidebar: document.getElementById("sidebar"),
    velo: document.getElementById("velo"),
    toast: document.getElementById("toast"),
    dlg: document.getElementById("dlgNueva"),
    form: document.getElementById("formNueva"),
    btnCancelar: document.getElementById("btnCancelar"),
    nuevoCliente: document.getElementById("nuevoCliente"),
    nuevoTipo: document.getElementById("nuevoTipo"),
    nuevaUbicacion: document.getElementById("nuevaUbicacion"),
    nuevaHora: document.getElementById("nuevaHora"),
    errorCliente: document.getElementById("errorCliente"),
    errorUbicacion: document.getElementById("errorUbicacion"),
    errorHora: document.getElementById("errorHora")
  };

  /* -------------------------------------------------------------- datos demo */

  var solicitudes = [
    { codigo: "#REC-8922", cliente: "BioIndustrias S.A.", tipo: "Cartón industrial", ubicacion: "Parque Industrial Lote 4", hora: "15:00", estado: "pendiente" },
    { codigo: "#REC-8924", cliente: "TecnoReciclaje Inc.", tipo: "RAEE electrónicos", ubicacion: "Av. Tecnológico 88", hora: "16:45", estado: "pendiente" },
    { codigo: "#REC-8919", cliente: "Supermercado La Castellana", tipo: "Plástico PET", ubicacion: "Calle 41 #12-30", hora: "14:20", estado: "proceso" },
    { codigo: "#REC-8915", cliente: "Clínica Montería Norte", tipo: "Residuos orgánicos", ubicacion: "Carrera 6 #68-12", hora: "13:05", estado: "proceso" },
    { codigo: "#REC-8908", cliente: "Colegio San Jerónimo", tipo: "Papel y cartón", ubicacion: "Calle 27 #4-55", hora: "11:40", estado: "completada" },
    { codigo: "#REC-8903", cliente: "Hotel Ronda del Sinú", tipo: "Vidrio", ubicacion: "Av. Circunvalar 22", hora: "10:15", estado: "completada" }
  ];

  var ETIQUETAS = {
    pendiente: "Pendiente",
    proceso: "En proceso",
    completada: "Completada"
  };

  var filtro = "todas";
  var siguienteCodigo = 8925;

  /* ------------------------------------------ reportes de la app ciudadana */

  function leerReportes() {
    try {
      var lista = JSON.parse(localStorage.getItem(CLAVE_REPORTES));
      return Array.isArray(lista) ? lista : [];
    } catch (error) {
      return [];
    }
  }

  function insertarReportes() {
    var reportes = leerReportes();
    if (!reportes.length) return;

    var codigos = {};
    solicitudes.forEach(function (solicitud) {
      codigos[solicitud.codigo] = true;
    });

    var nuevos = [];

    reportes.forEach(function (reporte) {
      var codigo = reporte.folio || "";
      if (!codigo || codigos[codigo]) return;

      codigos[codigo] = true;

      nuevos.push({
        codigo: codigo,
        cliente: "Reporte de caneca",
        tipo: "Caneca " + (reporte.caneca || "s/n") + " · " +
          String(reporte.estado || "").toLowerCase() + " " + (reporte.nivel || "0") + "%",
        ubicacion: reporte.direccion || reporte.zona || "Montería",
        hora: reporte.hora || "",
        estado: "pendiente",
        origen: "ciudadano"
      });
    });

    if (nuevos.length) {
      solicitudes = nuevos.reverse().concat(solicitudes);
    }
  }

  insertarReportes();

  /* --------------------------------------------------------------- utilidades */

  var temporizadorToast = null;

  function avisar(mensaje) {
    el.toast.textContent = mensaje;
    el.toast.classList.add("is-visible");

    window.clearTimeout(temporizadorToast);
    temporizadorToast = window.setTimeout(function () {
      el.toast.classList.remove("is-visible");
    }, 2600);
  }

  function escapar(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ------------------------------------------------------------ cabecera */

  (function pintarUsuario() {
    var nombre = sesion.nombre || "Camila Torres";
    var cargo = sesion.cargo || "Directora de Operaciones";
    var iniciales = nombre
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(function (parte) { return parte.charAt(0).toUpperCase(); })
      .join("");

    el.usuarioNombre.textContent = nombre;
    el.usuarioCargo.textContent = cargo;
    el.avatar.textContent = iniciales || "RA";
  })();

  /* --------------------------------------------------------- marca de tiempo */

  var fechaActualizacion = Date.now() - 2 * 60 * 1000;

  function textoUltimaActualizacion() {
    var minutos = Math.floor((Date.now() - fechaActualizacion) / 60000);

    if (minutos < 1) return "hace un momento";
    if (minutos === 1) return "hace 1 min";
    return "hace " + minutos + " mins";
  }

  function pintarHace() {
    el.hace.textContent = textoUltimaActualizacion();
  }

  pintarHace();
  window.setInterval(pintarHace, 30000);

  /* ---------------------------------------------------------------- tabla */

  function solicitudesVisibles() {
    return solicitudes.filter(function (solicitud) {
      return filtro === "todas" || solicitud.estado === filtro;
    });
  }

  function filaHTML(solicitud) {
    return (
      '<tr>' +
        '<td>' +
          '<span class="cliente">' + escapar(solicitud.cliente) +
            (solicitud.origen === "ciudadano" ? ' <span class="origen">App</span>' : "") +
          "</span>" +
          '<span class="codigo">' + escapar(solicitud.codigo) + "</span>" +
        "</td>" +
        "<td>" + escapar(solicitud.tipo) + "</td>" +
        "<td>" +
          '<span class="ubicacion">' + escapar(solicitud.ubicacion) + "</span>" +
          '<span class="hora">' +
            '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true">' +
              '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>' +
            "</svg>" +
            escapar(solicitud.hora) +
          "</span>" +
        "</td>" +
        "<td>" +
          '<span class="badge badge--' + solicitud.estado + '">' + ETIQUETAS[solicitud.estado] + "</span>" +
        "</td>" +
        '<td class="col-accion">' +
          '<button type="button" class="fila-btn" data-codigo="' + escapar(solicitud.codigo) + '" aria-label="Ver solicitud ' + escapar(solicitud.codigo) + '">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="m9 6 6 6-6 6"/>' +
            "</svg>" +
          "</button>" +
        "</td>" +
      "</tr>"
    );
  }

  function pintarTabla() {
    var visibles = solicitudesVisibles();

    if (!visibles.length) {
      el.cuerpoTabla.innerHTML =
        '<tr class="vacio"><td colspan="5">No hay solicitudes que coincidan con la búsqueda.</td></tr>';
    } else {
      el.cuerpoTabla.innerHTML = visibles.map(filaHTML).join("");
    }

    el.contador.textContent = visibles.length === 1
      ? "Mostrando 1 solicitud reciente"
      : "Mostrando " + visibles.length + " solicitudes recientes";

    pintarContadores();
  }

  function pintarContadores() {
    var conteos = { todas: solicitudes.length, pendiente: 0, proceso: 0, completada: 0 };

    solicitudes.forEach(function (solicitud) {
      if (conteos[solicitud.estado] !== undefined) conteos[solicitud.estado] += 1;
    });

    el.tabs.forEach(function (tab) {
      var dato = conteos[tab.dataset.filtro];
      var numero = tab.querySelector("span");
      if (numero) numero.textContent = dato;
    });
  }

  pintarTabla();

  /* ------------------------------------------------------------ interacción */

  el.tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      filtro = tab.dataset.filtro;

      el.tabs.forEach(function (otro) {
        var activo = otro === tab;
        otro.classList.toggle("is-activo", activo);
        otro.setAttribute("aria-selected", String(activo));
      });

      pintarTabla();
    });
  });

  el.cuerpoTabla.addEventListener("click", function (evento) {
    var boton = evento.target.closest(".fila-btn");
    if (!boton) return;
    avisar("Abriendo la solicitud " + boton.dataset.codigo + "…");
  });

  el.btnRefrescar.addEventListener("click", function () {
    el.btnRefrescar.classList.add("icono--giro");

    window.setTimeout(function () {
      el.btnRefrescar.classList.remove("icono--giro");
      fechaActualizacion = Date.now();
      pintarHace();
      insertarReportes();
      pintarTabla();
      avisar("Datos sincronizados con las 142 canecas conectadas.");
    }, 650);
  });

  /* --------------------------------------------------------------- alertas */

  function cerrarAlertas() {
    el.panelAlertas.hidden = true;
    el.btnAlertas.setAttribute("aria-expanded", "false");
  }

  el.btnAlertas.addEventListener("click", function (evento) {
    evento.stopPropagation();
    var abierto = el.panelAlertas.hidden;

    el.panelAlertas.hidden = !abierto;
    el.btnAlertas.setAttribute("aria-expanded", String(abierto));
  });

  el.panelAlertas.addEventListener("click", function (evento) {
    evento.stopPropagation();

    var alerta = evento.target.closest(".alerta");
    if (!alerta) return;

    avisar("Alerta: " + alerta.dataset.alerta);
    cerrarAlertas();
  });

  document.addEventListener("click", function () {
    if (!el.panelAlertas.hidden) cerrarAlertas();
  });

  /* ------------------------------------------------------- menú lateral móvil */

  function abrirMenu(abierto) {
    el.sidebar.classList.toggle("is-abierta", abierto);
    el.velo.hidden = !abierto;
    el.btnMenu.setAttribute("aria-expanded", String(abierto));
  }

  el.btnMenu.addEventListener("click", function () {
    abrirMenu(!el.sidebar.classList.contains("is-abierta"));
  });

  el.velo.addEventListener("click", function () { abrirMenu(false); });

  /* ------------------------------------------------------ módulos del menú */

  document.addEventListener("click", function (evento) {
    var boton = evento.target.closest("[data-modulo]");
    if (!boton) return;

    // Los enlaces del menú navegan solos.
    if (boton.tagName === "A") return;

    var modulo = boton.dataset.modulo;
    if (modulo === "dashboard") return;

    if (modulo === "rutas") {
      window.location.href = "rutas.html";
      return;
    }

    if (modulo === "impacto") {
      window.location.href = "impacto.html";
      return;
    }

    if (modulo === "flota") {
      window.location.href = "flota.html";
      return;
    }

    if (modulo === "empresas") {
      window.location.href = "empresas.html";
      return;
    }

    if (modulo === "ajustes") {
      window.location.href = "ajustes.html";
      return;
    }
  });

  /* ------------------------------------------------------------ nueva orden */

  function limpiarErroresDialogo() {
    [
      [el.nuevoCliente.parentNode, el.errorCliente],
      [el.nuevaUbicacion.parentNode, el.errorUbicacion],
      [el.nuevaHora.parentNode, el.errorHora]
    ].forEach(function (par) {
      par[1].textContent = "";
      par[0].classList.remove("campo--error");
    });
  }

  function marcarError(input, nodo, mensaje) {
    nodo.textContent = mensaje;
    input.parentNode.classList.add("campo--error");
  }

  el.btnCancelar.addEventListener("click", function () {
    el.dlg.close();
  });

  el.form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    limpiarErroresDialogo();

    var cliente = el.nuevoCliente.value.trim();
    var ubicacion = el.nuevaUbicacion.value.trim();
    var hora = el.nuevaHora.value;
    var valido = true;

    if (!cliente) {
      marcarError(el.nuevoCliente, el.errorCliente, "Escribe el nombre del cliente.");
      valido = false;
    }

    if (!ubicacion) {
      marcarError(el.nuevaUbicacion, el.errorUbicacion, "Indica la dirección de recolección.");
      valido = false;
    }

    if (!hora) {
      marcarError(el.nuevaHora, el.errorHora, "Selecciona una hora.");
      valido = false;
    }

    if (!valido) return;

    var codigo = "#REC-" + siguienteCodigo;
    siguienteCodigo += 1;

    solicitudes.unshift({
      codigo: codigo,
      cliente: cliente,
      tipo: el.nuevoTipo.value,
      ubicacion: ubicacion,
      hora: hora,
      estado: "pendiente"
    });

    el.dlg.close();
    filtro = "pendiente";
    el.tabs.forEach(function (tab) {
      var activo = tab.dataset.filtro === "pendiente";
      tab.classList.toggle("is-activo", activo);
      tab.setAttribute("aria-selected", String(activo));
    });
    pintarTabla();
    avisar("Solicitud " + codigo + " creada y asignada a la ruta más cercana.");
  });

  /* --------------------------------------------------------------- sesión */

  el.btnSalir.addEventListener("click", function () {
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch (error) {
      /* sin almacenamiento disponible */
    }
    window.location.href = "index.html";
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key !== "Escape") return;
    if (!el.panelAlertas.hidden) cerrarAlertas();
    if (el.sidebar.classList.contains("is-abierta")) abrirMenu(false);
  });
})();
