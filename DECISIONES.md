# Decisiones de diseño

Por qué Nomenclador hace lo que hace. Cada punto es una decisión que se podría haber tomado al
revés, con el motivo por el que no se tomó así.

---

## 1. La convención es configurable, no está cableada

**La decisión.** La app no impone un formato de nombre. Trae una plantilla por defecto sensata y
deja definir los bloques, su orden, los separadores y la capitalización, con tantas convenciones
guardadas como haga falta.

**Por qué.** Porque **no existe una convención oficial de nomenclatura**. Ni Meta ni Google publican
una, y las que circulan son buenas prácticas de agencia, no estándares. Lo que sí es transversal es
otra cosa, y es más pequeña:

- consistencia dentro de una cuenta y entre cuentas;
- sin espacios;
- guion bajo para separar conceptos, guion normal dentro de un concepto de varias palabras;
- nada de abreviaturas que no se entiendan solas.

Eso son reglas de forma, no un formato concreto. Una app que cableara *un* formato estaría
inventándose autoridad que no tiene, y además fallaría en el caso real que la motiva: quien lleva
varias cuentas se encuentra con clientes que ya tienen su propio formato y no lo van a cambiar
porque una herramienta lo diga.

**La consecuencia técnica.** El orden de los bloques es **una sola lista global**, y cada nivel
filtra los que le tocan. Por eso el nombre del anuncio es siempre el de campaña ampliado, la
herencia sale gratis y cambiar un valor arriba actualiza los tres nombres sin un solo `useEffect`
de sincronización.

**Lo que se descartó.** Tres o cuatro plantillas fijas entre las que elegir. Habría sido más rápido
de construir y habría dejado fuera al primer cliente con un formato propio.

---

## 2. El ancho de corte por defecto es 45, y no es un límite de Meta

**La decisión.** El corte se previsualiza a 45 caracteres por defecto, es configurable entre 20 y
100, tiene atajos a 40/45/50/60, y la interfaz dice literalmente que es un valor observado en la
práctica y **no un límite oficial de la plataforma**.

**Por qué 45.** Porque el rango que se observa en las columnas de Ads Manager y en las
exportaciones está **entre 40 y 60 caracteres** según la vista, el zoom y el ancho de la pantalla.
45 está en la parte baja de ese rango: es el valor que hace que la herramienta avise antes de
tiempo en vez de demasiado tarde. Un aviso de más se descarta en un segundo; un identificador de
test que no aparece en el informe se descubre un mes después.

**Por qué se insiste en que no es oficial.** Porque hay **dos límites distintos** y confundirlos
lleva a decisiones malas:

| | Meta | Google Ads |
|---|---|---|
| Límite técnico del nombre | ~400 caracteres | 128 caracteres |
| Ancho visible en columna | 40–60, según la vista | 40–60, según la vista |

El técnico lo impone la plataforma y la app lo enseña aparte, en rojo, cuando se supera. El visible
**no lo publica nadie**: depende de la vista. Presentarlo como dato oficial sería inventarse una
fuente, y además haría que el usuario no lo ajustara a su caso, que es justo lo que tiene que hacer.

**El diseño que sale de ahí.** El corte no se enseña como un veredicto, sino como una simulación
manipulable: se mueve el ancho y se ve en vivo qué bloques entran y cuáles no.

---

## 3. En Google el nombre se escribe a mano en `utm_campaign`

**La decisión.** En Meta, la UTM dinámica usa los parámetros que rellena la plataforma:

```
utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}
&utm_term={{adset.name}}&utm_content={{ad.name}}&utm_placement={{placement}}
```

En Google, `utm_campaign` lleva el **nombre generado, escrito**, y los identificadores de ValueTrack
se añaden aparte:

```
utm_source=google&utm_medium=cpc&utm_campaign=nordicfit_search_marca_es
&utm_term={keyword}&utm_content={creative}&utm_matchtype={matchtype}
&utm_network={network}&utm_device={device}&campaignid={campaignid}&adgroupid={adgroupid}
```

**Por qué.** Porque **ValueTrack no devuelve el nombre de la campaña**. Devuelve `{campaignid}`, que
es un número. No hay equivalente a `{{campaign.name}}` en Google, y la app lo dice en la interfaz en
vez de disimularlo.

