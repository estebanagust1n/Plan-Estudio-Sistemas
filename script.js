let materiasAprobadas = JSON.parse(localStorage.getItem('aprobadas')) || [];

fetch('materias.json')
  .then(res => res.json())
  .then(materias => {
    const tramo1 = document.getElementById('tramo1');
    const tramo2 = document.getElementById('tramo2');
    const profesional1 = document.getElementById('profesional1');
    const profesional2 = document.getElementById('profesional2');
    const profesional3 = document.getElementById('profesional3');

    function actualizarVista() {
      tramo1.innerHTML = '';
      tramo2.innerHTML = '';
      profesional1.innerHTML = '';
      profesional2.innerHTML = '';
      profesional3.innerHTML = '';

      const materiasConNotas = [];

      materias.forEach((materia, index) => {
        const div = document.createElement('div');
        div.className = 'materia';

        const cumplidas = materia.requisitos.every(cor => materiasAprobadas.includes(cor));
        const aprobada = materiasAprobadas.includes(materia.codigo);
        const nota = localStorage.getItem(`nota-${materia.codigo}`) || '';

        // Aplicar estado visual
        if (aprobada) {
          div.classList.add('aprobada');
        } else if (cumplidas) {
          div.classList.add('habilitada');
        } else {
          div.classList.add('bloqueada');
        }

        div.innerHTML = `
          <div class="materia-header">
            <div class="nota-final">${nota || ''}</div>
            <div class="codigo">${materia.codigo}</div>
            <div class="horas">${materia.carga_horaria}</div>
          </div>
          <div class="nombre">${materia.nombre}</div>
        `;

        if (cumplidas || aprobada) {
          div.addEventListener('click', () => {
            if (!aprobada) {
              const nuevaNota = prompt(`Ingrese la nota final de ${materia.nombre} (4-10):`);
              const notaNum = parseInt(nuevaNota);
              if (!isNaN(notaNum) && notaNum >= 4 && notaNum <= 10) {
                materiasAprobadas.push(materia.codigo);
                localStorage.setItem(`nota-${materia.codigo}`, notaNum);
                localStorage.setItem('aprobadas', JSON.stringify(materiasAprobadas));
                actualizarVista();
              }
            } else {
              if (confirm(`¿Deseás desmarcar "${materia.nombre}" como aprobada?`)) {
                materiasAprobadas = materiasAprobadas.filter(c => c !== materia.codigo);
                localStorage.removeItem(`nota-${materia.codigo}`);
                localStorage.setItem('aprobadas', JSON.stringify(materiasAprobadas));
                actualizarVista();
              }
            }
          });
        }

        // Insertar en tramo correspondiente
        if (materia.tramo === "Primer tramo") tramo1.appendChild(div);
        else if (materia.tramo === "Segundo tramo") tramo2.appendChild(div);
        else {
          const i = index % 3;
          if (i === 0) profesional1.appendChild(div);
          else if (i === 1) profesional2.appendChild(div);
          else profesional3.appendChild(div);
        }

        if (aprobada && nota) materiasConNotas.push(parseFloat(nota));
      });

      // Resumen
      const total = materias.length;
      const aprobadas = materiasAprobadas.length;
      const porcentaje = ((aprobadas / total) * 100).toFixed(1);
      const promedio = materiasConNotas.length > 0
        ? (materiasConNotas.reduce((a, b) => a + b, 0) / materiasConNotas.length).toFixed(2)
        : '0.00';

      document.getElementById('stats-text').innerHTML = `${aprobadas} de ${total} materias aprobadas`;
      document.getElementById('promedio-text').innerHTML = `Promedio: ${promedio}`;
      document.getElementById('barra-progreso').style.width = `${porcentaje}%`;
    }

    actualizarVista();
  });

function exportarPDF() {
  const ventana = window.open('', '', 'width=800,height=600');
  ventana.document.write('<html><head><title>Resumen</title>');
  ventana.document.write('<style>body{font-family:sans-serif;padding:20px;}h1,h2{color:#e66900}</style>');
  ventana.document.write('</head><body>');
  ventana.document.write('<h1>Resumen de la Carrera</h1>');

  const stats = document.getElementById('stats-text').innerHTML;
  const promedio = document.getElementById('promedio-text').innerHTML;
  ventana.document.write(`<p>${stats}</p><p>${promedio}</p>`);

  ventana.document.write('<h2>Notas por materia</h2>');
  const aprobadas = JSON.parse(localStorage.getItem('aprobadas')) || [];
  aprobadas.forEach(codigo => {
    const nota = localStorage.getItem(`nota-${codigo}`) || 'Sin nota';
    ventana.document.write(`<p>${codigo}: ${nota}</p>`);
  });

  ventana.document.write('</body></html>');
  ventana.document.close();
  ventana.print();
}
