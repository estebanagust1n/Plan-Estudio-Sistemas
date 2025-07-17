document.addEventListener("DOMContentLoaded", function () {
  fetch("materias.json")
    .then((res) => res.json())
    .then((materias) => inicializar(materias));
});

let materiasAprobadas = [];

function inicializar(materias) {
  const contenedor = document.getElementById("plan-estudios");
  const listaAprobadas = document.getElementById("materias-aprobadas-lista");

  materias.forEach((materia) => {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("materia");
    tarjeta.dataset.codigo = materia.codigo;

    // Header con nota, código y carga horaria
    const header = document.createElement("div");
    header.classList.add("materia-header");

    const nota = document.createElement("span");
    nota.classList.add("nota");
    nota.textContent = materia.nota || "-";

    const codigo = document.createElement("span");
    codigo.classList.add("codigo");
    codigo.textContent = materia.codigo;

    const carga = document.createElement("span");
    carga.classList.add("carga-horaria");
    carga.textContent = materia.carga_horaria;

    header.append(nota, codigo, carga);

    // Nombre centrado
    const nombre = document.createElement("div");
    nombre.classList.add("nombre");
    nombre.textContent = materia.nombre;

    tarjeta.append(header, nombre);

    // Estado inicial
    tarjeta.classList.add("inhabilitada");
    tarjeta.addEventListener("click", () => toggleAprobada(tarjeta, materia, listaAprobadas));

    contenedor.appendChild(tarjeta);
  });

  actualizarEstados(materias);
}

function toggleAprobada(tarjeta, materia, lista) {
  const yaAprobada = materiasAprobadas.includes(materia.codigo);

  if (yaAprobada) {
    materiasAprobadas = materiasAprobadas.filter((c) => c !== materia.codigo);
    tarjeta.classList.remove("aprobada");
  } else {
    materiasAprobadas.push(materia.codigo);
    tarjeta.classList.add("aprobada");
  }

  actualizarResumen(lista);
  actualizarEstados();
}

function actualizarResumen(lista) {
  lista.innerHTML = "";
  materiasAprobadas.forEach((codigo) => {
    const div = document.createElement("div");
    const materia = document.querySelector(`[data-codigo="${codigo}"]`);
    const nombre = materia.querySelector(".nombre").textContent;
    const nota = materia.querySelector(".nota").textContent;
    div.textContent = `${nombre} — Nota: ${nota}`;
    lista.appendChild(div);
  });

  document.getElementById("total-aprobadas").textContent = materiasAprobadas.length;
}

function actualizarEstados() {
  const tarjetas = document.querySelectorAll(".materia");
  tarjetas.forEach((tarjeta) => {
    const codigo = tarjeta.dataset.codigo;
    if (materiasAprobadas.includes(codigo)) {
      tarjeta.classList.remove("inhabilitada");
      tarjeta.classList.add("aprobada");
    } else {
      tarjeta.classList.remove("aprobada");
      tarjeta.classList.add("inhabilitada");
    }
  });
}

// Exportar pantalla a PDF
document.getElementById("exportar-pdf").addEventListener("click", () => {
  html2canvas(document.body).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("plan-estudios.pdf");
  });
});
