'use client'

import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const facilities = [
  { id: 1, name: 'CHU Fattouma Bourguiba', position: [35.7648, 10.8241] as [number, number], priority: 'critical' },
  { id: 2, name: 'Maternité et Néonatologie', position: [35.7708, 10.8172] as [number, number], priority: 'critical' },
  { id: 3, name: 'Hôpital régional Ksar Helal', position: [35.647, 10.891] as [number, number], priority: 'critical' },
  { id: 4, name: 'Faculté de Médecine', position: [35.767, 10.809] as [number, number], priority: 'essential' },
  { id: 5, name: 'Aéroport Habib Bourguiba', position: [35.758, 10.754] as [number, number], priority: 'essential' },
  { id: 6, name: 'Zone industrielle Ksar Hellal', position: [35.681, 10.884] as [number, number], priority: 'important' },
  { id: 7, name: 'Zone touristique Skanès', position: [35.771, 10.751] as [number, number], priority: 'important' },
  { id: 8, name: 'Faculté des Sciences', position: [35.762, 10.811] as [number, number], priority: 'important' },
  { id: 9, name: 'ENIM', position: [35.765, 10.818] as [number, number], priority: 'important' },
  { id: 10, name: 'IPEIM', position: [35.76, 10.83] as [number, number], priority: 'important' },
  { id: 11, name: 'Quartiers résidentiels', position: [35.785, 10.832] as [number, number], priority: 'flexible' },
]

const lines = [
  [facilities[0].position, facilities[1].position],
  [facilities[0].position, facilities[3].position],
  [facilities[0].position, facilities[4].position],
  [facilities[0].position, facilities[7].position],
  [facilities[3].position, facilities[6].position],
  [facilities[3].position, facilities[10].position],
  [facilities[4].position, facilities[6].position],
  [facilities[6].position, facilities[5].position],
  [facilities[7].position, facilities[9].position],
  [facilities[9].position, facilities[2].position],
  [facilities[1].position, facilities[10].position],
  [facilities[4].position, facilities[8].position],
]

const priorityColors: Record<string, string> = {
  critical: '#e3232d',
  essential: '#174d9a',
  important: '#4e7ec4',
  flexible: '#9db5d8',
}

export function AigridMap({ selectedSite, onSelectSite }: { selectedSite: number; onSelectSite: (id: number) => void }) {
  return (
    <div className="map-canvas" aria-label="Carte interactive du réseau électrique de Monastir">
      <MapContainer center={[35.755, 10.82]} zoom={12} zoomControl={false} scrollWheelZoom className="leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        {lines.map((path, index) => (
          <Polyline key={index} positions={path} pathOptions={{ color: '#2d66b8', weight: 2.5, opacity: 0.68 }} />
        ))}
        {facilities.map((facility) => (
          <CircleMarker
            key={facility.id}
            center={facility.position}
            radius={facility.id === selectedSite ? 11 : 7}
            pathOptions={{
              color: '#ffffff',
              weight: facility.id === selectedSite ? 3 : 2,
              fillColor: priorityColors[facility.priority],
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => onSelectSite(facility.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <strong>{facility.id}. {facility.name}</strong>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="map-overlay-label"><span className="live-dot" /> Monastir · IEEE-14 bus</div>
      <div className="map-legend" aria-label="Légende de la carte">
        <span><i className="legend-dot critical" /> Vital</span>
        <span><i className="legend-dot essential" /> Essentiel</span>
        <span><i className="legend-dot important" /> Important</span>
        <span><i className="legend-dot flexible" /> Différable</span>
        <span><i className="legend-line" /> Ligne chargée</span>
      </div>
    </div>
  )
}
