import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Users, 
  Share2, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import IncidentMap from '../components/IncidentMap';
import { firebaseService } from '../services/firebaseService';
import { Incident } from '../types';

export default function IncidentDetails() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      firebaseService.getIncident(id).then((data) => {
        setIncident(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="p-20 text-center font-mono animate-pulse">Initializing reconnaissance...</div>;
  if (!incident) return <div className="p-20 text-center">Incident not found in active sectors.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-[#111827] p-4 border border-[#1F2937] rounded">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-slate-500 hover:text-white p-0">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Incident Intel: {id?.slice(-8).toUpperCase()}</div>
            <h1 className="text-xl font-bold text-white uppercase tracking-tight">{incident.type} Detected</h1>
          </div>
        </div>
        <div className="flex gap-2">
           <Badge className={`${getStatusColor(incident.status)} border-0 text-[10px] font-black uppercase rounded-none px-3 py-1`}>
             {incident.status.toUpperCase()}
           </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0B0F19] border-[#1F2937] rounded-none overflow-hidden">
             <div className="aspect-video bg-black relative flex items-center justify-center border-b border-[#1F2937]">
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 border-2 border-dashed border-[#1F2937]">
                  <Play size={48} className="text-[#1F2937]" />
                  <p className="text-[9px] text-[#1F2937] uppercase font-black tracking-widest mt-4">Demo Payload Only: No Video Blob</p>
                </div>
                <div className="absolute top-4 left-4 bg-black/80 px-2 py-1 rounded text-[9px] mono font-bold text-red-500 border border-red-500/30">
                  RECON_FEED: {id?.slice(0, 8)}
                </div>
             </div>
             <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#111827]">
                {[
                  { label: 'Latitude', value: incident.latitude.toFixed(6) },
                  { label: 'Longitude', value: incident.longitude.toFixed(6) },
                  { label: 'Signal Base', value: 'UNIT_MAP_01' },
                  { label: 'Uplink Time', value: incident.timestamp?.toDate ? incident.timestamp.toDate().toLocaleTimeString() : 'RECENT' }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-[9px] text-slate-600 font-black uppercase">{item.label}</div>
                    <div className="text-xs font-bold text-slate-300 mono">{item.value}</div>
                  </div>
                ))}
             </div>
          </Card>

          <Card className="bg-[#111827] border-[#1F2937] rounded-none p-6">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-[#1F2937] pb-2">Intelligence Brief</h3>
             <div className="space-y-4">
                <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-none">
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] uppercase font-black text-red-500">Neural Confidence Analysis</span>
                      <span className="text-xl font-bold text-red-400 mono">{incident.confidenceScore}%</span>
                   </div>
                   <div className="w-full bg-[#0B0F19] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full" style={{ width: `${incident.confidenceScore}%` }} />
                   </div>
                   <p className="mt-3 text-[11px] text-slate-400 italic leading-relaxed">
                     "{incident.description || 'System-generated anomaly extract: Threat detected in high-density civilian sector. verified against cross-user telemetry.'}"
                   </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#1F2937]/30 border border-[#1F2937] text-[10px]">
                    <div className="text-slate-500 font-black uppercase mb-1">Primary Threat</div>
                    <div className="text-white font-bold uppercase">{incident.type}</div>
                  </div>
                  <div className="p-3 bg-[#1F2937]/30 border border-[#1F2937] text-[10px]">
                    <div className="text-slate-500 font-black uppercase mb-1">Source node</div>
                    <div className="text-white font-bold uppercase">Uplink_{id?.slice(-4)}</div>
                  </div>
                </div>
             </div>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="bg-[#111827] border-[#1F2937] rounded-none p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-[#1F2937] pb-2">Authorization Rail</h3>
              <div className="space-y-3">
                 <Button className="w-full bg-red-600 hover:bg-red-700 h-12 rounded-none font-black text-[11px] uppercase tracking-[0.2em] glow-red shadow-lg shadow-red-600/20" onClick={() => firebaseService.updateIncident(incident.id, { status: 'alert_sent' })}>
                   {incident.status === 'alert_sent' ? 'BROADCAST ACTIVE' : 'Dispatch Response Force'}
                 </Button>
                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="border-[#1F2937] bg-transparent text-[10px] font-black uppercase h-9 rounded-none" onClick={() => firebaseService.updateIncident(incident.id, { status: 'verified' })}>
                      Verify Signal
                    </Button>
                    <Button variant="outline" className="border-[#1F2937] bg-transparent text-[10px] font-black uppercase h-9 rounded-none text-slate-500" onClick={() => firebaseService.updateIncident(incident.id, { status: 'rejected' })}>
                      False Alarm
                    </Button>
                 </div>
              </div>
           </Card>

           <div className="h-64 rounded border border-[#1F2937] overflow-hidden grayscale contrast-125 opacity-70">
              <IncidentMap incidents={[incident]} center={[incident.longitude, incident.latitude]} />
           </div>

           <Card className="bg-[#0B0F19] border-[#1F2937] rounded-none p-4 shadow-xl">
              <h3 className="text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">Signal Integrity Log</h3>
              <div className="space-y-3 mono text-[10px]">
                 {[
                   { t: '14:22:05', u: 'SYSTEM', m: 'Uplink established. Unit initialized.' },
                   { t: '14:22:12', u: 'NERUAL_AI', m: 'Anomaly detected: ' + incident.type },
                   { t: '14:22:30', u: 'OPS_VERIFY', m: 'Signal integrity validated.' }
                 ].map((log, i) => (
                   <div key={i} className="flex gap-3 border-l border-[#1F2937] pl-3">
                      <span className="text-slate-600 font-bold">{log.t}</span>
                      <span className={log.u === 'SYSTEM' ? 'text-blue-500' : 'text-red-500'}>[{log.u}]</span>
                      <span className="text-slate-400 capitalize">{log.m}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
