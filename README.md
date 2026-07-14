# Simulador de fórmulas de valoración económica

Prototipo estático, sin backend ni dependencias de ejecución, para entender cómo una fórmula de valoración económica puede cambiar el resultado de una licitación pública.

La interfaz está en español y presenta un escenario de servicios con cinco licitadores. Puede probarse en [GitHub Pages](https://gootyfer.github.io/price-scoring-simulator/) o abriendo `index.html` en un navegador.

## Estado actual

- Cuatro fórmulas de valoración seleccionables.
- Tres pasos: escenario, fórmula de precio y resultados.
- Presupuesto base, puntuación de precio, umbral de baja anormal y umbral de saciedad configurables.
- Técnica y precio siempre suman 100 puntos; las puntuaciones técnicas de los licitadores se ajustan proporcionalmente.
- Las ofertas se recalculan como porcentajes fijos del presupuesto base.
- Ganadores, empates, exclusiones y posibles bajas anormales identificados de forma visual y textual.
- Diseño mobile-first, HTML semántico y controles accesibles.

Las decisiones de alcance y diseño se recogen en [DECISIONS.md](DECISIONS.md).

## Pruebas

Ejecuta `npm test` antes de incorporar una nueva funcionalidad. No requiere instalar dependencias.

## Próximas iteraciones

1. Comparar dos fórmulas lado a lado.
2. Crear recorridos específicos: uno para adjudicadores que ayude a ajustar la fórmula y otro para licitadores que ayude a decidir el precio de su oferta.
3. Añadir fórmulas no lineales, por tramos y otros algoritmos de valoración.
