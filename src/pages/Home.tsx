import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, AlertCircle, MapPin } from 'lucide-react';
import IncidentMap from '../components/IncidentMap';
import { Incident } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { firebaseService } from '../services/firebaseService';

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.listenToIncidents((data) => {
      setIncidents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 h-[calc(100vh-80px)] border-[#1F2937] border bg-[#0B0F19]">
      {/* Search & Sidebar */}
      <div className="lg:col-span-1 border-r border-[#1F2937] flex flex-col bg-[#0B0F19]">
        <div className="p-4 border-b border-[#1F2937] bg-[#111827]">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Active Duty Sectors</div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Filter reconnaissance..." 
              className="w-full bg-[#1F2937] border-none rounded py-2 pl-9 pr-3 text-[11px] text-slate-300 placeholder-slate-600 outline-none"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 bg-[#0B0F19]">
          <div className="divide-y divide-[#1F2937]">
            {incidents.map((incident) => (
              <motion.div
                key={incident.id}
                whileHover={{ backgroundColor: '#111827' }}
                onClick={() => setSelectedIncident(incident)}
                className={`p-4 cursor-pointer transition-colors border-l-2 ${
                  selectedIncident?.id === incident.id ? 'border-red-500 bg-red-900/10' : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge className={`${getTypeColor(incident.type)} text-white border-0 text-[9px] font-black tracking-tighter px-2 rounded-none`}>
                    {incident.type.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-slate-600 mono font-bold">
                    {incident.timestamp?.toDate ? incident.timestamp.toDate().toLocaleTimeString() : 'RECENT'}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-tight flex items-center gap-2">
                  Threat: {incident.description || 'Detected Anomaly'}
                  {incident.confidenceScore > 80 && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse glow-red" />}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mono font-bold uppercase">
                    <MapPin size={10} />
                    {incident.latitude.toFixed(3)} | {incident.longitude.toFixed(3)}
                  </div>
                  <Badge variant="outline" className="border-[#1F2937] text-[9px] text-slate-400 font-mono">
                    STAT: {incident.status.toUpperCase()}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Map */}
      <div className="lg:col-span-3 h-full bg-[#0D1117] relative">
        <IncidentMap 
          incidents={incidents} 
          onIncidentClick={(i) => setSelectedIncident(i)}
          center={selectedIncident ? [selectedIncident.longitude, selectedIncident.latitude] : undefined}
        />
        
        {/* Map Overlays for High Density look */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-[#111827]/90 backdrop-blur border border-[#1F2937] p-3 rounded flex items-center gap-4 shadow-2xl">
            <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase font-black">Active</div>
              <div className="text-xl font-bold text-red-500 mono">{incidents.length}</div>
            </div>
            <div className="w-px h-8 bg-[#1F2937]"></div>
            <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase font-black">Verified</div>
              <div className="text-xl font-bold text-blue-400 mono">
                {incidents.filter(i => i.status === 'verified').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTypeColor(type: string) {
  switch (type) {
    case 'fire': return 'bg-orange-600';
    case 'flood': return 'bg-blue-600';
    case 'accident': return 'bg-red-600';
    case 'medical': return 'bg-green-600';
    default: return 'bg-zinc-600';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'verified': return 'bg-red-500';
    case 'pending': return 'bg-yellow-500';
    case 'alert_sent': return 'bg-blue-500';
    default: return 'bg-zinc-500';
  }
}
