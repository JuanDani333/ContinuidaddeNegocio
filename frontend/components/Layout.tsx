import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, ShieldCheck, Menu, X } from 'lucide-react';
import { Button } from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
  user: { username: string } | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar / Navbar */}
      <aside 
        className={`
          bg-slate-900 border-r border-slate-800 
          flex flex-col flex-shrink-0
          transition-all duration-300 ease-in-out
          w-full md:w-64
          ${isMobileMenuOpen ? 'h-full z-50 absolute md:relative' : 'h-auto'}
          md:h-full
          overflow-y-auto
        `}
      >
        {/* Sidebar Header (Logo + Mobile Toggle) */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-magenta-500 to-magenta-700 flex items-center justify-center shadow-lg shadow-magenta-900/40">
               <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-100 tracking-tight">Core<span className="text-magenta-500">View</span></span>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-slate-400 hover:text-white focus:outline-none p-1"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation Content - Hidden on mobile unless open, always visible on desktop */}
        <div className={`flex-col flex-1 ${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex`}>
          <nav className="flex-1 p-4 space-y-2">
            <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menu
            </div>
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${location.pathname === '/' ? 'bg-white/5 text-magenta-400' : ''}`}
              onClick={() => handleNavClick('/')}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Button>
          </nav>

          {/* User Profile Section (Fixed at bottom of sidebar scroll area) */}
          <div className="p-4 border-t border-slate-800 mt-auto">
             <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-600 ring-2 ring-slate-800">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{user?.username}</p>
                  <p className="text-xs text-slate-500 truncate">Administrador</p>
                </div>
             </div>
             <Button variant="secondary" onClick={handleLogout} className="w-full justify-center text-sm">
               <LogOut className="w-4 h-4 mr-2" />
               Cerrar Sesión
             </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* Hidden on mobile if menu is full screen open (z-index issue prevention), otherwise flexible */}
      <main className={`
        flex-1 overflow-y-auto 
        bg-slate-950
        relative
        ${isMobileMenuOpen ? 'hidden md:block' : 'block'}
      `}>
        <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-full">
           {children}
        </div>
      </main>
    </div>
  );
};