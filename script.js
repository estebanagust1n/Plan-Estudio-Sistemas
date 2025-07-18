let materias = [];
let aprobadas = [];

fetch("materias.json")
  .then(res => res.json())
  .then(data => {
    materias = data;
    renderMaterias();
  });

function renderMaterias() {
  const tramos = {
    "Primer tramo": document.querySelector("#primer-tramo .columnas"),
    "Segundo tramo": document.querySelector("#segundo-tramo .columnas"),
    "Ciclo Profesional": document.querySelector("#ciclo-profesional .columnas")
  };

  Object.values(tramos).forEach(div => div.innerHTML = "");

  const porTramo = {
    "Primer tramo": [],
    "Segundo tramo": [],
    "Ciclo Profesional": []
  };

  materias.forEach(m => porTramo[m.tramo].push(m));

  for (let tramo in porTramo) {
    const container = tramos[tramo];
    const grupos = chunkArray(porTramo[tramo], 6);

    grupos.forEach(grupo => {
      const col = document.createElement("div");
      col.classList.add("columna");

      grupo.forEach(materia => {
        const card = document.createElement("div");
        card.classList.add("materia");

        const estaAprobada = aprobadas.some(a => a.codigo === materia.codigo);
        const habilitada = checkHabilitada(materia);

        if (estaAprobada) card.classList.add("aprobada");
        else if (!habilitada) card.classList.add("bloqueada");
        else card.classList.add("habilitada");

        const nota = document.createElement("div");
        nota.className = "nota";
        nota.textContent = estaAprobada
          ? aprobadas.find(a => a.codigo === materia.codigo).nota
          : "";

        const nombre = document.createElement("div");
        nombre.textContent = materia.nombre;

        const info = document.createElement("div");
        info.className = "info";
        info.textContent = `${materia.codigo} — ${materia.carga_horaria}`;

        card.appendChild(nota);
        card.appendChild(nombre);
        card.appendChild(info);

        card.addEventListener("click", () => {
          if (!checkHabilitada(materia)) return;

          if (!estaAprobada) {
            const notaIngresada = prompt(`Ingrese nota para ${materia.nombre}:`);
            const notaNum = parseFloat(notaIngresada);
            if (!isNaN(notaNum) && notaNum >= 4 && notaNum <= 10) {
              aprobadas.push({ codigo: materia.codigo, nota: notaNum });
            }
          } else {
            aprobadas = aprobadas.filter(a => a.codigo !== materia.codigo);
          }

          renderMaterias();
          actualizarResumen();
        });

        col.appendChild(card);
      });

      container.appendChild(col);
    });
  }

  actualizarResumen();
}

function chunkArray(arr, size) {
  const resultado = [];
  for (let i = 0; i < arr.length; i += size) {
    resultado.push(arr.slice(i, i + size));
  }
  return resultado;
}

function checkHabilitada(materia) {
  if (!materia.requisitos || materia.requisitos.length === 0) return true;
  return materia.requisitos.every(req =>
    aprobadas.some(a => a.codigo === req)
  );
}

function actualizarResumen() {
  const cantidad = aprobadas.length;
  const total = materias.length;
  const promedio =
    aprobadas.reduce((acc, m) => acc + m.nota, 0) / (cantidad || 1);

  document.getElementById("avance").textContent = `${cantidad} materias aprobadas — Avance: ${Math.round(
    (cantidad / total) * 100
  )}%`;
  document.getElementById("promedio").textContent = `Promedio: ${promedio.toFixed(
    2
  )}`;
}

function exportarResumen() {
  window.print();
}
