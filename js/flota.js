/* ==========================================================================
   Recolecta+ · Vehículos y Flota
   Prototipo: la flota y las fichas viven en el navegador.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE_SESION = "recolecta.sesion";

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
    btnSalir: document.getElementById("btnSalir"),
    btnAlertas: document.getElementById("btnAlertas"),
    panelAlertas: document.getElementById("panelAlertas"),
    btnMenu: document.getElementById("btnMenu"),
    sidebar: document.getElementById("sidebar"),
    velo: document.getElementById("velo"),
    toast: document.getElementById("toast"),
    rejilla: document.getElementById("flotaRejilla"),
    ficha: document.getElementById("fichaVehiculo"),
    fichaTitulo: document.getElementById("fichaTitulo"),
    fichaTipo: document.getElementById("fichaTipo"),
    fichaEstado: document.getElementById("fichaEstado"),
    fichaCerrar: document.getElementById("fichaCerrar"),
    fichaCerrarPie: document.getElementById("fichaCerrarPie"),
    fichaVerRuta: document.getElementById("fichaVerRuta"),
    fichaEstatus: document.getElementById("fichaEstatus"),
    fichaEstatusCaja: document.querySelector(".vf-estatus"),
    fichaPulso: document.querySelector(".vf-pulso"),
    fichaAvatar: document.getElementById("fichaAvatar"),
    fichaConductor: document.getElementById("fichaConductor"),
    fichaUbicacion: document.getElementById("fichaUbicacion"),
    fichaRutaTitulo: document.getElementById("fichaRutaTitulo"),
    fichaUltima: document.getElementById("fichaUltima"),
    fichaProxima: document.getElementById("fichaProxima"),
    fichaProgreso: document.getElementById("fichaProgreso"),
    fichaProgresoBarra: document.getElementById("fichaProgresoBarra"),
    fichaOperador: document.getElementById("fichaOperador"),
    fichaAsistente: document.getElementById("fichaAsistente"),
    fichaAsistenteAvatar: document.getElementById("fichaAsistenteAvatar"),
    fichaHorario: document.getElementById("fichaHorario"),
    fichaEstadoGeneral: document.getElementById("fichaEstadoGeneral"),
    fichaUltimoMantenimiento: document.getElementById("fichaUltimoMantenimiento"),
    fichaProximoMantenimiento: document.getElementById("fichaProximoMantenimiento"),
    fichaProgramar: document.getElementById("fichaProgramar")
  };

  /* --------------------------------------------------------------- utilidades */

  var temporizadorToast = null;

  function avisar(mensaje) {
    el.toast.textContent = mensaje;
    el.toast.classList.add("is-visible");

    window.clearTimeout(temporizadorToast);
    temporizadorToast = window.setTimeout(function () {
      el.toast.classList.remove("is-visible");
    }, 3000);
  }

  function iniciales(nombre) {
    var partes = String(nombre || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!partes.length) return "—";
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();

    return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
  }

  /* ------------------------------------------------------------ cabecera */

  (function pintarUsuario() {
    var nombre = sesion.nombre || "Camila Torres";
    var cargo = sesion.cargo || "Directora de Operaciones";

    el.usuarioNombre.textContent = nombre;
    el.usuarioCargo.textContent = cargo;
    el.avatar.textContent = iniciales(nombre) || "RA";
  })();

  /* ------------------------------------------------------- datos de la flota */

  var VEHICULOS = [
    {
      id: "URB-041",
      tipo: "Camión compactador",
      estado: "ruta",
      estadoTexto: "EN RUTA",
      conductor: "Carlos Mendoza",
      ubicacion: "R-1 · Centro Norte",
      combustible: 72,
      ruta: "R-1: Centro Norte",
      ultima: "Calle 10, #34-12",
      proxima: "Parque Central",
      progreso: 55,
      operador: "Carlos Mendoza",
      asistente: "Andrés Pérez",
      horario: "6:00 - 14:00",
      mantEstado: "Óptimo",
      mantRevision: false,
      ultimoMant: "10/10/2026 · Preventivo · Aceite y filtros",
      proximoMant: "Estimado en 1500 km",
      puedeProgramar: true
    },
    {
      id: "URB-023",
      tipo: "Camión compactador",
      estado: "disponible",
      estadoTexto: "DISPONIBLE",
      conductor: "Andrés Pérez",
      ubicacion: "R-2 · Sur Boston",
      combustible: 88,
      ruta: "R-2: Sur Boston",
      ultima: "Base Sur · Carrera 8",
      proxima: "Mercado del Sur",
      progreso: 0,
      operador: "Andrés Pérez",
      asistente: "Laura Gómez",
      horario: "14:00 - 22:00",
      mantEstado: "Óptimo",
      mantRevision: false,
      ultimoMant: "18/09/2026 · Preventivo · Frenos",
      proximoMant: "Estimado en 3000 km",
      puedeProgramar: true
    },
    {
      id: "URB-037",
      tipo: "Volqueta recolectora",
      estado: "ruta",
      estadoTexto: "EN RUTA",
      conductor: "Juan Ríos",
      ubicacion: "R-3 · Mocarí",
      combustible: 61,
      ruta: "R-3: Mocarí",
      ultima: "Calle 62, #14-08",
      proxima: "Colegio Mocarí",
      progreso: 68,
      operador: "Juan Ríos",
      asistente: "Diego Salas",
      horario: "6:00 - 14:00",
      mantEstado: "Óptimo",
      mantRevision: false,
      ultimoMant: "02/10/2026 · Preventivo · Llantas",
      proximoMant: "Estimado en 1200 km",
      puedeProgramar: true
    },
    {
      id: "URB-018",
      tipo: "Camión de apoyo",
      estado: "mantenimiento",
      estadoTexto: "MANTENIMIENTO",
      conductor: "Sin asignar",
      ubicacion: "Patio operativo",
      combustible: 45,
      ruta: "Patio operativo",
      ultima: "Taller central",
      proxima: "Revisión técnico-mecánica",
      progreso: 0,
      operador: "Sin asignar",
      asistente: "—",
      horario: "Sin turno",
      mantEstado: "En revisión",
      mantRevision: true,
      ultimoMant: "28/10/2026 · Correctivo · Sistema hidráulico",
      proximoMant: "Programado 05/11/2026",
      puedeProgramar: false
    }
  ];

  var ICONO_CAMION =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3 7h11v9H3z"/><path d="M14 10h3.5l3.5 3.5V16h-7z"/>' +
    '<circle cx="7" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/></svg>';

  function claseEstado(estado) {
    return "estado--" + estado;
  }

  /* ------------------------------------------------------ tarjetas de flota */

  function pintarFlota() {
    el.rejilla.innerHTML = VEHICULOS.map(function (vehiculo) {
      return (
        '<article class="flota-card">' +
          '<header class="flota-card__cabecera">' +
            '<span class="flota-card__icono">' + ICONO_CAMION + "</span>" +
            '<div class="flota-card__identidad">' +
              "<h2>" + vehiculo.id + "</h2>" +
              "<p>" + vehiculo.tipo + "</p>" +
            "</div>" +
            '<span class="estado ' + claseEstado(vehiculo.estado) + '">' +
              vehiculo.estadoTexto +
            "</span>" +
          "</header>" +

          '<dl class="flota-card__datos">' +
            "<div><dt>Conductor</dt><dd>" + vehiculo.conductor + "</dd></div>" +
            "<div><dt>Ubicación / ruta</dt><dd>" + vehiculo.ubicacion + "</dd></div>" +
          "</dl>" +

          '<div class="flota-card__combustible">' +
            '<div class="flota-card__combustible-fila">' +
              "<span>Combustible</span><b>" + vehiculo.combustible + "%</b>" +
            "</div>" +
            '<span class="vf-barra"><i style="width: ' + vehiculo.combustible + '%"></i></span>' +
          "</div>" +

          '<footer class="flota-card__pie">' +
            '<button type="button" class="flota-card__enlace" data-vehiculo="' +
              vehiculo.id + '">Ver ficha del vehículo <span aria-hidden="true">→</span></button>' +
          "</footer>" +
        "</article>"
      );
    }).join("");
  }

  /* ----------------------------------------------------- ficha del vehículo */

  function buscarVehiculo(id) {
    for (var i = 0; i < VEHICULOS.length; i++) {
      if (VEHICULOS[i].id === id) return VEHICULOS[i];
    }
    return null;
  }

  function abrirFicha(vehiculo) {
    el.fichaTitulo.firstChild.nodeValue = vehiculo.id + " ";
    el.fichaTipo.textContent = vehiculo.tipo;

    el.fichaEstado.className = "estado " + claseEstado(vehiculo.estado);
    el.fichaEstado.textContent = vehiculo.estadoTexto;

    el.fichaEstatusCaja.className = "vf-estatus vf-estatus--" + vehiculo.estado;
    el.fichaEstatus.textContent = vehiculo.estadoTexto;
    el.fichaPulso.classList.toggle("is-oculto", vehiculo.estado !== "ruta");

    el.fichaAvatar.textContent = iniciales(vehiculo.conductor);
    el.fichaConductor.textContent = vehiculo.conductor;
    el.fichaUbicacion.textContent = vehiculo.ubicacion;

    el.fichaRutaTitulo.textContent = vehiculo.ruta;
    el.fichaUltima.textContent = vehiculo.ultima;
    el.fichaProxima.textContent = vehiculo.proxima;
    el.fichaProgreso.textContent = vehiculo.progreso + "%";
    el.fichaProgresoBarra.style.width = vehiculo.progreso + "%";

    el.fichaOperador.textContent = vehiculo.operador;
    el.fichaAsistente.textContent = vehiculo.asistente;
    el.fichaAsistenteAvatar.textContent = iniciales(vehiculo.asistente);
    el.fichaHorario.textContent = vehiculo.horario;

    el.fichaEstadoGeneral.textContent = vehiculo.mantEstado;
    el.fichaEstadoGeneral.className = vehiculo.mantRevision
      ? "vf-badge vf-badge--revision"
      : "vf-badge";
    el.fichaUltimoMantenimiento.textContent = vehiculo.ultimoMant;
    el.fichaProximoMantenimiento.textContent = vehiculo.proximoMant;

    el.fichaProgramar.hidden = !vehiculo.puedeProgramar;
    el.fichaProgramar.disabled = false;
    el.fichaProgramar.textContent = "Programar";
    el.ficha.dataset.vehiculo = vehiculo.id;

    el.ficha.showModal();
  }

  el.rejilla.addEventListener("click", function (evento) {
    var boton = evento.target.closest("[data-vehiculo]");
    if (!boton) return;

    var vehiculo = buscarVehiculo(boton.dataset.vehiculo);
    if (vehiculo) abrirFicha(vehiculo);
  });

  function cerrarFicha() {
    if (el.ficha.open) el.ficha.close();
  }

  el.fichaCerrar.addEventListener("click", cerrarFicha);
  el.fichaCerrarPie.addEventListener("click", cerrarFicha);

  el.fichaVerRuta.addEventListener("click", function () {
    window.location.href = "rutas.html";
  });

  el.fichaProgramar.addEventListener("click", function () {
    var id = el.ficha.dataset.vehiculo;
    el.fichaProgramar.textContent = "Programado ✓";
    el.fichaProgramar.disabled = true;
    avisar("Mantenimiento programado para " + id + ". Se notificó al equipo de taller.");
  });

  el.ficha.addEventListener("click", function (evento) {
    if (evento.target === el.ficha) cerrarFicha();
  });

  el.ficha.addEventListener("close", function () {
    el.fichaProgramar.disabled = false;
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
    if (modulo === "dashboard") { window.location.href = "panel.html"; return; }
    if (modulo === "rutas") { window.location.href = "rutas.html"; return; }
    if (modulo === "impacto") { window.location.href = "impacto.html"; return; }
    if (modulo === "flota") { window.location.href = "flota.html"; return; }
    if (modulo === "empresas") { window.location.href = "empresas.html"; return; }
    if (modulo === "ajustes") { window.location.href = "ajustes.html"; return; }
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

  /* ------------------------------------------------------------- arranque */

  pintarFlota();
})();
