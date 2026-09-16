import React from 'react';
import { Plus } from 'lucide-react';
import { Organization } from '../types';

interface HeaderProps {
  title: string;
  activeTenant: Organization | null;
  onOpenCreateTicket: () => void;
  resolutionRate?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  activeTenant,
  onOpenCreateTicket,
  resolutionRate = 98.4,
}) => {
  return (
    <header id="app-header" className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 select-none">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 font-medium">
          {activeTenant?.name || 'Zenith Financial Services'} • Tenant ID:{' '}
          <span className="font-mono text-slate-600 font-semibold">{activeTenant?.tenantId || 'org_NG_00412'}</span>
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Resolution</span>
          <span className="text-xl font-mono font-bold text-slate-900">{resolutionRate}%</span>
        </div>

        <div className="h-8 w-[1px] bg-slate-200"></div>

        <button
          id="btn-create-ticket"
          onClick={onOpenCreateTicket}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Ticket</span>
        </button>
      </div>
    </header>
  );
};
