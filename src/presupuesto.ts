import {
  type Diagnostico,
  type Escenario,
  type Magnitud,
  type Moneda,
  type ResultadoPresupuesto,
  type Luz,
  NOMBRE_RESULTADO,
} from './tipos'

/** Media de dias del mes (365,25 / 12). El reparto diario sale de aqui. */
export const DIAS_MES = 30.44

// --- Formato -------------------------------------------------------------

export function dinero(valor: number, moneda: Moneda): string {
  if (!Number.isFinite(valor)) return '—'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: moneda,
    maximumFractionDigits: moneda === 'COP' ? 0 : 2,
    minimumFractionDigits: moneda === 'COP' ? 0 : 2,
    // es-ES no agrupa por defecto los numeros de cuatro cifras, y en un panel
    // de cifras eso hace que 1200 y 12.800 parezcan de escalas distintas.
    useGrouping: true,
  }).format(valor)
}

export function entero(valor: number): string {
  if (!Number.isFinite(valor)) return '—'
  return new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(valor)
}

export function decimal(valor: number, cifras = 2): string {
  if (!Number.isFinite(valor)) return '—'
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: cifras,
    maximumFractionDigits: cifras,
  }).format(valor)
}

export function porcentaje(valor: number, cifras = 2): string {
  if (!Number.isFinite(valor)) return '—'
  return `${decimal(valor, cifras)} %`
}

const nada: Magnitud = { valor: NaN, formula: '—' }

// --- Calculo -------------------------------------------------------------

/**
 * Todo el modelo en un sitio. Cada magnitud viaja con la formula que la
 * produjo, ya con los numeros sustituidos, porque estos resultados se
 * enseñan a clientes y hay que poder defender cada uno.
 */