La tentación era rellenar el hueco con algo que se le pareciera, para que las dos plataformas
tuvieran el mismo aspecto. Habría producido una analítica rota **en silencio**: informes con
`utm_campaign` vacío o con un número que no cuadra con ningún nombre de Ads Manager, descubierto
semanas después al intentar cruzar datos. Una herramienta que existe para que los informes cuadren
no puede ser la causa de que no cuadren.

**El coste asumido.** En Google, si renombras la campaña después de lanzarla, la UTM deja de
coincidir con el nombre. Es un coste real, y es honesto: la alternativa no era evitarlo, era
ocultarlo.

**Detalle que costaría un día de depuración.** Las llaves **no se codifican**.
`encodeURIComponent('{{campaign.name}}')` produce `%7B%7Bcampaign.name%7D%7D`, y ni Meta ni Google
lo reconocen al servir el anuncio. La función que compone la cadena deja pasar las llaves y escapa
todo lo demás.

---

## 4. Cada resultado enseña su fórmula

**La decisión.** Bajo cada cifra de la calculadora va la operación que la produjo, con los números
ya sustituidos:

```
Inversión mensual    1.200,00 €    ← 1.250 clics × 0,96 € de CPC = 1.200,00 €
Coste máximo/lead      176,00 €    ← 320,00 € × 55 % de margen = 176,00 €
ROAS de equilibrio        1,82×    ← 1 ÷ 55 % de margen = 1,82×
Impresiones            138.889     ← 1.250 clics ÷ 0,90 % de CTR = 138.889
```

**Por qué.** Porque estos paneles se enseñan a clientes, y un número sin origen en una reunión de
presupuesto es indefendible. La pregunta «¿de dónde sale que necesito 1.200 € al mes?» tiene que
poder responderse señalando la pantalla, no abriendo una hoja de cálculo aparte.

Hay un segundo motivo, menos obvio: **la fórmula visible es una auditoría permanente del modelo**.
Si alguna vez el cálculo se equivoca, se ve en la fórmula antes que en el resultado, porque el
resultado solo es un número plausible y la fórmula dice qué se hizo con qué.

**La consecuencia técnica.** El motor devuelve `{ valor, formula }` en vez de un número suelto. La
fórmula se compone en el mismo sitio donde se calcula, así que **no puede desincronizarse** del
resultado: no hay forma de cambiar el cálculo y dejar la explicación vieja.

**Y una comprobación aparte.** La prueba de aceptación recalcula las once cifras a mano, sin
importar nada del motor, y las compara con lo que muestra la interfaz. Si la prueba usara la misma
función que valida, compartiría sus errores.

---

## 5. Los rangos de referencia son del usuario, y se dice en pantalla

**La decisión.** La calculadora contrasta el coste máximo por resultado contra un rango de
referencia. Ese rango:

- viene con cuatro valores de partida (lead por formulario, lead por WhatsApp, venta de e-commerce,
  venta de ticket alto);
- es **editable** en la propia interfaz, con mínimo y máximo;
- se guarda junto al cliente, en su moneda;
- y lleva al lado un aviso que dice **«estos rangos son tuyos»** y explica por qué.

**Por qué.** Porque **ni Meta ni Google publican coste por resultado por sector**. No existe el dato
oficial que uno esperaría citar. Lo que circula por internet como «benchmark de CPL en el sector X»
son medias de agencias sobre sus propias cuentas, sin metodología publicada y sin relación con el
mercado, la oferta ni el país de quien las lee.

Poner una de esas cifras en la app y presentarla como referencia sería **inventarse una autoridad**.
Peor aún: el usuario la enseñaría a un cliente, el cliente tomaría una decisión con ella, y el
origen sería un número que alguien copió de un blog.

**La salida honesta.** Dar unos valores de partida que sirvan para empezar, decir clarísimo de dónde
salen —de ningún sitio oficial— y hacer que se editen en dos clics con los datos de las cuentas
propias, que son los únicos que valen para ese cliente.

**Cómo se usa.** El semáforo mira **dos cosas distintas**, y separarlas importa porque las salidas
son distintas:

| | Qué compara | Si falla |
|---|---|---|
| **Rentabilidad** | coste proyectado por resultado vs. `ticket × margen` | Aritmética: la campaña pierde dinero por diseño. Se arregla con precio, margen o conversión. |
| **Realismo** | `ticket × margen` vs. el rango de referencia | Puedes tener margen y aun así no comprar ese resultado a ese precio. Puede no tener arreglo. |

