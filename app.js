document.addEventListener("DOMContentLoaded", () => {
  const botonMenu = document.querySelector("#boton-menu");
  const menu = document.querySelector("#menu");
  const cerrarMenu = document.querySelector("#cerrar-menu");
  const jugar = document.querySelector("#jugar");
  const tamanioCampo = document.querySelector("#tamanio");
  const bombrasCampo = document.querySelector("#bombras");
  const tablero = document.querySelector("#contenedor-juego");
  const seleccionarBandera = document.querySelector("#boton-bandera");
  const banderas = document.querySelector("#banderas");
  const colorMenu = document.querySelector("#color-menu");
  const reloj = document.querySelector("#reloj");
  const imagenModal = document.querySelector("#imagen-modal");
  const finPartida = document.querySelector("#fin-partida");
  var campoVisible = [];
  var campoLogico = [];
  var espadoPartida = "";
  var banderaSeleccionada = false;
  var banderasUsadas = 0;
  var banderasTotales = 0;
  var tiempo = 0;
  var hiloTiempo = null;

  const generarCampo = (tamanio, bombas, logico = true) => {
    let campo = [];
    if (logico) {
      let numBombas = 0;
      for (let i = 0; i < tamanio * tamanio; i++) {
        if (
          Math.floor(Math.random() < bombas / (tamanio * tamanio)) &&
          numBombas < bombas
        ) {
          campo.push(1);
          numBombas++;
        } else {
          campo.push(0);
        }
      }
      if (numBombas < bombas) {
        campo.forEach((elemento, i) => {
          if (
            Math.floor(Math.random() < bombas / tamanio) &&
            numBombas < bombas &&
            elemento !== 1
          ) {
            campo[i] = 1;
            numBombas++;
          }
        });
      }
      if (numBombas < bombas) {
        campo.forEach((elemento) => {
          if (elemento !== 1) {
            campo[i] = 1;
            numBombas++;
          }
        });
      }
    } else {
      for (let i = 0; i < tamanio * tamanio; i++) {
        campo.push("oculto");
      }
    }
    return campo;
  };
  
  function formatearSegundos(segundos) {
    var horas = Math.floor(segundos / 3600);
    horas = horas < 10 ? "0" + horas : horas;
    var minutos = Math.floor((segundos / 60) % 60);
    minutos = minutos < 10 ? "0" + minutos : minutos;
    var segundos = segundos % 60;
    segundos = segundos < 10 ? "0" + segundos : segundos;
    return horas + ":" + minutos + ":" + segundos;
  }

  const reiniciarReloj = () => {
    tiempo = 0;
    if (hiloTiempo) {
      clearInterval(hiloTiempo);
    }
    hiloTiempo = setInterval(() => {
      tiempo++;
      reloj.innerHTML = formatearSegundos(tiempo);
    }, 1000);
  };

  const reverlarBombas = () => {
    campoLogico.forEach((elemento, i) => {
      if (elemento === 1) {
        campoVisible[i] = "bomba";
      }
    });
    pintarCampo(parseInt(tamanioCampo.value), campoVisible);
  };

  const obtenerNumeroMinas = (posicion) => {
    const tamanioTablero = parseInt(tamanioCampo.value);
    const maximoTablero = tamanioTablero * tamanioTablero;
    let numeroMinas = 0;
    let posiciones = [posicion - tamanioTablero, posicion + tamanioTablero];
    if (
      Math.trunc(posicion / tamanioTablero) ===
      Math.trunc((posicion - 1) / tamanioTablero)
    ) {
      posiciones.push(posicion - 1);
    }
    if (
      Math.trunc(posicion / tamanioTablero) ===
      Math.trunc((posicion + 1) / tamanioTablero)
    ) {
      posiciones.push(posicion + 1);
    }
    if (
      Math.trunc((posicion - tamanioTablero) / tamanioTablero) ===
      Math.trunc((posicion - tamanioTablero - 1) / tamanioTablero)
    ) {
      posiciones.push(posicion - tamanioTablero - 1);
    }
    if (
      Math.trunc((posicion - tamanioTablero) / tamanioTablero) ===
      Math.trunc((posicion - tamanioTablero + 1) / tamanioTablero)
      && posicion - tamanioTablero + 1 > 0
    ) {
      posiciones.push(posicion - tamanioTablero + 1);
    }
    if (
      Math.trunc((posicion + tamanioTablero) / tamanioTablero) ===
      Math.trunc((posicion + tamanioTablero - 1) / tamanioTablero)
    ) {
      posiciones.push(posicion + tamanioTablero - 1);
    }
    if (
      Math.trunc((posicion + tamanioTablero) / tamanioTablero) ===
      Math.trunc((posicion + tamanioTablero + 1) / tamanioTablero)
    ) {
      posiciones.push(posicion + tamanioTablero + 1);
    }

    posiciones.forEach((elemento) => {
      if (
        elemento > -1 &&
        elemento < maximoTablero &&
        campoLogico[elemento] === 1
      ) {
        numeroMinas++;
      }
    });
    return numeroMinas;
  };

  const descubrirCasillasVecinas = (posicion) => {
    const tamanioTablero = parseInt(tamanioCampo.value);
    const maximoTablero = tamanioTablero * tamanioTablero;
    const poisicionesCero = [posicion];
    while (poisicionesCero.length > 0) {
      let posiciones = [
        poisicionesCero[0] - tamanioTablero,
        poisicionesCero[0] + tamanioTablero,
      ];
      if (
        Math.trunc(poisicionesCero[0] / tamanioTablero) ===
        Math.trunc((poisicionesCero[0] - 1) / tamanioTablero)
      ) {
        posiciones.push(poisicionesCero[0] - 1);
      }
      if (
        Math.trunc(poisicionesCero[0] / tamanioTablero) ===
        Math.trunc((poisicionesCero[0] + 1) / tamanioTablero)
      ) {
        posiciones.push(poisicionesCero[0] + 1);
      }
      posiciones.forEach((elemento) => {
        if (
          elemento > -1 &&
          elemento < maximoTablero &&
          campoVisible[elemento] === "oculto"
        ) {
          campoVisible[elemento] = obtenerNumeroMinas(elemento);
          if (campoVisible[elemento] === 0) {
            poisicionesCero.push(elemento);
          }
        }
      });
      poisicionesCero.shift();
    }
    pintarCampo(parseInt(tamanioCampo.value), campoVisible);
  };

  const perdio = () => {
    imagenModal.src = "images/skull.svg";
    colorMenu.style.backgroundColor = "#fd3b3b";
    menu.classList.remove("ocultar-menu");
    finPartida.innerHTML="HAS PERDIDO"
    clearInterval(hiloTiempo);
  };

  const evaluarVictoria = () => {
    let descubiertos = 0;
    campoVisible.forEach((elemento) => {
      if (Number.isInteger(elemento)) {
        descubiertos++;
      }
    });
    if (descubiertos === campoVisible.length - banderasTotales) {
      imagenModal.src = "images/victory.svg";
      colorMenu.style.backgroundColor = "#3bfd6b";
      clearInterval(hiloTiempo);
      finPartida.innerHTML="HAS GANADO EN "+ formatearSegundos(tiempo); 
      menu.classList.remove("ocultar-menu");
    }
  };

  const descubrirCasilla = (i) => {
    if (banderaSeleccionada && campoVisible[i] === "bandera") {
      banderasUsadas--;
      campoVisible[i] = "oculto";
      banderas.innerHTML = banderasTotales - banderasUsadas;
      pintarCampo(parseInt(tamanioCampo.value), campoVisible);
      return;
    }
    if (
      banderaSeleccionada &&
      campoVisible[i] === "oculto" &&
      banderasUsadas < banderasTotales
    ) {
      banderasUsadas++;
      campoVisible[i] = "bandera";
      banderas.innerHTML = banderasTotales - banderasUsadas;
      pintarCampo(parseInt(tamanioCampo.value), campoVisible);
      return;
    }
    if (
      espadoPartida === "perdio" ||
      campoVisible[i] === "bandera" ||
      (banderasUsadas === banderasTotales && banderaSeleccionada) ||
      campoVisible[i] !== "oculto"
    ) {
      return;
    }
    if (campoLogico[i] === 1) {
      campoVisible[i] = "bomba";
      pintarCampo(parseInt(tamanioCampo.value), campoVisible);
      espadoPartida = "perdio";
      setTimeout(() => {
        reverlarBombas();
        campoVisible[i] = "explosion";
        pintarCampo(parseInt(tamanioCampo.value), campoVisible);
        perdio();
      }, 200);
    } else {
      const minas = obtenerNumeroMinas(i);
      campoVisible[i] = minas;
      if (minas === 0) {
        descubrirCasillasVecinas(i);
      }
      pintarCampo(parseInt(tamanioCampo.value), campoVisible);
      evaluarVictoria();
    }
  };

  const pintarCampo = (tamanio, campo) => {
    tablero.innerHTML = "";
    // referenciasCasillas = [];
    const pixelesExtras = tamanio * 2;
    const ancho = tablero.clientWidth;
    const alto = tablero.clientHeight;
    const anchoDisponible = ancho - pixelesExtras;
    const altoDisponible = alto - pixelesExtras;
    const anchoCasilla = anchoDisponible / tamanio;
    const altoCasilla = altoDisponible / tamanio;
    campo.forEach((elemento, i) => {
      tablero.innerHTML += `<div id="casilla-${i}" class="${
        Number.isInteger(elemento) ? "descubierto" : elemento
      }" style="width : ${anchoCasilla}px; height: ${altoCasilla}px; font-size :  ${
        altoCasilla - 5
      }px; line-height:  ${altoCasilla + 5}px" >${
        !Number.isInteger(elemento) ||
        (Number.isInteger(elemento) && elemento === 0)
          ? ""
          : elemento
      }</div>`;
      setTimeout(() => {
        document
          .querySelector(`#casilla-${i}`)
          .addEventListener("click", (evento) => {
            descubrirCasilla(i);
          });
      }, 100);
    });
  };

  const refrescarBotonBandera = () => {
    if (banderaSeleccionada) {
      seleccionarBandera.classList.add("active");
    } else {
      seleccionarBandera.classList.remove("active");
    }
  };

  const generarPartida = () => {
    espadoPartida = "";
    banderasUsadas = 0;
    banderas.innerHTML = bombrasCampo.value;
    banderasTotales = parseInt(bombrasCampo.value);
    tiempo = 0;
    campoLogico = generarCampo(
      parseInt(tamanioCampo.value),
      parseInt(bombrasCampo.value),
      true
    );
    campoVisible = generarCampo(
      parseInt(tamanioCampo.value),
      parseInt(bombrasCampo.value),
      false
    );
    pintarCampo(parseInt(tamanioCampo.value), campoVisible);
    banderaSeleccionada = false;
    colorMenu.style.backgroundColor = "#3ba9fd";
    imagenModal.src = "images/ancla.svg";
    finPartida.innerHTML=""
    refrescarBotonBandera();
    reiniciarReloj();
  };

  botonMenu.addEventListener("click", (evento) => {
    menu.classList.remove("ocultar-menu");
  });

  cerrarMenu.addEventListener("click", (evento) => {
    menu.classList.add("ocultar-menu");
  });

  seleccionarBandera.addEventListener("click", (evento) => {
    banderaSeleccionada = !banderaSeleccionada;
    refrescarBotonBandera();
  });

  jugar.addEventListener("click", (evento) => {
    const tamanioTablero = parseInt(tamanioCampo.value);
    const bombasTablero = parseInt(bombrasCampo.value);
    if (tamanioTablero < 5 || tamanioTablero > 15) {
      return;
    }
    if (
      bombasTablero < 1 ||
      bombasTablero > tamanioTablero * tamanioTablero - 1
    ) {
      return;
    }
    generarPartida();
    menu.classList.add("ocultar-menu");
  });

  generarPartida();
});
