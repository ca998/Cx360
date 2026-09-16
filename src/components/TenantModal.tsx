import React from 'react';
import { Building2, Check, Shield } from 'lucide-react';
import { Organization } from '../types';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTenantId: string;
  onSwitchTenant: (tenantId: string) => Promise<void>;
}

export const TenantModal: React.FC<TenantModalProps> = ({
  isOpen,
  onClose,
  activeTenantId,
  onSwitchTenant,
}) => {
  if (!isOpen) return null;

  const tenantOptions = [
    {
      tenantId: 'org_NG_00412',
      name: 'Zenith Financial Services',
      industry: 'Banking & Fintech',
      country: 'Nigeria (NGN)',
      activeUsers: 21,
      slaTarget: '15m / 2h',
    },
    {
      tenantId: 'org_NG_00881',
      name: 'PaySwitch Africa Technologies',
      industry: 'Payment Gateway & Fintech',
      country: 'Pan-Africa (NGN / USD)',
      activeUsers: 14,
      slaTarget: '30m / 4h',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Switch Tenant Environment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Strict multi-tenant boundary: data and queues are isolated per organization.
          </div>

          {tenantOptions.map((t) => {
            const isActive = activeTenantId === t.tenantId;
            return (
              <div
                key={t.tenantId}
                onClick={async () => {
                  await onSwitchTenant(t.tenantId);
                  onClose();
                }}
                className={`p-3.5 rounded border transition-colors cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>{t.name}</span>
                    {isActive && (
                      <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Tenant ID: {t.tenantId} • {t.industry}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {t.country} • {t.activeUsers} Agents
                  </div>
                </div>

                {isActive && <Check className="w-5 h-5 text-indigo-600 shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
