import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, FilePlus2, Files, RotateCcw, Trash2 } from 'lucide-react'
import { type Bloque, type Convencion, NIVELES, NOMBRE_PLATAFORMA } from './tipos'
import { generarTodos, moverBloque, nuevoId } from './nomenclatura'
import { cargar, estadoInicial, guardar, type EstadoGuardado } from './almacen'
import { csvDeNombres, descargarCsv, nombreArchivo } from './lote'
import { type ModoUtm } from './utm'
import { ListaBloques, bloqueNuevo } from './componentes/ListaBloques'
import { PanelAjustes } from './componentes/PanelAjustes'
import { PanelLote } from './componentes/PanelLote'
import { PanelUtm } from './componentes/PanelUtm'
import { TarjetaNivel } from './componentes/TarjetaNivel'
import { Copiar } from './componentes/Copiar'

function convencionNueva(): Convencion {
  const base: Bloque[] = [
    { id: nuevoId(), nombre: 'Cliente', nivel: 'campana', clave: true, catalogo: [], valor: '' },
    { id: nuevoId(), nombre: 'Objetivo', nivel: 'campana', clave: true, catalogo: [], valor: '' },
    { id: nuevoId(), nombre: 'Público', nivel: 'conjunto', clave: true, catalogo: [], valor: '' },
    { id: nuevoId(), nombre: 'Creativo', nivel: 'anuncio', clave: true, catalogo: [], valor: '' },
  ]
  return {
    id: nuevoId(),
    nombre: 'Convención sin nombre',
    plataforma: 'meta',
    separador: '_',
    separadorPalabra: '-',
    capitalizacion: 'mayusculas',
    anchoCorte: 45,
    urlBase: '',
    utmSource: 'facebook',
    utmMedium: 'paid_social',
    bloques: base,
  }
}

