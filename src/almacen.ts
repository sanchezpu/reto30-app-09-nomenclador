import { type Convencion } from './tipos'
import { convencionesDemo } from './demo'

const CLAVE = 'nomenclador.estado.v1'

export interface EstadoGuardado {
  convenciones: Convencion[]
  activaId: string
}

export function estadoInicial(): EstadoGuardado {
  const convenciones = convencionesDemo()
  return { convenciones, activaId: convenciones[0].id }
}

/**
 * Nunca devuelve una lista vacia: si el navegador no guarda nada o lo guardado
 * esta corrupto, la app arranca con los ejemplos en vez de con la pantalla en blanco.
 */
export function cargar(): EstadoGuardado {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return estadoInicial()
    const datos = JSON.parse(crudo) as Partial<EstadoGuardado>
    if (!Array.isArray(datos.convenciones) || datos.convenciones.length === 0) {
      return estadoInicial()
    }
    const convenciones = datos.convenciones.filter(
      (c) => c && typeof c.id === 'string' && Array.isArray(c.bloques),
    )
    if (convenciones.length === 0) return estadoInicial()
    const activaId = convenciones.some((c) => c.id === datos.activaId)
      ? (datos.activaId as string)
      : convenciones[0].id
    return { convenciones, activaId }
  } catch {
    return estadoInicial()
  }
}

/**
 * Devuelve false si el navegador no deja guardar (modo privado, cuota llena,
 * almacenamiento bloqueado). La app sigue funcionando en memoria, pero hay que
 * decirlo: perder el trabajo en silencio es peor que no guardarlo.
 */
export function guardar(estado: EstadoGuardado): boolean {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado))
    return true
  } catch {
    return false
  }
}
