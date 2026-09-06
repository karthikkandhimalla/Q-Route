import { useEffect, useMemo, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { HYDERABAD_CENTER, TRAFFIC_COLORS } from '../data/mockData'

const TILES = {
  standard: [
    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ],
  humanitarian: [
    'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    'https://c.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  ],
}

function pointDistance(a, b) {
  if (!a || !b) return Infinity
  const latDiff = a[0] - b[0]
  const lngDiff = a[1] - b[1]
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)
}

function getDirectionalPath(route, startPoint, endPoint) {
  if (!route?.path || route.path.length < 2) return []
  if (!startPoint?.coords || !endPoint?.coords) return route.path
  const path = route.path
  return pointDistance(path[path.length - 1], startPoint.coords) < pointDistance(path[0], startPoint.coords)
    ? [...path].reverse()
    : path
}

function createMapStyle(mapStyle) {
  const tiles = TILES[mapStyle] || TILES.standard
  return {
    version: 8,
    name: 'Q Route OpenStreetMap Globe',
    projection: { type: 'globe' },
    sources: {
      osm: {
        type: 'raster',
        tiles,
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxzoom: 19,
      },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.2, 'raster-contrast': 0.08 } }],
  }
}

function markerElement(className, content = '') {
  const element = document.createElement('div')
  element.className = className
  element.innerHTML = content
  return element
}

function PinMarker({ map, coords, label, color, popup }) {
  useEffect(() => {
    if (!map || !coords) return undefined
    const element = markerElement('maplibre-marker-pin', label)
    element.style.background = color
    element.style.boxShadow = `0 0 14px ${color}`
    const marker = new maplibregl.Marker({ element, anchor: 'center' })
      .setLngLat([coords[1], coords[0]])
      .addTo(map)
    if (popup) marker.setPopup(new maplibregl.Popup({ offset: 16 }).setHTML(popup))
    return () => marker.remove()
  }, [map, coords, label, color, popup])
  return null
}

function IncidentMarker({ map, coords, color, popup }) {
  useEffect(() => {
    if (!map || !coords) return undefined
    const element = markerElement('maplibre-incident-pin', `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
      </svg>
    `)
    element.style.background = `${color}22`
    element.style.borderColor = color
    const marker = new maplibregl.Marker({ element, anchor: 'center' })
      .setLngLat([coords[1], coords[0]])
      .addTo(map)
    if (popup) marker.setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(popup))
    return () => marker.remove()
  }, [map, coords, color, popup])
  return null
}

function VehicleMarker({ map, position, angle, traffic = false, color }) {
  useEffect(() => {
    if (!map || !position) return undefined
    const element = markerElement(traffic ? 'traffic-car-marker' : 'animated-car-marker', `
      <div class="${traffic ? 'traffic-car' : 'animated-car'}" style="transform:rotate(${angle}deg);${traffic ? `--traffic-car-color:${color};` : ''}">
        <div class="${traffic ? 'traffic-car-shadow' : 'car-glow'}"></div>
        <div class="${traffic ? 'traffic-car-body' : 'car-body'}">
          <div class="${traffic ? 'traffic-car-roof' : 'car-roof'}"><div class="${traffic ? 'traffic-car-window' : 'car-window'}"></div></div>
          <div class="${traffic ? 'traffic-car-light' : 'car-headlight'} left"></div><div class="${traffic ? 'traffic-car-light' : 'car-headlight'} right"></div>
          <div class="${traffic ? 'traffic-car-wheel' : 'car-wheel'} left"></div><div class="${traffic ? 'traffic-car-wheel' : 'car-wheel'} right"></div>
        </div>
      </div>
    `)
    const marker = new maplibregl.Marker({ element, anchor: 'center' })
      .setLngLat([position[1], position[0]])
      .addTo(map)
    return () => marker.remove()
  }, [map, position, angle, traffic, color])
  return null
}

