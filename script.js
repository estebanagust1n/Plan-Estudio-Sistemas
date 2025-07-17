let materias = [], aprobadas = JSON.parse(localStorage.getItem("aprobadas")||"{}");

fetch("materias.json")
  .then(r=>r.json()).then(d=>{
    materias=d;
    init();
  });

function init(){
  aplicarColumnas();
  renderMaterias();
  actualizarResumen();
}

function aplicarColumnas(){
  document.querySelectorAll(".columnas").forEach(c=>{
    let cols=+c.dataset.cols;
    c.style.setProperty("--cols", cols);
  });
}

function renderMaterias(){
  const conts = {
    1: document.querySelector("#primer-tramo .columnas"),
    2: document.querySelector("#segundo-tramo .columnas"),
    3: document.querySelector("#ciclo-profesional .columnas")
  };
  Object.values(conts).forEach(el=>el.innerHTML="");

  materias.forEach(m=>{
    const d=document.createElement("div"), inf=document.createElement("div"),
      inp=document.createElement("input"), cod=document.createElement("div"),
      cyc=document.createElement("div"), nom=document.createElement("div");
    d.className="materia";
    inf.className="info-superior";
    inp.className="nota-input"; inp.type="number"; inp.min=1; inp.max=10;
    inp.value=aprobadas[m.codigo]||"";
    cod.textContent=m.codigo; cyc.textContent=m.carga_horaria;
    nom.className="nombre-materia"; nom.textContent=m.nombre;

    inf.append(inp,cod,cyc); d.append(inf,nom);
    conts[m.tramo].append(d);

    const aprob = !!aprobadas[m.codigo];
    const habil = m.correlativas.every(c=>aprobadas[c]);

    if(aprob){d.classList.add("aprobada");}
    else if(habil){d.classList.add("habilitada");}
    else {d.classList.add("bloqueada"); d.classList.add("disabled");}

    if(!aprob && habil){
      d.addEventListener("click",()=> inp.focus());
    }

    inp.addEventListener("change", ()=>{
      const v=parseInt(inp.value);
      if(v>=1 && v<=10) {
        aprobadas[m.codigo]=v;
        d.classList.replace("habilitada","aprobada");
      } else { delete aprobadas[m.codigo]; d.classList.remove("aprobada"); }
      localStorage.setItem("aprobadas", JSON.stringify(aprobadas));
      actualizarResumen(); renderMaterias();
    });
  });
}

function actualizarResumen(){
  const ap = Object.keys(aprobadas);
  const prom = ap.length ? (ap.reduce((sum,c)=>sum+aprobadas[c],0)/ap.length).toFixed(2):"0.00";
  const avance = ((ap.length/materias.length)*100).toFixed(1);
  document.getElementById("promedio").textContent=`Promedio: ${prom}`;
  document.getElementById("avance").textContent=`${ap.length} materias aprobadas — Avance: ${avance}%`;
  const ex = document.getElementById("exportacion"); ex.innerHTML="";
  ap.forEach(c=>{
    const m=materias.find(x=>x.codigo===c);
    ex.innerHTML+=`<div>${m.nombre}: ${aprobadas[c]}</div>`;
  });
}

function exportarResumen(){
  html2canvas(document.body).then(c=> {
    const a=document.createElement("a");
    a.download="resumen.png"; a.href=c.toDataURL(); a.click();
  });
}
