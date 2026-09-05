import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRightLeft,
  Check,
  CircleAlert,
  Info,
  Pencil,
  Sigma,
} from 'lucide-react'
import {
  type Escenario,
  type Luz,
  type Magnitud,
  type ModeloCoste,
  type Moneda,
  type ResultadoPresupuesto,
  type TipoResultado,
  NOMBRE_RESULTADO,
} from '../tipos'
import { decimal, dinero, entero, porcentaje } from '../presupuesto'
import { Copiar } from './Copiar'

const COLOR_LUZ: Record<Luz, { borde: string; fondo: string; texto: string; punto: string }> = {
  verde: { borde: 'border-lima', fondo: 'bg-[#14210F]', texto: 'text-lima', punto: 'bg-lima' },
  ambar: { borde: 'border-ambar', fondo: 'bg-[#241C0C]', texto: 'text-ambarSuave', punto: 'bg-ambar' },
  rojo: { borde: 'border-rojo', fondo: 'bg-[#2A1A1E]', texto: 'text-rojo', punto: 'bg-rojo' },
}

// =====================================================================
// Panel de entrada
// =====================================================================

interface PropsEscenario {
  escenario: Escenario
  onCambiar: (parcial: Partial<Escenario>) => void
}

function CampoNumero({
  etiqueta,
  valor,
  sufijo,
  paso = 1,
  ayuda,
  onCambiar,
}: {
  etiqueta: string
  valor: number
  sufijo?: string
  paso?: number
  ayuda?: string
  onCambiar: (v: number) => void
}) {
  return (
    <label className="block">
      <span className="etiqueta mb-1">{etiqueta}</span>
      <span className="relative block">
        <input
          type="number"
          min={0}
          step={paso}
          inputMode="decimal"
          className="campo font-mono"
          aria-label={etiqueta}
          value={valor === 0 ? '' : String(valor)}
          onChange={(ev) => onCambiar(Math.max(0, Number(ev.target.value) || 0))}
        />
        {sufijo && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-masTenue">
            {sufijo}
          </span>
        )}
      </span>
      {ayuda && <span className="mt-1 block text-[11px] leading-snug text-tenue">{ayuda}</span>}
    </label>
  )
}