function MovingVehicle({ map, route, startPoint, endPoint, speed, delay, color, traffic = false, active = true }) {
  const [state, setState] = useState(null)
  const path = useMemo(() => getDirectionalPath(route, startPoint, endPoint), [route, startPoint, endPoint])

  useEffect(() => {
    if (!active || path.length < 2) {
      setState(null)
      return undefined
    }
    let segment = 0
    let progress = delay
    let frame
    const tick = () => {
      if (segment >= path.length - 1) {
        segment = 0
        progress = 0
      }
      const start = path[segment]
      const end = path[segment + 1]
      if (!start || !end) return
      setState({
        position: [start[0] + (end[0] - start[0]) * progress, start[1] + (end[1] - start[1]) * progress],
        angle: Math.atan2(end[1] - start[1], end[0] - start[0]) * (180 / Math.PI),
      })
      progress += (traffic ? 0.0025 : 0.006) * speed
      if (progress >= 1) {
        progress = 0
        segment += 1
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [path, speed, delay, traffic, active])

  return state ? <VehicleMarker map={map} position={state.position} angle={state.angle} traffic={traffic} color={color} /> : null
}

function RouteLayers({ map, routes, selectedRouteId, startPoint, endPoint, onSelectRoute }) {
  const layers = useMemo(() => routes.flatMap((route) => {
    const path = getDirectionalPath(route, startPoint, endPoint)
    if (path.length < 2) return []
    return [{ route, path, selected: route.id === selectedRouteId }]
  }), [routes, selectedRouteId, startPoint, endPoint])

  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return undefined
    const sourceIds = layers.map(({ route }) => `qroute-${route.id}`)
    layers.forEach(({ route, path, selected }) => {
      const sourceId = `qroute-${route.id}`
      if (map.getSource(sourceId)) {
        map.getSource(sourceId).setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: path.map(([lat, lon]) => [lon, lat]) }, properties: {} })
      } else {
        map.addSource(sourceId, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: path.map(([lat, lon]) => [lon, lat]) }, properties: {} } })
        map.addLayer({ id: `${sourceId}-glow`, type: 'line', source: sourceId, paint: { 'line-color': route.color, 'line-width': selected ? 15 : 3.5, 'line-opacity': selected ? 0.18 : 0.5, 'line-blur': selected ? 3 : 0, 'line-dasharray': selected ? [1, 0] : [2, 2], 'line-cap': 'round', 'line-join': 'round' } })
        map.addLayer({ id: `${sourceId}-line`, type: 'line', source: sourceId, paint: { 'line-color': route.color, 'line-width': selected ? 5.5 : 3.5, 'line-opacity': selected ? 1 : 0.5, 'line-dasharray': selected ? [1, 0] : [2, 2], 'line-cap': 'round', 'line-join': 'round' } })
        map.on('click', `${sourceId}-line`, () => onSelectRoute?.(route.id))
        map.on('mouseenter', `${sourceId}-line`, () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', `${sourceId}-line`, () => { map.getCanvas().style.cursor = '' })
      }
    })
    return () => {
      sourceIds.forEach((sourceId) => {
        if (map.getLayer(`${sourceId}-line`)) map.removeLayer(`${sourceId}-line`)
        if (map.getLayer(`${sourceId}-glow`)) map.removeLayer(`${sourceId}-glow`)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      })
    }
  }, [map, layers, onSelectRoute])
  return null
}

