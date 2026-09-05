import {
  type Bloque,
  type Capitalizacion,
  type Convencion,
  type NivelId,
  type NombreGenerado,
  type Plataforma,
  type Segmento,
  NIVELES,
} from './tipos'

/** Limite tecnico del nombre en cada plataforma. Nada que ver con el corte visual. */
export const LIMITE_TECNICO: Record<Plataforma, number> = {
  meta: 400,
  google: 128,
}

/** Un nivel hereda todos los bloques de los niveles por encima de el. */
export function nivelesHasta(nivel: NivelId): NivelId[] {
  return NIVELES.slice(0, NIVELES.indexOf(nivel) + 1)
}

export function aplicarCapitalizacion(texto: string, modo: Capitalizacion): string {
  if (modo === 'mayusculas') return texto.toUpperCase()
  if (modo === 'minusculas') return texto.toLowerCase()
  return texto
}

/**
 * Deja un valor listo para pegarse en Ads Manager: sin espacios, sin tildes,
 * las palabras de un mismo concepto unidas por el separador de palabra.
 */
export function normalizarValor(valor: string, convencion: Convencion): string {
  const { separador, separadorPalabra } = convencion
  let t = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  t = t.replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
  // El separador de conceptos dentro de un valor rompe la lectura del nombre.
  if (separador) t = t.split(separador).join(separadorPalabra || '')
  t = t.replace(/[\s/\\|,;:.]+/g, separadorPalabra || '')
  // Fuera todo lo que no sea alfanumerico o el separador de palabra.
  const permitido = separadorPalabra ? escaparClase(separadorPalabra) : ''
  t = t.replace(new RegExp(`[^A-Za-z0-9${permitido}]`, 'g'), '')
  if (separadorPalabra) {
    const esc = escaparRegExp(separadorPalabra)
    t = t.replace(new RegExp(`(?:${esc})+`, 'g'), separadorPalabra)
    t = t.replace(new RegExp(`^(?:${esc})+|(?:${esc})+$`, 'g'), '')
  }
  return aplicarCapitalizacion(t, convencion.capitalizacion)
}

function escaparRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escaparClase(s: string): string {
  return s.replace(/[\]\\^-]/g, '\\$&')
}

/** Bloques que participan en un nivel, en el orden en que aparecen en el nombre. */
export function bloquesDeNivel(convencion: Convencion, nivel: NivelId): Bloque[] {
  const activos = new Set(nivelesHasta(nivel))
  return convencion.bloques.filter((b) => activos.has(b.nivel))
}

/**
 * Construye el nombre de un nivel y devuelve tambien donde empieza y acaba
 * cada bloque, que es lo que permite saber que se pierde al truncar.
 */
export function generarNombre(convencion: Convencion, nivel: NivelId): NombreGenerado {
  const segmentos: Segmento[] = []
  const partes: string[] = []
  let cursor = 0

  for (const bloque of bloquesDeNivel(convencion, nivel)) {
    const texto = normalizarValor(bloque.valor, convencion)
    if (!texto) continue
    if (partes.length > 0) cursor += convencion.separador.length
    segmentos.push({
      bloqueId: bloque.id,
      nombreBloque: bloque.nombre,
      clave: bloque.clave,
      texto,
      inicio: cursor,
      fin: cursor + texto.length,
    })
    cursor += texto.length
    partes.push(texto)
  }

  const texto = partes.join(convencion.separador)
  const ancho = convencion.anchoCorte

  return {
    nivel,
    texto,
    segmentos,
    longitud: texto.length,
    visible: texto.slice(0, ancho),
    oculto: texto.slice(ancho),
    avisos: segmentos
      .filter((s) => s.clave && s.fin > ancho)
      .map((s) => ({
        bloqueId: s.bloqueId,
        nombreBloque: s.nombreBloque,
        gravedad: s.inicio >= ancho ? ('invisible' as const) : ('cortado' as const),
      })),
  }
}

export function generarTodos(convencion: Convencion): Record<NivelId, NombreGenerado> {
  return {
    campana: generarNombre(convencion, 'campana'),
    conjunto: generarNombre(convencion, 'conjunto'),
    anuncio: generarNombre(convencion, 'anuncio'),
  }
}

export function moverBloque(convencion: Convencion, bloqueId: string, delta: number): Bloque[] {
  const bloques = [...convencion.bloques]
  const i = bloques.findIndex((b) => b.id === bloqueId)
  const j = i + delta
  if (i < 0 || j < 0 || j >= bloques.length) return bloques
  const [movido] = bloques.splice(i, 1)
  bloques.splice(j, 0, movido)
  return bloques
}

export function nuevoId(): string {
  return Math.random().toString(36).slice(2, 10)
}
