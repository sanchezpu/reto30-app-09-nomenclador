import { type Convencion, type NivelId, type NombreGenerado, NIVELES, NOMBRE_NIVEL_CORTO } from './tipos'
import { generarTodos } from './nomenclatura'
import { calcular, dinero } from './presupuesto'
import { cadenaConsulta, parametrosUtm, urlConUtm, type ModoUtm } from './utm'

/** Tope de seguridad: por encima de esto ya no es un lote, es un incendio. */
export const MAXIMO_FILAS = 300

export interface Variacion {
  bloqueId: string
  valores: string[]
}

export interface FilaLote {
  /** Valor usado en cada bloque variado, en el orden de las variaciones. */
  combinacion: { bloqueId: string; nombreBloque: string; valor: string }[]
  nombres: Record<NivelId, NombreGenerado>
}

/** Producto cartesiano de las listas pegadas en cada bloque. */
export function combinaciones(listas: string[][]): string[][] {
  return listas.reduce<string[][]>(
    (acumulado, lista) => acumulado.flatMap((previa) => lista.map((v) => [...previa, v])),
    [[]],
  )
}

export function totalCombinaciones(variaciones: Variacion[]): number {
  const activas = variaciones.filter((v) => v.valores.length > 0)
  if (activas.length === 0) return 0
  return activas.reduce((total, v) => total * v.valores.length, 1)
}

export function generarLote(convencion: Convencion, variaciones: Variacion[]): FilaLote[] {
  const activas = variaciones.filter((v) => v.valores.length > 0)
  if (activas.length === 0) return []

  return combinaciones(activas.map((v) => v.valores))
    .slice(0, MAXIMO_FILAS)
    .map((valores) => {
      const bloques = convencion.bloques.map((b) => {
        const i = activas.findIndex((v) => v.bloqueId === b.id)
        return i >= 0 ? { ...b, valor: valores[i] } : b
      })
      const variante: Convencion = { ...convencion, bloques }
      return {
        combinacion: activas.map((v, i) => ({
          bloqueId: v.bloqueId,
          nombreBloque: convencion.bloques.find((b) => b.id === v.bloqueId)?.nombre ?? v.bloqueId,
          valor: valores[i],
        })),
        nombres: generarTodos(variante),
      }
    })
}

/** Trocea el texto pegado: una linea o una coma separan valores. */
export function leerLista(texto: string): string[] {
  return texto
    .split(/[\n,]/)
    .map((v) => v.trim())
    .filter(Boolean)
}

// --- Exportacion a CSV ---------------------------------------------------

function celda(valor: string): string {
  const limpio = valor.replace(/"/g, '""')
  return /[";\n]/.test(limpio) ? `"${limpio}"` : limpio
}

function descripcionAvisos(nombre: NombreGenerado): string {
  if (nombre.avisos.length === 0) return ''
  return nombre.avisos
    .map((a) => `${a.nombreBloque}: ${a.gravedad === 'invisible' ? 'no se ve' : 'se corta'}`)
    .join(' · ')
}

const CABECERA = [
  'combinacion',
  'nivel',
  'nombre',
  'caracteres',
  'visible_al_corte',
  'oculto_al_corte',
  'aviso',
  'url_con_utm',
  'inversion_mensual',
  'coste_por_resultado',
]

function filasDeNombres(
  convencion: Convencion,
  nombres: Record<NivelId, NombreGenerado>,
  etiquetaCombinacion: string,
  modoUtm: ModoUtm,
): string[][] {
  const url = urlConUtm(convencion.urlBase, parametrosUtm(convencion, nombres, modoUtm))
  // Solo si el presupuesto se paso al nomenclador: si no, las columnas van vacias.
  const p = convencion.presupuesto
  const calculo = p.campanaAsociada ? calcular(p) : null
  const inversion = calculo?.valido ? dinero(calculo.inversionMensual.valor, p.moneda) : ''
  const cpa = calculo?.valido ? dinero(calculo.cpaProyectado.valor, p.moneda) : ''
  return NIVELES.map((nivel) => {
    const n = nombres[nivel]
    return [
      etiquetaCombinacion,
      NOMBRE_NIVEL_CORTO[convencion.plataforma][nivel],
      n.texto,
      String(n.longitud),
      n.visible,
      n.oculto,
      descripcionAvisos(n),
      // La URL es la misma para los tres niveles: solo se escribe en la fila del anuncio.
      nivel === 'anuncio' ? url : '',
      nivel === 'campana' ? inversion : '',
      nivel === 'campana' ? cpa : '',
    ]
  })
}

function componerCsv(filas: string[][]): string {
  const lineas = [CABECERA, ...filas].map((f) => f.map(celda).join(';'))
  // El BOM hace que Excel abra bien las tildes.
  return '\ufeff' + lineas.join('\r\n') + '\r\n'
}

export function csvDeNombres(
  convencion: Convencion,
  nombres: Record<NivelId, NombreGenerado>,
  modoUtm: ModoUtm,
): string {
  return componerCsv(filasDeNombres(convencion, nombres, 'individual', modoUtm))
}

export function csvDeLote(convencion: Convencion, filas: FilaLote[], modoUtm: ModoUtm): string {
  return componerCsv(
    filas.flatMap((fila, i) => {
      const etiqueta = `${i + 1}. ${fila.combinacion.map((c) => c.valor).join(' + ')}`
      return filasDeNombres(convencion, fila.nombres, etiqueta, modoUtm)
    }),
  )
}

export function descargarCsv(contenido: string, nombreArchivo: string): void {
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function nombreArchivo(convencion: Convencion, sufijo: string): string {
  const base = convencion.nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  const fecha = new Date().toISOString().slice(0, 10)
  return `${base || 'convencion'}-${sufijo}-${fecha}.csv`
}

export { cadenaConsulta }
