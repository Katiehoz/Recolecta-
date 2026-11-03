/* ==========================================================================
   Recolecta+ · Inicio de sesión
   Prototipo funcional sin backend: las cuentas se validan en el navegador
   y la sesión se guarda en localStorage.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE_SESION = "recolecta.sesion";

  var CUENTAS = {
    empleado: {
      aviso: "Acceso al Panel Urbaser para operadores y administradores",
      boton: "Entrar al Panel Urbaser",
      placeholder: "operador@urbaser.co",
      demo: "operador@urbaser.co",
      correo: "operador@urbaser.co",
      clave: "recolecta123",
      nombre: "Camila Torres",
      cargo: "Directora de Operaciones"
    },
    ciudadano: {
      aviso: "Accede a tus puntos, recompensas y educación ambiental",
      boton: "Entrar a Recolecta+",
      placeholder: "tu@correo.com",
      demo: "ciudadano@recolecta.co",
      correo: "ciudadano@recolecta.co",
      clave: "recolecta123",
      nombre: "Andrés Villalba",
      cargo: "Ciudadano"
    }
  };

  var PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  var el = {
    roles: Array.prototype.slice.call(document.querySelectorAll(".rol")),
    aviso: document.getElementById("avisoTexto"),
    formulario: document.getElementById("formulario"),
    correo: document.getElementById("correo"),
    clave: document.getElementById("clave"),
    campoCorreo: document.getElementById("campoCorreo"),
    campoClave: document.getElementById("campoClave"),
    errorCorreo: document.getElementById("errorCorreo"),
    errorClave: document.getElementById("errorClave"),
    boton: document.getElementById("btnEntrar"),
    olvido: document.getElementById("olvido"),
    nota: document.getElementById("nota"),
    demoCorreo: document.getElementById("demoCorreo")
  };

  var rolActivo = "empleado";

  /* ---------------------------------------------------------------- utilidades */

  function mostrarError(campo, nodoError, mensaje) {
    nodoError.textContent = mensaje;
    campo.classList.add("campo--error");
  }

  function limpiarError(campo, nodoError) {
    nodoError.textContent = "";
    campo.classList.remove("campo--error");
  }

  function limpiarNota() {
    el.nota.hidden = true;
    el.nota.textContent = "";
  }

  function limpiarTodo() {
    limpiarError(el.campoCorreo, el.errorCorreo);
    limpiarError(el.campoClave, el.errorClave);
    limpiarNota();
  }

  /* ------------------------------------------------------------ cambio de rol */

  function seleccionarRol(rol) {
    var cuenta = CUENTAS[rol];
    if (!cuenta || rol === rolActivo) return;

    rolActivo = rol;

    el.roles.forEach(function (boton) {
      var activo = boton.dataset.rol === rol;
      boton.classList.toggle("is-activo", activo);
      boton.setAttribute("aria-pressed", String(activo));
    });

    el.aviso.textContent = cuenta.aviso;
    el.boton.textContent = cuenta.boton;
    el.correo.placeholder = cuenta.placeholder;
    el.demoCorreo.textContent = cuenta.demo;

    el.clave.value = "";
    limpiarTodo();
  }

  el.roles.forEach(function (boton) {
    boton.addEventListener("click", function () {
      seleccionarRol(boton.dataset.rol);
    });
  });

  /* ------------------------------------------------------------- validaciones */

  function validar() {
    var valido = true;
    var correo = el.correo.value.trim();
    var clave = el.clave.value;
    var cuenta = CUENTAS[rolActivo];

    limpiarTodo();

    if (!correo) {
      mostrarError(el.campoCorreo, el.errorCorreo, "Escribe tu correo electrónico.");
      valido = false;
    } else if (!PATRON_CORREO.test(correo)) {
      mostrarError(el.campoCorreo, el.errorCorreo, "Ingresa un correo electrónico válido.");
      valido = false;
    }

    if (!clave) {
      mostrarError(el.campoClave, el.errorClave, "Escribe tu contraseña.");
      valido = false;
    } else if (clave.length < 6) {
      mostrarError(el.campoClave, el.errorClave, "La contraseña debe tener al menos 6 caracteres.");
      valido = false;
    }

    if (!valido) return false;

    if (correo.toLowerCase() !== cuenta.correo) {
      mostrarError(
        el.campoCorreo,
        el.errorCorreo,
        "No encontramos esta cuenta para el rol seleccionado."
      );
      return false;
    }

    if (clave !== cuenta.clave) {
      mostrarError(el.campoClave, el.errorClave, "Contraseña incorrecta. Inténtalo de nuevo.");
      return false;
    }

    return true;
  }

  /* ---------------------------------------------------------------- ingreso */

  function guardarSesion(cuenta) {
    var sesion = {
      rol: rolActivo,
      correo: cuenta.correo,
      nombre: cuenta.nombre,
      cargo: cuenta.cargo,
      iniciadaEn: new Date().toISOString()
    };

    try {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch (error) {
      /* Si el navegador bloquea localStorage, igual dejamos continuar. */
    }
  }

  el.formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!validar()) {
      var primerError = el.formulario.querySelector(".campo--error input");
      if (primerError) primerError.focus();
      return;
    }

    var cuenta = CUENTAS[rolActivo];

    el.boton.disabled = true;
    el.boton.textContent = "Verificando…";

    window.setTimeout(function () {
      guardarSesion(cuenta);
      el.boton.textContent = "Acceso concedido ✓";
      window.setTimeout(function () {
        window.location.href = rolActivo === "ciudadano" ? "ciudadano.html" : "panel.html";
      }, 450);
    }, 700);
  });

  /* Limpia el error del campo en cuanto el usuario lo corrige */
  el.correo.addEventListener("input", function () {
    limpiarError(el.campoCorreo, el.errorCorreo);
  });

  el.clave.addEventListener("input", function () {
    limpiarError(el.campoClave, el.errorClave);
  });

  /* ------------------------------------------------------ recuperar contraseña */

  el.olvido.addEventListener("click", function () {
    el.nota.textContent =
      "La recuperación de contraseña aún no está habilitada en el prototipo. Usa la cuenta de prueba indicada abajo.";
    el.nota.hidden = false;
  });
})();
