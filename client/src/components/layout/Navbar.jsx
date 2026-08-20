import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard, Glasses, Settings } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-white border-2 border-slate-100 shadow-[2px_2px_0_0_#1e293b] rounded-none group-hover:-rotate-12 group-hover:scale-110 transition-all duration-200">
              <Glasses className="w-6 h-6 text-slate-100" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Quiz<span className="text-indigo-400">Master</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/leaderboard" className="hidden sm:inline-flex text-slate-400 hover:text-slate-100 transition-colors text-sm font-medium">
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
                    <span className="text-sm font-medium text-slate-200">{user.name}</span>
                    <span className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to="/settings" title="Settings" className="hover:opacity-80 transition-opacity">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-indigo-500/30" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-900 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>
                  </div>
                  <Link to="/settings" className="p-2 text-slate-400 hover:text-slate-100 transition-colors" title="Settings">
                    <Settings className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
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
