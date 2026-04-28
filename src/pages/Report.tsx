import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, MapPin, Send, Video, ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { analyzeIncidentVideo } from '../services/geminiService';
import { firebaseService, auth } from '../services/firebaseService';

export default function Report() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const fetchLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success("Location captured");
      }, (err) => {
        toast.error("Failed to get location: " + err.message);
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video too large. Please upload less than 50MB.");
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      fetchLocation();
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result?.toString().split(',')[1];
        resolve(base64String || '');
      };
      reader.onerror = error => reject(error);
    });
  };

  const processReport = async () => {
    if (!videoFile || !location) {
      toast.error("Please provide video and location");
      return;
    }

    setIsAnalyzing(true);
    try {
      const base64Video = await convertToBase64(videoFile);
      const result = await analyzeIncidentVideo(base64Video, videoFile.type);
      setAnalysisResult(result);
      toast.success("AI Verification Complete");
    } catch (err) {
      toast.error("AI Analysis failed. Manual review required.");
      setAnalysisResult({ type: 'other', confidenceScore: 0, description: 'Analysis failed' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitFinalReport = async () => {
    if (!analysisResult || !location) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please sign in to report an incident");
        return;
      }

      await firebaseService.createIncident({
        latitude: location.lat,
        longitude: location.lng,
        status: 'pending',
        type: analysisResult.type,
        confidenceScore: analysisResult.confidenceScore,
        description: analysisResult.description,
        reporterId: user.uid,
        reporterName: user.displayName || 'Anonymous Citizen',
        videoUrl: "Video stored in edge buffer (Demo Mode)"
      });

      toast.success("Incident reported to National Emergency Network");
      setVideoFile(null);
      setVideoPreview(null);
      setAnalysisResult(null);
    } catch (error: any) {
      toast.error("Submission failed: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-[#111827] p-4 border border-[#1F2937] rounded">
        <div>
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Signal Uplink</h1>
          <h2 className="text-xl font-bold text-white uppercase">Report Critical Incident</h2>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 uppercase font-black">AI Readiness</div>
          <div className="text-xs font-bold text-green-500 flex items-center gap-2 justify-end">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse glow-green" />
             OPTIMAL
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#0B0F19] border-[#1F2937] overflow-hidden rounded-none shadow-2xl">
            <CardContent className="p-0">
              <div className="aspect-video bg-black flex flex-col items-center justify-center relative group border-b border-[#1F2937]">
                {videoPreview ? (
                  <video 
                    src={videoPreview} 
                    className="w-full h-full object-contain" 
                    controls
                  />
                ) : (
                  <div 
                    className="flex flex-col items-center cursor-pointer p-12 transition-all hover:bg-zinc-900/50"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 bg-red-600/10 border border-red-500/20 rounded flex items-center justify-center mb-4">
                      <Camera className="text-red-500" size={32} />
                    </div>
                    <p className="font-bold text-xs uppercase tracking-widest text-white mb-1">Establish Video Feed</p>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Maximum Buffer: 50MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                />
              </div>

              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="bg-[#111827] p-3 border border-[#1F2937] rounded">
                  <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Geospatial Fix</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] mono font-bold text-slate-300">
                      {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'SCANNING...'}
                    </span>
                    {!location && (
                      <Button size="sm" variant="ghost" className="h-6 text-[9px] text-blue-400 p-0" onClick={fetchLocation}>RESCAN</Button>
                    )}
                  </div>
                </div>
                <div className="bg-[#111827] p-3 border border-[#1F2937] rounded">
                  <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Link Identity</div>
                  <div className="text-[11px] font-bold text-slate-300 truncate">
                    {auth.currentUser?.displayName?.toUpperCase() || 'ANONYMOUS_UNIT'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <footer className="bg-[#111827] border border-[#1F2937] p-4">
            <div className="text-[10px] text-slate-500 font-bold uppercase mb-3 tracking-widest">Network Alert Log</div>
            <div className="space-y-2 mono text-[10px]">
              <div className="flex gap-4">
                <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-blue-500">[SYSTEM]</span>
                <span className="text-slate-400">Application kernel initialized. awaiting binary input.</span>
              </div>
              {videoFile && (
                <div className="flex gap-4">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-amber-500">[BUFFER]</span>
                  <span className="text-slate-400 truncate">Video object detected: {videoFile.name}</span>
                </div>
              )}
            </div>
          </footer>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#111827] border-[#1F2937] rounded-none">
            <CardContent className="p-4 space-y-4">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-[#1F2937] pb-2">Analysis Hub</div>
              
              {!analysisResult ? (
                <div className="py-8 text-center px-4">
                  <div className="w-12 h-12 border-2 border-dashed border-[#1F2937] rounded-full mx-auto flex items-center justify-center mb-4">
                    <ShieldCheck className="text-slate-700" size={24} />
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold leading-relaxed">AI Verification required before network transmission</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] uppercase font-black text-red-500">Confidence</span>
                       <span className="text-xl font-bold text-red-400 mono">{analysisResult.confidenceScore}%</span>
                    </div>
                    <div className="w-full bg-[#0B0F19] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${analysisResult.confidenceScore}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] text-slate-500 uppercase font-black">Threat Classification</div>
                    <Badge className="bg-[#1F2937] text-white border-0 rounded-none w-full justify-center py-1">
                      {analysisResult.type.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] text-slate-500 uppercase font-black">AI Summary Extract</div>
                    <p className="text-[11px] text-slate-400 italic leading-relaxed">
                      "{analysisResult.description}"
                    </p>
                  </div>
                </motion.div>
              )}

              <Button 
                className={`w-full h-12 rounded-none font-black text-[11px] uppercase tracking-[0.2em] transition-all
                  ${analysisResult ? 'bg-red-600 hover:bg-red-700 glow-red' : 'bg-blue-600 hover:bg-blue-700 glow-blue'}
                `}
                disabled={!videoFile || !location || isAnalyzing}
                onClick={analysisResult ? submitFinalReport : processReport}
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin" />
                    Neural Processing...
                  </div>
                ) : analysisResult ? (
                  <div className="flex items-center gap-3">
                    <Send size={14} />
                    Authorize Transmission
                  </div>
                ) : (
                  "Initiate AI Verification"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#0B0F19] border-[#1F2937] border-t-4 border-t-red-600 rounded-none p-4">
            <h3 className="text-[10px] font-black uppercase text-red-500 mb-2">Emergency Protocols</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed italic uppercase font-bold">
              False reporting is a felony. All verified transmissions are logged to the National Emergency Network with biometric and geospatial watermarks.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
