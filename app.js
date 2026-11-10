// ============================================
// IncidentResponse Lab - app.js
// Simulador de Respuesta ante Phishing
// ============================================

let scenarios = [];
let currentScenarioIdx = 0;
let currentNodeIdx = 0;
let sessionData = {
  sessionId: '',
  startTime: null,
  decisions: [],
  totalCost: 0,
  totalDamage: 0,
  totalTime: 0,
  optimalCount: 0,
  totalDecisions: 0
};
let decisionStartTime = null;
let timerInterval = null;

// ---------- INICIALIZACIÓN ----------
document.addEventListener('DOMContentLoaded', async () => {
  await loadScenarios();
  bindEvents();
  generateSessionId();
});

async function loadScenarios() {
  try {
    const res = await fetch('scenarios.json');
    const data = await res.json();
    scenarios = data.scenarios;
  } catch (e) {
    console.error('Error cargando escenarios:', e);
    alert('No se pudieron cargar los escenarios.');
  }
}

function bindEvents() {
  document.getElementById('btn-start').addEventListener('click', startSimulation);
  document.getElementById('btn-next').addEventListener('click', nextStep);
  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
  document.getElementById('btn-restart').addEventListener('click', () => location.reload());
}

function generateSessionId() {
  const id = 'S-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  sessionData.sessionId = id;
  document.getElementById('session-code').textContent = 'Sesión: ' + id;
}

// ---------- FLUJO DE SIMULACIÓN ----------
function startSimulation() {
  sessionData.startTime = new Date();
  currentScenarioIdx = 0;
  currentNodeIdx = 0;
  document.getElementById('screen-start').classList.add('hidden');
  document.getElementById('screen-scenario').classList.remove('hidden');
  renderScenario();
}

function renderScenario() {
  const scenario = scenarios[currentScenarioIdx];
  document.getElementById('scenario-tag').textContent = `Escenario ${currentScenarioIdx + 1}/${scenarios.length}`;
  document.getElementById('scenario-title').textContent = scenario.title;
  document.getElementById('scenario-context').innerHTML = scenario.context;
  renderNode();
}

function renderNode() {
  const scenario = scenarios[currentScenarioIdx];
  const node = scenario.nodes[currentNodeIdx];

  document.getElementById('feedback-box').classList.add('hidden');
  const container = document.getElementById('options-container');
  container.innerHTML = '';

  node.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn w-full text-left bg-slate-700 hover:bg-red-700 border border-slate-600 hover:border-red-500 p-4 rounded-lg transition fade-in';
    btn.innerHTML = `<span class="font-bold text-red-400 mr-2">${String.fromCharCode(65 + idx)}.</span> ${opt.text}`;
    btn.addEventListener('click', () => handleDecision(opt));
    container.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  decisionStartTime = Date.now();
  clearInterval(timerInterval);
  const timerEl = document.getElementById('timer');
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - decisionStartTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }, 1000);
}

function handleDecision(option) {
  clearInterval(timerInterval);
  const decisionTime = Math.floor((Date.now() - decisionStartTime) / 1000);

  sessionData.decisions.push({
    scenarioId: currentScenarioIdx + 1,
    scenarioTitle: scenarios[currentScenarioIdx].title,
    nodeId: scenarios[currentScenarioIdx].nodes[currentNodeIdx].id,
    decisionTime: decisionTime,
    cost: option.cost,
    damage: option.damage,
    optimal: option.optimal,
    feedback: option.feedback
  });

  sessionData.totalCost += option.cost;
  sessionData.totalDamage += option.damage;
  sessionData.totalTime += decisionTime;
  sessionData.totalDecisions++;
  if (option.optimal) sessionData.optimalCount++;

  showFeedback(option, decisionTime);
}

function showFeedback(option, time) {
  document.getElementById('options-container').innerHTML = '';
  const fb = document.getElementById('feedback-box');
  fb.classList.remove('hidden');
  fb.classList.add('fade-in');

  document.getElementById('feedback-icon').textContent = option.optimal ? '✅' : (option.damage > 50 ? '💥' : '⚠️');
  document.getElementById('feedback-title').textContent = option.optimal ? 'Decisión óptima' : 'Decisión subóptima';
  document.getElementById('feedback-text').textContent = option.feedback;
  document.getElementById('fb-time').textContent = time;
  document.getElementById('fb-cost').textContent = option.cost.toLocaleString('es-CO');
  document.getElementById('fb-damage').textContent = option.damage;

  const btnNext = document.getElementById('btn-next');
  
  if (currentNodeIdx === 0) {
    btnNext.textContent = '➡️ Fase 2: Mitigación del daño';
  } else if (currentNodeIdx === 1) {
    btnNext.textContent = '➡️ Fase 3: Reporte y Cierre';
  } else {
    btnNext.textContent = '🏁 Finalizar Escenario y pasar al siguiente';
  }
}

