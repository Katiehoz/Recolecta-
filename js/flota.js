/* ==========================================================================
   Recolecta+ · Vehículos y Flota
   Prototipo: la flota, la búsqueda, los filtros y las fichas viven en el
   navegador (sin persistencia entre recargas).
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
    contadorTotal: document.getElementById("flotaTotal"),
    contadorEnRuta: document.getElementById("flotaEnRuta"),
    busqueda: document.getElementById("busquedaVehiculo"),
    filtroEstado: document.getElementById("filtroEstado"),
    filtroTipo: document.getElementById("filtroTipo"),
    btnAgregar: document.getElementById("btnAgregarVehiculo"),
    resultado: document.getElementById("flotaResultado"),
    vacio: document.getElementById("flotaVacio"),

    ficha: document.getElementById("fichaVehiculo"),
    fichaTitulo: document.getElementById("fichaTitulo"),
    fichaTipo: document.getElementById("fichaTipo"),
    fichaEstado: document.getElementById("fichaEstado"),
    fichaCerrar: document.getElementById("fichaCerrar"),
    fichaCerrarPie: document.getElementById("fichaCerrarPie"),
    fichaVerRuta: document.getElementById("fichaVerRuta"),
    fichaEditar: document.getElementById("fichaEditar"),
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
    fichaProgramar: document.getElementById("fichaProgramar"),

    dlg: document.getElementById("dlgVehiculo"),
    frm: document.getElementById("frmVehiculo"),
    dlgKicker: document.getElementById("dlgVehiculoKicker"),
    dlgTitulo: document.getElementById("dlgVehiculoTitulo"),
    dlgCerrar: document.getElementById("dlgVehiculoCerrar"),
    dlgCancelar: document.getElementById("dlgVehiculoCancelar"),
    dlgGuardar: document.getElementById("dlgVehiculoGuardar"),
    errorVId: document.getElementById("errorVId")
  };

  var campos = {
    id: document.getElementById("vId"),
    tipo: document.getElementById("vTipo"),
    estado: document.getElementById("vEstado"),
    combustible: document.getElementById("vCombustible"),
    conductor: document.getElementById("vConductor"),
    ubicacion: document.getElementById("vUbicacion"),
    ruta: document.getElementById("vRuta"),
    ultima: document.getElementById("vUltima"),
    proxima: document.getElementById("vProxima"),
    progreso: document.getElementById("vProgreso"),
    operador: document.getElementById("vOperador"),
    asistente: document.getElementById("vAsistente"),
    horario: document.getElementById("vHorario"),
    mantEstado: document.getElementById("vMantEstado"),
    ultimoMant: document.getElementById("vUltimoMant"),
    proximoMant: document.getElementById("vProximoMant"),
    puedeProgramar: document.getElementById("vPuedeProgramar")
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

  function textoEstado(estado) {
    if (estado === "ruta") return "EN RUTA";
    if (estado === "disponible") return "DISPONIBLE";
    return "MANTENIMIENTO";
  }

  function limitarNumero(valor, min, max, porDefecto) {
    var numero = parseInt(valor, 10);
    if (isNaN(numero)) numero = porDefecto;
    if (numero < min) return min;
    if (numero > max) return max;
    return numero;
  }

  function normalizar(texto) {
    return String(texto || "").toLowerCase();
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

  var vehiculos = [
    {
      id: "URB-041",
      tipo: "Camión compactador",
      estado: "ruta",
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
      ultimoMant: "10/10/2026 · Preventivo · Aceite y filtros",
      proximoMant: "Estimado en 1500 km",
      puedeProgramar: true
    },
    {
      id: "URB-023",
      tipo: "Camión compactador",
      estado: "disponible",
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
      ultimoMant: "18/09/2026 · Preventivo · Frenos",
      proximoMant: "Estimado en 3000 km",
      puedeProgramar: true
    },
    {
      id: "URB-037",
      tipo: "Volqueta recolectora",
      estado: "ruta",
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
      ultimoMant: "02/10/2026 · Preventivo · Llantas",
      proximoMant: "Estimado en 1200 km",
      puedeProgramar: true
    },
    {
      id: "URB-018",
      tipo: "Camión de apoyo",
      estado: "mantenimiento",
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
      ultimoMant: "28/10/2026 · Correctivo · Sistema hidráulico",
      proximoMant: "Programado 05/11/2026",
      puedeProgramar: false
    }
  ];

  var idEditando = null;

  var ICONO_CAMION =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3 7h11v9H3z"/><path d="M14 10h3.5l3.5 3.5V16h-7z"/>' +
    '<circle cx="7" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/></svg>';

  function claseEstado(estado) {
    return "estado--" + estado;
  }

  /* --------------------------------------------- búsqueda, filtros y resumen */

  function buscarVehiculo(id) {
    for (var i = 0; i < vehiculos.length; i++) {
      if (vehiculos[i].id === id) return vehiculos[i];
    }
    return null;
  }

  function vehiculosFiltrados() {
    var q = normalizar(el.busqueda.value).trim();
    var estado = el.filtroEstado.value;
    var tipo = el.filtroTipo.value;

    return vehiculos.filter(function (v) {
      if (estado !== "todos" && v.estado !== estado) return false;
      if (tipo !== "todos" && v.tipo !== tipo) return false;

      if (!q) return true;

      var texto = [v.id, v.tipo, v.conductor, v.operador, v.ubicacion, v.ruta, v.asistente]
        .join(" ")
        .toLowerCase();

      return texto.indexOf(q) !== -1;
    });
  }

  function actualizarResumen() {
    var enRuta = vehiculos.filter(function (v) { return v.estado === "ruta"; }).length;
    el.contadorTotal.textContent = String(vehiculos.length);
    el.contadorEnRuta.textContent = String(enRuta);
  }

  /* ------------------------------------------------------ tarjetas de flota */

  function pintarFlota() {
    var lista = vehiculosFiltrados();
    actualizarResumen();

    if (!lista.length) {
      el.rejilla.innerHTML = "";
      el.vacio.hidden = false;
      el.resultado.hidden = true;
      return;
    }

    el.vacio.hidden = true;
    el.resultado.hidden = lista.length === vehiculos.length;
    if (!el.resultado.hidden) {
      el.resultado.textContent = "Mostrando " + lista.length + " de " + vehiculos.length + " vehículos.";
    }

    el.rejilla.innerHTML = lista.map(function (vehiculo) {
      return (
        '<article class="flota-card">' +
          '<header class="flota-card__cabecera">' +
            '<span class="flota-card__icono">' + ICONO_CAMION + "</span>" +
            '<div class="flota-card__identidad">' +
              "<h2>" + vehiculo.id + "</h2>" +
              "<p>" + vehiculo.tipo + "</p>" +
            "</div>" +
            '<span class="estado ' + claseEstado(vehiculo.estado) + '">' +
              textoEstado(vehiculo.estado) +
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

  function abrirFicha(vehiculo) {
    var mantRevision = vehiculo.mantEstado === "En revisión";

    el.fichaTitulo.firstChild.nodeValue = vehiculo.id + " ";
    el.fichaTipo.textContent = vehiculo.tipo;

    el.fichaEstado.className = "estado " + claseEstado(vehiculo.estado);
    el.fichaEstado.textContent = textoEstado(vehiculo.estado);

    el.fichaEstatusCaja.className = "vf-estatus vf-estatus--" + vehiculo.estado;
    el.fichaEstatus.textContent = textoEstado(vehiculo.estado);
    el.fichaPulso.classList.toggle("is-oculto", vehiculo.estado !== "ruta");

    el.fichaAvatar.textContent = iniciales(vehiculo.conductor);
    el.fichaConductor.textContent = vehiculo.conductor;
    el.fichaUbicacion.textContent = vehiculo.ubicacion;

    el.fichaRutaTitulo.textContent = vehiculo.ruta || "Sin ruta asignada";
    el.fichaUltima.textContent = vehiculo.ultima || "—";
    el.fichaProxima.textContent = vehiculo.proxima || "—";
    el.fichaProgreso.textContent = vehiculo.progreso + "%";
    el.fichaProgresoBarra.style.width = vehiculo.progreso + "%";

    el.fichaOperador.textContent = vehiculo.operador || "Sin asignar";
    el.fichaAsistente.textContent = vehiculo.asistente || "—";
    el.fichaAsistenteAvatar.textContent = iniciales(vehiculo.asistente);
    el.fichaHorario.textContent = vehiculo.horario || "Sin turno";

    el.fichaEstadoGeneral.textContent = vehiculo.mantEstado || "Óptimo";
    el.fichaEstadoGeneral.className = mantRevision
      ? "vf-badge vf-badge--revision"
      : "vf-badge";
    el.fichaUltimoMantenimiento.textContent = vehiculo.ultimoMant || "Sin registro";
    el.fichaProximoMantenimiento.textContent = vehiculo.proximoMant || "Sin definir";

    el.fichaProgramar.hidden = !vehiculo.puedeProgramar;
    el.fichaProgramar.disabled = false;
    el.fichaProgramar.textContent = "Programar";
    el.ficha.dataset.vehiculo = vehiculo.id;

    el.ficha.showModal();
  }

  function cerrarFicha() {
    if (el.ficha.open) el.ficha.close();
  }

  el.rejilla.addEventListener("click", function (evento) {
    var boton = evento.target.closest("[data-vehiculo]");
    if (!boton) return;

    var vehiculo = buscarVehiculo(boton.dataset.vehiculo);
    if (vehiculo) abrirFicha(vehiculo);
  });

  el.fichaCerrar.addEventListener("click", cerrarFicha);
  el.fichaCerrarPie.addEventListener("click", cerrarFicha);

  el.fichaVerRuta.addEventListener("click", function () {
    window.location.href = "rutas.html";
  });

  el.fichaProgramar.addEventListener("click", function () {
    var id = el.ficha.dataset.vehiculo;
    var vehiculo = buscarVehiculo(id);
    if (!vehiculo) return;

    vehiculo.puedeProgramar = false;
    vehiculo.proximoMant = "Programado · pendiente de taller";
    el.fichaProgramar.hidden = true;
    el.fichaProximoMantenimiento.textContent = vehiculo.proximoMant;
    avisar("Mantenimiento programado para " + id + ". Se notificó al equipo de taller.");
  });

  el.ficha.addEventListener("click", function (evento) {
    if (evento.target === el.ficha) cerrarFicha();
  });

  /* --------------------------------------------------- agregar / editar */

  function limpiarErrorFormulario() {
    el.errorVId.textContent = "";
    campos.id.classList.remove("is-error");
  }

  function cargarFormulario(vehiculo) {
    campos.id.value = vehiculo.id || "";
    campos.tipo.value = vehiculo.tipo || "";
    campos.estado.value = vehiculo.estado || "disponible";
    campos.combustible.value = vehiculo.combustible != null ? vehiculo.combustible : 100;
    campos.conductor.value = vehiculo.conductor || "";
    campos.ubicacion.value = vehiculo.ubicacion || "";
    campos.ruta.value = vehiculo.ruta || "";
    campos.ultima.value = vehiculo.ultima || "";
    campos.proxima.value = vehiculo.proxima || "";
    campos.progreso.value = vehiculo.progreso != null ? vehiculo.progreso : 0;
    campos.operador.value = vehiculo.operador || "";
    campos.asistente.value = vehiculo.asistente || "";
    campos.horario.value = vehiculo.horario || "";
    campos.mantEstado.value = vehiculo.mantEstado || "Óptimo";
    campos.ultimoMant.value = vehiculo.ultimoMant || "";
    campos.proximoMant.value = vehiculo.proximoMant || "";
    campos.puedeProgramar.checked = vehiculo.puedeProgramar !== false;
  }

  function abrirFormularioAgregar() {
    idEditando = null;
    limpiarErrorFormulario();
    el.frm.reset();
    campos.estado.value = "disponible";
    campos.combustible.value = 100;
    campos.progreso.value = 0;
    campos.mantEstado.value = "Óptimo";
    campos.puedeProgramar.checked = true;
    campos.id.disabled = false;

    el.dlgKicker.textContent = "Nuevo vehículo";
    el.dlgTitulo.textContent = "Agregar vehículo";
    el.dlgGuardar.textContent = "Guardar vehículo";

    el.dlg.showModal();
  }

  function abrirFormularioEditar(vehiculo) {
    idEditando = vehiculo.id;
    limpiarErrorFormulario();
    cargarFormulario(vehiculo);
    campos.id.disabled = true;

    el.dlgKicker.textContent = "Actualizar datos";
    el.dlgTitulo.textContent = "Editar vehículo " + vehiculo.id;
    el.dlgGuardar.textContent = "Actualizar vehículo";

    el.dlg.showModal();
  }

  function cerrarFormulario() {
    if (el.dlg.open) el.dlg.close();
  }

  function leerFormulario() {
    var id = campos.id.value.trim().toUpperCase();

    return {
      id: id,
      tipo: campos.tipo.value,
      estado: campos.estado.value,
      combustible: limitarNumero(campos.combustible.value, 0, 100, 100),
      conductor: campos.conductor.value.trim() || "Sin asignar",
      ubicacion: campos.ubicacion.value.trim() || "Sin ubicación",
      ruta: campos.ruta.value.trim() || "Sin ruta asignada",
      ultima: campos.ultima.value.trim() || "—",
      proxima: campos.proxima.value.trim() || "—",
      progreso: limitarNumero(campos.progreso.value, 0, 100, 0),
      operador: campos.operador.value.trim() || campos.conductor.value.trim() || "Sin asignar",
      asistente: campos.asistente.value.trim() || "—",
      horario: campos.horario.value.trim() || "Sin turno",
      mantEstado: campos.mantEstado.value || "Óptimo",
      ultimoMant: campos.ultimoMant.value.trim() || "Sin registro",
      proximoMant: campos.proximoMant.value.trim() || "Sin definir",
      puedeProgramar: campos.puedeProgramar.checked
    };
  }

  function validarFormulario(datos) {
    limpiarErrorFormulario();

    if (!datos.id) {
      el.errorVId.textContent = "Ingresa el código del vehículo.";
      campos.id.classList.add("is-error");
      campos.id.focus();
      return false;
    }

    if (!idEditando) {
      var existente = buscarVehiculo(datos.id);
      if (existente) {
        el.errorVId.textContent = "Ya existe un vehículo con ese código.";
        campos.id.classList.add("is-error");
        campos.id.focus();
        return false;
      }
    }

    if (!datos.tipo) {
      campos.tipo.focus();
      return false;
    }

    return true;
  }

  el.btnAgregar.addEventListener("click", abrirFormularioAgregar);

  el.fichaEditar.addEventListener("click", function () {
    var vehiculo = buscarVehiculo(el.ficha.dataset.vehiculo);
    if (!vehiculo) return;
    cerrarFicha();
    abrirFormularioEditar(vehiculo);
  });

  el.dlgCerrar.addEventListener("click", cerrarFormulario);
  el.dlgCancelar.addEventListener("click", cerrarFormulario);

  el.dlg.addEventListener("click", function (evento) {
    if (evento.target === el.dlg) cerrarFormulario();
  });

  el.frm.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var datos = leerFormulario();
    if (!validarFormulario(datos)) return;

    if (idEditando) {
      var indice = -1;
      for (var i = 0; i < vehiculos.length; i++) {
        if (vehiculos[i].id === idEditando) { indice = i; break; }
      }
      if (indice !== -1) vehiculos[indice] = datos;
      avisar("Vehículo " + datos.id + " actualizado correctamente.");
    } else {
      vehiculos.unshift(datos);
      avisar("Vehículo " + datos.id + " agregado a la flota.");
    }

    cerrarFormulario();
    pintarFlota();
  });

  /* --------------------------------------------------------------- filtros */

  el.busqueda.addEventListener("input", pintarFlota);
  el.filtroEstado.addEventListener("change", pintarFlota);
  el.filtroTipo.addEventListener("change", pintarFlota);

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
