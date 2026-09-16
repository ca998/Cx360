import React, { useState } from 'react';
import { Ticket as TicketIcon, AlertCircle } from 'lucide-react';
import { Customer, Priority } from '../types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onCreateTicket: (ticket: {
    customerName: string;
    customerId: string;
    subject: string;
    description: string;
    category: string;
    priority: Priority;
  }) => Promise<void>;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  customers,
  onCreateTicket,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Failed Transaction');
  const [priority, setPriority] = useState<Priority>('high');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
    setSubmitting(true);
    try {
      await onCreateTicket({
        customerName: customer ? customer.fullName : 'Walk-in Customer',
        customerId: customer ? customer.id : 'cust-01',
        subject,
        description,
        category,
        priority,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Create New Support Ticket</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full p-2 rounded border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.phone}) - {c.segment.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject / Issue Summary</label>
            <input
              type="text"
              required
              placeholder="e.g. NIP Transfer Debit without Beneficiary Credit"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 rounded border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="Failed Transaction">Failed Transaction (NIP)</option>
                <option value="POS Settlement">POS Settlement Dispute</option>
                <option value="Mobile App & Biometrics">Mobile App & Biometrics</option>
                <option value="Card Delivery">Debit/Credit Card Issue</option>
                <option value="Trade & FX">Trade & FX Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority (SLA Tier)</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full p-2 rounded border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="critical">Critical (15 min SLA)</option>
                <option value="high">High (30 min SLA)</option>
                <option value="medium">Medium (2 hr SLA)</option>
                <option value="low">Low (8 hr SLA)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              placeholder="Include session ID, transaction amount, beneficiary bank, or error code..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded text-[11px] text-slate-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>SLA countdown will begin immediately upon submission.</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded cursor-pointer transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
