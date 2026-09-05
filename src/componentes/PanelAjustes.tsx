import { Info } from 'lucide-react'
import { type Capitalizacion, type Convencion, type Plataforma, NOMBRE_PLATAFORMA } from '../tipos'
import { LIMITE_TECNICO } from '../nomenclatura'

const ANCHOS_TIPICOS = [40, 45, 50, 60]

interface Props {
  convencion: Convencion
  onCambiar: (parcial: Partial<Convencion>) => void
}

export function PanelAjustes({ convencion, onCambiar }: Props) {
  return (
    <section className="tarjeta p-3">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-tenue">Formato</h2>

      <div className="mb-3">
        <span className="etiqueta mb-1">Plataforma</span>
        <div className="grid grid-cols-2 gap-1.5">
          {(['meta', 'google'] as Plataforma[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={convencion.plataforma === p}
              className={`rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors ${
                convencion.plataforma === p
                  ? 'border-ambar bg-[#2A2113] text-ambar'
                  : 'border-borde bg-panelAlto text-tenue hover:border-bordeAlto'
              }`}
              onClick={() => onCambiar({ plataforma: p })}
            >
              {NOMBRE_PLATAFORMA[p]}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-tenue">
          Cambia el nombre del nivel intermedio, los parámetros dinámicos de la UTM y el límite
          técnico ({LIMITE_TECNICO[convencion.plataforma]} caracteres).
        </p>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <label className="block">
          <span className="etiqueta mb-1">Entre conceptos</span>
          <input
            className="campo text-center font-mono"
            maxLength={3}
            value={convencion.separador}
            onChange={(e) => onCambiar({ separador: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="etiqueta mb-1">Entre palabras</span>
          <input
            className="campo text-center font-mono"
            maxLength={3}
            value={convencion.separadorPalabra}
            onChange={(e) => onCambiar({ separadorPalabra: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="etiqueta mb-1">Mayúsculas</span>
          <select
            className="campo"
            value={convencion.capitalizacion}
            onChange={(e) => onCambiar({ capitalizacion: e.target.value as Capitalizacion })}
          >
            <option value="ninguna">Tal cual</option>
            <option value="mayusculas">MAYÚS</option>
            <option value="minusculas">minús</option>
          </select>
        </label>
      </div>

      <div className="mb-3 rounded-md border border-borde bg-panelAlto p-2.5">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="etiqueta">Ancho de columna</span>
          <span className="font-mono text-xs font-bold text-ambar">
            {convencion.anchoCorte} car.
          </span>
        </div>
        <input
          type="range"
          min={20}
          max={100}
          step={1}
          value={convencion.anchoCorte}
          aria-label={`Ancho de columna: ${convencion.anchoCorte} caracteres`}
          className="w-full accent-[#FFB020]"
          onChange={(e) => onCambiar({ anchoCorte: Number(e.target.value) })}
        />
        <div className="mt-1.5 grid grid-cols-4 gap-1">
          {ANCHOS_TIPICOS.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={convencion.anchoCorte === a}
              className={`rounded border px-1 py-1 font-mono text-[11px] transition-colors ${
                convencion.anchoCorte === a
                  ? 'border-ambar text-ambar'
                  : 'border-borde text-tenue hover:border-bordeAlto'
              }`}
              onClick={() => onCambiar({ anchoCorte: a })}
            >
              {a}
            </button>
          ))}
        </div>
        <p className="mt-2 flex gap-1.5 text-[11px] leading-snug text-tenue">
          <Info size={12} className="mt-px shrink-0" aria-hidden />
          <span>
            Entre 40 y 60 caracteres es lo que suele caber en una columna de Ads Manager o en una
            exportación. Es un valor observado en la práctica, no un límite oficial de la
            plataforma: ajústalo a la vista que uses.
          </span>
        </p>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="etiqueta mb-1">URL de destino</span>
          <input
            className="campo font-mono text-xs"
            placeholder="https://tusitio.com/pagina"
            value={convencion.urlBase}
            onChange={(e) => onCambiar({ urlBase: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="etiqueta mb-1">utm_source</span>
            <input
              className="campo font-mono text-xs"
              value={convencion.utmSource}
              onChange={(e) => onCambiar({ utmSource: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="etiqueta mb-1">utm_medium</span>
            <input
              className="campo font-mono text-xs"
              value={convencion.utmMedium}
              onChange={(e) => onCambiar({ utmMedium: e.target.value })}
            />
          </label>
        </div>
      </div>
    </section>
  )
}
