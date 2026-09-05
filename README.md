# Nomenclador

Dos herramientas para montar una campaña antes de gastar un euro: un generador de nomenclatura que
devuelve los tres nombres —campaña, conjunto o grupo, y anuncio— ya formateados para pegar en Ads
Manager con la UTM que cuadra con ellos, y una calculadora que dice cuánto hay que invertir para
llegar a la meta y si los números dan.

**En vivo:** https://app09.reto.icebergmarketingdigital.com

## Para quién

Para quien lleva varias cuentas publicitarias a la vez y escribe los mismos cuatro nombres cada vez
que lanza una campaña. Con 15 clientes, cada uno con su formato, la consistencia deja de ser
cuestión de memoria.

## Qué resuelve

No existe una convención oficial de nomenclatura. Lo transversal en las buenas prácticas es la
consistencia: sin espacios, guion bajo entre conceptos, guion normal dentro de un concepto de
varias palabras y nada de abreviaturas que no se entiendan solas. Por eso la app no trae una
convención cableada, sino convenciones **configurables**, con una plantilla por defecto sensata.

### El aviso de truncado

Meta admite nombres de unos 400 caracteres y Google Ads 128, pero las columnas de Ads Manager y las
exportaciones **truncan el texto visible mucho antes**, entre 40 y 60 caracteres según la vista. La
consecuencia práctica es que un nombre largo se corta justo donde está el identificador del test, y
ese dato nunca aparece en el informe.

La app muestra en vivo:

- el contador de caracteres de cada nivel;
- una previsualización del nombre **cortado** al ancho típico de columna, con el punto de corte
  marcado y la parte invisible atenuada;
- el mapa de bloques, señalando cuáles caen del lado que no se ve;
- un aviso cuando un bloque marcado como clave queda fuera, con un botón para moverlo antes en el
  orden.

El ancho de corte es configurable (20–100, con atajos a 40/45/50/60). Es un valor observado en la
práctica, no un límite oficial de la plataforma, y la interfaz lo dice.

## Funciones

| | |
|---|---|
| **Constructor de convención** | Bloques con nombre, nivel y orden. Separador entre conceptos y entre palabras, y capitalización. Varias convenciones guardadas, una por cliente si hace falta. |
| **Catálogo por bloque** | Cada bloque guarda sus valores con etiqueta legible y abreviatura (`Conversiones = CONV`). Aparecen como sugerencias al escribir, y siempre se puede escribir uno nuevo. |
| **Jerarquía que hereda** | Los bloques se heredan hacia abajo: lo que se pone en campaña aparece también en conjunto y anuncio. Cambiar un valor arriba actualiza los tres nombres al instante. |
| **Normalización** | Quita tildes y espacios, sustituye la ñ, colapsa separadores repetidos y aplica la capitalización. `Clínica Aurora Dental` sale como `CLINICA-AURORA-DENTAL`. |
| **UTM que cuadra** | Con valores fijos, o con parámetros dinámicos: `{{campaign.name}}`, `{{adset.name}}`, `{{ad.name}}`, `{{placement}}` y `{{site_source_name}}` en Meta; ValueTrack (`{keyword}`, `{matchtype}`, `{network}`, `{campaignid}`…) en Google. |
| **Generación en lote** | Se pegan listas de valores en los bloques que se quieran variar y salen todas las combinaciones (producto cartesiano), hasta 300. |
| **Salida** | Copiar cada nombre por separado, los tres de una, o todos los del lote. Exportación a CSV con una fila por nivel: nombre, caracteres, parte visible, parte oculta, aviso y URL con UTM. |


## Calculadora de presupuesto

Segunda pestaña, mismo cliente. Se introducen la meta mensual, el ticket o valor del lead, el margen
bruto, la conversión del destino, el CTR estimado y el CPC o CPM esperado; devuelve la inversión
mensual y su equivalente diario, el ROAS de equilibrio y el proyectado, el coste máximo y el
proyectado por resultado, y el volumen de impresiones, clics y conversiones.

**Cada resultado enseña su fórmula con los números ya sustituidos**, porque estos paneles se enseñan
a clientes y hay que poder defender cada cifra:

```
Inversión mensual   1.200,00 €    ← 1.250 clics × 0,96 € de CPC
Coste máximo/lead     176,00 €    ← 320,00 € × 55 % de margen
ROAS de equilibrio       1,82×    ← 1 ÷ 55 % de margen
```

### El semáforo mira dos cosas distintas

1. **Rentabilidad**, que es aritmética pura: el coste por resultado proyectado frente al máximo que
   deja cada resultado (`ticket × margen`). Si lo supera, la campaña pierde dinero por diseño.
2. **Realismo**, frente a un rango de coste por resultado. Si el techo que puedes pagar está por
   debajo del mínimo del rango, no compras ese resultado a ese precio ni con la campaña perfecta.

El semáforo global toma el peor de los dos, y cuando sale rojo despeja las tres salidas: a cuánto
habría que subir el ticket, el margen o la conversión para llegar al equilibrio.

> **Los rangos de referencia son del usuario, no de la plataforma.** Ni Meta ni Google publican coste
> por resultado por sector, así que no hay dato oficial que citar. La app trae cuatro rangos de
> partida, marcados como estimación propia y editables, para poder contrastar con datos propios.

El escenario se guarda junto a la convención, y **«Pasar al nomenclador»** deja la inversión como un
bloque más del nombre (`…_1200EUR`), lo anota en el panel de nombres y lo exporta en el CSV.

### El CTR, una entrada que el encargo no pedía

Sin CTR no se puede pasar de clics a impresiones ni calcular con CPM: son dos de las salidas
pedidas. Está como campo visible y editable, no escondido en una constante.

## Detalles que importan

- **Google no devuelve el nombre de la campaña por ValueTrack**, solo su identificador. Por eso en
  Google el nombre va escrito en la UTM y los ID se añaden aparte, en vez de fingir que hay un
  equivalente a `{{campaign.name}}`.
- Las llaves de los parámetros dinámicos **no se codifican**: si se escapan, ni Meta ni Google las
  reconocen al servir el anuncio.
- El CSV sale con `;` y BOM, que es lo que abre bien en Excel en español; Google Sheets detecta el
  delimitador solo.

## Stack

Vite · React 18 · TypeScript · Tailwind CSS · lucide-react.

Sin backend, sin base de datos y sin llamadas de red: todo se guarda en el `localStorage` del
navegador, así que funciona sin conexión una vez cargada la página. No hay cuentas ni registro.

```bash
npm install
npm run dev      # http://localhost:5179
npm run build
./deploy.sh      # build local + subida al servidor
```

## Capturas

| | |
|---|---|
| ![Escritorio](capturas/01-desktop.png) | ![Móvil](capturas/02-mobile.png) |
| ![Generación en lote](capturas/03-accion.png) | |

En `capturas/prueba-real/` hay nueve capturas más, tomadas contra la app publicada: el constructor
de convención, los tres niveles, el aviso de truncado, las UTM de Meta y de Google, el lote, la
calculadora y el semáforo en rojo.
