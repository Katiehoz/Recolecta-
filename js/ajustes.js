/* ==========================================================================
   Recolecta+ · Ajustes de Plataforma
   Prototipo: perfil, preferencias y notificaciones viven en el navegador.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE_SESION = "recolecta.sesion";
  var CLAVE_AJUSTES = "recolecta.ajustes";
  var CLAVE_DEMO = "recolecta123";

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

    tabs: Array.prototype.slice.call(document.querySelectorAll(".ajustes-tab")),
    panelCuenta: document.getElementById("panelCuenta"),
    panelPronto: document.getElementById("panelPronto"),
    prontoTitulo: document.getElementById("prontoTitulo"),
    prontoTexto: document.getElementById("prontoTexto"),
    btnVolverCuenta: document.getElementById("btnVolverCuenta"),

    perfilAvatar: document.getElementById("perfilAvatar"),
    perfilNombre: document.getElementById("perfilNombre"),
    perfilCargo: document.getElementById("perfilCargo"),
    perfilCorreo: document.getElementById("perfilCorreo"),

    temas: Array.prototype.slice.call(document.querySelectorAll("[data-tema]")),

    switchMaster: document.getElementById("switchMaster"),
    notifEstado: document.getElementById("notifEstado"),
    switches: Array.prototype.slice.call(document.querySelectorAll("[data-notif]")),

    btnGuardar: document.getElementById("btnGuardar"),
    btnCancelar: document.getElementById("btnCancelar"),

    btnEditarPerfil: document.getElementById("btnEditarPerfil"),
    btnCambiarClave: document.getElementById("btnCambiarClave"),

    dlgPerfil: document.getElementById("dlgPerfil"),
    formPerfil: document.getElementById("formPerfil"),
    dlgPerfilCerrar: document.getElementById("dlgPerfilCerrar"),
    dlgPerfilCancelar: document.getElementById("dlgPerfilCancelar"),
    perfilInputNombre: document.getElementById("perfilInputNombre"),
    perfilInputCargo: document.getElementById("perfilInputCargo"),
    perfilInputCorreo: document.getElementById("perfilInputCorreo"),
    errorNombre: document.getElementById("errorNombre"),
    errorCargo: document.getElementById("errorCargo"),
    errorCorreo: document.getElementById("errorCorreo"),

    dlgClave: document.getElementById("dlgClave"),
    formClave: document.getElementById("formClave"),
    dlgClaveCerrar: document.getElementById("dlgClaveCerrar"),
    dlgClaveCancelar: document.getElementById("dlgClaveCancelar"),
    claveActual: document.getElementById("claveActual"),
    claveNueva: document.getElementById("claveNueva"),
    claveRepetir: document.getElementById("claveRepetir"),
    errorClaveActual: document.getElementById("errorClaveActual"),
    errorClaveNueva: document.getElementById("errorClaveNueva"),
    errorClaveRepetir: document.getElementById("errorClaveRepetir")
  };

  /* --------------------------------------------------------------- utilidades */

  var temporizadorToast = null;

  function avisar(mensaje) {
    el.toast.textContent = mensaje;
    el.toast.classList.add("is-visible");

    window.clearTimeout(temporizadorToast);
    temporizadorToast = window.setTimeout(function () {
      el.toast.classList.remove("is-visible");
    }, 3200);
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

  function correoDeSesion() {
    return sesion.correo || "operador@urbaser.co";
  }

  /* ------------------------------------------------------------ cabecera */

  function pintarUsuario() {
    var nombre = sesion.nombre || "Camila Torres";
    var cargo = sesion.cargo || "Directora de Operaciones";

    el.usuarioNombre.textContent = nombre;
    el.usuarioCargo.textContent = cargo;
    el.avatar.textContent = iniciales(nombre);

    el.perfilAvatar.textContent = iniciales(nombre);
    el.perfilNombre.textContent = nombre;
    el.perfilCargo.textContent = cargo;
    el.perfilCorreo.textContent = correoDeSesion();
  }

  pintarUsuario();

  /* ------------------------------------------------------- preferencias */

  var DEFECTOS = {
    tema: "claro",
    notif: {
      criticas: true,
      rutas: true,
      reportes: true,
      vehiculos: true
    }
  };

  var guardado = leerAjustes();
  var estado = clonar(guardado || DEFECTOS);

  function clonar(ajustes) {
    return {
      tema: "claro",
      notif: {
        criticas: ajustes.notif ? ajustes.notif.criticas !== false : true,
        rutas: ajustes.notif ? ajustes.notif.rutas !== false : true,
        reportes: ajustes.notif ? ajustes.notif.reportes !== false : true,
        vehiculos: ajustes.notif ? ajustes.notif.vehiculos !== false : true
      }
    };
  }

  function leerAjustes() {
    try {
      var crudo = JSON.parse(localStorage.getItem(CLAVE_AJUSTES));
      return crudo ? clonar(crudo) : null;
    } catch (error) {
      return null;
    }
  }

  function guardarAjustes() {
    try {
      localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(estado));
    } catch (error) {
      /* sin almacenamiento disponible */
    }
  }

  function todosActivos() {
    return el.switches.every(function (boton) {
      return estado.notif[boton.dataset.notif];
    });
  }

  function algunActivo() {
    return el.switches.some(function (boton) {
      return estado.notif[boton.dataset.notif];
    });
  }

  function pintarPreferencias() {
    el.temas.forEach(function (boton) {
      var activo = boton.dataset.tema === estado.tema;
      boton.classList.toggle("is-activo", activo);
      boton.setAttribute("aria-pressed", String(activo));
    });
  }

  function pintarNotificaciones() {
    el.switches.forEach(function (boton) {
      var activo = Boolean(estado.notif[boton.dataset.notif]);
      boton.classList.toggle("is-on", activo);
      boton.setAttribute("aria-checked", String(activo));
    });

    var activos = todosActivos();
    el.switchMaster.classList.toggle("is-on", activos);
    el.switchMaster.setAttribute("aria-checked", String(activos));

    if (activos) {
      el.notifEstado.textContent = "Activado";
      el.notifEstado.style.color = "";
    } else if (!algunActivo()) {
      el.notifEstado.textContent = "Desactivado";
      el.notifEstado.style.color = "#8A9A8F";
    } else {
      el.notifEstado.textContent = "Personalizado";
      el.notifEstado.style.color = "#96620C";
    }
  }

  /* ---------------------------------------------------------- pestañas */

  var TEXTOS_PRONTO = {
    organizacion: "Aquí podrás administrar la empresa operadora y sus sedes en Montería.",
    canecas: "La gestión de canecas IoT y sus límites de llenado se conectará en la siguiente iteración.",
    api: "Las claves de API, webhooks e integraciones con sistemas externos estarán disponibles próximamente."
  };

  function activarTab(tab) {
    el.tabs.forEach(function (boton) {
      var activo = boton === tab;
      boton.classList.toggle("is-activo", activo);
      boton.setAttribute("aria-selected", String(activo));
      boton.tabIndex = activo ? 0 : -1;
    });

    if (tab.dataset.tab === "cuenta") {
      el.panelCuenta.hidden = false;
      el.panelPronto.hidden = true;
      return;
    }

    el.prontoTitulo.textContent = tab.textContent;
    el.prontoTexto.textContent = TEXTOS_PRONTO[tab.dataset.tab] ||
      "Esta sección estará disponible en la siguiente iteración del prototipo.";
    el.panelPronto.setAttribute("aria-labelledby", tab.id);
    el.panelCuenta.hidden = true;
    el.panelPronto.hidden = false;
  }

  el.tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activarTab(tab);
    });

    tab.addEventListener("keydown", function (evento) {
      if (evento.key !== "ArrowRight" && evento.key !== "ArrowLeft") return;

      evento.preventDefault();
      var indice = el.tabs.indexOf(tab);
      var paso = evento.key === "ArrowRight" ? 1 : -1;
      var siguiente = el.tabs[(indice + paso + el.tabs.length) % el.tabs.length];

      siguiente.focus();
      activarTab(siguiente);
    });
  });

  el.btnVolverCuenta.addEventListener("click", function () {
    activarTab(el.tabs[0]);
    el.tabs[0].focus();
  });

  /* ------------------------------------------------------ tema de interfaz */

  el.temas.forEach(function (boton) {
    boton.addEventListener("click", function () {
      if (boton.dataset.tema === "oscuro") {
        avisar("El tema oscuro estará disponible en una próxima versión del prototipo.");
        return;
      }

      estado.tema = "claro";
      pintarPreferencias();
    });
  });

  /* --------------------------------------------------------- notificaciones */

  el.switchMaster.addEventListener("click", function () {
    var activar = !todosActivos();

    el.switches.forEach(function (boton) {
      estado.notif[boton.dataset.notif] = activar;
    });

    pintarNotificaciones();
  });

  el.switches.forEach(function (boton) {
    boton.addEventListener("click", function () {
      var clave = boton.dataset.notif;
      estado.notif[clave] = !estado.notif[clave];
      pintarNotificaciones();
    });
  });

  /* ----------------------------------------------------------- acciones */

  el.btnGuardar.addEventListener("click", function () {
    guardado = clonar(estado);
    guardarAjustes();
    avisar("Cambios guardados correctamente.");
  });

  el.btnCancelar.addEventListener("click", function () {
    estado = clonar(guardado || DEFECTOS);
    pintarPreferencias();
    pintarNotificaciones();
    avisar("Cambios descartados.");
  });

  /* ------------------------------------------------------ editar perfil */

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

  function marcarError(campo) {
    campo.classList.add("adj-campo--error");
  }

  function limpiarError(campo) {
    campo.classList.remove("adj-campo--error");
  }

  function campoDe(input) {
    return input.closest(".adj-campo");
  }

  function abrirPerfil() {
    el.perfilInputNombre.value = sesion.nombre || "Camila Torres";
    el.perfilInputCargo.value = sesion.cargo || "Directora de Operaciones";
    el.perfilInputCorreo.value = correoDeSesion();

    [el.perfilInputNombre, el.perfilInputCargo, el.perfilInputCorreo].forEach(function (input) {
      limpiarError(campoDe(input));
    });

    abrirDialogo(el.dlgPerfil);
    el.perfilInputNombre.focus();
    el.perfilInputNombre.select();
  }

  function validarPerfil() {
    var valido = true;
    var nombre = el.perfilInputNombre.value.trim();
    var cargo = el.perfilInputCargo.value.trim();
    var correo = el.perfilInputCorreo.value.trim();

    limpiarError(campoDe(el.perfilInputNombre));
    limpiarError(campoDe(el.perfilInputCargo));
    limpiarError(campoDe(el.perfilInputCorreo));

    if (nombre.length < 3) {
      marcarError(campoDe(el.perfilInputNombre));
      el.errorNombre.textContent = "Escribe tu nombre completo.";
      valido = false;
    }

    if (cargo.length < 3) {
      marcarError(campoDe(el.perfilInputCargo));
      el.errorCargo.textContent = "Escribe tu cargo.";
      valido = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
      marcarError(campoDe(el.perfilInputCorreo));
      el.errorCorreo.textContent = "Ingresa un correo válido.";
      valido = false;
    }

    return valido;
  }

  el.btnEditarPerfil.addEventListener("click", abrirPerfil);
  el.dlgPerfilCerrar.addEventListener("click", function () { cerrarDialogo(el.dlgPerfil); });
  el.dlgPerfilCancelar.addEventListener("click", function () { cerrarDialogo(el.dlgPerfil); });

  el.formPerfil.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (!validarPerfil()) return;

    sesion.nombre = el.perfilInputNombre.value.trim();
    sesion.cargo = el.perfilInputCargo.value.trim();
    sesion.correo = el.perfilInputCorreo.value.trim();

    try {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch (error) {
      /* sin almacenamiento disponible */
    }

    pintarUsuario();
    cerrarDialogo(el.dlgPerfil);
    avisar("Perfil actualizado correctamente.");
  });

  /* -------------------------------------------------- cambiar contraseña */

  function abrirClave() {
    el.claveActual.value = "";
    el.claveNueva.value = "";
    el.claveRepetir.value = "";

    [el.claveActual, el.claveNueva, el.claveRepetir].forEach(function (input) {
      limpiarError(campoDe(input));
    });

    abrirDialogo(el.dlgClave);
    el.claveActual.focus();
  }

  function validarClave() {
    var valido = true;

    limpiarError(campoDe(el.claveActual));
    limpiarError(campoDe(el.claveNueva));
    limpiarError(campoDe(el.claveRepetir));

    if (el.claveActual.value !== CLAVE_DEMO) {
      marcarError(campoDe(el.claveActual));
      el.errorClaveActual.textContent = "La contraseña actual no coincide.";
      valido = false;
    }

    if (el.claveNueva.value.length < 8) {
      marcarError(campoDe(el.claveNueva));
      el.errorClaveNueva.textContent = "Usa al menos 8 caracteres.";
      valido = false;
    } else if (el.claveNueva.value === CLAVE_DEMO) {
      marcarError(campoDe(el.claveNueva));
      el.errorClaveNueva.textContent = "La nueva contraseña debe ser distinta a la actual.";
      valido = false;
    }

    if (el.claveRepetir.value !== el.claveNueva.value || !el.claveRepetir.value) {
      marcarError(campoDe(el.claveRepetir));
      el.errorClaveRepetir.textContent = "Las contraseñas no coinciden.";
      valido = false;
    }

    return valido;
  }

  el.btnCambiarClave.addEventListener("click", abrirClave);
  el.dlgClaveCerrar.addEventListener("click", function () { cerrarDialogo(el.dlgClave); });
  el.dlgClaveCancelar.addEventListener("click", function () { cerrarDialogo(el.dlgClave); });

  el.formClave.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (!validarClave()) return;

    cerrarDialogo(el.dlgClave);
    avisar("Contraseña actualizada (simulación del prototipo).");
  });

  [el.dlgPerfil, el.dlgClave].forEach(function (dialogo) {
    dialogo.addEventListener("click", function (evento) {
      if (evento.target === dialogo) cerrarDialogo(dialogo);
    });
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

    if (window.innerWidth <= 760) abrirMenu(false);
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

  pintarPreferencias();
  pintarNotificaciones();
})();
