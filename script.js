let materias = [];
let aprobadas = 0;
let sumaNotas = 0;

async function cargarMaterias() {
  const res = await fetch("materias.json");
  materias = await res.json();
  renderizarMaterias();
}

function renderizarMaterias() {
  const porTramo = {
    1: document.getElementById("columnas-primer"),
    2: document.getElementById("columnas-segundo"),
    3: document.getElementById("columnas-ciclo")
  };

  for (let tramo = 1; tramo <= 3; tramo++) {
    const materiasTramo = materias.filter(m => m.tramo === tramo);
    for (let i = 0; i < materiasTramo.length; i += 6) {
      const columna = document.createElement("div");
      columna.className = "columna";
      materiasTramo.slice(i, i + 6).forEach(m => {
        const tarjeta = crearTarjeta(m);
        columna.appendChild(tarjeta);
      });
      porTramo[tramo].appendChild(columna);
    }
  }
  actualizarEstadoCorrelativas();
}

function crearTarjeta(materia) {
  const div = document.createElement("div");
  div.className = "materia";
  div.id = `materia-${materia.codigo}`;

  const inputNota = document.createElement("input");
  inputNota.type = "number";
  inputNota.min = 4;
  inputNota.max = 10;
  inputNota.className = "nota-input";
  inputNota.placeholder = "-";
  inputNota.disabled = true;

  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "check-aprobada";
  check.onchange = () => {
    inputNota.disabled = !check.checked;
    if (!check.checked) {
      inputNota.value = "";
    }
    actualizarResumen();
    actualizarEstadoCorrelativas();
  };

  const label = document.createElement("label");
  label.textContent = materia.nombre;
  label.className = "nombre-materia";

  div.appendChild(inputNota);
  div.appendChild(check);
  div.appendChild(label);

  return div;
}

function actualizarResumen() {
  const todas = document.querySelectorAll(".materia");
  aprobadas = 0;
  sumaNotas = 0;

  todas.forEach(m => {
    const check = m.querySelector(".check-aprobada");
    const notaInput = m.querySelector(".nota-input");

    if (check.checked && notaInput.value >= 4) {
      aprobadas++;
      sumaNotas += parseFloat(notaInput.value);
      m.classList.add("aprobada");
    } else {
      m.classList.remove("aprobada");
    }
  });

  const porcentaje = Math.round((aprobadas / materias.length) * 100);
  const promedio = aprobadas > 0 ? (sumaNotas / aprobadas).toFixed(2) : "0.00";

  document.getElementById("avance").textContent = `${aprobadas} materias aprobadas — Avance: ${porcentaje}%`;
  document.getElementById("promedio").textContent = `Promedio: ${promedio}`;
}

function actualizarEstadoCorrelativas() {
  materias.forEach(m => {
    const tarjeta = document.getElementById(`materia-${m.codigo}`);
    const check = tarjeta.querySelector(".check-aprobada");
    const nota = tarjeta.querySelector(".nota-input");

    const habilitada = m.correlativas.every(cod => {
      const corr = document.getElementById(`materia-${cod}`);
      return corr && corr.querySelector(".check-aprobada").checked;
    });

    if (!habilitada) {
      tarjeta.classList.add("bloqueada");
      check.disabled = true;
      nota.disabled = true;
    } else {
      tarjeta.classList.remove("bloqueada");
      check.disabled = false;
    }
  });
}

function exportarResumen() {
  window.print();
}

cargarMaterias();
