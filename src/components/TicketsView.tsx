import React, { useState } from 'react';
import { Ticket, Priority } from '../types';
import { AlertTriangle, Clock, CheckCircle, Search, Filter } from 'lucide-react';

interface TicketsViewProps {
  tickets: Ticket[];
  onUpdateTicketStatus: (ticketId: string, status: string) => Promise<void>;
  onOpenCreateTicket: () => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  tickets,
  onUpdateTicketStatus,
  onOpenCreateTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
            <AlertTriangle className="w-2.5 h-2.5" /> Critical (15m SLA)
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold uppercase w-fit">
            High (30m SLA)
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-[10px] font-bold uppercase w-fit">
            Medium (2h SLA)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase w-fit">
            Low (8h SLA)
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">
            {status}
          </span>
        );
      case 'escalated':
        return (
          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold uppercase">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="tickets-view" className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#F8FAFC]">
      {/* SLA Policy Summary Banner */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Configured SLA Policies (Nigerian Banking & Commercial Hours: 08:00 - 17:00 WAT)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Breach triggers automatic escalation to Team Leader & WhatsApp alert to Branch Manager.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded font-semibold">
            Critical: 15m
          </span>
          <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded font-semibold">
            High: 30m
          </span>
          <span className="px-2 py-1 bg-sky-50 border border-sky-200 text-sky-700 rounded font-semibold">
            Medium: 2h
          </span>
          <span className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded font-semibold">
            Low: 8h
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ticket ID, customer, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            onClick={onOpenCreateTicket}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
          >
            + New Ticket
          </button>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
            Enterprise Helpdesk Tickets ({filteredTickets.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-4 py-2 border-b border-slate-200">Ticket ID</th>
                <th className="px-4 py-2 border-b border-slate-200">Customer</th>
                <th className="px-4 py-2 border-b border-slate-200">Subject</th>
                <th className="px-4 py-2 border-b border-slate-200">Category</th>
                <th className="px-4 py-2 border-b border-slate-200">Priority</th>
                <th className="px-4 py-2 border-b border-slate-200">Status</th>
                <th className="px-4 py-2 border-b border-slate-200">SLA Status</th>
                <th className="px-4 py-2 border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-xs text-indigo-600">
                    {t.ticketNumber}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-xs">
                    {t.customerName}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700 max-w-xs truncate font-medium">
                    {t.subject}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                    {t.category}
                  </td>
                  <td className="px-4 py-3">{getPriorityBadge(t.priority)}</td>
                  <td className="px-4 py-3">{getStatusBadge(t.status)}</td>
                  <td className="px-4 py-3 font-mono text-[10px] font-bold text-slate-600">
                    {t.slaStatusText}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.status !== 'resolved' ? (
                      <button
                        onClick={() => onUpdateTicketStatus(t.id, 'resolved')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
