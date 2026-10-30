'use client'

import React from 'react'
import { useField, useTranslation } from '@payloadcms/ui'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { TranslationKeys, Translations } from '@/i18n/translations'

// Safe to define here because this file is only loaded in the browser
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Update the field value when the map is clicked
function MapEvents({ onPick }: { onPick: (point: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lng, e.latlng.lat]) // Payload expects [lng, lat]
    },
  })
  return null
}

export default function MapFieldClient({ path }: { path: string }) {
  // useField connects our component to Payload's database state
  const { value, setValue } = useField<[number, number]>({ path })
  const { t } = useTranslation<Translations, TranslationKeys>()

  const center: [number, number] = value ? [value[1], value[0]] : [51.505, -0.09]

  return (
    <div style={{ marginBottom: '20px', flexGrow: '1' }}>
      {/* Own stacking context: Leaflet's panes (z-index 400+) would cover Payload's dropdowns */}
      <div
        style={{
          height: '400px',
          width: '100%',
          borderRadius: '4px',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
      >
        <MapContainer
          center={center}
          zoom={value ? 12 : 3}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {value && <Marker position={[value[1], value[0]]} icon={icon} />}
          <MapEvents onPick={setValue} />
        </MapContainer>
      </div>
      <label className="field-label" style={{ display: 'block' }}>
        {t('map:pick')}
      </label>
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <code>
          {t('map:longitude')}: {value?.[0]}
        </code>
        <code>
          {t('map:latitude')}: {value?.[1]}
        </code>
      </div>
    </div>
  )
}