function nextStep() {
  const scenario = scenarios[currentScenarioIdx];
  currentNodeIdx++;

  if (currentNodeIdx >= scenario.nodes.length) {
    currentScenarioIdx++;
    currentNodeIdx = 0;
    if (currentScenarioIdx >= scenarios.length) {
      showResults();
      return;
    }
    renderScenario();
  } else {
    renderNode();
  }
}

// ---------- PANTALLA DE RESULTADOS ----------
function showResults() {
  document.getElementById('screen-scenario').classList.add('hidden');
  document.getElementById('screen-results').classList.remove('hidden');

  const kpis = calculateKPIs();
  renderKPIs(kpis);
  renderChart();
}

function calculateKPIs() {
  const n = sessionData.totalDecisions;
  const TPR = (sessionData.totalTime / n).toFixed(1); 
  const TAC = ((sessionData.optimalCount / n) * 100).toFixed(1); 
  const maxCost = 2500000; 
  const CE = maxCost - sessionData.totalCost; 
  const TFE = sessionData.totalCost < maxCost * 0.5 ? 100 : (sessionData.totalCost < maxCost ? 70 : 0); 
  const DPO = (((n - sessionData.optimalCount) / n) * 100).toFixed(1); 

  return { TPR, TAC, CE, TFE, DPO };
}

function renderKPIs(kpis) {
  const grid = document.getElementById('kpi-grid');
  const items = [
    { label: 'Tiempo Promedio de Respuesta (TPR)', value: `${kpis.TPR} s`, meta: '< 15 s', color: parseFloat(kpis.TPR) < 15 ? 'emerald' : 'amber' },
    { label: 'Tasa de Acierto Crítico (TAC)', value: `${kpis.TAC}%`, meta: '≥ 80%', color: parseFloat(kpis.TAC) >= 80 ? 'emerald' : 'red' },
    { label: 'Costo Económico Evitado (CE)', value: `$${kpis.CE.toLocaleString('es-CO')} COP`, meta: '≥ $300.000', color: kpis.CE >= 300000 ? 'emerald' : 'red' },
    { label: 'Desviación del Protocolo Óptimo (DPO)', value: `${kpis.DPO}%`, meta: '≤ 20%', color: parseFloat(kpis.DPO) <= 20 ? 'emerald' : 'amber' }
  ];

  grid.innerHTML = items.map(it => `
    <div class="bg-slate-900 border border-${it.color}-700 rounded-lg p-4">
      <div class="text-xs text-slate-400">${it.label}</div>
      <div class="text-2xl font-bold text-${it.color}-400 mt-1">${it.value}</div>
      <div class="text-xs text-slate-500 mt-1">Meta: ${it.meta}</div>
    </div>
  `).join('');
}

function renderChart() {
  const ctx = document.getElementById('chart-scatter').getContext('2d');

  const byScenario = {};
  sessionData.decisions.forEach(d => {
    if (!byScenario[d.scenarioId]) byScenario[d.scenarioId] = { time: 0, cost: 0, count: 0 };
    byScenario[d.scenarioId].time += d.decisionTime;
    byScenario[d.scenarioId].cost += d.cost;
    byScenario[d.scenarioId].count++;
  });

  const points = Object.entries(byScenario).map(([id, v]) => ({
    x: v.time / v.count, 
    y: v.cost 
  }));

  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Escenarios',
        data: points,
        backgroundColor: 'rgba(220, 38, 38, 0.8)',
        borderColor: 'rgb(220, 38, 38)',
        pointRadius: 10,
        pointHoverRadius: 12
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#cbd5e1' } }
      },
      scales: {
        x: {
          title: { display: true, text: 'Tiempo promedio por decisión (s)', color: '#cbd5e1' },
          ticks: { color: '#94a3b8' },
          grid: { color: '#334155' }
        },
        y: {
          title: { display: true, text: 'Costo acumulado (COP)', color: '#cbd5e1' },
          ticks: { color: '#94a3b8', callback: v => '$' + v.toLocaleString('es-CO') },
          grid: { color: '#334155' }
        }
      }
    }
  });
}

// ---------- EXPORTAR CSV ----------
function exportCSV() {
  const headers = ['SesionID','Escenario','Nodo','TiempoDecision_s','Costo_COP','Dano_%','Optimal','Feedback'];
  const rows = sessionData.decisions.map(d => [
    sessionData.sessionId,
    d.scenarioId,
    d.nodeId,
    d.decisionTime,
    d.cost,
    d.damage,
    d.optimal ? 1 : 0,
    `"${d.feedback.replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IncidentResponseLab_${sessionData.sessionId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
