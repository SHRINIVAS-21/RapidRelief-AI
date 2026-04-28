import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { firebaseService } from '../services/firebaseService';
import { Incident } from '../types';

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.listenToIncidents((data) => {
      setIncidents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = {
    total: incidents.length,
    verified: incidents.filter(i => i.status === 'verified').length,
    pending: incidents.filter(i => i.status === 'pending').length,
    dispatched: incidents.filter(i => i.status === 'alert_sent').length
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center bg-[#111827] px-6 py-4 border border-[#1F2937]">
        <div>
          <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Sector Overview</h1>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Critical Response Dashboard</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#1F2937] bg-transparent text-[10px] font-black uppercase h-8 px-4">
            <Download size={14} className="mr-2" />
            Export Log
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-[10px] font-black uppercase h-8 px-4 rounded-none shadow-lg shadow-red-600/20">Dispatch Network</Button>
        </div>
      </header>

      {/* High Density Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Signals" value={stats.total} color="text-white" trend="+4 ACTIVE" />
        <StatCard title="Neural Verified" value={stats.verified} color="text-red-500" trend="92% ACCURACY" />
        <StatCard title="Validation Queue" value={stats.pending} color="text-amber-500" trend="-2 TRENDING" />
        <StatCard title="Units Engaged" value={stats.dispatched} color="text-blue-400" trend="OPTIMAL LOAD" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Feed */}
        <Card className="lg:col-span-2 bg-[#0B0F19] border-[#1F2937] rounded-none">
          <CardHeader className="p-4 border-b border-[#1F2937] bg-[#111827]">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClipboardList size={14} />
                Live Reconnaissance Feed
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse glow-red"></div>
                <span className="text-[9px] text-red-500">Live Stream Online</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-[#1F2937]">
                {incidents.map((incident) => (
                  <Link key={incident.id} to={`/incident/${incident.id}`} className="block hover:bg-[#111827] transition-colors">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded border border-[#1F2937] flex items-center justify-center ${getTypeBg(incident.type)}`}>
                          <span className="font-black text-xs">{incident.type[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase text-white truncate max-w-[200px]">
                              {incident.type} - SECTOR_{incident.id.slice(-4).toUpperCase()}
                            </span>
                            <Badge className={`${getStatusColor(incident.status)} text-[8px] font-black uppercase px-1 rounded-none border-0`}>
                              {incident.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-500 mono font-bold bg-[#111827] w-fit px-2 py-0.5 rounded">
                            FIX: {incident.latitude.toFixed(4)} | {incident.longitude.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1 px-2">
                        <span className="text-[10px] text-slate-500 mono font-bold uppercase italic">
                          T-{incident.timestamp?.toDate ? incident.timestamp.toDate().toLocaleTimeString() : 'RECENT'}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Match: {incident.confidenceScore}%</div>
                          <ChevronRight size={14} className="text-slate-700" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {incidents.length === 0 && !loading && (
                  <div className="p-20 text-center">
                    <p className="text-[10px] text-slate-600 uppercase font-black font-mono tracking-[0.3em]">No active threat data detected in proximity.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Priority Panel */}
        <Card className="bg-[#111827] border-[#1F2937] rounded-none overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-red-500">Critical Directives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-none space-y-3">
               <div className="flex justify-between items-start">
                 <h4 className="text-[11px] font-bold text-red-400 italic leading-relaxed uppercase">"Elevated heat sig in Zone 4. Automated responder dispatch requested."</h4>
               </div>
               <div className="flex gap-2">
                 <Button size="sm" className="bg-red-600 hover:bg-red-700 text-[9px] font-black uppercase h-7 px-3 rounded-none">Verify</Button>
                 <Button size="sm" variant="outline" className="border-[#1F2937] bg-transparent text-[9px] font-black uppercase h-7 px-3 rounded-none">Details</Button>
               </div>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase italic">
               Cross-referencing telemetry with local sensor arrays. Latency within nominal range (42ms).
             </p>
             <div className="pt-4 border-t border-[#1F2937] space-y-2">
                <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Network Load</div>
                <div className="w-full bg-[#0B0F19] h-1 rounded-full overflow-hidden">
                   <div className="bg-blue-500 h-full w-[42%]" />
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, trend }: any) {
  return (
    <Card className="bg-[#111827] border-[#1F2937] rounded-none p-4 relative overflow-hidden group">
      <div className="relative z-10">
        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className={`text-2xl font-black mono ${color}`}>{value.toString().padStart(2, '0')}</h3>
          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{trend}</span>
        </div>
      </div>
    </Card>
  );
}

function getTypeBg(type: string) {
  switch (type) {
    case 'fire': return 'bg-orange-600/20 text-orange-500 border border-orange-500/30';
    case 'flood': return 'bg-blue-600/20 text-blue-500 border border-blue-500/30';
    case 'accident': return 'bg-red-600/20 text-red-500 border border-red-500/30';
    case 'medical': return 'bg-green-600/20 text-green-500 border border-green-500/30';
    default: return 'bg-zinc-800 text-zinc-400';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'verified': return 'bg-red-600';
    case 'pending': return 'bg-yellow-600';
    case 'alert_sent': return 'bg-blue-600';
    default: return 'bg-zinc-700';
  }
}
