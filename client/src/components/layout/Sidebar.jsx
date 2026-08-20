import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, BarChart3, ListChecks } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'ADMIN') return null;

  const links = [
    { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview' },
    { to: '/admin/quizzes', icon: <BookOpen className="w-5 h-5" />, label: 'Quizzes' },
    { to: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
    { to: '/admin/categories', icon: <ListChecks className="w-5 h-5" />, label: 'Categories' },
    { to: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
    { to: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  return (
    <aside className="w-64 glass border-r border-slate-700/50 hidden md:block min-h-[calc(100vh-4rem)]">
      <div className="p-4 py-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">
          Admin Menu
        </h2>
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-100 text-brand-900 font-bold'
                    : 'text-slate-500 hover:text-brand-600 hover:bg-slate-50'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
