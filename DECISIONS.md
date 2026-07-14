# Decisiones de producto y diseño

## Objetivo de la primera versión

Ayudar a entender, con un caso concreto, que la fórmula de valoración del precio condiciona el resultado de una licitación. La v1 no pretende resolver la elección jurídica de una fórmula ni recomendar un precio de oferta.

## Alcance deliberadamente simple

- Datos fijos: presupuesto, ofertas, puntuaciones técnicas, umbrales y reglas de exclusión.
- Una fórmula visible cada vez, elegida mediante un desplegable accesible.
- Se muestran resultados en forma de tabla en escritorio y tarjetas equivalentes en móvil.
- No hay perfiles, edición de datos, comparación de dos fórmulas ni persistencia.

Mantener estos límites permite que el ejercicio concentre la atención en la interpretación de los resultados, no en la configuración del simulador.

## Decisiones de información

La tabla enseña el precio presentado, la baja, los puntos técnicos, los de precio, el total y el estado. El ganador se identifica por la mayor puntuación total, no por la oferta más barata. Una ficha explica cada fórmula y un texto bajo los resultados interpreta el ganador para este escenario.

El caso reproduce la regla proporcionada: Épsilon aparece como posible baja anormal en las fórmulas 1 y 3, y como excluida en las fórmulas 2 y 4. El aviso deja claro que se trata de una simplificación ilustrativa y no de una exclusión jurídica automática.

## Accesibilidad y diseño responsive

- HTML semántico, etiquetas asociadas y tablas con encabezados.
- Selector operable por teclado, foco visible y anuncio de cambios para lectores de pantalla.
- El color refuerza los estados, que además se expresan en texto.
- Contraste alto, tipografía del sistema y respeto por la preferencia de reducción de movimiento.
- Prioridad móvil: las filas se convierten en tarjetas para evitar el desplazamiento horizontal; la tabla completa se conserva en escritorio.

El objetivo práctico es WCAG 2.2 AA en los aspectos aplicables a este prototipo.

## Siguientes iteraciones

1. Permitir cambiar ponderaciones, umbrales y ofertas.
2. Comparar dos fórmulas lado a lado.
3. Crear recorridos específicos para adjudicadores y licitadores.
4. Añadir escenarios y validaciones configurables.
