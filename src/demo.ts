import { type Bloque, type Convencion, type NivelId, type OpcionBloque } from './tipos'

function bloque(
  id: string,
  nombre: string,
  nivel: NivelId,
  clave: boolean,
  valor: string,
  catalogo: [string, string][],
): Bloque {
  return {
    id,
    nombre,
    nivel,
    clave,
    valor,
    catalogo: catalogo.map(([etiqueta, v]): OpcionBloque => ({ etiqueta, valor: v })),
  }
}

/**
 * Tres convenciones cargadas de salida. La primera esta pensada para que el
 * aviso de truncado salte solo: el identificador de test cae fuera del corte.
 */
export function convencionesDemo(): Convencion[] {
  return [
    {
      id: 'demo-meta',
      nombre: 'Meta — estándar de agencia',
      plataforma: 'meta',
      separador: '_',
      separadorPalabra: '-',
      capitalizacion: 'mayusculas',
      anchoCorte: 45,
      urlBase: 'https://www.auroradental.es/promocion-ortodoncia',
      utmSource: 'facebook',
      utmMedium: 'paid_social',
      bloques: [
        bloque('b-cliente', 'Cliente', 'campana', true, 'AURORA', [
          ['Aurora Dental', 'AURORA'],
          ['Casa Verde', 'CASAVERDE'],
          ['Nordic Fit', 'NORDICFIT'],
        ]),
        bloque('b-plataforma', 'Plataforma', 'campana', false, 'MET', [
          ['Meta', 'MET'],
          ['Google', 'GGL'],
          ['TikTok', 'TKT'],
        ]),
        bloque('b-objetivo', 'Objetivo', 'campana', true, 'CONV', [
          ['Conversiones', 'CONV'],
          ['Tráfico', 'TRF'],
          ['Alcance', 'ALC'],
          ['Clientes potenciales', 'LEAD'],
          ['Ventas del catálogo', 'CATVENTAS'],
        ]),
        bloque('b-embudo', 'Embudo', 'campana', false, 'BOFU', [
          ['Descubrimiento', 'TOFU'],
          ['Consideración', 'MOFU'],
          ['Conversión', 'BOFU'],
        ]),
        bloque('b-mes', 'Mes', 'campana', false, '2026-09', [
          ['Septiembre 2026', '2026-09'],
          ['Octubre 2026', '2026-10'],
          ['Siempre activa', 'EVERGREEN'],
        ]),
        bloque('b-publico', 'Público', 'conjunto', true, 'RMK-30D', [
          ['Retargeting 30 días', 'RMK-30D'],
          ['Lookalike 1%', 'LAL-1'],
          ['Intereses', 'INT'],
          ['Público abierto', 'OPEN'],
        ]),
        bloque('b-ubicacion', 'Ubicación', 'conjunto', false, 'CO', [
          ['España', 'ES'],
          ['Colombia', 'CO'],
          ['México', 'MX'],
          ['LATAM', 'LATAM'],
        ]),
        bloque('b-oferta', 'Oferta', 'conjunto', false, 'OFF20', [
          ['20% de descuento', 'OFF20'],
          ['Envío gratis', 'ENVIOGRATIS'],
          ['Primera visita gratis', 'VISITAGRATIS'],
          ['Sin oferta', 'SINOFERTA'],
        ]),
        bloque('b-formato', 'Formato', 'anuncio', false, 'VID', [
          ['Vídeo', 'VID'],
          ['Carrusel', 'CAR'],
          ['Imagen', 'IMG'],
          ['Colección', 'COL'],
        ]),
        bloque('b-version', 'Versión', 'anuncio', false, 'V01', [
          ['Versión 1', 'V01'],
          ['Versión 2', 'V02'],
          ['Versión 3', 'V03'],
        ]),
        bloque('b-test', 'Test', 'anuncio', true, 'TA', [
          ['Variante A', 'TA'],
          ['Variante B', 'TB'],
          ['Sin test', 'SINTEST'],
        ]),
      ],
    },
    {
      id: 'demo-google',
      nombre: 'Google Ads — búsqueda',
      plataforma: 'google',
      separador: '_',
      separadorPalabra: '-',
      capitalizacion: 'minusculas',
      anchoCorte: 50,
      urlBase: 'https://nordicfit.com/planes',
      utmSource: 'google',
      utmMedium: 'cpc',
      bloques: [
        bloque('g-cuenta', 'Cuenta', 'campana', true, 'nordicfit', [
          ['Nordic Fit', 'nordicfit'],
          ['Aurora Dental', 'auroradental'],
        ]),
        bloque('g-red', 'Red', 'campana', false, 'search', [
          ['Búsqueda', 'search'],
          ['Display', 'display'],
          ['Performance Max', 'pmax'],
          ['YouTube', 'yt'],
        ]),
        bloque('g-tipo', 'Tipo', 'campana', true, 'marca', [
          ['Marca', 'marca'],
          ['Genérica', 'generica'],
          ['Competencia', 'competencia'],
          ['Remarketing', 'rmk'],
        ]),
        bloque('g-pais', 'País', 'campana', false, 'es', [
          ['España', 'es'],
          ['Colombia', 'co'],
          ['México', 'mx'],
        ]),
        bloque('g-tema', 'Tema', 'conjunto', true, 'marca-exacta', [
          ['Marca exacta', 'marca-exacta'],
          ['Marca + producto', 'marca-producto'],
          ['Marca + ciudad', 'marca-ciudad'],
        ]),
        bloque('g-concordancia', 'Concordancia', 'conjunto', false, 'exact', [
          ['Exacta', 'exact'],
          ['De frase', 'frase'],
          ['Amplia', 'amplia'],
        ]),
        bloque('g-anuncio', 'Tipo de anuncio', 'anuncio', false, 'rsa', [
          ['Anuncio adaptable', 'rsa'],
          ['Solo llamada', 'llamada'],
        ]),
        bloque('g-version', 'Versión', 'anuncio', false, 'v01', [
          ['Versión 1', 'v01'],
          ['Versión 2', 'v02'],
        ]),
      ],
    },
    {
      id: 'demo-minima',
      nombre: 'Mínima — 4 bloques',
      plataforma: 'meta',
      separador: '_',
      separadorPalabra: '-',
      capitalizacion: 'mayusculas',
      anchoCorte: 40,
      urlBase: 'https://casaverde.co/reforma-cocinas',
      utmSource: 'facebook',
      utmMedium: 'paid_social',
      bloques: [
        bloque('m-cliente', 'Cliente', 'campana', true, 'CASAVERDE', [
          ['Casa Verde', 'CASAVERDE'],
          ['Aurora Dental', 'AURORA'],
        ]),
        bloque('m-objetivo', 'Objetivo', 'campana', true, 'TRF', [
          ['Tráfico', 'TRF'],
          ['Conversiones', 'CONV'],
        ]),
        bloque('m-publico', 'Público', 'conjunto', true, 'LAL-1', [
          ['Lookalike 1%', 'LAL-1'],
          ['Retargeting 30 días', 'RMK-30D'],
        ]),
        bloque('m-creativo', 'Creativo', 'anuncio', true, 'IMG-V02', [
          ['Imagen v2', 'IMG-V02'],
          ['Vídeo v1', 'VID-V01'],
        ]),
      ],
    },
  ]
}
