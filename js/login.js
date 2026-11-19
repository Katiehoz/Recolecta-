/* ==========================================================================
   Recolecta+ · Inicio de sesión
   Prototipo funcional sin backend: las cuentas se validan en el navegador
   y la sesión se guarda en localStorage.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE_SESION = "recolecta.sesion";
  var CLAVE_CUENTAS = "recolecta.cuentas";

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
    demoCorreo: document.getElementById("demoCorreo"),
    btnCrearCuenta: document.getElementById("btnCrearCuenta"),
    dlgCuenta: document.getElementById("dlgCuenta"),
    formCuenta: document.getElementById("formCuenta"),
    dlgCuentaKicker: document.getElementById("dlgCuentaKicker"),
    dlgCuentaTitulo: document.getElementById("dlgCuentaTitulo"),
    dlgCuentaCerrar: document.getElementById("dlgCuentaCerrar"),
    dlgCuentaCancelar: document.getElementById("dlgCuentaCancelar"),
    camposCuenta: document.getElementById("camposCuenta"),
    cuentaClave: document.getElementById("cuentaClave"),
    campoCuentaClave: document.getElementById("campoCuentaClave"),
    errorCuentaClave: document.getElementById("errorCuentaClave")
  };

  var rolActivo = "empleado";

  /* --------------------------------------------------------- cuentas guardadas */

  function leerCuentas() {
    try {
      var datos = JSON.parse(localStorage.getItem(CLAVE_CUENTAS));
      return Array.isArray(datos) ? datos : [];
    } catch (error) {
      return [];
    }
  }

  function guardarCuentas(cuentas) {
    try {
      localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas));
    } catch (error) {
      /* sin almacenamiento disponible */
    }
  }

  function buscarCuentaRegistrada(rol, correo) {
    var correoNormal = correo.trim().toLowerCase();
    var cuentas = leerCuentas();

    for (var i = 0; i < cuentas.length; i++) {
      if (cuentas[i].rol === rol && String(cuentas[i].correo || "").toLowerCase() === correoNormal) {
        return cuentas[i];
      }
    }
    return null;
  }

  function correoReservado(rol, correo) {
    var correoNormal = correo.trim().toLowerCase();
    if (CUENTAS[rol] && CUENTAS[rol].correo.toLowerCase() === correoNormal) return true;
    return !!buscarCuentaRegistrada(rol, correoNormal);
  }

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
    var cuentaDemo = CUENTAS[rolActivo];
    var cuentaRegistrada = buscarCuentaRegistrada(rolActivo, correo);

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

    if (cuentaRegistrada) {
      if (clave !== cuentaRegistrada.clave) {
        mostrarError(el.campoClave, el.errorClave, "Contraseña incorrecta. Inténtalo de nuevo.");
        return false;
      }
      return cuentaRegistrada;
    }

    if (correo.toLowerCase() !== cuentaDemo.correo) {
      mostrarError(
        el.campoCorreo,
        el.errorCorreo,
        "No encontramos esta cuenta para el rol seleccionado."
      );
      return false;
    }

    if (clave !== cuentaDemo.clave) {
      mostrarError(el.campoClave, el.errorClave, "Contraseña incorrecta. Inténtalo de nuevo.");
      return false;
    }

    return cuentaDemo;
  }

  /* ---------------------------------------------------------------- ingreso */

  function guardarSesion(cuenta) {
    var sesion = {
      rol: rolActivo,
      correo: cuenta.correo,
      nombre: cuenta.nombre,
      cargo: cuenta.cargo || (rolActivo === "ciudadano" ? "Ciudadano" : "Empleado"),
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

    var cuenta = validar();
    if (!cuenta) {
      var primerError = el.formulario.querySelector(".campo--error input");
      if (primerError) primerError.focus();
      return;
    }

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

  /* ---------------------------------------------------------- crear cuenta */

  function definicionCampos(rol) {
    if (rol === "ciudadano") {
      return [
        { id: "regNombre", nombre: "nombre", etiqueta: "Nombre", tipo: "text", placeholder: "Tu nombre", autocomplete: "given-name", ancho: false },
        { id: "regApellido", nombre: "apellido", etiqueta: "Apellido", tipo: "text", placeholder: "Tu apellido", autocomplete: "family-name", ancho: false },
        { id: "regTelefono", nombre: "telefono", etiqueta: "Teléfono", tipo: "tel", placeholder: "Ej. 300 000 0000", autocomplete: "tel", ancho: false },
        { id: "regCorreo", nombre: "correo", etiqueta: "Correo", tipo: "email", placeholder: "tu@correo.com", autocomplete: "email", ancho: false },
        { id: "regDireccion", nombre: "direccion", etiqueta: "Dirección", tipo: "text", placeholder: "Ej. Calle 27 #4-56", autocomplete: "street-address", ancho: true }
      ];
    }

    return [
      { id: "regNombre", nombre: "nombre", etiqueta: "Nombre", tipo: "text", placeholder: "Tu nombre", autocomplete: "given-name", ancho: false },
      { id: "regApellido", nombre: "apellido", etiqueta: "Apellido", tipo: "text", placeholder: "Tu apellido", autocomplete: "family-name", ancho: false },
      { id: "regTelefono", nombre: "telefono", etiqueta: "Teléfono", tipo: "tel", placeholder: "Ej. 300 000 0000", autocomplete: "tel", ancho: false },
      { id: "regCorreo", nombre: "correo", etiqueta: "Correo", tipo: "email", placeholder: "correo@empresa.com", autocomplete: "email", ancho: false },
      { id: "regCargo", nombre: "cargo", etiqueta: "Cargo", tipo: "text", placeholder: "Ej. Operador de ruta", autocomplete: "organization-title", ancho: true }
    ];
  }

  function renderizarCamposCuenta() {
    var campos = definicionCampos(rolActivo);
    var html = '<div class="cuenta-grid">';

    campos.forEach(function (campo) {
      html += '<div class="campo' + (campo.ancho ? " campo--ancho" : "") + '" id="campo-' + campo.id + '">';
      html += '<label for="' + campo.id + '">' + campo.etiqueta + '</label>';
      html += '<input id="' + campo.id + '" name="' + campo.nombre + '" type="' + campo.tipo + '" autocomplete="' + campo.autocomplete + '" placeholder="' + campo.placeholder + '" required aria-describedby="error-' + campo.id + '">';
      html += '<p class="campo__error" id="error-' + campo.id + '" role="alert"></p>';
      html += '</div>';
    });

    html += '</div>';
    el.camposCuenta.innerHTML = html;
  }

  function limpiarErroresCuenta() {
    var errores = el.formCuenta.querySelectorAll(".campo");
    errores.forEach(function (campo) {
      campo.classList.remove("campo--error");
      var msg = campo.querySelector(".campo__error");
      if (msg) msg.textContent = "";
    });
  }

  function mostrarErrorCuenta(idCampo, mensaje) {
    var contenedor = document.getElementById("campo-" + idCampo);
    var error = document.getElementById("error-" + idCampo);
    if (!contenedor || !error) return;
    contenedor.classList.add("campo--error");
    error.textContent = mensaje;
  }

  function abrirCrearCuenta() {
    el.dlgCuentaKicker.textContent = rolActivo === "ciudadano" ? "Registro ciudadano" : "Registro de empleado";
    el.dlgCuentaTitulo.textContent = "Crear cuenta";
    el.formCuenta.reset();
    limpiarErroresCuenta();
    limpiarError(el.campoCuentaClave, el.errorCuentaClave);
    renderizarCamposCuenta();

    if (typeof el.dlgCuenta.showModal === "function") {
      el.dlgCuenta.showModal();
    } else {
      el.dlgCuenta.setAttribute("open", "");
    }
  }

  function cerrarCrearCuenta() {
    if (typeof el.dlgCuenta.close === "function") {
      el.dlgCuenta.close();
    } else {
      el.dlgCuenta.removeAttribute("open");
    }
  }

  function valorCampo(id) {
    var nodo = document.getElementById(id);
    return nodo ? nodo.value.trim() : "";
  }

  function validarCuenta() {
    limpiarErroresCuenta();
    var campos = definicionCampos(rolActivo);
    var valido = true;
    var primero = null;

    campos.forEach(function (campo) {
      var valor = valorCampo(campo.id);
      if (!valor) {
        mostrarErrorCuenta(campo.id, "Este campo es obligatorio.");
        if (!primero) primero = document.getElementById(campo.id);
        valido = false;
        return;
      }
      if (campo.nombre === "correo" && !PATRON_CORREO.test(valor)) {
        mostrarErrorCuenta(campo.id, "Ingresa un correo electrónico válido.");
        if (!primero) primero = document.getElementById(campo.id);
        valido = false;
      }
    });

    var clave = el.cuentaClave.value;
    if (!clave) {
      mostrarError(el.campoCuentaClave, el.errorCuentaClave, "Crea una contraseña.");
      if (!primero) primero = el.cuentaClave;
      valido = false;
    } else if (clave.length < 6) {
      mostrarError(el.campoCuentaClave, el.errorCuentaClave, "La contraseña debe tener al menos 6 caracteres.");
      if (!primero) primero = el.cuentaClave;
      valido = false;
    }

    if (!valido) {
      if (primero) primero.focus();
      return null;
    }

    var correo = valorCampo("regCorreo").toLowerCase();
    if (correoReservado(rolActivo, correo)) {
      mostrarErrorCuenta("regCorreo", "Ya existe una cuenta con este correo para el rol seleccionado.");
      document.getElementById("regCorreo").focus();
      return null;
    }

    var nombre = valorCampo("regNombre");
    var apellido = valorCampo("regApellido");
    var telefono = valorCampo("regTelefono");
    var direccion = rolActivo === "ciudadano" ? valorCampo("regDireccion") : "";
    var cargo = rolActivo === "empleado" ? valorCampo("regCargo") : "Ciudadano";

    return {
      rol: rolActivo,
      nombre: (nombre + " " + apellido).trim(),
      telefono: telefono,
      correo: correo,
      direccion: direccion,
      cargo: cargo,
      clave: clave
    };
  }

  el.btnCrearCuenta.addEventListener("click", abrirCrearCuenta);
  el.dlgCuentaCerrar.addEventListener("click", cerrarCrearCuenta);
  el.dlgCuentaCancelar.addEventListener("click", cerrarCrearCuenta);

  el.dlgCuenta.addEventListener("click", function (evento) {
    if (evento.target === el.dlgCuenta) cerrarCrearCuenta();
  });

  el.dlgCuenta.addEventListener("cancel", function (evento) {
    evento.preventDefault();
    cerrarCrearCuenta();
  });

  el.formCuenta.addEventListener("input", function (evento) {
    var campo = evento.target.closest(".campo");
    if (!campo) return;
    campo.classList.remove("campo--error");
    var msg = campo.querySelector(".campo__error");
    if (msg) msg.textContent = "";
  });

  el.formCuenta.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var cuenta = validarCuenta();
    if (!cuenta) return;

    var cuentas = leerCuentas();
    cuentas.push(cuenta);
    guardarCuentas(cuentas);

    cerrarCrearCuenta();
    el.correo.value = cuenta.correo;
    el.clave.value = "";
    limpiarTodo();
    el.nota.textContent = "Cuenta creada correctamente. Ahora puedes iniciar sesión con tu correo y contraseña.";
    el.nota.hidden = false;
    el.clave.focus();
  });
})();
