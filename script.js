let materias = [];
let materiasAprobadas = {};

fetch("materias.json")
  .then((res) => res.json())
  .then((data) => {
    materias = data;
    renderizarMaterias();
  });

function renderizarMaterias() {
  const tramos = {
    "Primer tramo": document.querySelector("#primer-tramo .columnas"),
    "Segundo tramo": document.querySelector("#segundo-tramo .columnas"),
    "Ciclo Profesional": document.querySelector("#ciclo-profesional .columnas"),
  };

  Object.entries(tramos).forEach(([tramo, contenedor]) => {
    const materiasTramo = materias.filter((m) => m.tramo === tramo);
    const columnas = parseInt(contenedor.getAttribute("data-cols")) || 1;
    const materiasPorColumna = Math.ceil(materiasTramo.length / columnas);

    for (let i = 0; i < columnas; i++) {
      const col = document.createElement("div");
      col.classList.add("columna");
      contenedor.appendChild(col);
    }

    materiasTramo.forEach((materia, index) => {
      const card = crearCardMateria(materia);
      const columna = contenedor.children[Math.floor(index / materiasPorColumna)];
      columna.appendChild(card);
    });
  });

  actualizarResumen();
}

function crearCardMateria(materia) {
  const div = document.createElement("div");
  div.className = "materia bloqueada";
  div.dataset.codigo = materia.codigo;

  const notaInput = document.createElement("input");
  notaInput.className = "nota";
  notaInput.type = "text";
  notaInput.maxLength = 2;

  const nombre = document.createElement("div");
  nombre.textContent = materia.nombre;

  const codigo = document.createElement("div");
  codigo.style.fontSize = "12px";
  codigo.textContent = materia.codigo;

  div.appendChild(notaInput);
  div.appendChild(codigo);
  div.appendChild(nombre);

  div.addEventListener("click", () => {
    if (div.classList.contains("bloqueada")) return;

    const aprobada = div.classList.toggle("aprobada");

    if (aprobada) {
      notaInput.style.display = "inline-block";
      notaInput.focus();
    } else {
      notaInput.value = "";
      notaInput.style.display = "none";
    }

    materiasAprobadas[materia.codigo] = aprobada;
    actualizarHabilitadas();
    actualizarResumen();
  });

  return div;
}

function actualizarHabilitadas() {
  document.querySelectorAll(".materia").forEach((el) => {
    const codigo = el.dataset.codigo;
    const materia = materias.find((m) => m.codigo === codigo);
    const requisitos = materia.requisitos || [];

    if (materiasAprobadas[codigo]) {
      el.classList.remove("bloqueada");
      el.classList.add("aprobada");
    } else if (requisitos.every((r) => materiasAprobadas[r])) {
      el.classList.remove("bloqueada");
      el.classList.remove("aprobada");
      el.classList.add("habilitada");
    } else {
      el.classList.remove("aprobada", "habilitada");
      el.classList.add("bloqueada");
    }
  });
}

function actualizarResumen() {
  const aprobadas = Object.values(materiasAprobadas).filter(Boolean).length;
  const total = materias.length;
  const porcentaje = Math.round((aprobadas / total) * 100);
  document.getElementById(
    "info-materias"
  ).textContent = `Aprobadas: ${aprobadas}/${total} – ${porcentaje}% completado`;
}
