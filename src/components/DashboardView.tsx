import React, { useState } from 'react';
import { Conversation, SystemMetrics } from '../types';
import { CheckCircle2, RefreshCw } from 'lucide-react';

interface DashboardViewProps {
  metrics: SystemMetrics;
  conversations: Conversation[];
  onSelectConversation: (conv: Conversation) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  conversations,
  onSelectConversation,
}) => {
  const [filterChannel, setFilterChannel] = useState<'all' | 'high_priority'>('all');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  const displayConversations = conversations.filter((c) => {
    if (filterChannel === 'high_priority') {
      return c.priority === 'critical' || c.priority === 'high';
    }
    return true;
  });

  const handleApproveBroadcast = async () => {
    setBroadcasting(true);
    try {
      await fetch('/api/v1/ai/insights/broadcast', { method: 'POST' });
      setBroadcastSent(true);
    } catch {
      setBroadcastSent(true);
    } finally {
      setBroadcasting(false);
    }
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">
            WhatsApp
          </span>
        );
      case 'web_chat':
        return (
          <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-[10px] font-bold rounded uppercase">
            Web Chat
          </span>
        );
      case 'voice':
        return (
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase">
            Voice
          </span>
        );
      case 'email':
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">
            Email
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">
            {channel}
          </span>
        );
    }
  };

  const getSentimentPill = (sentiment: string) => {
    switch (sentiment) {
      case 'very_negative':
      case 'negative':
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
            <span className="text-xs font-semibold text-rose-600 uppercase">
              {sentiment === 'very_negative' ? 'Angry' : 'Negative'}
            </span>
          </div>
        );
      case 'positive':
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-semibold text-emerald-600 uppercase">Positive</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Neutral</span>
          </div>
        );
    }
  };

  return (
    <div id="dashboard-grid" className="flex-1 p-8 overflow-y-auto space-y-6">
      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded p-5 flex flex-col justify-between shadow-sm h-32">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Active Conversations
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {metrics.activeConversations.toLocaleString()}
            </span>
            <span className="text-emerald-500 text-xs font-bold mb-1">↑ 14%</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded p-5 flex flex-col justify-between shadow-sm h-32">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Open Tickets
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">{metrics.openTickets}</span>
            <span className="text-rose-500 text-xs font-bold mb-1">↓ 2%</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded p-5 flex flex-col justify-between shadow-sm h-32">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            SLA Compliance
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">{metrics.slaComplianceRate}%</span>
            <span className="text-slate-400 text-xs font-bold mb-1">Stable</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200 rounded p-5 flex flex-col justify-between shadow-sm h-32">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Avg. AI Handoff
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">{metrics.avgAiHandoffTime}</span>
            <span className="text-emerald-500 text-xs font-bold mb-1">-22s</span>
          </div>
        </div>
      </div>

      {/* Main Grid Section: Col-span-3 Priority Queue + Col-span-1 AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Omnichannel Priority Queue (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded flex flex-col shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
              Omnichannel Priority Queue
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterChannel('all')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                  filterChannel === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                All Channels
              </button>
              <button
                onClick={() => setFilterChannel('high_priority')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                  filterChannel === 'high_priority'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                High Priority
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-4 py-2 border-b border-slate-200">Channel</th>
                  <th className="px-4 py-2 border-b border-slate-200">Customer</th>
                  <th className="px-4 py-2 border-b border-slate-200">Category</th>
                  <th className="px-4 py-2 border-b border-slate-200">Sentiment</th>
                  <th className="px-4 py-2 border-b border-slate-200">SLA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayConversations.map((conv) => (
                  <tr
                    key={conv.id}
                    onClick={() => onSelectConversation(conv)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">{getChannelBadge(conv.channel)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {conv.customerName}
                      <div className="text-[10px] font-normal text-slate-500 font-mono">
                        {conv.customerPhone || conv.customerEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 font-medium">{conv.intent}</span>
                    </td>
                    <td className="px-4 py-3">{getSentimentPill(conv.sentiment)}</td>
                    <td
                      className={`px-4 py-3 font-mono text-[10px] font-bold ${
                        conv.slaBreachRisk ? 'text-rose-600' : 'text-slate-500'
                      }`}
                    >
                      {conv.slaRemainingFormatted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights Agent (1 col) */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded flex flex-col shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
              AI Insights Agent
            </h2>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          </div>

          <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
            {/* Intelligence Advisory */}
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded">
              <p className="text-[11px] leading-relaxed text-indigo-900 italic">
                "Detected 18% spike in 'Failed Transaction' intents in the last 45 mins from Lagos Mainland IP range. Suggesting mass-notification via SMS/WhatsApp."
              </p>
              {broadcastSent ? (
                <div className="mt-2 text-[10px] text-emerald-700 bg-emerald-100 p-1.5 rounded flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Broadcast Dispatched to 1,840 Users</span>
                </div>
              ) : (
                <button
                  onClick={handleApproveBroadcast}
                  disabled={broadcasting}
                  className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  {broadcasting && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>{broadcasting ? 'Broadcasting...' : 'Approve & Broadcast'}</span>
                </button>
              )}
            </div>

            {/* AI Containment Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  AI Containment Rate
                </span>
                <span className="text-[10px] font-bold text-indigo-600 font-mono">
                  {metrics.aiContainmentRate}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${metrics.aiContainmentRate}%` }}
                ></div>
              </div>
            </div>

            {/* Trending Intents */}
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                Trending Intents
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {metrics.trendingIntents.map((intent) => (
                  <span
                    key={intent.name}
                    className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700"
                  >
                    {intent.name} ({intent.percentage}%)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant System Performance (Col span 4) */}
      <div className="bg-white border border-slate-200 rounded flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
            Tenant System Performance
          </h2>
          <div className="text-[10px] font-mono text-slate-400">REFRESHING IN 14s</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-4 gap-8">
          {/* DB Usage */}
          <div className="flex flex-col justify-center border-r border-slate-100 pr-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase">DB Usage</span>
            <div className="h-2 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="w-1/3 h-full bg-indigo-400 rounded-full"></div>
            </div>
            <span className="text-xs font-bold mt-1 text-slate-800">{metrics.dbUsageText}</span>
          </div>

          {/* API Requests */}
          <div className="flex flex-col justify-center border-r border-slate-100 pr-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase">API Requests (24h)</span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {metrics.apiRequestsCount.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-500 font-bold tracking-tight">
              99.98% SUCCESS RATE
            </span>
          </div>

          {/* Active Agents */}
          <div className="flex flex-col justify-center border-r border-slate-100 pr-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Agents</span>
            <div className="flex -space-x-2 mt-2">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-white flex items-center justify-center text-[8px] text-white font-bold">
                JO
              </div>
              <div className="w-6 h-6 rounded-full bg-indigo-400 border border-white flex items-center justify-center text-[8px] text-white font-bold">
                KM
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-400 border border-white flex items-center justify-center text-[8px] text-white font-bold">
                TY
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[8px] text-slate-500 font-bold">
                +18
              </div>
            </div>
          </div>

          {/* SLA Breaches */}
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">SLA Breaches Today</span>
            <div className="text-xl font-bold font-mono text-rose-500">
              {String(metrics.slaBreachesToday).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-rose-400 font-bold">CRITICAL ESCALATIONS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