export default function App() {
  const [estado, setEstado] = useState<EstadoGuardado>(() => cargar())
  const [modoUtm, setModoUtm] = useState<ModoUtm>('fijo')
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)
  const [puedeGuardar, setPuedeGuardar] = useState(true)

  useEffect(() => {
    setPuedeGuardar(guardar(estado))
  }, [estado])

  const convencion =
    estado.convenciones.find((c) => c.id === estado.activaId) ?? estado.convenciones[0]

  const nombres = useMemo(() => generarTodos(convencion), [convencion])

  function actualizar(parcial: Partial<Convencion>) {
    setEstado((prev) => ({
      ...prev,
      convenciones: prev.convenciones.map((c) =>
        c.id === convencion.id ? { ...c, ...parcial } : c,
      ),
    }))
  }

  function cambiarBloque(id: string, parcial: Partial<Bloque>) {
    actualizar({ bloques: convencion.bloques.map((b) => (b.id === id ? { ...b, ...parcial } : b)) })
  }

  function seleccionar(id: string) {
    setConfirmandoBorrado(false)
    setEstado((prev) => ({ ...prev, activaId: id }))
  }

  function crear(duplicando: boolean) {
    const nueva: Convencion = duplicando
      ? {
          ...convencion,
          id: nuevoId(),
          nombre: `${convencion.nombre} (copia)`,
          bloques: convencion.bloques.map((b) => ({ ...b, id: nuevoId() })),
        }
      : convencionNueva()
    setConfirmandoBorrado(false)
    setEstado((prev) => ({
      convenciones: [...prev.convenciones, nueva],
      activaId: nueva.id,
    }))
  }

  function borrar() {
    setEstado((prev) => {
      const restantes = prev.convenciones.filter((c) => c.id !== convencion.id)
      if (restantes.length === 0) return estadoInicial()
      return { convenciones: restantes, activaId: restantes[0].id }
    })
    setConfirmandoBorrado(false)
  }

  const losTresNombres = NIVELES.map((n) => nombres[n].texto)
    .filter(Boolean)
    .join('\n')
  const totalAvisos = NIVELES.reduce((suma, n) => suma + nombres[n].avisos.length, 0)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-borde bg-fondo/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 sm:px-4">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold leading-none text-ambar">_</span>
            <h1 className="text-sm font-bold tracking-tight text-tinta">Nomenclador</h1>
            <p className="hidden text-[11px] text-tenue md:block">
              Nombres consistentes para Meta y Google Ads
            </p>
          </div>

          <div className="ml-auto flex min-w-0 flex-wrap items-center gap-1.5">
            <label className="sr-only" htmlFor="sel-convencion">
              Convención activa
            </label>
            <select
              id="sel-convencion"
              className="campo !w-auto min-w-0 max-w-[220px] !py-1 text-xs font-semibold"
              value={convencion.id}
              onChange={(e) => seleccionar(e.target.value)}
            >
              {estado.convenciones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} · {NOMBRE_PLATAFORMA[c.plataforma]}
                </option>
              ))}
            </select>
            <button type="button" className="boton" title="Nueva convención" onClick={() => crear(false)}>
              <FilePlus2 size={13} aria-hidden />
              <span className="hidden sm:inline">Nueva</span>
            </button>
            <button type="button" className="boton" title="Duplicar la convención activa" onClick={() => crear(true)}>
              <Files size={13} aria-hidden />
              <span className="hidden sm:inline">Duplicar</span>
            </button>
            {confirmandoBorrado ? (
              <span className="flex items-center gap-1.5 rounded-md border border-rojo bg-[#2A1A1E] px-2 py-1 text-[11px] text-rojo">
                ¿Borrar «{convencion.nombre}»?
                <button type="button" className="font-bold underline" onClick={borrar}>
                  Sí
                </button>
                <button
                  type="button"
                  className="underline"
                  onClick={() => setConfirmandoBorrado(false)}
                >
                  No
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="boton"
                title="Borrar la convención activa"
                aria-label="Borrar la convención activa"
                onClick={() => setConfirmandoBorrado(true)}
              >
                <Trash2 size={13} aria-hidden />
              </button>
            )}
            <button
              type="button"
              className="boton"
              title="Restaurar las convenciones de ejemplo"
              aria-label="Restaurar las convenciones de ejemplo"
              onClick={() => {
                setConfirmandoBorrado(false)
                setEstado(estadoInicial())
              }}
            >
              <RotateCcw size={13} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {!puedeGuardar && (
        <p className="mx-auto max-w-[1600px] px-3 pt-3 sm:px-4">
          <span className="block rounded-md border border-ambar bg-[#241C0C] px-3 py-2 text-xs text-ambarSuave">
            Este navegador no permite guardar datos, así que las convenciones se perderán al cerrar
            la pestaña. Suele pasar en ventanas privadas o con el almacenamiento del sitio
            bloqueado. Puedes seguir trabajando y exportar el CSV antes de salir.
          </span>
        </p>
      )}

      <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        <div className="space-y-3 lg:sticky lg:top-[60px] lg:max-h-[calc(100vh-72px)] lg:overflow-y-auto lg:pr-1">
          <label className="block">
            <span className="etiqueta mb-1">Nombre de la convención</span>
            <input
              className="campo font-semibold"
              value={convencion.nombre}
              onChange={(e) => actualizar({ nombre: e.target.value })}
            />
          </label>

          <PanelAjustes convencion={convencion} onCambiar={actualizar} />

          <ListaBloques
            convencion={convencion}
            onCambiarBloque={cambiarBloque}
            onMover={(id, delta) => actualizar({ bloques: moverBloque(convencion, id, delta) })}
            onBorrar={(id) => actualizar({ bloques: convencion.bloques.filter((b) => b.id !== id) })}
            onAnadir={() => actualizar({ bloques: [...convencion.bloques, bloqueNuevo()] })}
          />
        </div>

        <div className="space-y-3">
          <section className="tarjeta p-3">
            <header className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-tenue">
                Nombres generados
              </h2>
              <div className="flex flex-wrap gap-1.5">
                <Copiar texto={losTresNombres} etiqueta="Copiar los tres" fuerte />
                <button
                  type="button"
                  className="boton"
                  onClick={() =>
                    descargarCsv(
                      csvDeNombres(convencion, nombres, modoUtm),
                      nombreArchivo(convencion, 'nombres'),
                    )
                  }
                >
                  <Download size={13} aria-hidden />
                  CSV
                </button>
              </div>
            </header>

            {totalAvisos > 0 && (
              <p className="mb-2.5 rounded-md border border-ambar bg-[#241C0C] px-2.5 py-2 text-xs text-ambarSuave">
                <strong className="font-semibold text-ambar">
                  {totalAvisos} {totalAvisos === 1 ? 'bloque clave' : 'bloques clave'}
                </strong>{' '}
                {totalAvisos === 1 ? 'queda' : 'quedan'} fuera de una columna de{' '}
                {convencion.anchoCorte} caracteres. En el informe verás el nombre cortado ahí, aunque
                la plataforma lo guarde entero.
              </p>
            )}

            <div className="space-y-2.5">
              {NIVELES.map((nivel) => (
                <TarjetaNivel
                  key={nivel}
                  convencion={convencion}
                  nivel={nivel}
                  nombre={nombres[nivel]}
                  onMoverAntes={(id) => actualizar({ bloques: moverBloque(convencion, id, -1) })}
                />
              ))}
            </div>
          </section>

          <PanelUtm
            convencion={convencion}
            nombres={nombres}
            modo={modoUtm}
            onCambiarModo={setModoUtm}
          />

          <PanelLote convencion={convencion} modoUtm={modoUtm} />
        </div>
      </main>

      <footer className="mx-auto max-w-[1600px] px-3 pb-6 pt-2 sm:px-4">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-borde pt-3 text-[11px] text-tenue">
          <Copy size={12} aria-hidden />
          <strong className="font-semibold text-tinta">Nomenclador</strong>
          <span>
            Una convención, tres nombres y la UTM que cuadra. Todo se guarda en este navegador: sin
            cuentas, sin instalar y sin conexión una vez cargado.
          </span>
        </p>
      </footer>
    </div>
  )
}
