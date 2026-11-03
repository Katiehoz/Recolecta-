/* ==========================================================================
   Recolecta+ · Rutas y Mapa en Vivo
   Prototipo: la flota y las rutas viven en el DOM.
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
    hace: document.getElementById("hace"),
    btnRefrescar: document.getElementById("btnRefrescar"),
    btnSalir: document.getElementById("btnSalir"),
    btnAlertas: document.getElementById("btnAlertas"),
    panelAlertas: document.getElementById("panelAlertas"),
    btnMenu: document.getElementById("btnMenu"),
    sidebar: document.getElementById("sidebar"),
    velo: document.getElementById("velo"),
    toast: document.getElementById("toast"),
    listaFlota: document.getElementById("listaFlota"),
    rutaNombre: document.getElementById("rutaNombre"),
    rutaZona: document.getElementById("rutaZona"),
    rutaDetalle: document.getElementById("rutaDetalle"),
    rutaPuntos: document.getElementById("rutaPuntos"),
    rutaProgreso: document.getElementById("rutaProgreso"),
    rutaCompletado: document.getElementById("rutaCompletado"),
    rutaEta: document.getElementById("rutaEta"),
    pinConductor: document.getElementById("pinConductor"),
    listaAlertas: document.getElementById("listaAlertas"),
    cuentaAlertas: document.getElementById("cuentaAlertas"),
    ficha: document.getElementById("fichaProgramar"),
    fichaCerrar: document.getElementById("fichaCerrar"),
    fichaId: document.getElementById("fichaId"),
    fichaAlerta: document.getElementById("fichaAlerta"),
    fichaNivel: document.getElementById("fichaNivel"),
    fichaHora: document.getElementById("fichaHora"),
    fichaResumen: document.getElementById("fichaResumen"),
    fichaSector: document.getElementById("fichaSector"),
    fichaDireccion: document.getElementById("fichaDireccion"),
    fichaAccesibilidad: document.getElementById("fichaAccesibilidad"),
    fichaHistorial: document.getElementById("fichaHistorial"),
    fichaChipRuta: document.getElementById("fichaChipRuta"),
    fichaRutaNombre: document.getElementById("fichaRutaNombre"),
    fichaEta: document.getElementById("fichaEta"),
    fichaVehiculo: document.getElementById("fichaVehiculo"),
    fichaOperador: document.getElementById("fichaOperador"),
    fichaExtra: document.getElementById("fichaExtra"),
    fichaCarga: document.getElementById("fichaCarga"),
    fichaCargaBarra: document.getElementById("fichaCargaBarra"),
    fichaResiduo: document.getElementById("fichaResiduo"),
    fichaEquipo: document.getElementById("fichaEquipo"),
    fichaApoyo: document.getElementById("fichaApoyo"),
    fichaTrafico: document.getElementById("fichaTrafico"),
    fichaConfirmar: document.getElementById("fichaConfirmar"),
    fichaVerRuta: document.getElementById("fichaVerRuta"),
    fichaReasignar: document.getElementById("fichaReasignar")
  };

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

  /* --------------------------------------------------------- flota / rutas */

  var vehiculos = Array.prototype.slice.call(
    el.listaFlota.querySelectorAll(".vehiculo")
  );

  function seleccionar(vehiculo) {
    var datos = vehiculo.dataset;

    vehiculos.forEach(function (otro) {
      var activo = otro === vehiculo;
      otro.classList.toggle("is-activo", activo);
      otro.setAttribute("aria-pressed", String(activo));
    });

    el.rutaNombre.textContent = "Ruta Seleccionada: " + datos.ruta;
    el.rutaZona.textContent = datos.zona;
    el.rutaDetalle.firstChild.textContent =
      "Mostrando recorrido de " + datos.vehiculo + ". ";
    el.rutaPuntos.textContent = datos.puntos + " puntos programados.";
    el.rutaProgreso.style.width = datos.completado + "%";
    el.rutaCompletado.textContent = datos.completado + "%";
    el.rutaEta.textContent = datos.eta;
    el.pinConductor.textContent = datos.corto;
  }

  el.listaFlota.addEventListener("click", function (evento) {
    var vehiculo = evento.target.closest(".vehiculo");
    if (!vehiculo || vehiculo.classList.contains("is-activo")) return;

    seleccionar(vehiculo);
    avisar(
      "Mostrando " + vehiculo.dataset.ruta + " · " +
      vehiculo.dataset.vehiculo + " · " +
      vehiculo.dataset.zona
    );
  });

  /* --------------------------------------------------------------- refresco */

  el.btnRefrescar.addEventListener("click", function () {
    el.btnRefrescar.classList.add("icono--giro");

    window.setTimeout(function () {
      el.btnRefrescar.classList.remove("icono--giro");
      fechaActualizacion = Date.now();
      pintarHace();
      avisar("Posiciones GPS sincronizadas con las 4 unidades de la flota.");
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

  /* ------------------------------------- alertas operativas / ficha */

  var alertas = [
    {
      id: "C-01",
      nivel: "Crítica",
      clase: "critica",
      hora: "12:43",
      llenado: 92,
      estado: "Intervención inmediata",
      sector: "Centro",
      direccion: "Calle 10, Sector Centro",
      accesibilidad: "Alta (vía principal)",
      historial: "Última colecta: 2 días",
      residuo: "Orgánicos",
      equipo: "Camión compactador",
      apoyo: "Asistente 1: Andrés Pérez",
      ruta: "R-1 · Ruta Centro Norte",
      chip: "RUTA 1 · Optimizada",
      eta: "14:30",
      vehiculo: "URB-041",
      operador: "Carlos Mendoza",
      extra: "+15 min",
      carga: 35,
      trafico: "Tráfico alto detectado en Sector Centro"
    },
    {
      id: "C-23",
      nivel: "Alta",
      clase: "alta",
      hora: "12:31",
      llenado: 88,
      estado: "Programar recolección",
      sector: "Norte",
      direccion: "Av. Tecnológico 88, Zona Norte",
      accesibilidad: "Media (vía alterna)",
      historial: "Última colecta: 1 día",
      residuo: "Reciclables",
      equipo: "Camión recolector",
      apoyo: "Asistente 2: Luisa Arrieta",
      ruta: "R-2 · Ruta Norte",
      chip: "RUTA 2 · Sugerida",
      eta: "15:10",
      vehiculo: "URB-052",
      operador: "Mateo Ríos",
      extra: "+20 min",
      carga: 45,
      trafico: "Vía alterna disponible por la Circunvalar"
    },
    {
      id: "C-07",
      nivel: "Media",
      clase: "media",
      hora: "11:58",
      llenado: 78,
      estado: "En seguimiento",
      sector: "Sur",
      direccion: "Carrera 8 #62-14, Zona Sur",
      accesibilidad: "Alta (vía principal)",
      historial: "Última colecta: 3 días",
      residuo: "No aprovechables",
      equipo: "VAN de barrido",
      apoyo: "Asistente 1: Valeria Gómez",
      ruta: "R-3 · Ruta Sur",
      chip: "RUTA 3 · Programada",
      eta: "15:40",
      vehiculo: "URB-008",
      operador: "Valeria Gómez",
      extra: "+10 min",
      carga: 20,
      trafico: "Sin novedades de tráfico en la zona"
    }
  ];

  var alertaEnFicha = null;
  var indiceReasignacion = 0;

  var reasignaciones = [
    { vehiculo: "URB-052", operador: "Mateo Ríos", eta: "14:50", extra: "+20 min", carga: 45, chip: "RUTA 2 · Reasignada" },
    { vehiculo: "URB-008", operador: "Valeria Gómez", eta: "15:05", extra: "+12 min", carga: 20, chip: "RUTA 3 · Reasignada" },
    { vehiculo: "URB-041", operador: "Carlos Mendoza", eta: "14:30", extra: "+15 min", carga: 35, chip: "RUTA 1 · Optimizada" }
  ];

  function tarjetaAlertaHTML(alerta) {
    return '<article class="alerta-card alerta-card--' + alerta.clase + '" data-id="' + alerta.id + '">' +
      '<div class="alerta-card__superior">' +
        '<span class="alerta-card__nivel">' + alerta.nivel + '</span>' +
        '<time class="alerta-card__hora">' + alerta.hora + '</time>' +
      '</div>' +
      '<h3 class="alerta-card__titulo">Caneca ' + alerta.id + ' al ' + alerta.llenado + '% — ' + alerta.estado + '</h3>' +
      '<div class="alerta-card__acciones">' +
        '<button type="button" class="alerta-card__btn alerta-card__btn--primario" data-accion="programar">Programar recolección</button>' +
        '<button type="button" class="alerta-card__btn alerta-card__btn--secundario" data-accion="descartar">Descartar</button>' +
      '</div>' +
    '</article>';
  }

  function actualizarCuentaAlertas() {
    el.cuentaAlertas.textContent =
      alertas.length + (alertas.length === 1 ? " activa" : " activas");
  }

  function pintarAlertas() {
    if (alertas.length === 0) {
      el.listaAlertas.innerHTML =
        '<p class="alertas-operativas__vacio">Sin alertas activas. Todas las canecas de la zona están bajo control.</p>';
    } else {
      el.listaAlertas.innerHTML = alertas.map(tarjetaAlertaHTML).join("");
    }
    actualizarCuentaAlertas();
  }

  function buscarAlerta(id) {
    for (var i = 0; i < alertas.length; i += 1) {
      if (alertas[i].id === id) return alertas[i];
    }
    return null;
  }

  function abrirFicha(alerta) {
    alertaEnFicha = alerta;
    indiceReasignacion = 0;

    el.fichaId.textContent = alerta.id;
    el.fichaAlerta.className = "ficha__alerta ficha__alerta--" + alerta.clase;
    el.fichaNivel.className = "nivel nivel--" + alerta.clase;
    el.fichaNivel.textContent = alerta.nivel;
    el.fichaHora.textContent = alerta.hora;
    el.fichaResumen.textContent =
      "Caneca " + alerta.id + " al " + alerta.llenado + "% — " + alerta.estado;
    el.fichaSector.textContent = "Sector: " + alerta.sector;
    el.fichaDireccion.textContent = alerta.direccion;
    el.fichaAccesibilidad.textContent = alerta.accesibilidad;
    el.fichaHistorial.textContent = alerta.historial;
    el.fichaChipRuta.textContent = alerta.chip;
    el.fichaRutaNombre.textContent = alerta.ruta;
    el.fichaEta.textContent = alerta.eta;
    el.fichaVehiculo.textContent = alerta.vehiculo;
    el.fichaOperador.textContent = alerta.operador;
    el.fichaExtra.textContent = alerta.extra;
    el.fichaCarga.textContent = alerta.carga + "%";
    el.fichaCargaBarra.style.width = alerta.carga + "%";
    el.fichaResiduo.textContent = alerta.residuo;
    el.fichaEquipo.textContent = alerta.equipo;
    el.fichaApoyo.textContent = alerta.apoyo;
    el.fichaTrafico.textContent = alerta.trafico;

    el.ficha.showModal();
    el.fichaConfirmar.focus();
  }

  el.listaAlertas.addEventListener("click", function (evento) {
    var boton = evento.target.closest("[data-accion]");
    if (!boton) return;

    var tarjeta = boton.closest(".alerta-card");
    if (!tarjeta) return;

    var alerta = buscarAlerta(tarjeta.dataset.id);
    if (!alerta) return;

    if (boton.dataset.accion === "programar") {
      abrirFicha(alerta);
      return;
    }

    if (boton.dataset.accion === "descartar") {
      tarjeta.classList.add("is-saliendo");
      window.setTimeout(function () {
        alertas = alertas.filter(function (otra) { return otra.id !== alerta.id; });
        pintarAlertas();
        avisar("Alerta de la caneca " + alerta.id + " descartada.");
      }, 220);
    }
  });

  el.fichaCerrar.addEventListener("click", function () { el.ficha.close(); });

  el.ficha.addEventListener("click", function (evento) {
    if (evento.target === el.ficha) el.ficha.close();
  });

  el.fichaConfirmar.addEventListener("click", function () {
    if (!alertaEnFicha) return;

    var confirmada = alertaEnFicha;
    el.ficha.close();
    alertas = alertas.filter(function (otra) { return otra.id !== confirmada.id; });
    pintarAlertas();
    avisar(
      "Recolección programada: " + confirmada.id + " · inicio " +
      confirmada.eta + " · " + confirmada.vehiculo + " · " + confirmada.operador
    );
  });

  el.fichaVerRuta.addEventListener("click", function () {
    if (!alertaEnFicha) return;

    var ruta = alertaEnFicha.ruta;
    el.ficha.close();
    avisar("Mostrando " + ruta + " en el mapa logístico.");
    document.querySelector(".rutas-mapa").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  el.fichaReasignar.addEventListener("click", function () {
    if (!alertaEnFicha) return;

    var nueva = reasignaciones[indiceReasignacion % reasignaciones.length];
    indiceReasignacion += 1;

    if (nueva.vehiculo === alertaEnFicha.vehiculo) {
      nueva = reasignaciones[indiceReasignacion % reasignaciones.length];
      indiceReasignacion += 1;
    }

    alertaEnFicha.vehiculo = nueva.vehiculo;
    alertaEnFicha.operador = nueva.operador;
    alertaEnFicha.eta = nueva.eta;
    alertaEnFicha.extra = nueva.extra;
    alertaEnFicha.carga = nueva.carga;
    alertaEnFicha.chip = nueva.chip;

    el.fichaChipRuta.textContent = nueva.chip;
    el.fichaEta.textContent = nueva.eta;
    el.fichaVehiculo.textContent = nueva.vehiculo;
    el.fichaOperador.textContent = nueva.operador;
    el.fichaExtra.textContent = nueva.extra;
    el.fichaCarga.textContent = nueva.carga + "%";
    el.fichaCargaBarra.style.width = nueva.carga + "%";
  });

  el.ficha.addEventListener("close", function () {
    alertaEnFicha = null;
  });

  pintarAlertas();

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
    if (modulo === "dashboard" || modulo === "rutas" || modulo === "impacto") return;

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
