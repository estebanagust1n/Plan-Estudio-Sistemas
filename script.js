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
    div.dataset.codigo = m.codigo;

    // Agregar contenido interno
    const infoSup = document.createElement("div");
    infoSup.className = "info-superior";

    // Nota (editable input)
    const notaBox = document.createElement("div");
    const notaInput = document.createElement("input");
    notaInput.className = "nota-input";
    notaInput.placeholder = "Nota";
    notaInput.value = aprobadas[m.codigo] || "";
    notaInput.addEventListener("change", () => {
      const nota = parseInt(notaInput.value);
      if (!isNaN(nota) && nota >= 1 && nota <= 10) {
        aprobadas[m.codigo] = nota;
      } else {
        delete aprobadas[m.codigo];
        notaInput.value = "";
      }
      localStorage.setItem("aprobadas", JSON.stringify(aprobadas));
      renderMaterias();
      actualizarResumen();
    });
    notaBox.appendChild(notaInput);

    // Código
    const codigoBox = document.createElement("div");
    codigoBox.textContent = m.codigo;

    // Carga horaria
    const cargaBox = document.createElement("div");
    cargaBox.textContent = m.carga_horaria;

    infoSup.appendChild(notaBox);
    infoSup.appendChild(codigoBox);
    infoSup.appendChild(cargaBox);

    const nombreDiv = document.createElement("div");
    nombreDiv.className = "nombre-materia";
    nombreDiv.textContent = m.nombre;

    div.appendChild(infoSup);
    div.appendChild(nombreDiv);

    // Colores según estado
    if (aprobadas[m.codigo]) {
      div.classList.add("aprobada");
    } else if (m.correlativas.every((c) => aprobadas[c])) {
      div.classList.add("habilitada");
    } else {
      div.classList.add("bloqueada");
    }

    // Hover para resaltar correlativas
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

    // Insertar según tramo
    if (m.tramo === 1) primer.appendChild(div);
    else if (m.tramo === 2) segundo.appendChild(div);
    else ciclo.appendChild(div);
  });
}

function actualizarResumen() {
  const total = materias.length;
  const aprobadasList = Object.keys(aprobadas);
  const cantAprobadas = aprobadasList.length;
  const avance = ((cantAprobadas / total) * 100).toFixed(1);

  const notas = aprobadasList.map((codigo) => Number(aprobadas[codigo]));
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
