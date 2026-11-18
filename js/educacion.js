/* ==========================================================================
   Recolecta+ · Educación (app ciudadana)
   Guard de rol, menú de cuenta y cuestionarios de los módulos educativos.
   Los puntos se comparten con el inicio y Premios.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE_SESION = "recolecta.sesion";
  var CLAVE_PUNTOS = "recolecta.puntos";
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

  var el = {
    btnUsuario: document.getElementById("btnUsuario"),
    menuUsuario: document.getElementById("menuUsuario"),
    menuNombre: document.getElementById("menuNombre"),
    menuCorreo: document.getElementById("menuCorreo"),
    btnMenuProgramar: document.getElementById("btnMenuProgramar"),
    btnSalir: document.getElementById("btnSalir"),
    toast: document.getElementById("toast"),
    btnAbrirClasificacion: document.getElementById("btnAbrirQuiz"),
    btnAbrirImpacto: document.getElementById("btnAbrirQuizImpacto"),
    btnAbrirEconomia: document.getElementById("btnAbrirQuizEconomia"),
    dlgQuiz: document.getElementById("dlgQuiz"),
    frmQuiz: document.getElementById("frmQuiz"),
    quizKicker: document.getElementById("edQuizKicker"),
    quizTitulo: document.getElementById("edQuizTitulo"),
    quizBajada: document.getElementById("edQuizBajada"),
    quizCuerpo: document.getElementById("edQuizCuerpo"),
    btnQuizCerrar: document.getElementById("btnQuizCerrar"),
    btnQuizCancelar: document.getElementById("btnQuizCancelar"),
    btnQuizAccion: document.getElementById("btnQuizAccion")
  };

  /* ------------------------------------------------------------- utilidades */

  var temporizadorToast = null;

  function avisar(mensaje) {
    el.toast.textContent = mensaje;
    el.toast.classList.add("is-visible");

    window.clearTimeout(temporizadorToast);
    temporizadorToast = window.setTimeout(function () {
      el.toast.classList.remove("is-visible");
    }, 3400);
  }

  function leerNumero(clave, valorInicial) {
    var raw = localStorage.getItem(clave);
    var valor = raw === null ? valorInicial : parseInt(raw, 10);
    return isNaN(valor) ? valorInicial : valor;
  }

  function leerRegistro(clave) {
    try {
      return JSON.parse(localStorage.getItem(clave));
    } catch (error) {
      return null;
    }
  }

  /* ------------------------------------- cuestionarios: contenido educativo */

  /* La primera pregunta y la reflexión del módulo de clasificación reproducen
     el contenido de las capturas de referencia. */
  var MODULOS = {
    clasificacion: {
      kicker: "Clasificación de residuos sólidos",
      claveControl: "recolecta.educacion.clasificacion",
      pasos: [
        {
          tipo: "opcion",
          enunciado: "¿Qué beneficio genera directamente el reciclaje?",
          puntos: 5,
          opciones: [
            { letra: "A", texto: "Aumenta los residuos" },
            { letra: "B", texto: "Reduce el uso de materias primas", correcta: true },
            { letra: "C", texto: "Mezcla los materiales" }
          ],
          acierto: "Respuesta correcta. Ya puedes completar el módulo.",
          error: "Respuesta incorrecta. Intenta otra vez.",
          boton: "Completar módulo"
        },
        {
          tipo: "opcion",
          enunciado: "¿Qué material puede reciclarse una y otra vez sin perder calidad?",
          puntos: 4,
          opciones: [
            { letra: "A", texto: "El papel" },
            { letra: "B", texto: "El plástico" },
            { letra: "C", texto: "El vidrio", correcta: true }
          ],
          acierto: "¡Correcto! El vidrio puede reciclarse una y otra vez.",
          error: "Respuesta incorrecta. Piensa en el material que nunca se desgasta.",
          boton: "Siguiente"
        },
        {
          tipo: "opcion",
          enunciado: "¿Por qué conviene enjuagar los envases antes de reciclarlos?",
          puntos: 3,
          opciones: [
            { letra: "A", texto: "Para evitar olores y facilitar el reciclaje", correcta: true },
            { letra: "B", texto: "Para que pesen más al entregarlos" },
            { letra: "C", texto: "Para mezclarlos con los residuos orgánicos" }
          ],
          acierto: "¡Correcto! Un envase limpio evita olores y facilita el proceso.",
          error: "Respuesta incorrecta. Piensa en lo que pasa si quedan restos de comida.",
          boton: "Siguiente"
        },
        {
          tipo: "opcion",
          enunciado: "¿Cuál de estos residuos se considera orgánico?",
          puntos: 3,
          opciones: [
            { letra: "A", texto: "Una botella de plástico" },
            { letra: "B", texto: "Un periódico" },
            { letra: "C", texto: "Un resto de comida", correcta: true }
          ],
          acierto: "¡Correcto! Los restos de comida son residuos orgánicos.",
          error: "Respuesta incorrecta. Busca el residuo que puede compostarse.",
          boton: "Siguiente"
        },
        {
          tipo: "reflexion",
          titulo: "Llévalo a tu vida diaria",
          texto: "Piensa en una acción diaria que permita reutilizar un envase antes de desecharlo.",
          etiqueta: "Tu reflexión",
          placeholder: "Escribe aquí cómo aplicarías esta acción...",
          nota: "Esta respuesta forma parte de la simulación y no será almacenada.",
          boton: "Continuar"
        }
      ]
    },
    impacto: {
      kicker: "Impacto ambiental del reciclaje",
      claveControl: "recolecta.educacion.impacto",
      pasos: [
        {
          tipo: "opcion",
          enunciado: "¿Cómo ayuda el reciclaje a reducir la deforestación?",
          puntos: 2,
          opciones: [
            { letra: "A", texto: "Disminuye la necesidad de papel nuevo", correcta: true },
            { letra: "B", texto: "Aumenta la tala de árboles" },
            { letra: "C", texto: "No tiene ningún efecto" }
          ],
          acierto: "¡Correcto! Reciclar papel reduce la necesidad de talar árboles.",
          error: "Respuesta incorrecta. Piensa de dónde se obtiene la pulpa de papel.",
          boton: "Siguiente"
        },
        {
          tipo: "opcion",
          enunciado: "¿Qué recurso se ahorra principalmente al reciclar aluminio?",
          puntos: 2,
          opciones: [
            { letra: "A", texto: "Agua potable" },
            { letra: "B", texto: "Energía", correcta: true },
            { letra: "C", texto: "Arena" }
          ],
          acierto: "¡Correcto! Reciclar aluminio ahorra hasta un 95% de energía.",
          error: "Respuesta incorrecta. Piensa en el consumo industrial de las latas.",
          boton: "Siguiente"
        },
        {
          tipo: "opcion",
          enunciado: "¿Qué puede ocurrir si la materia orgánica llega a un relleno sanitario?",
          puntos: 2,
          opciones: [
            { letra: "A", texto: "Genera biogás y lixiviados", correcta: true },
            { letra: "B", texto: "Se convierte en abono automáticamente" },
            { letra: "C", texto: "Desaparece sin dejar huella" }
          ],
          acierto: "¡Correcto! Sin tratamiento, genera biogás y lixiviados.",
          error: "Respuesta incorrecta. Piensa en los gases y líquidos que se producen.",
          boton: "Completar módulo"
        },
        {
          tipo: "reflexion",
          titulo: "Llévalo a tu vida diaria",
          texto: "Piensa en una acción que ayude a reducir tu huella de carbono esta semana.",
          etiqueta: "Tu reflexión",
          placeholder: "Escribe aquí cómo aplicarías esta acción...",
          nota: "Esta respuesta forma parte de la simulación y no será almacenada.",
          boton: "Continuar"
        }
      ]
    },
    economia: {
      kicker: "Economía circular en Montería",
      claveControl: "recolecta.educacion.economia",
      pasos: [
        {
          tipo: "opcion",
          enunciado: "¿Qué significa \"economía circular\"?",
          puntos: 4,
          opciones: [
            { letra: "A", texto: "Usar, desechar y reemplazar siempre" },
            { letra: "B", texto: "Reducir, reutilizar y reciclar para volver a usar", correcta: true },
            { letra: "C", texto: "Producir más residuos cada año" }
          ],
          acierto: "¡Correcto! La economía circular busca que los materiales vuelvan a usarse.",
          error: "Respuesta incorrecta. Piensa en cómo alargar la vida de los materiales.",
          boton: "Siguiente"
        },
        {
          tipo: "opcion",
          enunciado: "¿Qué beneficio tiene procesar el reciclaje en Montería?",
          puntos: 4,
          opciones: [
            { letra: "A", texto: "Reduce el transporte y las emisiones", correcta: true },
            { letra: "B", texto: "Aumenta los costos de transporte" },
            { letra: "C", texto: "Evita que se generen residuos" }
          ],
          acierto: "¡Correcto! Procesar cerca reduce el transporte y las emisiones.",
          error: "Respuesta incorrecta. Piensa en la distancia que recorren los materiales.",
          boton: "Siguiente"
        },
        {
          tipo: "opcion",
          enunciado: "¿Cuál es un ejemplo de economía circular en la ciudad?",
          puntos: 4,
          opciones: [
            { letra: "A", texto: "Compostar restos de comida para hacer abono", correcta: true },
            { letra: "B", texto: "Quemar los residuos al aire libre" },
            { letra: "C", texto: "Mezclar plástico con vidrio" }
          ],
          acierto: "¡Correcto! Compostar convierte un residuo en un recurso útil.",
          error: "Respuesta incorrecta. Busca la opción que aproveche el residuo.",
          boton: "Siguiente"
        },
        {
          tipo: "opcion",
          enunciado: "¿Qué se prioriza antes de reciclar en la economía circular?",
          puntos: 3,
          opciones: [
            { letra: "A", texto: "Reducir y reutilizar", correcta: true },
            { letra: "B", texto: "Comprar más productos" },
            { letra: "C", texto: "Desechar todo de una vez" }
          ],
          acierto: "¡Correcto! Reducir y reutilizar vienen antes del reciclaje.",
          error: "Respuesta incorrecta. Piensa en la jerarquía de las 3R.",
          boton: "Completar módulo"
        },
        {
          tipo: "reflexion",
          titulo: "Llévalo a tu vida diaria",
          texto: "Piensa en una forma de darle una segunda vida a un objeto en tu casa.",
          etiqueta: "Tu reflexión",
          placeholder: "Escribe aquí cómo aplicarías esta acción...",
          nota: "Esta respuesta forma parte de la simulación y no será almacenada.",
          boton: "Continuar"
        }
      ]
    }
  };

  var moduloActual = null;
  var indice = 0;
  var puntajes = [];
  var respondida = false;

  function totalPuntos() {
    return puntajes.reduce(function (suma, valor) {
      return suma + (valor || 0);
    }, 0);
  }

  function cantidadPreguntas() {
    return moduloActual.pasos.filter(function (paso) {
      return paso.tipo === "opcion";
    }).length;
  }

  /* --------------------------------------------------- render del paso */

  function renderizarOpcion(paso) {
    var numero = 0;

    for (var i = 0; i <= indice; i += 1) {
      if (moduloActual.pasos[i].tipo === "opcion") numero += 1;
    }

    el.quizTitulo.textContent = "Pregunta " + numero + " de " + cantidadPreguntas();
    el.quizBajada.textContent = "Selecciona una respuesta para continuar.";

    var html = '<p class="ed-quiz__enunciado">' + paso.enunciado + "</p>";
    html += '<div class="ed-quiz__opciones" role="radiogroup" aria-label="Opciones de respuesta">';

    paso.opciones.forEach(function (opcion) {
      html += '<button type="button" class="ed-quiz__opcion" role="radio" aria-checked="false" data-letra="' + opcion.letra + '">';
      html += '<span class="ed-quiz__letra">' + opcion.letra + "</span>";
      html += '<span class="ed-quiz__texto">' + opcion.texto + "</span>";
      html += "</button>";
    });

    html += "</div>";
    html += '<p class="ed-quiz__feedback" id="edQuizFeedback" hidden></p>';

    el.quizCuerpo.innerHTML = html;
    el.btnQuizAccion.textContent = paso.boton;
    el.btnQuizAccion.disabled = true;
    respondida = false;

    var botones = el.quizCuerpo.querySelectorAll(".ed-quiz__opcion");

    botones.forEach(function (boton) {
      boton.addEventListener("click", function () {
        if (respondida) return;

        var letra = boton.getAttribute("data-letra");
        var elegida = paso.opciones.filter(function (opcion) {
          return opcion.letra === letra;
        })[0];

        var feedback = document.getElementById("edQuizFeedback");

        botones.forEach(function (otro) {
          otro.classList.remove("is-seleccionada");
          otro.setAttribute("aria-checked", "false");
        });

        boton.classList.add("is-seleccionada");
        boton.setAttribute("aria-checked", "true");

        if (elegida.correcta) {
          puntajes[indice] = paso.puntos;
          respondida = true;
          boton.classList.add("is-correcta");
          feedback.textContent = paso.acierto;
          feedback.className = "ed-quiz__feedback is-correcta";
          el.btnQuizAccion.disabled = false;
        } else {
          boton.classList.add("is-incorrecta");
          feedback.textContent = paso.error;
          feedback.className = "ed-quiz__feedback is-incorrecta";
          el.btnQuizAccion.disabled = true;
        }

        feedback.hidden = false;
      });
    });
  }

  function renderizarReflexion(paso) {
    el.quizTitulo.textContent = "Reflexión final";
    el.quizBajada.textContent = "Un último paso para cerrar el módulo.";

    var html = '<h3 class="ed-quiz__reflexion-titulo">' + paso.titulo + "</h3>";
    html += '<p class="ed-quiz__reflexion-texto">' + paso.texto + "</p>";
    html += '<div class="cz-campo">';
    html += '<label for="edReflexion">' + paso.etiqueta + "</label>";
    html += '<textarea id="edReflexion" class="ed-quiz__textarea" rows="4" placeholder="' + paso.placeholder + '"></textarea>';
    html += "</div>";
    html += '<p class="cz-dialogo__nota">';
    html += '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    html += '<circle cx="12" cy="12" r="8.6"/><path d="M12 8v4.4l2.8 1.6"/>';
    html += "</svg>";
    html += paso.nota;
    html += "</p>";

    el.quizCuerpo.innerHTML = html;
    el.btnQuizAccion.textContent = paso.boton;
    el.btnQuizAccion.disabled = false;
  }

  function renderizarResumen() {
    var total = totalPuntos();
    var maximo = moduloActual.pasos.reduce(function (suma, paso) {
      return suma + (paso.tipo === "opcion" ? paso.puntos : 0);
    }, 0);

    el.quizTitulo.textContent = "¡Módulo completado!";
    el.quizBajada.textContent = "Así va tu aprendizaje.";

    var html = '<div class="ed-quiz__resumen">';
    html += '<span class="ed-quiz__resumen-icono" aria-hidden="true">';
    html += '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
    html += "</span>";
    html += "<h3>Buen trabajo</h3>";
    html += "<p>Ganaste <strong>" + total + " puntos verdes</strong> de " + maximo + " posibles.</p>";
    html += '<p class="ed-quiz__resumen-nota">Tus puntos ya están disponibles en el catálogo de recompensas.</p>';
    html += "</div>";

    el.quizCuerpo.innerHTML = html;
    el.btnQuizAccion.textContent = "Finalizar";
    el.btnQuizAccion.disabled = false;
  }

  function renderizarPaso() {
    var paso = moduloActual.pasos[indice];

    if (!paso) {
      renderizarResumen();
    } else if (paso.tipo === "reflexion") {
      renderizarReflexion(paso);
    } else {
      renderizarOpcion(paso);
    }
  }

  /* -------------------------------------------------------------- acciones */

  function abrirQuiz(clave) {
    moduloActual = MODULOS[clave];
    indice = 0;
    puntajes = new Array(moduloActual.pasos.length).fill(0);
    respondida = false;

    el.frmQuiz.reset();
    el.quizKicker.textContent = moduloActual.kicker;
    renderizarPaso();

    if (typeof el.dlgQuiz.showModal === "function") {
      el.dlgQuiz.showModal();
    } else {
      el.dlgQuiz.setAttribute("open", "");
    }
  }

  function cerrarQuiz() {
    if (typeof el.dlgQuiz.close === "function") {
      el.dlgQuiz.close();
    } else {
      el.dlgQuiz.removeAttribute("open");
    }
  }

  function guardarPuntos() {
    var total = totalPuntos();
    var registro = leerRegistro(moduloActual.claveControl);

    if (registro && registro.completado) {
      avisar("Ya completaste este módulo. ¡Gracias por repasar!");
      cerrarQuiz();
      return;
    }

    var puntos = leerNumero(CLAVE_PUNTOS, PUNTOS_INICIALES);
    localStorage.setItem(CLAVE_PUNTOS, String(puntos + total));
    localStorage.setItem(moduloActual.claveControl, JSON.stringify({
      completado: true,
      puntos: total,
      fecha: new Date().toISOString()
    }));

    avisar("¡Ganaste " + total + " puntos verdes!");
    cerrarQuiz();
  }

  function accionSiguiente() {
    indice += 1;
    renderizarPaso();
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

  function inicializarQuiz() {
    el.btnAbrirClasificacion.addEventListener("click", function () {
      abrirQuiz("clasificacion");
    });

    el.btnAbrirImpacto.addEventListener("click", function () {
      abrirQuiz("impacto");
    });

    el.btnAbrirEconomia.addEventListener("click", function () {
      abrirQuiz("economia");
    });

    el.btnQuizCerrar.addEventListener("click", cerrarQuiz);
    el.btnQuizCancelar.addEventListener("click", cerrarQuiz);

    el.btnQuizAccion.addEventListener("click", function () {
      if (indice >= moduloActual.pasos.length) {
        guardarPuntos();
      } else {
        accionSiguiente();
      }
    });

    el.frmQuiz.addEventListener("submit", function (evento) {
      evento.preventDefault();
    });

    el.dlgQuiz.addEventListener("cancel", function (evento) {
      evento.preventDefault();
      cerrarQuiz();
    });

    el.dlgQuiz.addEventListener("click", function (evento) {
      if (evento.target === el.dlgQuiz) cerrarQuiz();
    });
  }

  inicializarCuenta();
  inicializarQuiz();
})();
