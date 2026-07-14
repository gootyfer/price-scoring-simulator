const budget = 200000;
const maxPricePoints = 50;
const abnormalThreshold = 0.2;
const satisfactionThreshold = 0.15;

const bidders = [
  { name: "Alfa", offer: 200000, technical: 42 },
  { name: "Beta", offer: 185000, technical: 38 },
  { name: "Gamma", offer: 172000, technical: 35 },
  { name: "Delta", offer: 163000, technical: 30 },
  { name: "Épsilon", offer: 155000, technical: 25 }
];

const formulas = {
  inverse: {
    number: "01", name: "Proporcional inversa",
    description: "La oferta más baja recibe la puntuación máxima. El resto obtiene puntos en proporción a su precio respecto de esa oferta.",
    equation: "Puntos = (oferta más baja / oferta presentada) × 50",
    note: "Épsilon se mantiene en la simulación para ilustrar el efecto de una oferta posible anormalmente baja.",
    calculate() { const minimum = Math.min(...bidders.map(({ offer }) => offer)); return bidders.map(bidder => ({ ...bidder, price: minimum / bidder.offer * maxPricePoints, excluded: false })); },
    explain: "Alfa gana porque sus 42 puntos técnicos compensan una puntuación de precio menor. Aunque Épsilon presenta la oferta más baja y obtiene el máximo en precio, su puntuación técnica la sitúa por detrás."
  },
  budget: {
    number: "02", name: "Baja sobre presupuesto base",
    description: "Los puntos dependen de la rebaja sobre el presupuesto base. La baja máxima admisible, del 20 %, equivale a la puntuación máxima.",
    equation: "Puntos = (baja ofertada / 20 %) × 50",
    note: "En este ejemplo, una oferta con baja superior al 20 % queda excluida de la valoración.",
    calculate() { return bidders.map(bidder => { const reduction = 1 - bidder.offer / budget; const excluded = reduction > abnormalThreshold; return { ...bidder, price: excluded ? null : reduction / abnormalThreshold * maxPricePoints, excluded }; }); },
    explain: "Delta gana porque su baja del 18,50 % queda muy cerca del límite del 20 % y recibe 46,25 puntos por precio. Esa ventaja compensa que, entre las ofertas admitidas, tenga la menor puntuación técnica."
  },
  satisfaction: {
    number: "03", name: "Con umbral de saciedad",
    description: "A partir de una baja del 15 %, se alcanza la máxima puntuación. Ofrecer una rebaja mayor ya no suma puntos adicionales.",
    equation: "Si baja ≥ 15 %: 50 puntos · Si baja < 15 %: (baja / 15 %) × 50",
    note: "Épsilon se mantiene en la simulación para mostrar que rebajar más del 15 % no aporta puntos adicionales.",
    calculate() { return bidders.map(bidder => { const reduction = 1 - bidder.offer / budget; return { ...bidder, price: Math.min(reduction / satisfactionThreshold * maxPricePoints, maxPricePoints), excluded: false }; }); },
    explain: "Gamma gana porque combina una baja cercana al umbral de saciedad (14 %) con una buena puntuación técnica. Delta y Épsilon ya obtienen los 50 puntos de precio, de modo que rebajar más no les da ventaja."
  },
  average: {
    number: "04", name: "Referenciada a la media de las ofertas",
    description: "La media de las ofertas admitidas sirve de referencia. Las ofertas iguales o inferiores a esa media alcanzan la puntuación máxima.",
    equation: "Puntos = mínimo de [50, (media de ofertas admitidas / oferta presentada) × 50]",
    note: "La media se calcula solo con las cuatro ofertas admitidas: 180.000 €. Épsilon queda excluida en este ejemplo.",
    calculate() { const admitted = bidders.filter(bidder => bidder.offer >= budget * (1 - abnormalThreshold)); const average = admitted.reduce((sum, bidder) => sum + bidder.offer, 0) / admitted.length; return bidders.map(bidder => { const excluded = !admitted.some(admittedBidder => admittedBidder.name === bidder.name); return { ...bidder, price: excluded ? null : Math.min(average / bidder.offer * maxPricePoints, maxPricePoints), excluded }; }); },
    explain: "Alfa gana porque esta fórmula le asigna 45 puntos de precio pese a no aplicar baja, al tomar como referencia una media de 180.000 €. Sus 42 puntos técnicos deciden el resultado final."
  }
};

const money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const percentage = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const algorithmSelect = document.querySelector("#algorithm");
const elements = {
  formulaName: document.querySelector("#formula-nombre"), formulaDescription: document.querySelector("#formula-description"), formulaEquation: document.querySelector("#formula-equation"), formulaNote: document.querySelector("#formula-note"),
  table: document.querySelector("#results-body"), cards: document.querySelector("#mobile-results"), interpretation: document.querySelector("#interpretation-text"), announcement: document.querySelector("#results-announcement")
};

function reduction(bidder) { return (1 - bidder.offer / budget) * 100; }
function status(result) { if (result.excluded) return ["Excluida", "status-excluded"]; if (reduction(result) > abnormalThreshold * 100) return ["Posible baja anormal", "status-warning"]; return ["Admitida", "status-admitted"]; }
function pointText(value) { return value === null ? "—" : `${decimal.format(value)} pts`; }

function render() {
  const formula = formulas[algorithmSelect.value];
  const evaluated = formula.calculate().map(result => ({ ...result, total: result.excluded ? null : result.technical + result.price }));
  const ranking = [...evaluated].filter(({ excluded }) => !excluded).sort((a, b) => b.total - a.total);
  const winner = ranking[0];

  elements.formulaName.textContent = formula.name;
  elements.formulaDescription.textContent = formula.description;
  elements.formulaEquation.textContent = formula.equation;
  elements.formulaNote.textContent = formula.note;
  elements.interpretation.textContent = formula.explain;
  elements.announcement.textContent = `Fórmula actualizada: ${formula.name}. Gana ${winner.name} con ${decimal.format(winner.total)} puntos.`;

  elements.table.innerHTML = evaluated.map(result => {
    const [statusText, statusClass] = status(result);
    const rowClass = result.excluded ? "excluded" : result.name === winner.name ? "winner" : "";
    return `<tr class="${rowClass}"><th scope="row">${result.name}</th><td>${money.format(result.offer)}</td><td>${percentage.format(reduction(result))} %</td><td>${decimal.format(result.technical)} pts</td><td>${pointText(result.price)}</td><td class="total">${pointText(result.total)}</td><td><span class="status ${statusClass}">${statusText}</span></td></tr>`;
  }).join("");

  elements.cards.innerHTML = evaluated.map(result => {
    const [statusText, statusClass] = status(result);
    const cardClass = result.excluded ? "excluded" : result.name === winner.name ? "winner" : "";
    return `<article class="offer-card ${cardClass}"><header><h3>${result.name}</h3><span class="status ${statusClass}">${statusText}</span></header><dl><div><dt>Oferta</dt><dd>${money.format(result.offer)}</dd></div><div><dt>Baja</dt><dd>${percentage.format(reduction(result))} %</dd></div><div><dt>Técnica</dt><dd>${decimal.format(result.technical)} pts</dd></div><div><dt>Precio</dt><dd>${pointText(result.price)}</dd></div><div><dt>Total</dt><dd class="total-mobile">${pointText(result.total)}</dd></div></dl></article>`;
  }).join("");
}

algorithmSelect.addEventListener("change", render);
render();
