import { type Convencion, type NivelId, type NombreGenerado } from './tipos'

export type ModoUtm = 'fijo' | 'dinamico'

export interface ParametroUtm {
  clave: string
  valor: string
  /** Explicacion corta de por que ese valor. Se muestra bajo la cadena. */
  nota?: string
}

/**
 * Meta rellena los parametros dinamicos al servir el anuncio, asi que la
 * analitica trae exactamente el nombre que se ve en Ads Manager.
 */
function parametrosMetaDinamicos(convencion: Convencion): ParametroUtm[] {
  return [
    { clave: 'utm_source', valor: '{{site_source_name}}', nota: 'devuelve fb, ig, an o msg' },
    { clave: 'utm_medium', valor: convencion.utmMedium || 'paid_social' },
    { clave: 'utm_campaign', valor: '{{campaign.name}}' },
    { clave: 'utm_term', valor: '{{adset.name}}' },
    { clave: 'utm_content', valor: '{{ad.name}}' },
    { clave: 'utm_placement', valor: '{{placement}}', nota: 'no es estandar, pero Meta lo rellena' },
  ]
}

/**
 * Google no expone el nombre de la campana por ValueTrack: solo el id. Por eso
 * el nombre va escrito y los identificadores se anaden aparte.
 */
function parametrosGoogleDinamicos(
  convencion: Convencion,
  nombres: Record<NivelId, NombreGenerado>,
): ParametroUtm[] {
  return [
    { clave: 'utm_source', valor: convencion.utmSource || 'google' },
    { clave: 'utm_medium', valor: convencion.utmMedium || 'cpc' },
    { clave: 'utm_campaign', valor: nombres.campana.texto, nota: 'ValueTrack no devuelve el nombre, solo {campaignid}' },
    { clave: 'utm_term', valor: '{keyword}' },
    { clave: 'utm_content', valor: '{creative}' },
    { clave: 'utm_matchtype', valor: '{matchtype}' },
    { clave: 'utm_network', valor: '{network}', nota: 'g = búsqueda, s = socios, d = display' },
    { clave: 'utm_device', valor: '{device}' },
    { clave: 'campaignid', valor: '{campaignid}' },
    { clave: 'adgroupid', valor: '{adgroupid}' },
  ]
}

function parametrosFijos(
  convencion: Convencion,
  nombres: Record<NivelId, NombreGenerado>,
): ParametroUtm[] {
  const porDefecto = convencion.plataforma === 'meta' ? 'facebook' : 'google'
  const medioPorDefecto = convencion.plataforma === 'meta' ? 'paid_social' : 'cpc'
  return [
    { clave: 'utm_source', valor: convencion.utmSource || porDefecto },
    { clave: 'utm_medium', valor: convencion.utmMedium || medioPorDefecto },
    { clave: 'utm_campaign', valor: nombres.campana.texto },
    { clave: 'utm_term', valor: nombres.conjunto.texto },
    { clave: 'utm_content', valor: nombres.anuncio.texto },
  ]
}

export function parametrosUtm(
  convencion: Convencion,
  nombres: Record<NivelId, NombreGenerado>,
  modo: ModoUtm,
): ParametroUtm[] {
  if (modo === 'fijo') return parametrosFijos(convencion, nombres)
  return convencion.plataforma === 'meta'
    ? parametrosMetaDinamicos(convencion)
    : parametrosGoogleDinamicos(convencion, nombres)
}

/**
 * Las llaves de los parametros dinamicos se dejan tal cual: si se codifican,
 * ni Meta ni Google las reconocen al servir el anuncio.
 */
function codificar(valor: string): string {
  if (/^\{\{.+\}\}$/.test(valor) || /^\{.+\}$/.test(valor)) return valor
  return encodeURIComponent(valor)
}

export function cadenaConsulta(parametros: ParametroUtm[]): string {
  return parametros
    .filter((p) => p.valor)
    .map((p) => `${p.clave}=${codificar(p.valor)}`)
    .join('&')
}

export function urlConUtm(urlBase: string, parametros: ParametroUtm[]): string {
  const consulta = cadenaConsulta(parametros)
  if (!consulta) return urlBase
  if (!urlBase) return `?${consulta}`
  const union = urlBase.includes('?') ? '&' : '?'
  return `${urlBase}${union}${consulta}`
}
