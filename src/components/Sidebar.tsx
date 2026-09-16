import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Ticket as TicketIcon,
  Bot,
  Layers,
  Radio,
  Building2,
  ChevronDown
} from 'lucide-react';
import { Organization } from '../types';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  unreadCount?: number;
  activeTenant: Organization | null;
  onOpenTenantModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  unreadCount = 12,
  activeTenant,
  onOpenTenantModal,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Unified Inbox', icon: Inbox, badge: unreadCount },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'tickets', label: 'Tickets', icon: TicketIcon },
    { id: 'ai-automations', label: 'AI Automations', icon: Bot },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: Layers },
    { id: 'channels', label: 'Channels & WhatsApp', icon: Radio },
  ];

  return (
    <aside id="app-sidebar" className="w-64 bg-[#0F172A] flex flex-col shrink-0 border-r border-slate-800 text-slate-200 select-none">
      {/* Brand Header */}
      <div className="p-6 h-20 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white shadow-lg text-sm tracking-tighter">
          360
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold leading-none tracking-tight">CX360 AI</span>
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">Enterprise NG</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <div
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onSelectView(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded font-medium transition-colors cursor-pointer text-sm ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Status & User Widget */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-[#0c1322]">
        {/* Status Box */}
        <div className="bg-slate-800/60 p-3 rounded border border-slate-700/40">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 flex items-center justify-between">
            <span>API STATUS: LAGOS_01</span>
            <span className="text-[9px] text-indigo-400 font-mono">LOS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-slate-300 font-medium">All Channels Active</span>
          </div>
        </div>

        {/* User / Tenant Switcher */}
        <div
          id="tenant-switcher-btn"
          onClick={onOpenTenantModal}
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/60 cursor-pointer transition-colors border border-transparent hover:border-slate-700/40"
          title="Click to switch organization tenant"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-200 border-2 border-indigo-400 flex items-center justify-center text-indigo-900 font-bold text-xs shrink-0">
            AA
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs text-white font-medium truncate">Abiola Adekunle</span>
            <span className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <Building2 className="w-2.5 h-2.5" />
              {activeTenant?.name || 'Zenith Bank'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </aside>
  );
};
