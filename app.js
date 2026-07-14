let budget = 200000;
let maxPricePoints = 50;
let abnormalThreshold = 0.2;
const satisfactionThreshold = 0.15;

const bidderProfiles = [
  { name: "Alfa", offerRatio: 1, technicalRatio: 42 / 50 },
  { name: "Beta", offerRatio: 185 / 200, technicalRatio: 38 / 50 },
  { name: "Gamma", offerRatio: 172 / 200, technicalRatio: 35 / 50 },
  { name: "Delta", offerRatio: 163 / 200, technicalRatio: 30 / 50 },
  { name: "Épsilon", offerRatio: 155 / 200, technicalRatio: 25 / 50 }
];

let bidders = [];
function rebuildBidders() {
  const maxTechnicalPoints = 100 - maxPricePoints;
  bidders = bidderProfiles.map(profile => ({
    name: profile.name,
    offer: budget * profile.offerRatio,
    technical: maxTechnicalPoints * profile.technicalRatio
  }));
}

rebuildBidders();

const formulas = {
  inverse: {
    name: "Proporcional inversa",
    description: () => "La oferta más baja recibe la puntuación máxima. El resto obtiene puntos en proporción a su precio respecto de esa oferta.",
    equation: () => `Puntos = (oferta más baja / oferta presentada) × ${maxPricePoints}`,
    note: () => "Las ofertas se mantienen en la simulación para ilustrar el efecto de una oferta posible anormalmente baja.",
    calculate() { const minimum = Math.min(...bidders.map(({ offer }) => offer)); return bidders.map(bidder => ({ ...bidder, price: minimum / bidder.offer * maxPricePoints, excluded: false })); },
  },
  budget: {
    name: "Baja sobre presupuesto base",
    description: () => `Los puntos dependen de la rebaja sobre el presupuesto base. La baja máxima admisible, del ${percentage.format(abnormalThreshold * 100)} %, equivale a la puntuación máxima.`,
    equation: () => `Puntos = (baja ofertada / ${percentage.format(abnormalThreshold * 100)} %) × ${maxPricePoints}`,
    note: () => `En esta simulación, una oferta con baja superior al ${percentage.format(abnormalThreshold * 100)} % queda excluida de la valoración.`,
    calculate() { return bidders.map(bidder => { const reduction = 1 - bidder.offer / budget; const excluded = reduction > abnormalThreshold; return { ...bidder, price: excluded ? null : reduction / abnormalThreshold * maxPricePoints, excluded }; }); },
  },
  satisfaction: {
    name: "Con umbral de saciedad",
    description: () => "A partir de una baja del 15 %, se alcanza la máxima puntuación. Ofrecer una rebaja mayor ya no suma puntos adicionales.",
    equation: () => `Si baja ≥ 15 %: ${maxPricePoints} puntos\nSi baja < 15 %: (baja / 15 %) × ${maxPricePoints}`,
    note: () => "Las ofertas se mantienen en la simulación para mostrar que rebajar más del 15 % no aporta puntos adicionales.",
    calculate() { return bidders.map(bidder => { const reduction = 1 - bidder.offer / budget; return { ...bidder, price: Math.min(reduction / satisfactionThreshold * maxPricePoints, maxPricePoints), excluded: false }; }); },
  },
  average: {
    name: "Referenciada a la media de las ofertas",
    description: () => "La media de las ofertas admitidas sirve de referencia. Las ofertas iguales o inferiores a esa media alcanzan la puntuación máxima.",
    equation: () => `Puntos = mínimo de [${maxPricePoints}, (media de ofertas admitidas / oferta presentada) × ${maxPricePoints}]`,
    note: () => {
      const admitted = bidders.filter(bidder => bidder.offer >= budget * (1 - abnormalThreshold));
      const average = admitted.reduce((sum, bidder) => sum + bidder.offer, 0) / admitted.length;
      return `La media se calcula con ${admitted.length} ${admitted.length === 1 ? "oferta admitida" : "ofertas admitidas"}: ${money.format(average)}.`;
    },
    calculate() { const admitted = bidders.filter(bidder => bidder.offer >= budget * (1 - abnormalThreshold)); const average = admitted.reduce((sum, bidder) => sum + bidder.offer, 0) / admitted.length; return bidders.map(bidder => { const excluded = !admitted.some(admittedBidder => admittedBidder.name === bidder.name); return { ...bidder, price: excluded ? null : Math.min(average / bidder.offer * maxPricePoints, maxPricePoints), excluded }; }); },
  }
};