El semáforo global toma el peor de los dos. Solo el primero es aritmética pura; el segundo depende
de un dato que el usuario aporta, y por eso está marcado como suyo.

---

## Los dos escenarios de la prueba real

Ambos ejecutados contra la app publicada, con clientes ficticios. Las cifras son las que devuelve la
app; las capturas están en `capturas/prueba-real/`.

### Verde — Aurora Dental (clínica, capta leads)

| Entrada | Valor |
|---|---|
| Meta mensual | 40 leads |
| Valor del lead | 320,00 € |
| Margen bruto | 55 % |
| Conversión del destino | 3,20 % |
| CTR estimado | 0,90 % |
| CPC esperado | 0,96 € |
| Rango de referencia | Lead por formulario · 8,00 €–35,00 € |

| Resultado | Valor | Fórmula |
|---|---|---|
| Inversión mensual | **1.200,00 €** | 1.250 clics × 0,96 € de CPC |
| Equivalente diario | 39,42 € | 1.200,00 € ÷ 30,44 días |
| Impresiones | 138.889 | 1.250 clics ÷ 0,90 % de CTR |
| Clics | 1.250 | 40 leads ÷ 3,20 % |
| Coste por lead proyectado | 30,00 € | 1.200,00 € ÷ 40 leads |
| Coste máximo por lead | **176,00 €** | 320,00 € × 55 % de margen |
| ROAS de equilibrio | 1,82× | 1 ÷ 55 % de margen |
| ROAS proyectado | 10,67× | 12.800,00 € ÷ 1.200,00 € |
| Ingresos | 12.800,00 € | 40 leads × 320,00 € |
| Margen bruto | 7.040,00 € | 12.800,00 € × 55 % |
| Tras la inversión | **5.840,00 €** | 7.040,00 € − 1.200,00 € |

**Diagnóstico: verde.** Paga 30 € por lead de los 176 € que puede permitirse: **83 % de colchón**. Y
su techo de 176 € está por encima del máximo de 35 € que él mismo estima para un lead de
formulario, así que hay sitio para pagar de más y seguir ganando.

### Rojo — Bruma Accesorios (e-commerce de ticket bajo)

| Entrada | Valor |
|---|---|
| Meta mensual | 150 ventas |
| Ticket promedio | 24,00 € |
| Margen bruto | 25 % |
| Conversión del destino | 1,80 % |
| CTR estimado | 1,10 % |
| CPC esperado | 0,72 € |
| Rango de referencia | Venta de e-commerce · 15,00 €–60,00 € |

| Resultado | Valor | Fórmula |
|---|---|---|
| Inversión mensual | **6.000,00 €** | 8.333 clics × 0,72 € de CPC |
| Equivalente diario | 197,11 € | 6.000,00 € ÷ 30,44 días |
| Impresiones | 757.576 | 8.333 clics ÷ 1,10 % de CTR |
| Clics | 8.333 | 150 ventas ÷ 1,80 % |
| Coste por venta proyectado | **40,00 €** | 6.000,00 € ÷ 150 ventas |
| Coste máximo por venta | **6,00 €** | 24,00 € × 25 % de margen |
| ROAS de equilibrio | 4,00× | 1 ÷ 25 % de margen |
| ROAS proyectado | **0,60×** | 3.600,00 € ÷ 6.000,00 € |

**Diagnóstico: rojo por los dos motivos.**

- *Rentabilidad*: pagaría 40,00 € por venta y solo puede permitirse 6,00 €. Cada venta costaría
  34,00 € más de lo que deja.
- *Realismo*: su techo de 6,00 € está por debajo del mínimo de 15,00 € que él mismo estima para una
  venta de e-commerce. Aunque la campaña saliera perfecta, no compra ese resultado a ese precio.

**Las tres salidas que despeja la app:**

| Vía | De | A |
|---|---|---|
| Ticket | 24,00 € | **160,00 €** |
| Margen | 25 % | *no hay salida*: haría falta un 167 %, y el margen no pasa del 100 % |
| Conversión | 1,80 % | **12,00 %** |

Ese último cuadro es el argumento entero del módulo: el problema no está en las creatividades ni en
la segmentación, y ninguna de las tres vías es realista. La decisión correcta es **no lanzar**, y se
puede tomar antes de gastar el primer euro.
