let materias = [];

async function cargarMaterias() {
  const response = await fetch("materias.json");
  materias = await response.json();
  renderizarMaterias();
  actualizarResumen();
}

function renderizarMaterias() {
  const tramos = {
    "Primer tramo": document.querySelector("#primer-tramo .columnas"),
    "Segundo tramo": document.querySelector("#segundo-tramo .columnas"),
    "Ciclo Profesional": document.querySelector("#ciclo-profesional .columnas")
  };

  Object.values(tramos).forEach(col => col.innerHTML = "");

  const columnasProfesional = [[], [], []];

  materias.forEach((materia, index) => {
    const div = document.createElement("div");
    div.className = "materia";
    div.dataset.codigo = materia.codigo;

    const aprobada = materia.aprobada;
    const nota = materia.nota || "";

    if (aprobada) div.classList.add("aprobada");
    else if (materia.requisitos.length === 0 || materia.requisitos.every(codigo => obtenerMateria(codigo)?.aprobada))
      div.classList.add("habilitada");
    else div.classList.add("no-habilitada");

    div.innerHTML = `
      <div class="nota">${aprobada ? `Nota: ${nota}` : ""}</div>
      <strong>${materia.nombre}</strong>
      <span>${materia.codigo} - ${materia.carga_horaria}</span>
    `;

    div.onclick = () => {
      if (!div.classList.contains("habilitada") && !div.classList.contains("aprobada")) return;

      if (!div.classList.contains("aprobada")) {
        const nota = prompt("Ingresá la nota (1 a 10):");
        if (nota && !isNaN(nota) && nota >= 1 && nota <= 10) {
          materia.aprobada = true;
          materia.nota = nota;
        }
      } else {
        materia.aprobada = false;
        materia.nota = null;
      }

      renderizarMaterias();
      actualizarResumen();
    };

    if (materia.tramo === "Ciclo Profesional") {
      const colIndex = Math.floor(columnasProfesional.flat().length / 6);
      if (colIndex < 3) columnasProfesional[colIndex].push(div);
    } else {
      tramos[materia.tramo].appendChild(div);
    }
  });

  columnasProfesional.forEach((grupo, i) => {
    const contenedor = document.createElement("div");
    contenedor.style.display = "flex";
    contenedor.style.flexDirection = "column";
    grupo.forEach(m => contenedor.appendChild(m));
    tramos["Ciclo Profesional"].appendChild(contenedor);
  });
}

function obtenerMateria(codigo) {
  return materias.find(m => m.codigo === codigo);
}

function actualizarResumen() {
  const total = materias.length;
  const aprobadas = materias.filter(m => m.aprobada).length;
  const faltan = total - aprobadas;
  const promedio = materias.filter(m => m.aprobada).reduce((s, m) => s + Number(m.nota), 0) / (aprobadas || 1);
  const porcentaje = Math.round((aprobadas / total) * 100);

  document.getElementById("resumen-aprobadas").textContent = aprobadas;
  document.getElementById("resumen-faltan").textContent = faltan;
  document.getElementById("resumen-promedio").textContent = promedio.toFixed(2);
  document.getElementById("resumen-porcentaje").textContent = porcentaje + "%";
}

function exportarPDF() {
  window.print();
}

document.addEventListener("DOMContentLoaded", cargarMaterias);