const money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const percentage = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const algorithmSelect = document.querySelector("#algorithm");
const budgetInput = document.querySelector("#budget-input");
const pricePointsInput = document.querySelector("#price-points-input");
const thresholdInput = document.querySelector("#threshold-input");
const elements = {
  formulaDescription: document.querySelector("#formula-description"), formulaEquation: document.querySelector("#formula-equation"), formulaNote: document.querySelector("#formula-note"),
  technicalPoints: document.querySelector("#technical-points"), thresholdAmount: document.querySelector("#threshold-amount"),
  table: document.querySelector("#results-body"), cards: document.querySelector("#mobile-results"), announcement: document.querySelector("#results-announcement")
};

function normaliseBudget(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return budget;
  return Math.max(10000, Math.round(parsed / 10000) * 10000);
}
function updateConfiguration() {
  budget = normaliseBudget(budgetInput.value);
  maxPricePoints = Number(pricePointsInput.value);
  abnormalThreshold = Number(thresholdInput.value) / 100;
  budgetInput.value = String(budget);
  rebuildBidders();
  elements.technicalPoints.textContent = `${100 - maxPricePoints} puntos`;
  elements.thresholdAmount.textContent = money.format(budget * (1 - abnormalThreshold));
  render();
}
function reduction(bidder) { return (1 - bidder.offer / budget) * 100; }
function status(result) { if (result.excluded) return ["Excluida", "status-excluded"]; if (reduction(result) > abnormalThreshold * 100) return ["Posible baja anormal", "status-warning"]; return ["Admitida", "status-admitted"]; }
function pointText(value) { return value === null ? "—" : `${decimal.format(value)} pts`; }
function roundedScore(value) { return Math.round(value * 100) / 100; }
function listNames(results) {
  const names = results.map(({ name }) => name);
  if (names.length < 2) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} y ${names.at(-1)}`;
}
function winnerSummary(winners) {
  const total = decimal.format(roundedScore(winners[0].total));
  if (winners.length === 1) {
    const winner = winners[0];
    return `${winner.name} gana con ${total} puntos: ${decimal.format(winner.technical)} técnicos y ${decimal.format(winner.price)} de precio.`;
  }
  return `Hay un empate entre ${listNames(winners)}, con ${total} puntos.`;
}
function exclusionSummary(results) {
  const excluded = results.filter(({ excluded: isExcluded }) => isExcluded);
  if (excluded.length === 0) return ` Ninguna oferta queda excluida por superar el umbral del ${percentage.format(abnormalThreshold * 100)} %.`;
  const verb = excluded.length === 1 ? "queda excluida" : "quedan excluidas";
  return ` ${listNames(excluded)} ${verb} al superar el umbral del ${percentage.format(abnormalThreshold * 100)} %.`;
}
function explanationFor(formulaKey, winners, results) {
  const summary = winnerSummary(winners);
  if (formulaKey === "inverse") {
    const lowest = Math.min(...results.map(({ offer }) => offer));
    return `${summary} La proporcional inversa toma ${money.format(lowest)} como oferta de referencia y otorga la máxima puntuación de precio a esa oferta.`;
  }
  if (formulaKey === "budget") {
    return `${summary} Esta fórmula valora cada baja respecto al presupuesto base y asigna el máximo de ${decimal.format(maxPricePoints)} puntos al umbral del ${percentage.format(abnormalThreshold * 100)} %.${exclusionSummary(results)}`;
  }
  if (formulaKey === "satisfaction") {
    const saturated = results.filter(result => reduction(result) >= satisfactionThreshold * 100);
    const saturationText = saturated.length === 0 ? "Ninguna oferta alcanza el umbral de saciedad." : saturated.length === 1 ? `${listNames(saturated)} alcanza el umbral de saciedad del ${percentage.format(satisfactionThreshold * 100)} % y no obtiene más puntos por rebajar más.` : `${listNames(saturated)} alcanzan el umbral de saciedad del ${percentage.format(satisfactionThreshold * 100)} % y no obtienen más puntos por rebajar más.`;
    return `${summary} ${saturationText}`;
  }
  const admitted = results.filter(({ excluded: isExcluded }) => !isExcluded);
  const average = admitted.reduce((sum, result) => sum + result.offer, 0) / admitted.length;
  return `${summary} La media de las ofertas admitidas es ${money.format(average)}; las ofertas iguales o inferiores a esa media obtienen la máxima puntuación de precio.${exclusionSummary(results)}`;
}

function render() {
  const formula = formulas[algorithmSelect.value];
  const evaluated = formula.calculate().map(result => ({ ...result, total: result.excluded ? null : result.technical + result.price }));
  const ranking = [...evaluated].filter(({ excluded }) => !excluded).sort((a, b) => b.total - a.total);
  const bestScore = roundedScore(ranking[0].total);
  const winners = ranking.filter(result => roundedScore(result.total) === bestScore);
  const explanation = explanationFor(algorithmSelect.value, winners, evaluated);
  const lastWinnerIndex = Math.max(...evaluated.map((result, index) => winners.some(winner => winner.name === result.name) ? index : -1));

  elements.formulaDescription.textContent = formula.description();
  elements.formulaEquation.textContent = formula.equation();
  elements.formulaNote.textContent = formula.note();
  elements.announcement.textContent = `Fórmula actualizada: ${formula.name}. ${winnerSummary(winners)}`;

  elements.table.innerHTML = evaluated.map((result, index) => {
    const [statusText, statusClass] = status(result);
    const isWinner = winners.some(winner => winner.name === result.name);
    const rowClass = result.excluded ? "excluded" : isWinner ? "winner" : "";
    const row = `<tr class="${rowClass}"><th scope="row">${result.name}</th><td>${money.format(result.offer)}</td><td>${percentage.format(reduction(result))} %</td><td>${decimal.format(result.technical)} pts</td><td>${pointText(result.price)}</td><td class="total">${pointText(result.total)}</td><td><span class="status ${statusClass}">${statusText}</span></td></tr>`;
    return index === lastWinnerIndex ? `${row}<tr class="winner-explanation"><td colspan="7">${explanation}</td></tr>` : row;
  }).join("");

  elements.cards.innerHTML = evaluated.map((result, index) => {
    const [statusText, statusClass] = status(result);
    const isWinner = winners.some(winner => winner.name === result.name);
    const cardClass = result.excluded ? "excluded" : isWinner ? "winner" : "";
    const winnerExplanation = index === lastWinnerIndex ? `<p class="winner-explanation" role="note">${explanation}</p>` : "";
    return `<article class="offer-card ${cardClass}"><header><h3>${result.name}</h3><span class="status ${statusClass}">${statusText}</span></header><dl><div><dt>Oferta</dt><dd>${money.format(result.offer)}</dd></div><div><dt>Baja</dt><dd>${percentage.format(reduction(result))} %</dd></div><div><dt>Técnica</dt><dd>${decimal.format(result.technical)} pts</dd></div><div><dt>Precio</dt><dd>${pointText(result.price)}</dd></div><div><dt>Total</dt><dd class="total-mobile">${pointText(result.total)}</dd></div></dl>${winnerExplanation}</article>`;
  }).join("");
}

algorithmSelect.addEventListener("change", render);
budgetInput.addEventListener("change", updateConfiguration);
pricePointsInput.addEventListener("change", updateConfiguration);
thresholdInput.addEventListener("change", updateConfiguration);
updateConfiguration();