export default function MapView({
  routes = [], selectedRouteId = null, segments = [], incidents = [], startPoint = null, endPoint = null,
  showTraffic = true, showIncidents = true, highlightCoords = null, onSelectRoute, mapStyle = 'standard',
  center = HYDERABAD_CENTER, zoom = 12,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [error, setError] = useState(null)
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) || null
  const initialZoom = routes.length ? zoom : Math.min(zoom, 2.2)
  const trafficLevel = selectedRoute?.congestion < 0.3 ? 'low' : selectedRoute?.congestion < 0.5 ? 'moderate' : selectedRoute?.congestion < 0.7 ? 'heavy' : 'severe'
  const trafficColor = TRAFFIC_COLORS[trafficLevel] || '#facc15'

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined
    let instance
    try {
      instance = new maplibregl.Map({
        container: containerRef.current,
        style: createMapStyle(mapStyle),
        center: [center[1], center[0]],
        zoom: initialZoom,
        minZoom: 1,
        maxZoom: 19,
        attributionControl: true,
        dragRotate: false,
        touchPitch: false,
      })
      instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      instance.on('load', () => {
        mapRef.current = instance
        setMap(instance)
      })
    } catch {
      setError('The map could not load. Please refresh to try again.')
    }
    return () => {
      mapRef.current = null
      instance?.remove()
    }
  }, [])

  useEffect(() => {
    if (!map) return
    const style = createMapStyle(mapStyle)
    map.setStyle(style)
    map.once('styledata', () => setMap(map))
  }, [mapStyle, map])

  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return
    map.setProjection({ type: routes.length ? 'mercator' : 'globe' })
    const points = routes.flatMap((route) => route.path || [])
    if (points.length >= 2) {
      const bounds = points.reduce((bounds, [lat, lon]) => bounds.extend([lon, lat]), new maplibregl.LngLatBounds([points[0][1], points[0][0]], [points[0][1], points[0][0]]))
      map.fitBounds(bounds, { padding: 80, duration: 850, maxZoom: 14 })
    } else {
      map.easeTo({ center: [center[1], center[0]], zoom: initialZoom, duration: 700 })
    }
  }, [map, routes, center, initialZoom])

  return (
    <div ref={containerRef} className="qroute-maplibre" role="application" aria-label="Interactive Q Route globe map">
      {error && <div className="qroute-map-error">{error}</div>}
      {map && !error && <>
        <RouteLayers map={map} routes={routes} selectedRouteId={selectedRouteId} startPoint={startPoint} endPoint={endPoint} onSelectRoute={onSelectRoute} />
        {startPoint && <PinMarker map={map} coords={startPoint.coords} label="A" color="#2F6FED" popup={`<strong>Start</strong><br>${startPoint.name || ''}`} />}
        {endPoint && <PinMarker map={map} coords={endPoint.coords} label="B" color="#1F4D3A" popup={`<strong>Destination</strong><br>${endPoint.name || ''}`} />}
        {showIncidents && incidents.map((incident) => <IncidentMarker key={incident.id} map={map} coords={incident.coords} color={TRAFFIC_COLORS[incident.severity]} popup={`<strong>${incident.name}</strong><br>${incident.location} · ${incident.reportedAt}<br>${incident.description}`} />)}
        {highlightCoords && <IncidentMarker map={map} coords={highlightCoords} color="#D64545" popup="<strong>Predicted congestion spike</strong>" />}
        {showTraffic && selectedRoute && <MovingVehicle map={map} route={selectedRoute} startPoint={startPoint} endPoint={endPoint} speed={1} delay={0} active />}
        {showTraffic && selectedRoute?.path?.length >= 2 && <>
          <MovingVehicle map={map} route={selectedRoute} startPoint={startPoint} endPoint={endPoint} speed={trafficLevel === 'low' ? 1.7 : trafficLevel === 'moderate' ? 1.2 : trafficLevel === 'heavy' ? 0.8 : 0.5} delay={0.22} color={trafficColor} traffic />
          <MovingVehicle map={map} route={selectedRoute} startPoint={startPoint} endPoint={endPoint} speed={trafficLevel === 'low' ? 1.5 : trafficLevel === 'moderate' ? 1.05 : trafficLevel === 'heavy' ? 0.7 : 0.45} delay={0.58} color={trafficColor} traffic />
          {trafficLevel !== 'low' && <MovingVehicle map={map} route={selectedRoute} startPoint={startPoint} endPoint={endPoint} speed={trafficLevel === 'moderate' ? 0.95 : trafficLevel === 'heavy' ? 0.65 : 0.4} delay={0.82} color={trafficColor} traffic />}
        </>}
      </>}
      <div className="qroute-map-attribution">&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors</div>
    </div>
  )
}
