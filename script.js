let materiasAprobadas = JSON.parse(localStorage.getItem('aprobadas')) || [];

fetch('materias.json')
  .then(res => res.json())
  .then(materias => {
    const tramo1 = document.getElementById('tramo1');
    const tramo2 = document.getElementById('tramo2');
    const profesional = document.getElementById('profesional');

    function actualizarVista() {
      tramo1.innerHTML = '';
      tramo2.innerHTML = '';
      profesional.innerHTML = '';

      materias.forEach(materia => {
        const div = document.createElement('div');
        div.className = 'materia';

        const cumplidas = materia.requisitos.every(cor => materiasAprobadas.includes(cor));
        const aprobada = materiasAprobadas.includes(materia.codigo);

        // Aplicar clases según estado
        if (aprobada) {
          div.classList.add('aprobada');
        } else if (cumplidas) {
          div.classList.add('habilitada');
        } else {
          div.classList.add('bloqueada');
        }

        div.innerHTML = `
          <div class="codigo"><strong>${materia.codigo}</strong></div>
          <div>${materia.nombre}</div>
          <div>${materia.carga_horaria}</div>
          <div class="vinculo">${materia.requisitos.length > 0 ? 'Req: ' + materia.requisitos.join(', ') : 'Sin correlativas'}</div>
        `;

        // Hacer clic para marcar como aprobada
        if (cumplidas || aprobada) {
          div.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') return;

            if (aprobada) {
              materiasAprobadas = materiasAprobadas.filter(c => c !== materia.codigo);
              localStorage.removeItem(`nota-${materia.codigo}`);
            } else {
              materiasAprobadas.push(materia.codigo);
            }

            localStorage.setItem('aprobadas', JSON.stringify(materiasAprobadas));
            actualizarVista();
          });
        }

        // Campo para nota
        if (aprobada) {
          const nota = localStorage.getItem(`nota-${materia.codigo}`) || '';
          const input = document.createElement('input');
          input.type = 'number';
          input.min = 4;
          input.max = 10;
          input.value = nota;
          input.placeholder = 'Nota';
          input.addEventListener('change', () => {
            localStorage.setItem(`nota-${materia.codigo}`, input.value);
          });
          div.appendChild(input);
        }

        // Agregar materia a su tramo
        if (materia.tramo === "Primer tramo") tramo1.appendChild(div);
        else if (materia.tramo === "Segundo tramo") tramo2.appendChild(div);
        else profesional.appendChild(div);
      });

      // Resumen
      const total = materias.length;
      const aprobadas = materiasAprobadas.length;
      const porcentaje = ((aprobadas / total) * 100).toFixed(1);

      document.getElementById('stats-text').innerHTML = `
        <p><strong>${aprobadas}</strong> materias aprobadas de <strong>${total}</strong> – Avance: <strong>${porcentaje}%</strong></p>
      `;
      document.getElementById('barra-progreso').style.width = `${porcentaje}%`;
    }

    actualizarVista();
  })
  .catch(error => {
    console.error("Error al cargar materias:", error);
  });


// ✅ Exportar PDF limpio
function exportarPDF() {
  const ventana = window.open('', '', 'width=800,height=600');
  ventana.document.write('<html><head><title>Resumen</title>');
  ventana.document.write('<style>body{font-family:sans-serif;padding:20px;}h1,h2{color:#e66900}</style>');
  ventana.document.write('</head><body>');
  ventana.document.write('<h1>Resumen de la Carrera</h1>');

  const stats = document.getElementById('stats-text').innerHTML;
  ventana.document.write(`<div>${stats}</div>`);

  ventana.document.write('<h2>Notas por materia</h2>');
  materiasAprobadas.forEach(codigo => {
    const nota = localStorage.getItem(`nota-${codigo}`) || 'Sin nota';
    ventana.document.write(`<p>${codigo}: ${nota}</p>`);
  });

  ventana.document.write('</body></html>');
  ventana.document.close();
  ventana.print();
}
