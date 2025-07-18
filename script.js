fetch("materias.json")
  .then(res => res.json())
  .then(data => {
    const primer = document.getElementById("primer-tramo");
    const segundo = document.getElementById("segundo-tramo");
    const profesional = document.getElementById("ciclo-profesional");

    const totales = data.length;
    let aprobadas = 0;
    let sumaNotas = 0;

    const cols = { "Primer tramo": [], "Segundo tramo": [], "Ciclo Profesional": [] };

    data.forEach(m => {
      const card = document.createElement("div");
      card.className = "card";

      const nota = Math.random() > 0.5 ? (6 + Math.floor(Math.random() * 5)) : null;
      if (nota) {
        aprobadas++;
        sumaNotas += nota;
      }

      if (nota) {
        const notaTag = document.createElement("div");
        notaTag.className = "nota";
        notaTag.innerText = `Nota: ${nota}`;
        card.appendChild(notaTag);
      }

      card.innerHTML += `<strong>${m.nombre}</strong><br><small>${m.codigo} - ${m.carga_horaria}</small>`;

      cols[m.tramo].push(card);
    });

    // Agrupamos en columnas de 6
    const insertarEn = (target, cards) => {
      for (let i = 0; i < cards.length; i += 6) {
        const col = document.createElement("div");
        col.style.display = "flex";
        col.style.flexDirection = "column";
        col.style.gap = "10px";
        col.append(...cards.slice(i, i + 6));
        target.appendChild(col);
      }
    };

    insertarEn(primer, cols["Primer tramo"]);
    insertarEn(segundo, cols["Segundo tramo"]);
    insertarEn(profesional, cols["Ciclo Profesional"]);

    // Actualizar resumen
    document.getElementById("aprobadas").innerText = aprobadas;
    document.getElementById("promedio").innerText = (aprobadas ? (sumaNotas / aprobadas).toFixed(2) : "0.00");
    document.getElementById("barra-progreso").style.width = `${(aprobadas / totales) * 100}%`;
  });

// Exportar como PDF
document.getElementById("exportar").addEventListener("click", () => {
  window.print();
});