export function calcular(e: Escenario): ResultadoPresupuesto {
  const m = (moneda: number) => dinero(moneda, e.moneda)
  const nombre = NOMBRE_RESULTADO[e.tipoResultado]

  // Que falta para poder calcular.
  const faltan: string[] = []
  if (!(e.metaMensual > 0)) faltan.push('la meta mensual')
  if (!(e.ticket > 0)) faltan.push(e.tipoResultado === 'ventas' ? 'el ticket promedio' : 'el valor del lead')
  if (!(e.margen > 0)) faltan.push('el margen bruto')
  if (!(e.tasaConversion > 0)) faltan.push('la tasa de conversión')
  if (!(e.ctr > 0)) faltan.push('el CTR estimado')
  if (e.modeloCoste === 'cpc' && !(e.cpc > 0)) faltan.push('el CPC esperado')
  if (e.modeloCoste === 'cpm' && !(e.cpm > 0)) faltan.push('el CPM esperado')

  const conversion = e.tasaConversion / 100
  const ctr = e.ctr / 100
  const margen = e.margen / 100

  const vacio: Diagnostico = {
    luz: 'ambar',
    titulo: 'Faltan datos',
    detalle: 'Rellena todos los campos para ver el diagnóstico.',
  }

  if (faltan.length > 0) {
    return {
      valido: false,
      faltan,
      clics: nada,
      impresiones: nada,
      conversiones: nada,
      inversionMensual: nada,
      inversionDiaria: nada,
      ingresos: nada,
      margenBruto: nada,
      beneficio: nada,
      cpaProyectado: nada,
      cpaMaximo: nada,
      roasEquilibrio: nada,
      roasProyectado: nada,
      rentabilidad: vacio,
      realismo: vacio,
      semaforo: 'ambar',
      ajustes: null,
    }
  }

  // Volumen necesario para llegar a la meta.
  const clics = e.metaMensual / conversion
  const impresiones = clics / ctr

  // Inversion segun el modelo de coste elegido.
  const inversion =
    e.modeloCoste === 'cpc' ? clics * e.cpc : (impresiones / 1000) * e.cpm
  const inversionDia = inversion / DIAS_MES

  // Economia de la operacion.
  const ingresos = e.metaMensual * e.ticket
  const margenBruto = ingresos * margen
  const beneficio = margenBruto - inversion

  // Los dos numeros que deciden si esto se hace o no.
  const cpaProyectado = inversion / e.metaMensual
  const cpaMaximo = e.ticket * margen

  const roasEquilibrio = 1 / margen
  const roasProyectado = ingresos / inversion

  // Que habria que cambiar para llegar al equilibrio, despejando cada variable.
  const conversionNecesaria =
    e.modeloCoste === 'cpc'
      ? (e.cpc / cpaMaximo) * 100
      : (e.cpm / (cpaMaximo * ctr * 1000)) * 100

  const ajustes = {
    ticket: cpaProyectado / margen,
    margen: (cpaProyectado / e.ticket) * 100,
    conversion: conversionNecesaria,
  }

  // --- Diagnostico 1: rentabilidad (aritmetica pura, sin referencias) ---
  const holgura = cpaProyectado / cpaMaximo
  const rentabilidad: Diagnostico =
    holgura > 1
      ? {
          luz: 'rojo',
          titulo: 'Los números no dan',
          detalle:
            `Pagarías ${m(cpaProyectado)} por ${nombre.singular} y solo puedes permitirte ` +
            `${m(cpaMaximo)}. Cada ${nombre.singular} te costaría ${m(cpaProyectado - cpaMaximo)} ` +
            'más de lo que deja. No es un problema de creatividades: es de aritmética.',
        }
      : holgura > 0.7
        ? {
            luz: 'ambar',
            titulo: 'Margen ajustado',
            detalle:
              `El coste por ${nombre.singular} se come el ${porcentaje(holgura * 100, 0)} de lo que ` +
              'deja cada uno. Funciona, pero cualquier desvío en la conversión te deja en pérdidas.',
          }
        : {
            luz: 'verde',
            titulo: 'Los números dan',
            detalle:
              `Pagas ${m(cpaProyectado)} por ${nombre.singular} de los ${m(cpaMaximo)} que puedes ` +
              `permitirte: te queda un ${porcentaje((1 - holgura) * 100, 0)} de colchón.`,
          }

  // --- Diagnostico 2: realismo frente al rango que el propio usuario define ---
  const rango = e.referencias.find((r) => r.id === e.referenciaActiva)
  let realismo: Diagnostico
  if (!rango) {
    realismo = {
      luz: 'verde',
      titulo: 'Sin rango de referencia',
      detalle: 'Elige un rango de referencia para contrastar el coste por resultado.',
    }
  } else if (cpaMaximo < rango.min) {
    realismo = {
      luz: 'rojo',
      titulo: 'Fuera de tu propio rango',
      detalle:
        `Lo máximo que puedes pagar por ${nombre.singular} son ${m(cpaMaximo)}, por debajo del ` +
        `mínimo de ${m(rango.min)} que tú estimas para «${rango.etiqueta}». Aunque la campaña ` +
        'saliera perfecta, no compras ese resultado a ese precio. Cambia el ticket, el margen o ' +
        'la conversión antes de gastar.',
    }
  } else if (cpaMaximo < rango.max) {
    realismo = {
      luz: 'ambar',
      titulo: 'En la mitad baja de tu rango',
      detalle:
        `Tu techo de ${m(cpaMaximo)} cae dentro de «${rango.etiqueta}» (${m(rango.min)}–` +
        `${m(rango.max)}), pero sin holgura. Tendrías que estar en la parte buena del rango ` +
        'desde el primer mes.',
    }
  } else {
    realismo = {
      luz: 'verde',
      titulo: 'Holgado frente a tu rango',
      detalle:
        `Puedes pagar hasta ${m(cpaMaximo)}, por encima del máximo de ${m(rango.max)} que estimas ` +
        `para «${rango.etiqueta}». Hay sitio para pagar de más y seguir ganando.`,
    }
  }

  const peor = (a: Luz, b: Luz): Luz =>
    a === 'rojo' || b === 'rojo' ? 'rojo' : a === 'ambar' || b === 'ambar' ? 'ambar' : 'verde'

  const unidad = e.modeloCoste === 'cpc' ? 'CPC' : 'CPM'

  return {
    valido: true,
    faltan: [],
    clics: {
      valor: clics,
      formula: `${entero(e.metaMensual)} ${nombre.plural} ÷ ${porcentaje(e.tasaConversion)} = ${entero(clics)} clics`,
    },
    impresiones: {
      valor: impresiones,
      formula: `${entero(clics)} clics ÷ ${porcentaje(e.ctr)} de CTR = ${entero(impresiones)} impresiones`,
    },
    conversiones: {
      valor: e.metaMensual,
      formula: `${entero(clics)} clics × ${porcentaje(e.tasaConversion)} = ${entero(e.metaMensual)} ${nombre.plural}`,
    },
    inversionMensual: {
      valor: inversion,
      formula:
        e.modeloCoste === 'cpc'
          ? `${entero(clics)} clics × ${m(e.cpc)} de ${unidad} = ${m(inversion)}`
          : `(${entero(impresiones)} impresiones ÷ 1.000) × ${m(e.cpm)} de ${unidad} = ${m(inversion)}`,
    },
    inversionDiaria: {
      valor: inversionDia,
      formula: `${m(inversion)} ÷ ${decimal(DIAS_MES)} días = ${m(inversionDia)} al día`,
    },
    ingresos: {
      valor: ingresos,
      formula: `${entero(e.metaMensual)} ${nombre.plural} × ${m(e.ticket)} = ${m(ingresos)}`,
    },
    margenBruto: {
      valor: margenBruto,
      formula: `${m(ingresos)} × ${porcentaje(e.margen, 0)} de margen = ${m(margenBruto)}`,
    },
    beneficio: {
      valor: beneficio,
      formula: `${m(margenBruto)} de margen − ${m(inversion)} de inversión = ${m(beneficio)}`,
    },
    cpaProyectado: {
      valor: cpaProyectado,
      formula: `${m(inversion)} ÷ ${entero(e.metaMensual)} ${nombre.plural} = ${m(cpaProyectado)}`,
    },
    cpaMaximo: {
      valor: cpaMaximo,
      formula: `${m(e.ticket)} × ${porcentaje(e.margen, 0)} de margen = ${m(cpaMaximo)}`,
    },
    roasEquilibrio: {
      valor: roasEquilibrio,
      formula: `1 ÷ ${porcentaje(e.margen, 0)} de margen = ${decimal(roasEquilibrio)}×`,
    },
    roasProyectado: {
      valor: roasProyectado,
      formula: `${m(ingresos)} de ingresos ÷ ${m(inversion)} de inversión = ${decimal(roasProyectado)}×`,
    },
    rentabilidad,
    realismo,
    semaforo: peor(rentabilidad.luz, realismo.luz),
    ajustes,
  }
}

/** Rangos de partida. Son del usuario, no de la plataforma: se editan. */
export function referenciasPorDefecto() {
  return [
    { id: 'lead-form', etiqueta: 'Lead por formulario', min: 8, max: 35 },
    { id: 'lead-wa', etiqueta: 'Lead por WhatsApp', min: 5, max: 25 },
    { id: 'venta-ecom', etiqueta: 'Venta de e-commerce', min: 15, max: 60 },
    { id: 'venta-alta', etiqueta: 'Venta de ticket alto', min: 60, max: 250 },
  ]
}

/**
 * Escenario en blanco. Sirve para una convencion nueva y para completar las
 * guardadas antes de que existiera la calculadora.
 */
export function escenarioPorDefecto(): Escenario {
  return {
    tipoResultado: 'leads',
    metaMensual: 0,
    ticket: 0,
    margen: 0,
    tasaConversion: 0,
    ctr: 0,
    modeloCoste: 'cpc',
    cpc: 0,
    cpm: 0,
    moneda: 'EUR',
    referencias: referenciasPorDefecto(),
    referenciaActiva: 'lead-form',
  }
}
