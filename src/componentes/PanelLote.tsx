import { useMemo, useState } from 'react'
import { AlertTriangle, Download, Layers } from 'lucide-react'
import { type Convencion, NIVELES, NOMBRE_NIVEL_CORTO } from '../tipos'
import {
  MAXIMO_FILAS,
  csvDeLote,
  descargarCsv,
  generarLote,
  leerLista,
  nombreArchivo,
  totalCombinaciones,
  type Variacion,
} from '../lote'
import { type ModoUtm } from '../utm'
import { Copiar } from './Copiar'

interface Props {
  convencion: Convencion
  modoUtm: ModoUtm
}

export function PanelLote({ convencion, modoUtm }: Props) {
  const [textos, setTextos] = useState<Record<string, string>>({})

  const variaciones = useMemo<Variacion[]>(
    () =>
      convencion.bloques
        .map((b) => ({ bloqueId: b.id, valores: leerLista(textos[b.id] ?? '') }))
        .filter((v) => v.valores.length > 0),
    [convencion.bloques, textos],
  )

  const total = totalCombinaciones(variaciones)
  const filas = useMemo(() => generarLote(convencion, variaciones), [convencion, variaciones])
  const recortado = total > MAXIMO_FILAS

  const todoElTexto = filas
    .flatMap((f) => NIVELES.map((n) => f.nombres[n].texto))
    .filter(Boolean)
    .join('\n')

  return (
    <section className="tarjeta p-3">
      <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tenue">
          <Layers size={13} aria-hidden />
          Generación en lote
        </h2>
        <span className="font-mono text-xs font-semibold text-ambar" data-testid="lote-total">
          {total === 0 ? 'sin combinaciones' : `${total} combinacion${total === 1 ? '' : 'es'}`}
        </span>
      </header>
      <p className="mb-2.5 text-[11px] leading-snug text-tenue">
        Pega una lista de valores en los bloques que quieras variar —uno por línea o separados por
        comas— y salen todas las combinaciones. Los bloques que dejes vacíos conservan el valor del
        panel de arriba.
      </p>

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {convencion.bloques.map((b) => (
          <label key={b.id} className="block">
            <span className="etiqueta mb-1">
              {b.nombre}
              <span className="ml-1.5 font-normal normal-case tracking-normal text-masTenue">
                {NOMBRE_NIVEL_CORTO[convencion.plataforma][b.nivel]}
              </span>
            </span>
            <textarea
              className="campo min-h-[54px] resize-y font-mono text-xs"
              aria-label={`Lista de valores para ${b.nombre}`}
              placeholder={`fijo: ${b.valor || '(vacío)'}`}
              value={textos[b.id] ?? ''}
              onChange={(e) => setTextos((prev) => ({ ...prev, [b.id]: e.target.value }))}
            />
          </label>
        ))}
      </div>

      {recortado && (
        <p className="mb-2 flex items-start gap-1.5 rounded-md border border-ambar bg-[#241C0C] px-2.5 py-2 text-xs text-ambarSuave">
          <AlertTriangle size={13} className="mt-px shrink-0" aria-hidden />
          <span>
            {total} combinaciones son demasiadas para revisarlas de una. Se muestran y exportan las
            primeras {MAXIMO_FILAS}; quita valores de algún bloque para bajar el número.
          </span>
        </p>
      )}

      {filas.length > 0 ? (
        <>
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              className="boton-fuerte"
              onClick={() =>
                descargarCsv(
                  csvDeLote(convencion, filas, modoUtm),
                  nombreArchivo(convencion, 'lote'),
                )
              }
            >
              <Download size={13} aria-hidden />
              Exportar CSV ({filas.length * 3} filas)
            </button>
            <Copiar texto={todoElTexto} etiqueta="Copiar todos los nombres" />
          </div>

          <ol
            className="max-h-[420px] space-y-1.5 overflow-y-auto rounded-md border border-borde bg-fondo p-2"
            data-testid="lote-filas"
          >
            {filas.map((fila, i) => (
              <li key={i} className="rounded-md border border-borde bg-panelAlto p-2" data-testid="lote-fila">
                <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-ambar">
                  {i + 1}. {fila.combinacion.map((c) => `${c.nombreBloque}: ${c.valor}`).join(' · ')}
                </p>
                <div className="space-y-1">
                  {NIVELES.map((nivel) => {
                    const n = fila.nombres[nivel]
                    const seCorta = n.longitud > convencion.anchoCorte
                    const conAviso = n.avisos.length > 0
                    return (
                      <div key={nivel} className="flex items-start gap-1.5">
                        <span className="w-[62px] shrink-0 pt-0.5 text-[10px] font-semibold uppercase text-masTenue">
                          {NOMBRE_NIVEL_CORTO[convencion.plataforma][nivel]}
                        </span>
                        <span className="min-w-0 flex-1 break-all font-mono text-[11px] text-tinta">
                          {n.texto || '—'}
                        </span>
                        <span
                          className={`shrink-0 pt-0.5 font-mono text-[10px] ${
                            conAviso ? 'text-rojo' : seCorta ? 'text-ambar' : 'text-masTenue'
                          }`}
                          title={
                            conAviso
                              ? `Se pierde al truncar: ${n.avisos.map((a) => a.nombreBloque).join(', ')}`
                              : undefined
                          }
                        >
                          {n.longitud}
                          {conAviso && ' ⚠'}
                        </span>
                        <Copiar texto={n.texto} etiqueta="" titulo={n.texto} className="!px-1.5 !py-0.5" />
                      </div>
                    )
                  })}
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="rounded-md border border-dashed border-borde px-3 py-4 text-center text-xs text-tenue">
          Todavía no hay nada que combinar. Pega, por ejemplo, cuatro públicos en el bloque
          «Público» y saldrán los cuatro juegos de nombres completos.
        </p>
      )}
    </section>
  )
}
