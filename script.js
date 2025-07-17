let materias = [];
let estado = JSON.parse(localStorage.getItem('estadoMaterias')) || {};

fetch('materias.json')
  .then(res => res.json())
  .then(data => {
    materias = data;
    renderMaterias();
    actualizarResumen();
  });

function renderMaterias() {
  const container = document.getElementById("materias-container");
  container.innerHTML = "";

  materias.forEach(mat => {
    const div = document.createElement("div");
    div.className = "materia";
    div.textContent = mat.nombre;
    div.dataset.codigo = mat.codigo;

    if (estado[mat.codigo]) {
      div.classList.add("aprobada");
      div.dataset.nota = estado[mat.codigo];
    } else if (puedeCursarse(mat)) {
      div.classList.add("habilitada");
    }

    div.addEventListener("click", () => toggleAprobada(mat, div));
    div.addEventListener("mouseover", () => resaltarRequisitos(mat.codigo, true));
    div.addEventListener("mouseout", () => resaltarRequisitos(mat.codigo, false));

    container.appendChild(div);
  });
}

function puedeCursarse(materia) {
  return !estado[materia.codigo] && materia.correlativas.every(c => estado[c]);
}

function toggleAprobada(materia, div) {
  if (estado[materia.codigo]) {
    delete estado[materia.codigo];
  } else if (puedeCursarse(materia)) {
    const nota = prompt("Ingrese la nota final de la materia:");
    if (nota) estado[materia.codigo] = parseFloat(nota);
  }
  localStorage.setItem('estadoMaterias', JSON.stringify(estado));
  renderMaterias();
  actualizarResumen();
}

function actualizarResumen() {
  const aprobadas = Object.keys(estado);
  const porcentaje = ((aprobadas.length / materias.length) * 100).toFixed(1);
  const promedio = aprobadas.length
    ? (Object.values(estado).reduce((a,b)=>a+b,0) / aprobadas.length).toFixed(2)
    : "0.00";

  document.getElementById("estado-avance").textContent =
    `${aprobadas.length} materias aprobadas — Avance: ${porcentaje}%`;
  document.getElementById("estado-promedio").textContent =
    `Promedio: ${promedio}`;

  document.querySelector("#barra-avance > div").style.width = `${porcentaje}%`;

  document.getElementById("detalle-aprobadas").innerHTML =
    aprobadas.map(c => {
      const m = materias.find(m => m.codigo === c);
      return `<p>${m.nombre}: ${estado[c]}</p>`;
    }).join("");
}

function resaltarRequisitos(codigo, activar) {
  materias.forEach(mat => {
    if (mat.correlativas.includes(codigo)) {
      const div = document.querySelector(`.materia[data-codigo="${mat.codigo}"]`);
      if (div) div.classList.toggle("requerida", activar);
    }
  });
}

document.getElementById("btn-exportar").addEventListener("click", () => {
  html2canvas(document.body).then(canvas => {
    const link = document.createElement('a');
    link.download = 'resumen.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});
