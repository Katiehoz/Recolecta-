/* ==========================================================================
   Recolecta+ · Impacto Ambiental
   Prototipo: los datos y gráficos viven en el navegador.
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
    btnExportar: document.getElementById("btnExportar"),
    donaSegmentos: document.getElementById("donaSegmentos"),
    donaLeyenda: document.getElementById("donaLeyenda"),
    graficoCo2: document.getElementById("graficoCo2")
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

  function formatoNumero(valor) {
    return valor.toFixed(1).replace(".", ",");
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

  /* ------------------------------------------------------- datos del reporte */

  var residuos = [
    { nombre: "Plásticos & PET", toneladas: 35.4, porcentaje: 42, color: "#2E9E5B" },
    { nombre: "Cartón / Papel", toneladas: 21.9, porcentaje: 26, color: "#3B82F6" },
    { nombre: "Electrónicos RAEE", toneladas: 11.0, porcentaje: 13, color: "#E9A23B" },
    { nombre: "Vidrio", toneladas: 9.3, porcentaje: 11, color: "#2BB8C4" },
    { nombre: "Orgánicos", toneladas: 6.6, porcentaje: 8, color: "#8B5CF6" }
  ];

  var co2 = [
    { mes: "Ene", valor: 186 },
    { mes: "Feb", valor: 212 },
    { mes: "Mar", valor: 238 },
    { mes: "Abr", valor: 268 },
    { mes: "May", valor: 292 },
    { mes: "Jun", valor: 314 },
    { mes: "Jul", valor: 345 }
  ];

  /* -------------------------------------------------------------- dona */

  function pintarDona() {
    var NS = "http://www.w3.org/2000/svg";
    var radio = 88;
    var circunferencia = 2 * Math.PI * radio;
    var separacion = 3;
    var desplazamiento = 0;

    residuos.forEach(function (residuo, indice) {
      var longitud = (residuo.porcentaje / 100) * circunferencia;

      var segmento = document.createElementNS(NS, "circle");
      segmento.setAttribute("class", "dona__segmento");
      segmento.setAttribute("cx", "120");
      segmento.setAttribute("cy", "120");
      segmento.setAttribute("r", String(radio));
      segmento.setAttribute("stroke", residuo.color);
      segmento.setAttribute("stroke-dasharray",
        Math.max(longitud - separacion, 0) + " " + (circunferencia - longitud + separacion));
      segmento.setAttribute("stroke-dashoffset", String(-desplazamiento));
      segmento.dataset.indice = String(indice);

      var titulo = document.createElementNS(NS, "title");
      titulo.textContent = residuo.nombre + ": " + formatoNumero(residuo.toneladas) +
        " t (" + residuo.porcentaje + "%)";
      segmento.appendChild(titulo);

      el.donaSegmentos.appendChild(segmento);
      desplazamiento += longitud;
    });

    el.donaLeyenda.innerHTML = residuos.map(function (residuo, indice) {
      return '<li class="dona-leyenda__item" data-indice="' + indice + '" tabindex="0">' +
        '<span class="dona-leyenda__punto" style="background:' + residuo.color + '"></span>' +
        '<span class="dona-leyenda__nombre">' + residuo.nombre + '</span>' +
        '<span class="dona-leyenda__valor">' + formatoNumero(residuo.toneladas) + ' t · ' +
          residuo.porcentaje + '%</span>' +
      '</li>';
    }).join("");

    function resaltar(indice) {
      Array.prototype.forEach.call(
        el.donaSegmentos.querySelectorAll(".dona__segmento"),
        function (segmento) {
          var activo = segmento.dataset.indice === String(indice);
          segmento.classList.toggle("is-resaltado", activo);
          segmento.classList.toggle("is-apagado", !activo);
        }
      );
    }

    function limpiar() {
      Array.prototype.forEach.call(
        el.donaSegmentos.querySelectorAll(".dona__segmento"),
        function (segmento) {
          segmento.classList.remove("is-resaltado", "is-apagado");
        }
      );
    }

    Array.prototype.forEach.call(
      el.donaSegmentos.querySelectorAll(".dona__segmento"),
      function (segmento) {
        segmento.addEventListener("mouseenter", function () {
          resaltar(segmento.dataset.indice);
        });

        segmento.addEventListener("mouseleave", limpiar);
      }
    );

    Array.prototype.forEach.call(
      el.donaLeyenda.querySelectorAll(".dona-leyenda__item"),
      function (item) {
        var indice = item.dataset.indice;

        item.addEventListener("mouseenter", function () {
          item.classList.add("is-resaltado");
          resaltar(indice);
        });

        item.addEventListener("mouseleave", function () {
          item.classList.remove("is-resaltado");
          limpiar();
        });

        item.addEventListener("focus", function () {
          item.classList.add("is-resaltado");
          resaltar(indice);
        });

        item.addEventListener("blur", function () {
          item.classList.remove("is-resaltado");
          limpiar();
        });
      }
    );
  }

  /* -------------------------------------------------------- tendencia CO₂ */

  function pintarTendencia() {
    var NS = "http://www.w3.org/2000/svg";
    var ancho = 640;
    var alto = 330;
    var margen = { arriba: 18, derecha: 16, abajo: 52, izquierda: 44 };
    var baseY = alto - margen.abajo;
    var techoY = margen.arriba;
    var min = 180;
    var max = 360;

    el.graficoCo2.setAttribute("viewBox", "0 0 " + ancho + " " + alto);
    el.graficoCo2.innerHTML = "";

    var defs = document.createElementNS(NS, "defs");
    var gradiente = document.createElementNS(NS, "linearGradient");
    gradiente.setAttribute("id", "degradadoCo2");
    gradiente.setAttribute("x1", "0");
    gradiente.setAttribute("y1", "0");
    gradiente.setAttribute("x2", "0");
    gradiente.setAttribute("y2", "1");

    var altoGradiente = document.createElementNS(NS, "stop");
    altoGradiente.setAttribute("offset", "0");
    altoGradiente.setAttribute("stop-color", "#3DA35D");
    altoGradiente.setAttribute("stop-opacity", ".3");

    var bajoGradiente = document.createElementNS(NS, "stop");
    bajoGradiente.setAttribute("offset", "1");
    bajoGradiente.setAttribute("stop-color", "#3DA35D");
    bajoGradiente.setAttribute("stop-opacity", "0");

    gradiente.appendChild(altoGradiente);
    gradiente.appendChild(bajoGradiente);
    defs.appendChild(gradiente);
    el.graficoCo2.appendChild(defs);

    function x(indice) {
      var paso = (ancho - margen.izquierda - margen.derecha) / (co2.length - 1);
      return margen.izquierda + indice * paso;
    }

    function y(valor) {
      var proporcion = (valor - min) / (max - min);
      return baseY - proporcion * (baseY - techoY);
    }

    [180, 200, 220, 240, 260, 280, 300, 320, 340, 360].forEach(function (valor) {
      var linea = document.createElementNS(NS, "line");
      linea.setAttribute("class", "co2__cuadricula");
      linea.setAttribute("x1", String(margen.izquierda));
      linea.setAttribute("x2", String(ancho - margen.derecha));
      linea.setAttribute("y1", String(y(valor)));
      linea.setAttribute("y2", String(y(valor)));
      el.graficoCo2.appendChild(linea);

      var etiqueta = document.createElementNS(NS, "text");
      etiqueta.setAttribute("class", "co2__eje");
      etiqueta.setAttribute("x", String(margen.izquierda - 9));
      etiqueta.setAttribute("y", String(y(valor) + 3.5));
      etiqueta.setAttribute("text-anchor", "end");
      etiqueta.textContent = String(valor);
      el.graficoCo2.appendChild(etiqueta);
    });

    var ejeBase = document.createElementNS(NS, "line");
    ejeBase.setAttribute("x1", String(margen.izquierda));
    ejeBase.setAttribute("x2", String(ancho - margen.derecha));
    ejeBase.setAttribute("y1", String(baseY));
    ejeBase.setAttribute("y2", String(baseY));
    ejeBase.setAttribute("stroke", "#D7E7DB");
    ejeBase.setAttribute("stroke-width", "1");
    el.graficoCo2.appendChild(ejeBase);

    co2.forEach(function (punto, indice) {
      var etiqueta = document.createElementNS(NS, "text");
      etiqueta.setAttribute("class", "co2__eje");
      etiqueta.setAttribute("x", String(x(indice)));
      etiqueta.setAttribute("y", String(baseY + 24));
      etiqueta.setAttribute("text-anchor", "middle");
      etiqueta.textContent = punto.mes;
      el.graficoCo2.appendChild(etiqueta);
    });

    var lineaPath = co2.map(function (punto, indice) {
      return (indice === 0 ? "M" : "L") + x(indice) + " " + y(punto.valor);
    }).join(" ");

    var areaPath = lineaPath +
      " L" + x(co2.length - 1) + " " + baseY +
      " L" + x(0) + " " + baseY + " Z";

    var area = document.createElementNS(NS, "path");
    area.setAttribute("class", "co2__area");
    area.setAttribute("d", areaPath);
    el.graficoCo2.appendChild(area);

    var linea = document.createElementNS(NS, "path");
    linea.setAttribute("class", "co2__linea");
    linea.setAttribute("d", lineaPath);
    el.graficoCo2.appendChild(linea);

    co2.forEach(function (punto, indice) {
      var circulo = document.createElementNS(NS, "circle");
      circulo.setAttribute("class", "co2__punto");
      circulo.setAttribute("cx", String(x(indice)));
      circulo.setAttribute("cy", String(y(punto.valor)));
      circulo.setAttribute("r", "4");

      var titulo = document.createElementNS(NS, "title");
      titulo.textContent = punto.mes + " 2026: " + punto.valor + " t de CO₂ evitadas";
      circulo.appendChild(titulo);

      el.graficoCo2.appendChild(circulo);
    });

    var ultimo = co2[co2.length - 1];
    var valorFinal = document.createElementNS(NS, "text");
    valorFinal.setAttribute("class", "co2__valor-final");
    valorFinal.setAttribute("x", String(x(co2.length - 1)));
    valorFinal.setAttribute("y", String(y(ultimo.valor) - 12));
    valorFinal.setAttribute("text-anchor", "end");
    valorFinal.textContent = ultimo.valor + " t";
    el.graficoCo2.appendChild(valorFinal);
  }

  /* --------------------------------------------------------- exportar ESG */

  el.btnExportar.addEventListener("click", function () {
    var fecha = new Date().toLocaleString("es-CO");
    var lineas = [
      "Reporte de Impacto Ambiental - Recolecta+",
      "Zona,Centro - Montería",
      "Generado," + fecha,
      "",
      "Distribución por tipo de residuo (último mes)",
      "Tipo,Toneladas,Porcentaje"
    ];

    residuos.forEach(function (residuo) {
      lineas.push(residuo.nombre + "," + formatoNumero(residuo.toneladas) + "," + residuo.porcentaje + "%");
    });

    lineas.push("", "Tendencia de CO₂ evitado 2026", "Mes,Toneladas CO2");

    co2.forEach(function (punto) {
      lineas.push(punto.mes + "," + punto.valor);
    });

    var contenido = "\uFEFF" + lineas.join("\r\n");
    var blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "reporte-esg-recolecta.csv";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);

    avisar("Reporte ESG generado con la distribución de residuos y la tendencia de CO₂.");
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

  /* ------------------------------------------------------------- arranque */

  pintarDona();
  pintarTendencia();
})();
