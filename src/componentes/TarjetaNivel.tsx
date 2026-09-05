import { AlertTriangle, ArrowUp, Scissors } from 'lucide-react'
import { type Convencion, type NivelId, type NombreGenerado, NOMBRE_NIVEL } from '../tipos'
import { LIMITE_TECNICO } from '../nomenclatura'
import { Copiar } from './Copiar'

interface Props {
  convencion: Convencion
  nivel: NivelId
  nombre: NombreGenerado
  onMoverAntes: (bloqueId: string) => void
}

export function TarjetaNivel({ convencion, nivel, nombre, onMoverAntes }: Props) {
  const ancho = convencion.anchoCorte
  const limite = LIMITE_TECNICO[convencion.plataforma]
  const seCorta = nombre.longitud > ancho
  const pasaLimite = nombre.longitud > limite

  const colorContador = pasaLimite ? 'text-rojo' : seCorta ? 'text-ambar' : 'text-lima'

  return (
    <article className="tarjeta p-3" data-testid={`nivel-${nivel}`}>
      <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-tenue">
          {NOMBRE_NIVEL[convencion.plataforma][nivel]}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-xs font-semibold ${colorContador}`}>
            {nombre.longitud} car.
          </span>
          <Copiar texto={nombre.texto} titulo={NOMBRE_NIVEL[convencion.plataforma][nivel]} />
        </div>
      </header>

      {nombre.texto ? (
        <>
          <p
            className="mb-2 break-all rounded-md border border-borde bg-fondo px-2.5 py-2 font-mono text-[13px] leading-relaxed text-tinta"
            data-testid="nombre-completo"
          >
            {nombre.texto}
          </p>

          {/* Previsualizacion del corte: lo que se ve y lo que se pierde. */}
          <div className="mb-2">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-tenue">
              <Scissors size={11} aria-hidden />
              En una columna de {ancho} caracteres
            </p>
            <p className="break-all rounded-md border border-borde bg-fondo px-2.5 py-2 font-mono text-[13px] leading-relaxed">
              <span className="text-tinta">{nombre.visible}</span>
              {nombre.oculto && (
                <>
                  <span className="mx-px font-bold text-rojo" aria-hidden>
                    |
                  </span>
                  <span className="bg-[#2A1A1E] text-masTenue" title="No se ve en la columna">
                    {nombre.oculto}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Mapa de bloques: cual entra y cual se queda fuera. */}
          <ul className="flex flex-wrap gap-1">
            {nombre.segmentos.map((s) => {
              const fuera = s.inicio >= ancho
              const partido = !fuera && s.fin > ancho
              return (
                <li
                  key={s.bloqueId}
                  className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                    fuera
                      ? 'border-rojo bg-[#2A1A1E] text-rojo'
                      : partido
                        ? 'border-ambar bg-[#2A2113] text-ambarSuave'
                        : 'border-borde bg-panelAlto text-tenue'
                  }`}
                  title={`${s.nombreBloque}${s.clave ? ' (bloque clave)' : ''}`}
                >
                  {s.nombreBloque}
                  {s.clave && <span className="ml-1 text-ambar">•</span>}
                </li>
              )
            })}
          </ul>

          {nombre.avisos.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {nombre.avisos.map((aviso) => (
                <div
                  key={aviso.bloqueId}
                  data-testid="aviso-truncado"
                  data-gravedad={aviso.gravedad}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-ambar bg-[#241C0C] px-2.5 py-2 text-xs text-ambarSuave"
                >
                  <AlertTriangle size={13} className="shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <strong className="font-semibold text-ambar">{aviso.nombreBloque}</strong>{' '}
                    {aviso.gravedad === 'invisible'
                      ? 'no se ve en el informe: queda entero detrás del corte.'
                      : 'se parte por la mitad en el informe.'}
                  </span>
                  <button
                    type="button"
                    className="boton shrink-0 !py-1 !text-[11px]"
                    onClick={() => onMoverAntes(aviso.bloqueId)}
                  >
                    <ArrowUp size={11} aria-hidden />
                    Moverlo antes
                  </button>
                </div>
              ))}
            </div>
          )}

          {pasaLimite && (
            <p className="mt-2 rounded-md border border-rojo bg-[#2A1A1E] px-2.5 py-2 text-xs text-rojo">
              Supera el límite técnico de {limite} caracteres de{' '}
              {convencion.plataforma === 'meta' ? 'Meta' : 'Google Ads'}: la plataforma lo rechazará.
            </p>
          )}
        </>
      ) : (
        <p className="rounded-md border border-dashed border-borde px-2.5 py-3 text-xs text-tenue">
          Ningún bloque de este nivel tiene valor. Rellena al menos uno en el panel de la izquierda
          y el nombre aparece aquí.
        </p>
      )}
    </article>
  )
}
