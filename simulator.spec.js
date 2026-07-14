import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("./app.js", import.meta.url), "utf8");

function createSimulator() {
  const select = { value: "inverse", addEventListener() {} };
  const nodes = new Map();
  const createNode = (value = "") => ({ innerHTML: "", textContent: "", value, addEventListener() {} });
  nodes.set("#budget-input", createNode("200000"));
  nodes.set("#price-points-input", createNode("50"));
  nodes.set("#threshold-input", createNode("20"));
  nodes.set("#satisfaction-input", createNode("15"));
  const document = {
    querySelector(selector) {
      if (selector === "#algorithm") return select;
      if (!nodes.has(selector)) nodes.set(selector, createNode());
      return nodes.get(selector);
    }
  };
  const context = vm.createContext({ document, Intl });
  vm.runInContext(source, context, { filename: "app.js" });

  return {
    choose(algorithm) {
      vm.runInContext(`algorithmSelect.value = ${JSON.stringify(algorithm)}; render();`, context);
    },
    configure({ budget, pricePoints, threshold }) {
      if (budget !== undefined) nodes.get("#budget-input").value = String(budget);
      if (pricePoints !== undefined) nodes.get("#price-points-input").value = String(pricePoints);
      if (threshold !== undefined) nodes.get("#threshold-input").value = String(threshold);
      vm.runInContext("updateConfiguration();", context);
    },
    setSatisfactionThreshold(value) {
      nodes.get("#satisfaction-input").value = String(value);
      vm.runInContext("updateSatisfactionThreshold();", context);
    },
    run(code) {
      return vm.runInContext(code, context);
    },
    html(selector) {
      return nodes.get(selector).innerHTML;
    },
    text(selector) {
      return nodes.get(selector).textContent;
    }
  };
}

const expectedWinners = [
  ["inverse", "Alfa", "80,75"],
  ["budget", "Delta", "76,25"],
  ["satisfaction", "Gamma", "81,67"],
  ["average", "Alfa", "87,00"]
];

for (const [algorithm, winner, total] of expectedWinners) {
  test(`${algorithm}: muestra el ganador y el total esperados`, () => {
    const simulator = createSimulator();
    simulator.choose(algorithm);
    const cards = simulator.html("#mobile-results");

    assert.match(cards, new RegExp(`offer-card winner[\\s\\S]*?<h3>${winner}</h3>`));
    assert.match(cards, new RegExp(`${winner} gana con ${total} puntos`));
    assert.equal((cards.match(/winner-explanation/g) ?? []).length, 1);
  });
}

test("baja sobre presupuesto y media excluyen a Épsilon", () => {
  for (const algorithm of ["budget", "average"]) {
    const simulator = createSimulator();
    simulator.choose(algorithm);
    assert.match(simulator.html("#mobile-results"), /<h3>Épsilon<\/h3><span class="status status-excluded">Excluida/);
  }
});

test("el umbral de saciedad separa sus dos condiciones", () => {
  const simulator = createSimulator();
  simulator.choose("satisfaction");
  assert.equal(
    simulator.text("#formula-equation"),
    "Si baja ≥ 15,00 %: 50 puntos\nSi baja < 15,00 %: (baja / 15,00 %) × 50"
  );
});

test("el umbral de saciedad configurable actualiza la fórmula y el ganador", () => {
  const simulator = createSimulator();
  simulator.choose("satisfaction");
  simulator.setSatisfactionThreshold(20);

  assert.equal(
    simulator.text("#formula-equation"),
    "Si baja ≥ 20,00 %: 50 puntos\nSi baja < 20,00 %: (baja / 20,00 %) × 50"
  );
  assert.match(simulator.html("#mobile-results"), /offer-card winner[\s\S]*?<h3>Delta<\/h3>/);
  assert.match(simulator.html("#mobile-results"), /Delta gana con 76,25 puntos/);
});

test("las configuraciones recalculan ofertas, técnica y umbral en euros", () => {
  const simulator = createSimulator();
  simulator.configure({ budget: 300000, pricePoints: 40, threshold: 25 });

  assert.match(simulator.html("#mobile-results"), /300\.000&nbsp;€|300\.000\s*€/);
  assert.match(simulator.html("#mobile-results"), /50,40 pts/);
  assert.equal(simulator.text("#technical-points"), "60 puntos");
  assert.equal(simulator.text("#threshold-amount"), "Límite: 225.000 €");
});

test("las fórmulas reflejan la puntuación y el umbral configurados", () => {
  const simulator = createSimulator();
  simulator.configure({ pricePoints: 40, threshold: 25 });
  simulator.choose("budget");

  assert.equal(simulator.text("#formula-equation"), "Puntos = (baja ofertada / 25,00 %) × 40");
  assert.match(simulator.text("#formula-description"), /25,00 %/);
});

test("el presupuesto respeta el mínimo y los saltos de 10.000 €", () => {
  const simulator = createSimulator();
  simulator.configure({ budget: 245000 });
  assert.match(simulator.html("#mobile-results"), /250\.000\s*€/);

  simulator.configure({ budget: 1000 });
  assert.match(simulator.html("#mobile-results"), /10\.000\s*€/);
});

test("un empate muestra varios ganadores y una única explicación compartida", () => {
  const simulator = createSimulator();
  simulator.run("bidders[2].technical = 35.691860465; render();");
  const cards = simulator.html("#mobile-results");

  assert.equal((cards.match(/offer-card winner/g) ?? []).length, 2);
  assert.equal((cards.match(/winner-explanation/g) ?? []).length, 1);
  assert.match(cards, /Hay un empate entre Alfa y Gamma, con 80,75 puntos/);
});
