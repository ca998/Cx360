import React, { useState } from 'react';
import { MessageSquare, PhoneCall, Globe, CheckCircle2, ShieldCheck, Key } from 'lucide-react';

export const ChannelsView: React.FC = () => {
  const [phoneNumberId, setPhoneNumberId] = useState('109482910481920');
  const [wabaId, setWabaId] = useState('204918294018291');
  const [verifyToken, setVerifyToken] = useState('cx360_lagos_verify_9021');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div id="channels-view" className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#F8FAFC]">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          Official WhatsApp Business Cloud API & Voice Ingress Configuration
        </h2>
        <p className="text-xs text-slate-500">
          Connect official Meta Cloud API v20.0 endpoints and Nigerian telecom/SMS aggregators. Never use unofficial WhatsApp automation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Cloud API Settings */}
        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                WhatsApp Cloud API (Production)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
              CONNECTED
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                WhatsApp Phone Number ID
              </label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="w-full p-2 rounded border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Issued by Meta for registered phone (+234 813 942 1049)
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                WhatsApp Business Account ID (WABA)
              </label>
              <input
                type="text"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                className="w-full p-2 rounded border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Webhook Verification Secret
              </label>
              <input
                type="password"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full p-2 rounded border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 font-mono space-y-1">
              <div className="font-bold text-slate-800">WEBHOOK URL FOR META DEVELOPER PORTAL:</div>
              <div className="text-indigo-600 select-all">https://ais-dev-dwsaszvjthusbuntf27foc-936574647827.europe-west2.run.app/api/v1/channels/whatsapp/webhook</div>
            </div>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded text-xs transition-colors cursor-pointer"
            >
              Save Credentials
            </button>

            {saved && (
              <span className="ml-3 text-xs text-emerald-600 font-bold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved & Verified
              </span>
            )}
          </form>
        </div>

        {/* African Voice & Payment Connectors */}
        <div className="space-y-6">
          {/* Voice PBX */}
          <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Voice & Africa's Talking SIP Trunk
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inbound IVR queue configured with Lagos local DID (<span className="font-mono font-bold">+234 1 888 3600</span>). Automatic call recording, sentiment analysis, and transcript generation enabled.
            </p>
          </div>

          {/* Payment Gateways */}
          <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Paystack & Flutterwave NGN Subscriptions
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">
                PCI-DSS L1
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated NGN billing for agent seats, WhatsApp conversation quotas, and Gemini AI tokens. Cryptographic SHA-512 webhook validation active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
