import React, { useState } from 'react';
import { Customer } from '../types';
import { Phone, Mail, MapPin, Tag, Clock, CheckCircle, ShieldCheck } from 'lucide-react';

interface Customer360ViewProps {
  customers: Customer[];
}

export const Customer360View: React.FC<Customer360ViewProps> = ({ customers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(customers[0]);

  return (
    <div id="customer-360-view" className="flex-1 flex overflow-hidden bg-[#F8FAFC]">
      {/* Customer Directory List */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Customer Directory ({customers.length})
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {customers.map((c) => {
            const isSelected = selectedCustomer?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className={`p-4 cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-50/60 border-l-2 border-indigo-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm text-slate-900">{c.fullName}</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {c.segment.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">{c.phone}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">{c.email}</div>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Last active {c.lastInteractionAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer 360 Full Profile */}
      {selectedCustomer && (
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {/* Identity & KYC Card */}
          <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center font-bold text-indigo-800 text-lg">
                    {selectedCustomer.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {selectedCustomer.fullName}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      Account ID: {selectedCustomer.customerCode} • NUBAN: {selectedCustomer.accountNumber || '2084910283'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  KYC Verified (Tier 3)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone Number
                </span>
                <span className="font-mono font-semibold text-slate-800 text-sm">
                  {selectedCustomer.phone}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email Address
                </span>
                <span className="font-semibold text-slate-800 text-sm">
                  {selectedCustomer.email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </span>
                <span className="font-semibold text-slate-800 text-sm">
                  {selectedCustomer.location}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Customer Segment
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold uppercase rounded text-[11px]">
                  {selectedCustomer.segment} Priority
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
              <span className="text-xs text-slate-400">Customer Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCustomer.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Omnichannel Interaction Timeline */}
          <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-6">
              Complete Omnichannel Interaction Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {/* Event 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span className="text-emerald-700">WhatsApp Inbound Message</span>
                  <span className="text-[10px] font-mono text-slate-400">Today, 07:18 AM</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded border border-slate-100">
                  "I tried sending ₦450,000 to my vendor via Zenith Mobile app and got debited immediately... Session ID: 99920126090307123910."
                </p>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white"></div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span className="text-indigo-700">Ticket Created (TCK-2026-00412)</span>
                  <span className="text-[10px] font-mono text-slate-400">Today, 07:15 AM</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Automated ticket generation from WhatsApp conversation by CX360 AI Agent. Category: Failed Transaction. SLA: 15 minutes.
                </p>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-sky-500 border-2 border-white"></div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span className="text-sky-700">Web Chat Session Completed</span>
                  <span className="text-[10px] font-mono text-slate-400">Yesterday, 04:30 PM</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Customer inquired about international debit card spending limits on POS terminals. Resolved by AI virtual agent. CSAT Rating: 5/5.
                </p>
              </div>

              {/* Event 4 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-400 border-2 border-white"></div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span className="text-slate-700">Voice Inbound Call (03:45 mins)</span>
                  <span className="text-[10px] font-mono text-slate-400">28 Aug 2026, 11:15 AM</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Account validation and quarterly corporate statement dispatch to registered corporate email address.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
