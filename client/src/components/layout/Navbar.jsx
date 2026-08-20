import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 canva-gradient-bg rounded-xl group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-800">
              Quiz<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7d2ae8] to-[#00c4cc]">Master</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/leaderboard" className="hidden sm:inline-flex text-slate-600 hover:text-brand-600 transition-colors text-sm font-semibold">
              Leaderboard
            </Link>
            {user ? (
              <>
                <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}>
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-bold text-slate-800">{user.name}</span>
                    <span className="text-xs text-slate-500 font-medium capitalize">{user.role.toLowerCase()}</span>
                  </div>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="w-9 h-9 rounded-full canva-gradient-bg flex items-center justify-center font-bold shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button 
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
