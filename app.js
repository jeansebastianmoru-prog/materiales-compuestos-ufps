/* Materiales compuestos · sitio interactivo
   Jean Morales (1193641) · Jhostyn Blanco (1981490) · UFPS */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const fmt = (n, d = 1) => n.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });

/* ---------- Menú móvil y barra de progreso ---------- */
const menuBtn = $('.menu-btn');
const nav = $('.topnav nav');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
$$('.topnav nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

const bar = $('.progress-bar');
const sections = $$('main section, body > section');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  $$('.topnav nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}, { passive: true });

/* ---------- Aparición al hacer scroll ---------- */
$$('.block > *').forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    if (e.target.id === 'bars') animateBars();
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
$$('.reveal').forEach(el => io.observe(el));

/* ---------- Tarjetas que giran ---------- */
$$('.flip').forEach(card => card.addEventListener('click', () => {
  card.setAttribute('aria-pressed', card.getAttribute('aria-pressed') !== 'true');
}));

/* ---------- Pestañas de clasificación ---------- */
$$('.tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
  $$('.tab-panel').forEach(p => p.classList.remove('active'));
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
  $('#tab-' + tab.dataset.tab).classList.add('active');
}));

/* ---------- Orientación de la fibra ---------- */
const line = (x1, y1, x2, y2, c = '#AA1916') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`;
const ORIENT = {
  ud: {
    title: 'Unidireccional (0°)', tag: 'Anisótropo', long: 100, trans: 6,
    text: 'Todas las fibras en el mismo eje: máxima rigidez y resistencia a lo largo de la fibra, pero muy baja en sentido transversal.',
    svg: [30, 65, 100, 135, 160].map(y => line(20, y, 280, y)).join('')
  },
  woven: {
    title: 'Tejido bidireccional (0°/90°)', tag: 'Ortótropo', long: 55, trans: 55,
    text: 'Fibras tejidas en dos direcciones: buen equilibrio en ambos ejes, a costa de perder parte de la rigidez máxima.',
    svg: [40, 90, 140].map(y => line(20, y, 280, y)).join('') + [60, 120, 180, 240].map(x => line(x, 15, x, 165, '#6D6E70')).join('')
  },
  random: {
    title: 'Fibras aleatorias (mat)', tag: 'Casi isótropo en el plano', long: 30, trans: 30,
    text: 'Fibras cortas orientadas al azar: el material se comporta casi igual en todas las direcciones del plano, pero con menor resistencia.',
    svg: [[30,30,110,70],[150,20,120,100],[190,40,270,30],[40,140,100,105],[160,160,230,100],[240,150,280,80],[60,60,70,150],[200,120,250,165]].map(a => line(...a)).join('')
  },
  lam: {
    title: 'Laminado cuasi-isótropo (0/±45/90)', tag: 'Diseñado para varias cargas', long: 45, trans: 45,
    text: 'Capas apiladas con distintos ángulos para soportar cargas en varias direcciones, como en las alas de un avión.',
    svg: `<rect x="20" y="20" width="260" height="30" fill="#AA1916"/><rect x="20" y="58" width="260" height="30" fill="#C9605A"/><rect x="20" y="96" width="260" height="30" fill="#6D6E70"/><rect x="20" y="134" width="260" height="30" fill="#AA1916"/>
      <g font-family="Arial" font-size="14" fill="#fff" font-weight="700"><text x="30" y="40">0°</text><text x="30" y="78">+45°</text><text x="30" y="116">90°</text><text x="30" y="154">−45°</text></g>`
  }
};
function setOrient(key) {
  const o = ORIENT[key];
  $('#orient-svg').innerHTML = o.svg;
  $('#orient-title').textContent = o.title;
  $('#orient-text').textContent = o.text;
  $('#orient-tag').textContent = o.tag;
  $('#m-long').style.width = o.long + '%';
  $('#m-trans').style.width = o.trans + '%';
  $$('.opt').forEach(b => b.classList.toggle('active', b.dataset.o === key));
}
$$('.opt').forEach(b => b.addEventListener('click', () => setOrient(b.dataset.o)));
setOrient('ud');

/* ---------- Barras de rigidez específica ---------- */
function animateBars() {
  $$('.bar-row').forEach(r => { $('.bar', r).style.width = (r.dataset.v / 128) * 100 + '%'; });
}

/* ---------- Calculadora: regla de las mezclas ---------- */
const FIBERS = { carbon: { n: 'carbono', E: 230, rho: 1.8 }, glass: { n: 'vidrio E', E: 72, rho: 2.58 }, aramid: { n: 'aramida', E: 131, rho: 1.44 } };
const MATRICES = { epoxy: { n: 'epoxi', E: 3.4, rho: 1.2 }, polyester: { n: 'poliéster', E: 3.0, rho: 1.25 } };
const STEEL = 207 / 7.85;

function calc() {
  const f = FIBERS[$('#c-fiber').value];
  const m = MATRICES[$('#c-matrix').value];
  const vf = parseFloat($('#c-vf').value);
  const vm = 1 - vf;
  const ecl = m.E * vm + f.E * vf;
  const ect = 1 / (vm / m.E + vf / f.E);
  const rho = m.rho * vm + f.rho * vf;
  const ratio = (f.E * vf) / (m.E * vm);
  const load = ratio / (1 + ratio) * 100;
  const spec = ecl / rho;
  const vs = spec / STEEL;

  $('#c-vf-out').textContent = fmt(vf, 2);
  $('#r-ecl').textContent = fmt(ecl);
  $('#r-ect').textContent = fmt(ect);
  $('#r-rho').textContent = fmt(rho, 2);
  $('#r-load').textContent = fmt(load, 0) + ' %';
  $('#r-vs').textContent = fmt(vs) + '×';
  $('#r-vs-lbl').textContent = `rigidez específica frente al acero: ${fmt(spec)} vs ${fmt(STEEL)} GPa·cm³/g`;

  $('#c-steps').innerHTML = `
    <li>V<sub>m</sub> = 1 − ${fmt(vf, 2)} = ${fmt(vm, 2)}</li>
    <li>E<sub>cl</sub> = (${fmt(m.E)})(${fmt(vm, 2)}) + (${fmt(f.E, 0)})(${fmt(vf, 2)}) = ${fmt(m.E * vm, 2)} + ${fmt(f.E * vf, 2)} = <b>${fmt(ecl)} GPa</b></li>
    <li>1/E<sub>ct</sub> = ${fmt(vm, 2)}/${fmt(m.E)} + ${fmt(vf, 2)}/${fmt(f.E, 0)} = ${fmt(vm / m.E + vf / f.E, 4)} → E<sub>ct</sub> = <b>${fmt(ect)} GPa</b></li>
    <li>ρ<sub>c</sub> = (${fmt(m.rho, 2)})(${fmt(vm, 2)}) + (${fmt(f.rho, 2)})(${fmt(vf, 2)}) = <b>${fmt(rho, 2)} g/cm³</b></li>
    <li>F<sub>f</sub>/F<sub>m</sub> = (E<sub>f</sub>V<sub>f</sub>)/(E<sub>m</sub>V<sub>m</sub>) = ${fmt(f.E * vf, 2)}/${fmt(m.E * vm, 2)} ≈ ${fmt(ratio)} → las fibras llevan el <b>${fmt(load, 0)} %</b> de la carga</li>
    <li>Rigidez específica: ${fmt(ecl)}/${fmt(rho, 2)} = ${fmt(spec)} frente a 207/7,85 = ${fmt(STEEL)} del acero → <b>${fmt(vs)} veces</b></li>`;
}
['#c-fiber', '#c-matrix', '#c-vf'].forEach(s => $(s).addEventListener('input', calc));
calc();

/* ---------- Filtro de procesos ---------- */
$$('.filter').forEach(btn => btn.addEventListener('click', () => {
  $$('.filter').forEach(b => b.classList.toggle('active', b === btn));
  const f = btn.dataset.f;
  $$('.proc').forEach(p => p.classList.toggle('hide', f !== 'all' && p.dataset.v !== f));
}));

/* ---------- Test: banco de 20 preguntas (muestra aleatoria de 10) ---------- */
const BANK = [
  { q: '¿Qué es un material compuesto?', a: ['Una aleación formada por dos o más metales fundidos', 'Un material multifase artificial, con fases químicamente distintas separadas por una interfase', 'Un polímero al que se le agregan colorantes', 'Un cerámico obtenido por sinterizado de un solo polvo'], c: 1, e: 'Las fases conservan su identidad y están separadas por una interfase reconocible.' },
  { q: '¿Cuál es la función principal de la matriz?', a: ['Soportar la mayor parte de la carga aplicada', 'Aumentar la densidad del material', 'Transferir la carga al refuerzo, dar forma a la pieza y protegerlo', 'Conducir la electricidad a través de la pieza'], c: 2, e: 'La matriz une, protege y transfiere carga; quien la soporta es el refuerzo.' },
  { q: 'En un compuesto reforzado con fibras, la fase que soporta la mayor parte de la carga es:', a: ['El refuerzo', 'La matriz', 'La interfase', 'El aire atrapado'], c: 0, e: 'En el ejercicio de carbono-epoxi las fibras llevan cerca del 99 % de la carga.' },
  { q: 'Si la adhesión en la interfase es débil:', a: ['El compuesto se vuelve más rígido', 'Aumenta la resistencia a la corrosión', 'Disminuye la densidad del material', 'La carga no se transfiere bien y el material falla prematuramente'], c: 3, e: 'Por eso las fibras se recubren con agentes de acople (sizing).' },
  { q: 'La sigla PMC significa:', a: ['Compuesto de matriz particulada', 'Compuesto de matriz polimérica', 'Compuesto de matriz metálica', 'Compuesto multicapa prensado'], c: 1, e: 'PMC = Polymer Matrix Composite.' },
  { q: '¿Cuál es un ejemplo de compuesto reforzado con partículas?', a: ['Laminado de carbono-epoxi', 'Panel sándwich con núcleo de panal', 'Concreto', 'Tubería de fibra de vidrio bobinada'], c: 2, e: 'El concreto es grava y arena (partículas) en una matriz de cemento.' },
  { q: 'Un panel sándwich está formado por:', a: ['Fibras orientadas al azar en una resina', 'Partículas cerámicas en una matriz metálica', 'Una sola capa de tejido 0°/90°', 'Dos pieles rígidas unidas a un núcleo liviano'], c: 3, e: 'Es un compuesto estructural: pieles rígidas y núcleo de panal o espuma.' },
  { q: 'Que un compuesto sea anisótropo significa que:', a: ['Sus propiedades dependen de la dirección en que se mide', 'Tiene las mismas propiedades en todas las direcciones', 'No se corroe en ningún ambiente', 'Conduce el calor mejor que los metales'], c: 0, e: 'Ejemplo: 139,4 GPa en dirección de la fibra frente a 8,3 GPa en sentido transversal.' },
  { q: '¿Qué orientación de fibra da un comportamiento casi isótropo en el plano?', a: ['Unidireccional a 0°', 'Fibras orientadas al azar (mat)', 'Fibras solo a 90°', 'Una sola fibra continua'], c: 1, e: 'Al azar, las fibras reparten la rigidez en todas las direcciones del plano.' },
  { q: 'De las siguientes, ¿cuál tiene la mayor rigidez específica (E/ρ)?', a: ['Acero', 'Aluminio', 'Fibra de carbono', 'Fibra de vidrio E'], c: 2, e: 'Carbono ≈ 128 frente a ≈ 26 del acero y del aluminio.' },
  { q: 'En carga longitudinal (isodeformación), el módulo del compuesto se calcula como:', a: ['1/Ec = Vm/Em + Vf/Ef', 'Ec = Em × Ef', 'Ec = Ef − Em', 'Ec = Em·Vm + Ef·Vf'], c: 3, e: 'Es el promedio ponderado por las fracciones volumétricas: límite superior.' },
  { q: 'Cuando la carga es perpendicular a las fibras, la regla de las mezclas corresponde a:', a: ['Condición de isoesfuerzo, que da el límite inferior del módulo', 'Condición de isodeformación, que da el límite superior del módulo', 'Un módulo igual al de la fibra', 'Un módulo igual a cero'], c: 0, e: 'Ambas fases soportan el mismo esfuerzo y se suman los inversos.' },
  { q: 'Un compuesto tiene Vf = 0,5 de fibra de vidrio (Ef = 72 GPa) en poliéster (Em = 3 GPa). Su módulo longitudinal es:', a: ['75,0 GPa', '37,5 GPa', '5,7 GPa', '39,0 GPa'], c: 1, e: 'Ec = 3(0,5) + 72(0,5) = 1,5 + 36 = 37,5 GPa.' },
  { q: 'Un compuesto con 60 % de fibra de carbono (ρ = 1,8 g/cm³) en epoxi (ρ = 1,2 g/cm³) tiene una densidad de:', a: ['3,00 g/cm³', '1,50 g/cm³', '1,56 g/cm³', '1,80 g/cm³'], c: 2, e: 'ρc = 1,2(0,4) + 1,8(0,6) = 0,48 + 1,08 = 1,56 g/cm³.' },
  { q: 'En el ejercicio de carbono-epoxi al 60 %, ¿qué porcentaje aproximado de la carga soportan las fibras?', a: ['40 %', '60 %', '75 %', '99 %'], c: 3, e: 'Ff/Fm = 138/1,36 ≈ 101, es decir, cerca del 99 %.' },
  { q: 'En la práctica, la fracción volumétrica de fibra suele estar entre:', a: ['0,3 y 0,7', '0,01 y 0,05', '0,8 y 1,0', '0,05 y 0,15'], c: 0, e: 'Por encima de ~0,7 la matriz ya no alcanza a mojar todas las fibras.' },
  { q: '¿Qué proceso es el más adecuado para fabricar tuberías y tanques a presión?', a: ['Moldeo manual (hand lay-up)', 'Bobinado de filamentos (filament winding)', 'Moldeo por compresión SMC', 'Aspersión (spray-up)'], c: 1, e: 'La fibra se enrolla sobre un mandril giratorio: ideal para cuerpos de revolución.' },
  { q: 'Proceso continuo en el que las fibras impregnadas se jalan a través de un dado caliente para obtener perfiles de sección constante:', a: ['Autoclave', 'Infusión de resina', 'Pultrusión', 'Bobinado de filamentos'], c: 2, e: 'Pultrusión = pull + extrusión: perfiles, varillas y bandejas.' },
  { q: 'La etapa en la que se aplica vacío y presión para eliminar el aire y compactar las capas se llama:', a: ['Impregnación', 'Curado', 'Dar forma', 'Consolidación'], c: 3, e: 'Las cuatro etapas: impregnar, dar forma, consolidar y curar.' },
  { q: '¿Qué proceso ofrece la mayor calidad y es el más usado en piezas aeronáuticas?', a: ['Autoclave con preimpregnados (prepreg)', 'Moldeo manual', 'Aspersión', 'Pulvimetalurgia'], c: 0, e: 'Calor y presión controlados dan Vf de 0,6–0,7 y mínima porosidad.' }
];
const SAMPLE = 10;
let quiz = [], idx = 0, score = 0;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function startQuiz() {
  quiz = shuffle(BANK).slice(0, SAMPLE);
  idx = 0; score = 0;
  $('#quiz-start').hidden = true;
  $('#quiz-end').hidden = true;
  $('#quiz-run').hidden = false;
  showQuestion();
}
function showQuestion() {
  const item = quiz[idx];
  $('#q-count').textContent = `Pregunta ${idx + 1} de ${SAMPLE}`;
  $('#q-score').textContent = `Puntaje: ${score}`;
  $('#q-prog').style.width = (idx / SAMPLE) * 100 + '%';
  $('#q-text').textContent = item.q;
  $('#q-feedback').textContent = '';
  $('#q-feedback').className = 'feedback';
  $('#q-next').hidden = true;
  const box = $('#q-answers');
  box.innerHTML = '';
  item.a.forEach((txt, i) => {
    const b = document.createElement('button');
    b.className = 'answer';
    b.innerHTML = `<span class="letter">${'ABCD'[i]})</span>`;
    b.append(txt);
    b.addEventListener('click', () => answer(i));
    box.append(b);
  });
}
function answer(i) {
  const item = quiz[idx];
  const btns = $$('.answer');
  btns.forEach(b => b.disabled = true);
  btns[item.c].classList.add('correct');
  const fb = $('#q-feedback');
  if (i === item.c) {
    score++;
    fb.textContent = '¡Correcto! ' + item.e;
    fb.classList.add('ok');
  } else {
    btns[i].classList.add('wrong');
    fb.textContent = `Incorrecto. La respuesta es la ${'ABCD'[item.c]}. ${item.e}`;
    fb.classList.add('no');
  }
  $('#q-score').textContent = `Puntaje: ${score}`;
  $('#q-next').textContent = idx === SAMPLE - 1 ? 'Ver resultado' : 'Siguiente';
  $('#q-next').hidden = false;
  $('#q-next').focus();
}
$('#q-next').addEventListener('click', () => {
  idx++;
  if (idx < SAMPLE) return showQuestion();
  $('#quiz-run').hidden = true;
  $('#quiz-end').hidden = false;
  $('#q-final').textContent = `${score} / ${SAMPLE}`;
  const nota = (score / SAMPLE * 5).toLocaleString('es-CO', { maximumFractionDigits: 1 });
  $('#q-msg').textContent = score >= 8 ? `Excelente dominio del tema. Nota equivalente: ${nota}` :
    score >= 6 ? `Buen resultado; repase las secciones donde falló. Nota equivalente: ${nota}` :
    `Le recomendamos repasar el material y volver a intentarlo. Nota equivalente: ${nota}`;
});
$('#quiz-go').addEventListener('click', startQuiz);
$('#q-retry').addEventListener('click', startQuiz);