export function PanelEscenario({ escenario: e, onCambiar }: PropsEscenario) {
  const [editandoRangos, setEditandoRangos] = useState(false)
  const nombre = NOMBRE_RESULTADO[e.tipoResultado]
  const rango = e.referencias.find((r) => r.id === e.referenciaActiva)

  return (
    <>
      <section className="tarjeta p-3">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-tenue">
          Objetivo del mes
        </h2>

        <div className="mb-3">
          <span className="etiqueta mb-1">Qué compras</span>
          <div className="grid grid-cols-2 gap-1.5">
            {(['ventas', 'leads'] as TipoResultado[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={e.tipoResultado === t}
                className={`rounded-md border px-2 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  e.tipoResultado === t
                    ? 'border-ambar bg-[#2A2113] text-ambar'
                    : 'border-borde bg-panelAlto text-tenue hover:border-bordeAlto'
                }`}
                onClick={() => onCambiar({ tipoResultado: t })}
              >
                {NOMBRE_RESULTADO[t].plural}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <CampoNumero
            etiqueta={`Meta de ${nombre.plural} al mes`}
            valor={e.metaMensual}
            onCambiar={(v) => onCambiar({ metaMensual: v })}
          />
          <label className="block">
            <span className="etiqueta mb-1">Moneda</span>
            <select
              className="campo"
              aria-label="Moneda"
              value={e.moneda}
              onChange={(ev) => onCambiar({ moneda: ev.target.value as Moneda })}
            >
              <option value="EUR">EUR €</option>
              <option value="USD">USD $</option>
              <option value="COP">COP $</option>
            </select>
          </label>
          <CampoNumero
            etiqueta={e.tipoResultado === 'ventas' ? 'Ticket promedio' : 'Valor del lead'}
            valor={e.ticket}
            paso={0.01}
            onCambiar={(v) => onCambiar({ ticket: v })}
            ayuda={
              e.tipoResultado === 'leads'
                ? 'Lo que deja un lead de media: ticket × tasa de cierre. No el ticket de la venta.'
                : undefined
            }
          />
          <CampoNumero
            etiqueta="Margen bruto"
            valor={e.margen}
            sufijo="%"
            paso={0.5}
            onCambiar={(v) => onCambiar({ margen: Math.min(100, v) })}
          />
        </div>
      </section>

      <section className="tarjeta p-3">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-tenue">
          Rendimiento esperado
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <CampoNumero
            etiqueta="Conversión del destino"
            valor={e.tasaConversion}
            sufijo="%"
            paso={0.1}
            onCambiar={(v) => onCambiar({ tasaConversion: Math.min(100, v) })}
            ayuda="De cada 100 clics que llegan a la landing, al formulario o al WhatsApp."
          />
          <CampoNumero
            etiqueta="CTR estimado"
            valor={e.ctr}
            sufijo="%"
            paso={0.05}
            onCambiar={(v) => onCambiar({ ctr: Math.min(100, v) })}
            ayuda="Hace falta para estimar impresiones y para calcular con CPM."
          />
        </div>

        <div className="mt-3">
          <span className="etiqueta mb-1">Modelo de coste</span>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                ['cpc', 'CPC · por clic'],
                ['cpm', 'CPM · por mil impresiones'],
              ] as [ModeloCoste, string][]
            ).map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={e.modeloCoste === valor}
                className={`rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  e.modeloCoste === valor
                    ? 'border-ambar bg-[#2A2113] text-ambar'
                    : 'border-borde bg-panelAlto text-tenue hover:border-bordeAlto'
                }`}
                onClick={() => onCambiar({ modeloCoste: valor })}
              >
                {texto}
              </button>
            ))}
          </div>
          <div className="mt-2">
            {e.modeloCoste === 'cpc' ? (
              <CampoNumero
                etiqueta="CPC esperado"
                valor={e.cpc}
                paso={0.01}
                onCambiar={(v) => onCambiar({ cpc: v })}
              />
            ) : (
              <CampoNumero
                etiqueta="CPM esperado"
                valor={e.cpm}
                paso={0.1}
                onCambiar={(v) => onCambiar({ cpm: v })}
              />
            )}
          </div>
        </div>
      </section>

      <section className="tarjeta p-3">
        <header className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-tenue">
            Rango de referencia
          </h2>
          <button
            type="button"
            className="boton"
            aria-expanded={editandoRangos}
            onClick={() => setEditandoRangos(!editandoRangos)}
          >
            <Pencil size={12} aria-hidden />
            Editar
          </button>
        </header>

        <label className="block">
          <span className="sr-only">Rango de referencia activo</span>
          <select
            className="campo"
            aria-label="Rango de referencia activo"
            value={e.referenciaActiva}
            onChange={(ev) => onCambiar({ referenciaActiva: ev.target.value })}
          >
            {e.referencias.map((r) => (
              <option key={r.id} value={r.id}>
                {r.etiqueta} · {dinero(r.min, e.moneda)}–{dinero(r.max, e.moneda)}
              </option>
            ))}
          </select>
        </label>

        <p className="mt-2 flex gap-1.5 text-[11px] leading-snug text-tenue">
          <Info size={12} className="mt-px shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold text-ambarSuave">Estos rangos son tuyos.</strong> Ni
            Meta ni Google publican coste por resultado por sector, así que no hay dato oficial que
            citar: son una estimación propia, puesta aquí para poder contrastar. Edítalos con lo que
            veas en tus cuentas.
          </span>
        </p>

        {editandoRangos && (
          <ul className="mt-2 space-y-1.5">
            {e.referencias.map((r, i) => (
              <li key={r.id} className="rounded-md border border-borde bg-panelAlto p-2">
                <input
                  className="campo !py-1 mb-1.5 text-xs font-semibold"
                  aria-label={`Nombre del rango ${i + 1}`}
                  value={r.etiqueta}
                  onChange={(ev) =>
                    onCambiar({
                      referencias: e.referencias.map((x) =>
                        x.id === r.id ? { ...x, etiqueta: ev.target.value } : x,
                      ),
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-1.5">
                  <label className="block">
                    <span className="etiqueta mb-0.5">Mínimo</span>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      className="campo !py-1 font-mono text-xs"
                      aria-label={`Mínimo de ${r.etiqueta}`}
                      value={r.min}
                      onChange={(ev) =>
                        onCambiar({
                          referencias: e.referencias.map((x) =>
                            x.id === r.id ? { ...x, min: Number(ev.target.value) || 0 } : x,
                          ),
                        })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="etiqueta mb-0.5">Máximo</span>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      className="campo !py-1 font-mono text-xs"
                      aria-label={`Máximo de ${r.etiqueta}`}
                      value={r.max}
                      onChange={(ev) =>
                        onCambiar({
                          referencias: e.referencias.map((x) =>
                            x.id === r.id ? { ...x, max: Number(ev.target.value) || 0 } : x,
                          ),
                        })
                      }
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}

        {rango && !editandoRangos && (
          <p className="mt-2 font-mono text-[11px] text-masTenue">
            Contrastando contra {dinero(rango.min, e.moneda)}–{dinero(rango.max, e.moneda)} por{' '}
            {nombre.singular}.
          </p>
        )}
      </section>
    </>
  )
}

// =====================================================================
// Panel de salida
// =====================================================================

function Cifra({
  etiqueta,
  valor,
  magnitud,
  destacada,
  color,
}: {
  etiqueta: string
  valor: string
  magnitud: Magnitud
  destacada?: boolean
  color?: string
}) {
  return (
    <div
      className={`rounded-md border p-2.5 ${
        destacada ? 'border-ambar bg-[#1D1810]' : 'border-borde bg-panelAlto'
      }`}
    >
      <p className="etiqueta mb-1">{etiqueta}</p>
      <p
        className={`font-mono font-bold leading-none ${destacada ? 'text-xl' : 'text-base'} ${
          color ?? 'text-tinta'
        }`}
      >
        {valor}
      </p>
      <p className="mt-1.5 flex items-start gap-1 font-mono text-[10px] leading-snug text-tenue">
        <Sigma size={10} className="mt-0.5 shrink-0" aria-hidden />
        <span>{magnitud.formula}</span>
      </p>
    </div>
  )
}

interface PropsResultados {
  escenario: Escenario
  resultado: ResultadoPresupuesto
  nombreCampana: string
  onAsociar: () => void
}

export function PanelResultados({
  escenario: e,
  resultado: r,
  nombreCampana,
  onAsociar,
}: PropsResultados) {
  const m = (v: number) => dinero(v, e.moneda)
  const nombre = NOMBRE_RESULTADO[e.tipoResultado]
  const luz = COLOR_LUZ[r.semaforo]

  if (!r.valido) {
    return (
      <section className="tarjeta p-6" data-testid="presupuesto-incompleto">
        <h2 className="mb-2 text-sm font-bold text-tinta">Faltan datos para calcular</h2>
        <p className="text-xs leading-relaxed text-tenue">
          Necesito {r.faltan.join(', ').replace(/, ([^,]*)$/, ' y $1')}. En cuanto los rellenes, los
          resultados salen solos.
        </p>
      </section>
    )
  }

  const resumen = [
    `Escenario: ${entero(e.metaMensual)} ${nombre.plural}/mes`,
    `Inversión: ${m(r.inversionMensual.valor)}/mes (${m(r.inversionDiaria.valor)}/día)`,
    `Coste por ${nombre.singular}: ${m(r.cpaProyectado.valor)} (máximo ${m(r.cpaMaximo.valor)})`,
    `ROAS de equilibrio: ${decimal(r.roasEquilibrio.valor)}× · proyectado ${decimal(r.roasProyectado.valor)}×`,
    `Volumen: ${entero(r.clics.valor)} clics, ${entero(r.impresiones.valor)} impresiones`,
  ].join('\n')

  return (
    <>
      {/* Semaforo */}
      <section
        className={`rounded-lg border-2 p-3 ${luz.borde} ${luz.fondo}`}
        data-testid="semaforo"
        data-luz={r.semaforo}
      >
        <header className="mb-2.5 flex items-center gap-2">
          <span className="flex items-center gap-1" aria-hidden>
            {(['verde', 'ambar', 'rojo'] as Luz[]).map((l) => (
              <span
                key={l}
                className={`h-2.5 w-2.5 rounded-full ${
                  r.semaforo === l ? COLOR_LUZ[l].punto : 'bg-borde'
                }`}
              />
            ))}
          </span>
          <h2 className={`text-sm font-bold ${luz.texto}`}>
            {r.semaforo === 'rojo'
              ? 'No lances esto todavía'
              : r.semaforo === 'ambar'
                ? 'Se puede, pero sin margen de error'
                : 'Escenario viable'}
          </h2>
        </header>

        <div className="space-y-2">
          {[r.rentabilidad, r.realismo].map((d, i) => {
            const c = COLOR_LUZ[d.luz]
            return (
              <div
                key={i}
                className={`rounded-md border px-2.5 py-2 ${c.borde} bg-fondo`}
                data-testid="diagnostico"
                data-luz={d.luz}
              >
                <p className={`mb-0.5 flex items-center gap-1.5 text-xs font-bold ${c.texto}`}>
                  {d.luz === 'verde' ? (
                    <Check size={13} aria-hidden />
                  ) : d.luz === 'ambar' ? (
                    <AlertTriangle size={13} aria-hidden />
                  ) : (
                    <CircleAlert size={13} aria-hidden />
                  )}
                  {d.titulo}
                </p>
                <p className="text-xs leading-relaxed text-tinta">{d.detalle}</p>
              </div>
            )
          })}

          {r.semaforo === 'rojo' && r.ajustes && (
            <div className="rounded-md border border-borde bg-fondo px-2.5 py-2">
              <p className="mb-1.5 text-xs font-bold text-tinta">Para que cuadre, una de estas:</p>
              <ul className="space-y-1 font-mono text-[11px] text-tenue">
                <li>
                  Subir {e.tipoResultado === 'ventas' ? 'el ticket' : 'el valor del lead'} de{' '}
                  {m(e.ticket)} a <strong className="text-ambar">{m(r.ajustes.ticket)}</strong>
                </li>
                <li>
                  Subir el margen del {porcentaje(e.margen, 0)} al{' '}
                  <strong className="text-ambar">{porcentaje(r.ajustes.margen, 0)}</strong>
                </li>
                <li>
                  Subir la conversión del {porcentaje(e.tasaConversion)} al{' '}
                  <strong className="text-ambar">{porcentaje(r.ajustes.conversion)}</strong>
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Inversion */}
      <section className="tarjeta p-3">
        <header className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-tenue">
            Inversión necesaria
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <Copiar texto={resumen} etiqueta="Copiar resumen" />
            <button
              type="button"
              className="boton-fuerte"
              disabled={!nombreCampana}
              title={
                nombreCampana
                  ? `Asociar el presupuesto a ${nombreCampana}`
                  : 'Genera antes un nombre de campaña en la pestaña de nomenclatura'
              }
              onClick={onAsociar}
            >
              <ArrowRightLeft size={13} aria-hidden />
              Pasar al nomenclador
            </button>
          </div>
        </header>

        {e.campanaAsociada && (
          <p
            className="mb-2.5 rounded-md border border-lima bg-[#14210F] px-2.5 py-2 text-xs text-tinta"
            data-testid="presupuesto-asociado"
          >
            <Check size={12} className="mr-1 inline text-lima" aria-hidden />
            Presupuesto asociado a{' '}
            <strong className="break-all font-mono text-lima">{e.campanaAsociada}</strong>. El
            bloque «Presupuesto» ya forma parte del nombre y viaja en el CSV.
          </p>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Cifra
            etiqueta="Inversión mensual"
            valor={m(r.inversionMensual.valor)}
            magnitud={r.inversionMensual}
            destacada
          />
          <Cifra
            etiqueta="Equivalente diario"
            valor={m(r.inversionDiaria.valor)}
            magnitud={r.inversionDiaria}
            destacada
          />
        </div>
      </section>

      {/* Umbrales */}
      <section className="tarjeta p-3">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-tenue">
          Umbrales de rentabilidad
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Cifra
            etiqueta={`Coste máximo por ${nombre.singular}`}
            valor={m(r.cpaMaximo.valor)}
            magnitud={r.cpaMaximo}
            color="text-lima"
          />
          <Cifra
            etiqueta={`Coste por ${nombre.singular} proyectado`}
            valor={m(r.cpaProyectado.valor)}
            magnitud={r.cpaProyectado}
            color={r.cpaProyectado.valor > r.cpaMaximo.valor ? 'text-rojo' : 'text-tinta'}
          />
          <Cifra
            etiqueta="ROAS de equilibrio"
            valor={`${decimal(r.roasEquilibrio.valor)}×`}
            magnitud={r.roasEquilibrio}
            color="text-ambar"
          />
          <Cifra
            etiqueta="ROAS proyectado"
            valor={`${decimal(r.roasProyectado.valor)}×`}
            magnitud={r.roasProyectado}
            color={r.roasProyectado.valor < r.roasEquilibrio.valor ? 'text-rojo' : 'text-lima'}
          />
        </div>
        <p className="mt-2 text-[11px] leading-snug text-tenue">
          El ROAS de equilibrio es el que iguala margen bruto e inversión: por debajo de{' '}
          {decimal(r.roasEquilibrio.valor)}× estás pagando por facturar.
        </p>
      </section>

      {/* Volumen */}
      <section className="tarjeta p-3">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-tenue">
          Volumen estimado al mes
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Cifra etiqueta="Impresiones" valor={entero(r.impresiones.valor)} magnitud={r.impresiones} />
          <Cifra etiqueta="Clics" valor={entero(r.clics.valor)} magnitud={r.clics} />
          <Cifra
            etiqueta={nombre.plural}
            valor={entero(r.conversiones.valor)}
            magnitud={r.conversiones}
          />
        </div>
      </section>

      {/* Cuenta de resultados */}
      <section className="tarjeta p-3">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-tenue">
          Si el escenario se cumple
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Cifra etiqueta="Ingresos" valor={m(r.ingresos.valor)} magnitud={r.ingresos} />
          <Cifra etiqueta="Margen bruto" valor={m(r.margenBruto.valor)} magnitud={r.margenBruto} />
          <Cifra
            etiqueta="Tras la inversión"
            valor={m(r.beneficio.valor)}
            magnitud={r.beneficio}
            color={r.beneficio.valor < 0 ? 'text-rojo' : 'text-lima'}
          />
        </div>
        <p className="mt-2 text-[11px] leading-snug text-tenue">
          Margen bruto, no beneficio neto: no descuenta estructura, herramientas ni tu propio
          trabajo.
        </p>
      </section>
    </>
  )
}
