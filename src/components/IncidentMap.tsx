import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Incident } from '../types';

interface MapProps {
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
  center?: [number, number];
}

const IncidentMap: React.FC<MapProps> = ({ incidents, onIncidentClick, center }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const accessToken = (import.meta as any).env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!accessToken || accessToken === 'pk.mock_token') {
      console.warn("Mapbox access token missing or mock. Map will not render correctly.");
    }

    mapboxgl.accessToken = accessToken || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center || [0, 0],
      zoom: 2,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const markers: mapboxgl.Marker[] = [];

    incidents.forEach((incident) => {
      const color = incident.status === 'verified' ? '#ef4444' : '#f97316';
      const marker = new mapboxgl.Marker({ color })
        .setLngLat([incident.longitude, incident.latitude])
        .addTo(map.current!);
      
      marker.getElement().addEventListener('click', () => {
        onIncidentClick?.(incident);
      });

      markers.push(marker);
    });

    return () => {
      markers.forEach(m => m.remove());
      map.current?.remove();
    };
  }, [incidents, accessToken]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
      <div ref={mapContainer} className="w-full h-full" />
      {(!accessToken || accessToken === 'pk.mock_token') && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm z-10 p-6 text-center">
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-white mb-2">Mapbox Token Required</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Please set a valid VITE_MAPBOX_ACCESS_TOKEN in your environment to see the live emergency map.
            </p>
            <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 text-left">
              <p className="text-xs font-mono text-zinc-500 mb-1">Simulated Markers:</p>
              <div className="space-y-2">
                {incidents.slice(0, 3).map(i => (
                  <div key={i.id} className="text-xs text-zinc-300">
                    📍 {i.type.toUpperCase()} at [{i.latitude}, {i.longitude}]
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentMap;
