import { useState } from 'react'
import { ChevronDown, ChevronUp, ListPlus, Plus, Star, Trash2 } from 'lucide-react'
import { type Bloque, type Convencion, type NivelId, NIVELES, NOMBRE_NIVEL_CORTO } from '../tipos'
import { normalizarValor, nuevoId } from '../nomenclatura'

/** El catalogo se edita como texto: "Etiqueta = VALOR" por linea. */
function catalogoATexto(bloque: Bloque): string {
  return bloque.catalogo.map((o) => `${o.etiqueta} = ${o.valor}`).join('\n')
}

function textoACatalogo(texto: string) {
  return texto
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean)
    .map((linea) => {
      const i = linea.indexOf('=')
      if (i < 0) return { etiqueta: linea, valor: linea }
      return { etiqueta: linea.slice(0, i).trim(), valor: linea.slice(i + 1).trim() }
    })
    .filter((o) => o.valor)
}

interface Props {
  convencion: Convencion
  onCambiarBloque: (id: string, parcial: Partial<Bloque>) => void
  onMover: (id: string, delta: number) => void
  onBorrar: (id: string) => void
  onAnadir: () => void
}

export function ListaBloques({ convencion, onCambiarBloque, onMover, onBorrar, onAnadir }: Props) {
  const [abierto, setAbierto] = useState<string | null>(null)

  return (
    <section className="tarjeta p-3">
      <header className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-tenue">
          Bloques del nombre
        </h2>
        <button type="button" className="boton" onClick={onAnadir}>
          <Plus size={13} aria-hidden />
          Añadir
        </button>
      </header>
      <p className="mb-2.5 text-[11px] leading-snug text-tenue">
        El orden de la lista es el orden en el nombre. Cada bloque se hereda hacia abajo: lo que
        pongas en campaña aparece también en conjunto y anuncio. La estrella marca los bloques que
        no pueden perderse al truncar.
      </p>

      <ul className="space-y-1.5">
        {convencion.bloques.map((bloque, i) => {
          const listaId = `catalogo-${bloque.id}`
          const previsualizacion = normalizarValor(bloque.valor, convencion)
          const estaAbierto = abierto === bloque.id
          return (
            <li key={bloque.id} className="rounded-md border border-borde bg-panelAlto p-2">
              <div className="flex items-start gap-1.5">
                <div className="flex shrink-0 flex-col gap-0.5 pt-0.5">
                  <button
                    type="button"
                    className="rounded border border-borde p-0.5 text-tenue transition-colors hover:border-bordeAlto hover:text-tinta disabled:opacity-30"
                    disabled={i === 0}
                    aria-label={`Subir ${bloque.nombre}`}
                    title={`Subir ${bloque.nombre}`}
                    onClick={() => onMover(bloque.id, -1)}
                  >
                    <ChevronUp size={12} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="rounded border border-borde p-0.5 text-tenue transition-colors hover:border-bordeAlto hover:text-tinta disabled:opacity-30"
                    disabled={i === convencion.bloques.length - 1}
                    aria-label={`Bajar ${bloque.nombre}`}
                    title={`Bajar ${bloque.nombre}`}
                    onClick={() => onMover(bloque.id, 1)}
                  >
                    <ChevronDown size={12} aria-hidden />
                  </button>
                </div>

                <div className="grid min-w-0 flex-1 grid-cols-1 gap-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <input
                    className="campo !py-1 text-xs font-semibold"
                    value={bloque.nombre}
                    aria-label={`Nombre del bloque ${i + 1}`}
                    onChange={(e) => onCambiarBloque(bloque.id, { nombre: e.target.value })}
                  />
                  <div className="flex min-w-0 gap-1.5">
                    <select
                      className="campo !py-1 min-w-0 flex-1 text-xs"
                      value={bloque.nivel}
                      aria-label={`Nivel de ${bloque.nombre}`}
                      onChange={(e) =>
                        onCambiarBloque(bloque.id, { nivel: e.target.value as NivelId })
                      }
                    >
                      {NIVELES.map((n) => (
                        <option key={n} value={n}>
                          {NOMBRE_NIVEL_CORTO[convencion.plataforma][n]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      aria-pressed={bloque.clave}
                      aria-label={`${bloque.nombre}: bloque clave`}
                      title={
                        bloque.clave
                          ? `${bloque.nombre} es un bloque clave: avisa si se corta`
                          : `Marcar ${bloque.nombre} como bloque clave`
                      }
                      className={`shrink-0 rounded-md border px-1.5 transition-colors ${
                        bloque.clave
                          ? 'border-ambar text-ambar'
                          : 'border-borde text-masTenue hover:text-tenue'
                      }`}
                      onClick={() => onCambiarBloque(bloque.id, { clave: !bloque.clave })}
                    >
                      <Star size={13} fill={bloque.clave ? 'currentColor' : 'none'} aria-hidden />
                    </button>
                  </div>

                  <div className="flex min-w-0 gap-1.5 sm:col-span-2">
                    <input
                      className="campo !py-1 min-w-0 flex-1 font-mono text-xs"
                      list={listaId}
                      placeholder="valor…"
                      value={bloque.valor}
                      aria-label={`Valor de ${bloque.nombre}`}
                      onChange={(e) => onCambiarBloque(bloque.id, { valor: e.target.value })}
                    />
                    <datalist id={listaId}>
                      {bloque.catalogo.map((o) => (
                        <option key={o.valor} value={o.valor} label={o.etiqueta} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      aria-expanded={estaAbierto}
                      aria-label={`Catálogo de ${bloque.nombre}`}
                      title={`Editar el catálogo de ${bloque.nombre} (${bloque.catalogo.length} valores)`}
                      className={`shrink-0 rounded-md border px-1.5 transition-colors ${
                        estaAbierto
                          ? 'border-ambar text-ambar'
                          : 'border-borde text-masTenue hover:text-tenue'
                      }`}
                      onClick={() => setAbierto(estaAbierto ? null : bloque.id)}
                    >
                      <ListPlus size={13} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Borrar ${bloque.nombre}`}
                      title={`Borrar ${bloque.nombre}`}
                      className="shrink-0 rounded-md border border-borde px-1.5 text-masTenue transition-colors hover:border-rojo hover:text-rojo"
                      onClick={() => onBorrar(bloque.id)}
                    >
                      <Trash2 size={13} aria-hidden />
                    </button>
                  </div>
                </div>
              </div>

              {previsualizacion !== bloque.valor.trim() && bloque.valor.trim() !== '' && (
                <p className="mt-1 pl-6 font-mono text-[11px] text-cian">
                  se escribe: {previsualizacion || '(vacío)'}
                </p>
              )}

              {estaAbierto && (
                <div className="mt-2 rounded-md border border-borde bg-fondo p-2">
                  <label className="etiqueta mb-1 block" htmlFor={`txt-${bloque.id}`}>
                    Catálogo · una línea por valor, «Etiqueta = VALOR»
                  </label>
                  <textarea
                    id={`txt-${bloque.id}`}
                    className="campo min-h-[92px] font-mono text-xs"
                    defaultValue={catalogoATexto(bloque)}
                    onBlur={(e) =>
                      onCambiarBloque(bloque.id, { catalogo: textoACatalogo(e.target.value) })
                    }
                  />
                  <p className="mt-1 text-[11px] text-tenue">
                    Los valores del catálogo aparecen como sugerencias al escribir. Puedes escribir
                    uno que no esté en la lista.
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {convencion.bloques.length === 0 && (
        <p className="rounded-md border border-dashed border-borde px-3 py-4 text-center text-xs text-tenue">
          Esta convención no tiene bloques todavía. Añade el primero y el nombre empezará a
          construirse solo.
        </p>
      )}
    </section>
  )
}

export function bloqueNuevo(): Bloque {
  return {
    id: nuevoId(),
    nombre: 'Bloque',
    nivel: 'campana',
    clave: false,
    catalogo: [],
    valor: '',
  }
}
