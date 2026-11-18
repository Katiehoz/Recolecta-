/* ==========================================================================
   Recolecta+ · Catálogo de Recompensas
   Prototipo: los canjes son simulados y viven solo en la sesión del navegador.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE_SESION = "recolecta.sesion";
  var CLAVE_PUNTOS = "recolecta.puntos";
  var CLAVE_CANJES = "recolecta.canjes";
  var PUNTOS_INICIALES = 1480;

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

  function leerNumero(clave, valorInicial) {
    var raw = localStorage.getItem(clave);

    if (raw === null || raw === "") {
      return valorInicial;
    }

    var valor = Number(raw);
    return isFinite(valor) && valor >= 0 ? valor : valorInicial;
  }

  function costoPorNombre(nombre) {
    var botones = document.querySelectorAll(".pr-canjear");

    for (var i = 0; i < botones.length; i += 1) {
      if (botones[i].getAttribute("data-nombre") === nombre) {
        return Number(botones[i].getAttribute("data-costo")) || 0;
      }
    }

    return 0;
  }

  function fechaActual() {
    try {
      return new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch (error) {
      return "Hoy";
    }
  }

  function leerCanjes() {
    var valor;

    try {
      valor = JSON.parse(localStorage.getItem(CLAVE_CANJES));
    } catch (error) {
      return [];
    }

    if (!Array.isArray(valor)) {
      return [];
    }

    /* Compatibilidad con canjes guardados antes como simples cadenas. */
    return valor.map(function (canje, indice) {
      if (typeof canje === "string") {
        return {
          nombre: canje,
          costo: costoPorNombre(canje),
          codigo: "CUP-" + (2481 + indice),
          fecha: "Canje registrado"
        };
      }

      if (canje && canje.nombre) {
        return {
          nombre: canje.nombre,
          costo: Number(canje.costo) || 0,
          codigo: canje.codigo || "CUP-" + (2481 + indice),
          fecha: canje.fecha || "Canje registrado"
        };
      }

      return null;
    }).filter(Boolean);
  }

  var puntos = leerNumero(CLAVE_PUNTOS, PUNTOS_INICIALES);
  var canjes = leerCanjes();

  var el = {
    puntos: document.getElementById("prPuntos"),
    toast: document.getElementById("toast"),
    btnUsuario: document.getElementById("btnUsuario"),
    menuUsuario: document.getElementById("menuUsuario"),
    menuNombre: document.getElementById("menuNombre"),
    menuCorreo: document.getElementById("menuCorreo"),
    btnSalir: document.getElementById("btnSalir"),
    btnMenuProgramar: document.getElementById("btnMenuProgramar"),
    botones: Array.prototype.slice.call(document.querySelectorAll(".pr-canjear")),
    recibos: document.getElementById("prRecibos"),
    recibosLista: document.getElementById("prRecibosLista"),
    recibosCantidad: document.getElementById("prRecibosCantidad")
  };

  function formatoPuntos(valor) {
    return String(valor).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function actualizarPuntos() {
    el.puntos.textContent = formatoPuntos(puntos);
  }

  function crearRecibo(canje) {
    var fila = document.createElement("li");
    fila.className = "pr-recibo";

    var parteSuperior = document.createElement("div");
    parteSuperior.className = "pr-recibo__top";

    var sello = document.createElement("span");
    sello.className = "pr-recibo__sello";
    sello.textContent = "Recolecta+ · Recompensa";

    var estado = document.createElement("span");
    estado.className = "pr-recibo__estado";

    var punto = document.createElement("i");
    punto.setAttribute("aria-hidden", "true");
    estado.appendChild(punto);
    estado.appendChild(document.createTextNode("Lista para reclamar"));

    parteSuperior.appendChild(sello);
    parteSuperior.appendChild(estado);

    var datos = document.createElement("div");
    datos.className = "pr-recibo__datos";

    var nombre = document.createElement("strong");
    nombre.textContent = canje.nombre;

    var detalle = document.createElement("span");
    detalle.textContent = formatoPuntos(canje.costo) + " Puntos Verdes · " + canje.fecha;

    datos.appendChild(nombre);
    datos.appendChild(detalle);

    var separador = document.createElement("div");
    separador.className = "pr-recibo__separador";
    separador.setAttribute("aria-hidden", "true");

    var parteInferior = document.createElement("div");
    parteInferior.className = "pr-recibo__bottom";

    var codigo = document.createElement("span");
    codigo.className = "pr-recibo__codigo";
    codigo.appendChild(document.createTextNode("Código "));

    var codigoFuerte = document.createElement("strong");
    codigoFuerte.textContent = canje.codigo;
    codigo.appendChild(codigoFuerte);

    var barras = document.createElement("span");
    barras.className = "pr-recibo__barras";
    barras.setAttribute("aria-hidden", "true");

    parteInferior.appendChild(codigo);
    parteInferior.appendChild(barras);

    fila.appendChild(parteSuperior);
    fila.appendChild(datos);
    fila.appendChild(separador);
    fila.appendChild(parteInferior);

    return fila;
  }

  function renderizarRecibos() {
    el.recibosLista.textContent = "";

    canjes.forEach(function (canje) {
      el.recibosLista.appendChild(crearRecibo(canje));
    });

    el.recibosCantidad.textContent = String(canjes.length);
    el.recibos.hidden = canjes.length === 0;
  }

  var avisoTiempo;

  function mostrarAviso(mensaje) {
    el.toast.textContent = mensaje;
    el.toast.classList.add("is-visible");
    clearTimeout(avisoTiempo);
    avisoTiempo = setTimeout(function () {
      el.toast.classList.remove("is-visible");
    }, 3200);
  }

  function yaCanjeado(nombre) {
    return canjes.some(function (canje) {
      return canje.nombre === nombre;
    });
  }

  function aplicarCanje(boton) {
    var nombre = boton.getAttribute("data-nombre");
    var costo = Number(boton.getAttribute("data-costo"));

    if (yaCanjeado(nombre)) {
      mostrarAviso("Ya canjeaste esta recompensa.");
      return;
    }

    if (!isFinite(costo) || costo <= 0) {
      return;
    }

    if (puntos < costo) {
      mostrarAviso("Puntos insuficientes para este canje.");
      return;
    }

    var codigo = "CUP-" + (2481 + canjes.length);

    puntos -= costo;
    canjes.push({
      nombre: nombre,
      costo: costo,
      codigo: codigo,
      fecha: fechaActual()
    });

    try {
      localStorage.setItem(CLAVE_PUNTOS, String(puntos));
      localStorage.setItem(CLAVE_CANJES, JSON.stringify(canjes));
    } catch (error) {
      /* El prototipo sigue funcionando aunque el almacenamiento esté lleno. */
    }

    actualizarPuntos();
    renderizarRecibos();

    boton.disabled = true;
    boton.textContent = "Canjeado";
    mostrarAviso("¡Canjeaste " + nombre + "! Tu cupón " + codigo + " está listo.");

    window.setTimeout(function () {
      el.recibos.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 180);
  }

  function inicializarBotones() {
    el.botones.forEach(function (boton) {
      var nombre = boton.getAttribute("data-nombre");

      if (yaCanjeado(nombre)) {
        boton.disabled = true;
        boton.textContent = "Canjeado";
      }

      boton.addEventListener("click", function () {
        aplicarCanje(boton);
      });
    });
  }

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

  actualizarPuntos();
  renderizarRecibos();
  inicializarBotones();
  inicializarCuenta();
})();
