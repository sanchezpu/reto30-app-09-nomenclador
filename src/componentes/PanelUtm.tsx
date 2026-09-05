import { type Convencion, type NivelId, type NombreGenerado } from '../tipos'
import { cadenaConsulta, parametrosUtm, urlConUtm, type ModoUtm } from '../utm'
import { Copiar } from './Copiar'

interface Props {
  convencion: Convencion
  nombres: Record<NivelId, NombreGenerado>
  modo: ModoUtm
  onCambiarModo: (modo: ModoUtm) => void
}

export function PanelUtm({ convencion, nombres, modo, onCambiarModo }: Props) {
  const parametros = parametrosUtm(convencion, nombres, modo)
  const url = urlConUtm(convencion.urlBase, parametros)
  const esMeta = convencion.plataforma === 'meta'

  return (
    <section className="tarjeta p-3">
      <header className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-tenue">
          UTM que cuadra con el nombre
        </h2>
        <div className="flex gap-1">
          {(
            [
              ['fijo', 'Valores fijos'],
              ['dinamico', 'Parámetros dinámicos'],
            ] as [ModoUtm, string][]
          ).map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={modo === valor}
              className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                modo === valor
                  ? 'border-ambar bg-[#2A2113] text-ambar'
                  : 'border-borde bg-panelAlto text-tenue hover:border-bordeAlto'
              }`}
              onClick={() => onCambiarModo(valor)}
            >
              {texto}
            </button>
          ))}
        </div>
      </header>

      <p className="mb-2.5 text-[11px] leading-snug text-tenue">
        {modo === 'fijo'
          ? 'Los nombres se escriben tal cual en la URL. Sirve para cualquier plataforma y se ve exactamente lo que llegará a la analítica.'
          : esMeta
            ? 'Meta rellena estos parámetros al servir el anuncio, así que la analítica trae el mismo nombre que ves en Ads Manager aunque lo renombres después.'
            : 'Google no devuelve el nombre de la campaña por ValueTrack, solo su identificador. Por eso el nombre va escrito y los ID se añaden aparte.'}
      </p>

      <div className="mb-2.5 overflow-hidden rounded-md border border-borde">
        <table className="w-full text-left font-mono text-[11px]">
          <tbody>
            {parametros.map((p) => (
              <tr key={p.clave} className="border-b border-borde last:border-0">
                <th scope="row" className="w-[38%] bg-panelAlto px-2 py-1 font-semibold text-tenue">
                  {p.clave}
                </th>
                <td className="break-all px-2 py-1 text-tinta">
                  {p.valor}
                  {p.nota && <span className="ml-1.5 font-sans text-[10px] text-masTenue">{p.nota}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mb-2 break-all rounded-md border border-borde bg-fondo px-2.5 py-2 font-mono text-[11px] leading-relaxed text-tinta">
        {url || 'Escribe una URL de destino en el panel de la izquierda.'}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <Copiar texto={url} etiqueta="Copiar URL completa" fuerte />
        <Copiar texto={cadenaConsulta(parametros)} etiqueta="Copiar solo los parámetros" />
      </div>
    </section>
  )
}
