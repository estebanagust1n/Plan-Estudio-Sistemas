let materias = [];
let aprobadas = JSON.parse(localStorage.getItem("aprobadas") || "{}");

fetch("materias.json")
  .then((res) => res.json())
  .then((data) => {
    materias = data;
    renderMaterias();
    actualizarResumen();
  });

function renderMaterias() {
  const primer = document.querySelector("#primer-tramo .columnas");
  const segundo = document.querySelector("#segundo-tramo .columnas");
  const ciclo = document.querySelector("#ciclo-profesional .columnas");

  primer.innerHTML = segundo.innerHTML = ciclo.innerHTML = "";

  materias.forEach((m) => {
    const div = document.createElement("div");
    div.className = "materia";
    div.textContent = m.nombre;
    div.dataset.codigo = m.codigo;

    if (aprobadas[m.codigo]) {
      div.classList.add("aprobada");
      div.textContent += ` (${aprobadas[m.codigo]})`;
    } else if (m.correlativas.every((c) => aprobadas[c])) {
      div.classList.add("habilitada");
    }

    // Hover: resaltar correlativas
    div.addEventListener("mouseenter", () => {
      m.correlativas.forEach((codigo) => {
        const correlativa = document.querySelector(`[data-codigo="${codigo}"]`);
        if (correlativa && !aprobadas[codigo]) {
          correlativa.classList.add("resaltada");
        }
      });
    });

    div.addEventListener("mouseleave", () => {
      document.querySelectorAll(".resaltada").forEach((el) => {
        el.classList.remove("resaltada");
      });
    });

    // Click: aprobar/desaprobar
    div.onclick = () => toggleAprobada(m.codigo);

    if (m.tramo === 1) primer.appendChild(div);
    else if (m.tramo === 2) segundo.appendChild(div);
    else ciclo.appendChild(div);
  });
}

function toggleAprobada(codigo) {
  if (aprobadas[codigo]) {
    delete aprobadas[codigo];
  } else {
    const nota = prompt("Ingrese la nota final (1 a 10):");
    const num = Number(nota);
    if (!nota || isNaN(num) || num < 1 || num > 10) return;
    aprobadas[codigo] = num;
  }
  localStorage.setItem("aprobadas", JSON.stringify(aprobadas));
  renderMaterias();
  actualizarResumen();
}

function actualizarResumen() {
  const total = materias.length;
  const aprobadasList = Object.keys(aprobadas);
  const cantAprobadas = aprobadasList.length;
  const avance = ((cantAprobadas / total) * 100).toFixed(1);

  const notas = aprobadasList.map((codigo) => aprobadas[codigo]);
  const promedio =
    notas.length > 0
      ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)
      : "0.00";

  document.getElementById("avance").textContent = `${cantAprobadas} materias aprobadas — Avance: ${avance}%`;
  document.getElementById("promedio").textContent = `Promedio: ${promedio}`;

  const exportacion = document.getElementById("exportacion");
  exportacion.innerHTML = "";
  aprobadasList.forEach((codigo) => {
    const materia = materias.find((m) => m.codigo === codigo);
    const div = document.createElement("div");
    div.textContent = `${materia.nombre}: ${aprobadas[codigo]}`;
    exportacion.appendChild(div);
  });
}

function exportarResumen() {
  html2canvas(document.body).then((canvas) => {
    const link = document.createElement("a");
    link.download = "resumen.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}
