export type Plataforma = 'meta' | 'google'

/** Los tres niveles de la jerarquia, de mayor a menor. */
export type NivelId = 'campana' | 'conjunto' | 'anuncio'

export const NIVELES: NivelId[] = ['campana', 'conjunto', 'anuncio']

/** El nombre del nivel intermedio cambia segun la plataforma. */
export const NOMBRE_NIVEL: Record<Plataforma, Record<NivelId, string>> = {
  meta: { campana: 'Campaña', conjunto: 'Conjunto de anuncios', anuncio: 'Anuncio' },
  google: { campana: 'Campaña', conjunto: 'Grupo de anuncios', anuncio: 'Anuncio' },
}

export const NOMBRE_NIVEL_CORTO: Record<Plataforma, Record<NivelId, string>> = {
  meta: { campana: 'Campaña', conjunto: 'Conjunto', anuncio: 'Anuncio' },
  google: { campana: 'Campaña', conjunto: 'Grupo', anuncio: 'Anuncio' },
}

export const NOMBRE_PLATAFORMA: Record<Plataforma, string> = {
  meta: 'Meta Ads',
  google: 'Google Ads',
}

/** Un valor del catalogo de un bloque: lo que se lee y lo que se escribe. */
export interface OpcionBloque {
  etiqueta: string
  valor: string
}

export interface Bloque {
  id: string
  nombre: string
  /** Nivel en el que se introduce. Se hereda hacia los niveles inferiores. */
  nivel: NivelId
  /** Un bloque clave no puede quedar del lado invisible al truncar. */
  clave: boolean
  catalogo: OpcionBloque[]
  valor: string
}

export type Capitalizacion = 'ninguna' | 'minusculas' | 'mayusculas'

export interface Convencion {
  id: string
  nombre: string
  plataforma: Plataforma
  /** Separa conceptos distintos. Por convencion, guion bajo. */
  separador: string
  /** Separa palabras dentro de un mismo concepto. Por convencion, guion normal. */
  separadorPalabra: string
  capitalizacion: Capitalizacion
  /** El orden del array es el orden en el nombre. */
  bloques: Bloque[]
  /** Ancho de columna al que se previsualiza el corte. */
  anchoCorte: number
  /** Base de la URL para las UTM. */
  urlBase: string
  utmSource: string
  utmMedium: string
}

/** Un trozo del nombre generado, con su posicion exacta. */
export interface Segmento {
  bloqueId: string
  nombreBloque: string
  clave: boolean
  texto: string
  /** Indice del primer caracter del segmento dentro del nombre completo. */
  inicio: number
  /** Indice del ultimo caracter + 1. */
  fin: number
}

export interface AvisoTruncado {
  bloqueId: string
  nombreBloque: string
  /** 'cortado' = parte del bloque se ve; 'invisible' = no se ve nada. */
  gravedad: 'cortado' | 'invisible'
}

export interface NombreGenerado {
  nivel: NivelId
  texto: string
  segmentos: Segmento[]
  longitud: number
  /** Lo que se ve en una columna del ancho configurado. */
  visible: string
  oculto: string
  avisos: AvisoTruncado[]
}
