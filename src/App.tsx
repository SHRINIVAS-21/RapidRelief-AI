import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  AlertTriangle, 
  Map as MapIcon, 
  Upload, 
  LayoutDashboard, 
  ShieldAlert, 
  Menu, 
  X,
  Bell,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

import Home from './pages/Home';
import Report from './pages/Report';
import Dashboard from './pages/Dashboard';
import IncidentDetails from './pages/IncidentDetails';
import { Button } from './components/ui/button';
import { authService } from './services/authService';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-red-500/30">
        <Toaster position="top-right" theme="dark" />
        
        {/* Navigation Rail */}
        <nav className="fixed top-0 left-0 right-0 h-14 bg-[#111827] border-b border-[#1F2937] z-50 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-red-600/20">R</div>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase flex items-center gap-1">
              RapidRelief <span className="text-red-500 underline decoration-2">AI</span>
            </h1>
          </div>

          {/* Desktop Nav - High Density Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1 bg-[#1F2937] p-1 rounded border border-[#374151]">
              <NavLink to="/" icon={<MapIcon size={14} />} label="MAP" />
              <NavLink to="/report" icon={<Upload size={14} />} label="REPORT" />
              <NavLink to="/dashboard" icon={<LayoutDashboard size={14} />} label="ADMIN" />
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse glow-green"></div>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">AI Engine: Online</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:block text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">System Time (UTC)</div>
              <div className="text-xs mono font-bold text-slate-300">{new Date().toISOString().slice(0, 19).replace('T', ' ')}</div>
            </div>

            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button 
                  variant="outline" 
                  className="border-[#1F2937] bg-transparent hover:bg-[#1F2937] text-[10px] font-bold uppercase tracking-widest px-4 h-8 cursor-pointer"
                >
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            
            <Button className="hidden md:flex bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] px-4 h-8 rounded-none border-l-4 border-white/20">
              SOS
            </Button>
          </div>
        </nav>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed top-0 right-0 bottom-0 w-64 bg-zinc-900 z-70 p-6 border-l border-zinc-800"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-bold">Navigation</span>
                  <X className="cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
                </div>
                <div className="flex flex-col gap-4">
                  <MobileNavLink to="/" icon={<MapIcon />} label="Live Map" onClick={() => setIsSidebarOpen(false)} />
                  <MobileNavLink to="/report" icon={<Upload />} label="Report Incident" onClick={() => setIsSidebarOpen(false)} />
                  <MobileNavLink to="/dashboard" icon={<LayoutDashboard />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="pt-20 px-4 md:px-8 pb-12 max-w-7xl mx-auto min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<Report />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/incident/:id" element={<IncidentDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to}>
      <div className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200
        ${isActive ? 'bg-red-600 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-[#374151]'}
      `}>
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
    </Link>
  );
}

function MobileNavLink({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} onClick={onClick} className={`
      flex items-center gap-3 p-3 rounded transition-colors
      ${isActive ? 'bg-red-600/10 text-red-500 border border-red-500/20' : 'text-zinc-400 hover:bg-zinc-800'}
    `}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
    </Link>
  );
}
