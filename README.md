# Simulador de fórmulas de valoración económica

Prototipo estático, sin dependencias ni backend, para entender cómo cuatro fórmulas de valoración del precio pueden cambiar el resultado de una licitación pública.

La interfaz está en español y presenta un escenario con cinco licitadores. Se pueden configurar el presupuesto base, el peso del precio, el umbral de baja anormal y el umbral de saciedad. Para ejecutarlo basta con abrir `index.html` en un navegador; también puede publicarse directamente con GitHub Pages.

## Contenido

- Cuatro fórmulas de valoración seleccionables.
- Puntuación técnica y económica que siempre suma 100 puntos.
- Presupuesto base, peso de precio y umbral de baja anormal configurables.
- Umbral de saciedad configurable al usar esa fórmula.
- Ganador destacado, ofertas excluidas y posible baja anormal identificadas visualmente.
- Diseño responsive mobile-first y sin dependencias de compilación.

Las decisiones de alcance y diseño se recogen en [DECISIONS.md](DECISIONS.md).

## Pruebas

Ejecuta `npm test` antes de incorporar una nueva funcionalidad. No requiere instalar dependencias.
