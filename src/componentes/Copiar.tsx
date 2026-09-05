import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

async function alPortapapeles(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    // Respaldo para navegadores sin permiso de portapapeles.
    try {
      const area = document.createElement('textarea')
      area.value = texto
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      return ok
    } catch {
      return false
    }
  }
}

interface Props {
  texto: string
  etiqueta?: string
  titulo?: string
  fuerte?: boolean
  className?: string
}

export function Copiar({ texto, etiqueta, titulo, fuerte, className = '' }: Props) {
  const [estado, setEstado] = useState<'listo' | 'copiado' | 'error'>('listo')

  useEffect(() => {
    if (estado === 'listo') return
    const t = setTimeout(() => setEstado('listo'), 1600)
    return () => clearTimeout(t)
  }, [estado])

  const textoBoton =
    estado === 'copiado' ? 'Copiado' : estado === 'error' ? 'No se pudo' : (etiqueta ?? 'Copiar')

  return (
    <button
      type="button"
      className={`${fuerte ? 'boton-fuerte' : 'boton'} ${className}`}
      disabled={!texto}
      // El nombre accesible contiene el texto visible (§13.5).
      aria-label={etiqueta ? undefined : `Copiar ${titulo ?? 'al portapapeles'}`}
      title={titulo ? `Copiar ${titulo}` : 'Copiar'}
      onClick={async () => setEstado((await alPortapapeles(texto)) ? 'copiado' : 'error')}
    >
      {estado === 'copiado' ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
      {etiqueta !== '' && <span>{textoBoton}</span>}
    </button>
  )
}
