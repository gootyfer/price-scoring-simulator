# Decisiones de producto y diseño

## Objetivo

Mostrar, con un caso concreto, que la fórmula de precio condiciona el resultado de una licitación. Es una herramienta ilustrativa: no sustituye el análisis jurídico ni recomienda una oferta concreta.

## Modelo actual

- La interfaz sigue tres pasos: configurar el escenario, elegir la fórmula y revisar el resultado.
- Las ofertas de los cinco licitadores se mantienen como porcentajes fijos del presupuesto base.
- Técnica y precio suman siempre 100 puntos. Al variar el peso del precio, las notas técnicas se escalan proporcionalmente.
- Los umbrales de baja anormal y de saciedad se configuran de forma independiente.
- Los controles ofrecen rangos y saltos habituales en licitaciones, en vez de admitir cualquier valor: presupuesto desde 10.000 € en saltos de 10.000 €, y puntos o porcentajes de 5 en 5.
- Se muestra una fórmula cada vez; el ganador es quien logra mayor puntuación total. Los empates se resuelven mostrando todos los ganadores.

## Límites deliberados

- Sin backend, persistencia ni perfiles de usuario.
- Sin edición individual de ofertas ni comparación simultánea de fórmulas.
- En las fórmulas 1 y 3, una baja anormal se señala; en las fórmulas 2 y 4 se excluye para reproducir el escenario del ejercicio.

## Calidad

El prototipo prioriza móvil, semántica HTML, navegación por teclado, contraste y estados expresados también en texto. Las reglas esenciales se verifican con `npm test` antes de incorporar funcionalidades.
