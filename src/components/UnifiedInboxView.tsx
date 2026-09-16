import React, { useState } from 'react';
import { Conversation, Message } from '../types';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  Phone,
  Mail,
  MapPin,
  Tag,
  FileText,
  AlertCircle,
  RefreshCw,
  CheckCheck
} from 'lucide-react';

interface UnifiedInboxViewProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  onSendMessage: (conversationId: string, body: string, isInternalNote: boolean) => Promise<void>;
}

export const UnifiedInboxView: React.FC<UnifiedInboxViewProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onSendMessage,
}) => {
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestedReply, setAiSuggestedReply] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const activeConv = selectedConversation || conversations[0] || null;

  const filteredConversations = conversations.filter((c) => {
    if (activeChannelFilter === 'all') return true;
    return c.channel === activeChannelFilter;
  });

  const handleSend = async () => {
    if (!replyText.trim() || !activeConv) return;
    await onSendMessage(activeConv.id, replyText, isInternalNote);
    setReplyText('');
    setAiSuggestedReply(null);
  };

  const handleGenerateAiReply = async () => {
    if (!activeConv) return;
    setAiGenerating(true);
    try {
      const res = await fetch('/api/v1/ai/copilot/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConv.id,
          lastCustomerMessage: activeConv.lastMessagePreview,
          intent: activeConv.intent,
        }),
      });
      const data = await res.json();
      if (data.success && data.suggestedReply) {
        setAiSuggestedReply(data.suggestedReply);
      }
    } catch {
      setAiSuggestedReply('Hello! Thank you for reaching out. We have received your inquiry and are verifying the transaction on the core banking switch.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleToneImprovement = async (tone: 'professional' | 'empathetic' | 'shorter') => {
    if (!replyText.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch('/api/v1/ai/copilot/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText, tone }),
      });
      const data = await res.json();
      if (data.success && data.improvedText) {
        setReplyText(data.improvedText);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSummarize = () => {
    if (!activeConv) return;
    setAiSummary(
      `Customer reported ${activeConv.intent}. Interbank trace session ID flagged for clearing. Priority is ${activeConv.priority.toUpperCase()} due to SLA target (${activeConv.slaRemainingFormatted}). Next Best Action: verify settlement in NIBSS portal.`
    );
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return 'bg-emerald-100 text-emerald-700';
      case 'web_chat':
        return 'bg-sky-100 text-sky-700';
      case 'voice':
        return 'bg-indigo-100 text-indigo-700';
      case 'email':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div id="unified-inbox" className="flex-1 flex overflow-hidden bg-[#F8FAFC]">
      {/* 1. LEFT: Conversation Queue */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        {/* Channel Filter Pills */}
        <div className="p-3 border-b border-slate-200 flex gap-1.5 overflow-x-auto bg-slate-50/50">
          {['all', 'whatsapp', 'web_chat', 'voice', 'email'].map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannelFilter(ch)}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer shrink-0 ${
                activeChannelFilter === ch
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {ch === 'web_chat' ? 'Web' : ch}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.map((conv) => {
            const isSelected = activeConv?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`p-4 cursor-pointer transition-colors border-l-2 ${
                  isSelected
                    ? 'bg-indigo-50/60 border-l-indigo-600'
                    : 'border-l-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getChannelColor(conv.channel)}`}>
                    {conv.channel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{conv.lastMessageAt}</span>
                </div>

                <div className="font-semibold text-sm text-slate-900 truncate">
                  {conv.customerName}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {conv.lastMessagePreview}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/60 text-[10px]">
                  <span className="text-slate-500 font-medium">{conv.intent}</span>
                  <span
                    className={`font-mono font-bold ${
                      conv.slaBreachRisk ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {conv.slaRemainingFormatted}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER: Current Conversation Transcript & Composer */}
      {activeConv ? (
        <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-slate-200">
          {/* Conversation Header */}
          <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${getChannelColor(activeConv.channel)}`}>
                {activeConv.channel}
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 truncate">{activeConv.customerName}</h2>
                <span className="text-xs text-slate-500 truncate block font-mono">
                  {activeConv.customerPhone} • {activeConv.intent}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-[10px] font-mono text-slate-700">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>SLA: {activeConv.slaRemainingFormatted}</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                {activeConv.priority} Priority
              </span>
            </div>
          </div>

          {/* Transcript Message Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {activeConv.messages.map((msg: Message) => {
              const isAgent = msg.senderType === 'agent';
              const isAi = msg.senderType === 'ai';
              const isCustomer = msg.senderType === 'customer';

              if (msg.isInternalNote) {
                return (
                  <div
                    key={msg.id}
                    className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs my-2 max-w-xl mx-auto shadow-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-[10px] text-amber-700 uppercase mb-1">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Internal Agent Note
                      </span>
                      <span>{msg.createdAt}</span>
                    </div>
                    <p>{msg.body}</p>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                >
                  <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                    <span>{msg.senderName}</span>
                    <span>•</span>
                    <span>{msg.createdAt}</span>
                    {isAgent && <CheckCheck className="w-3 h-3 text-indigo-600" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-lg text-sm max-w-md shadow-xs ${
                      isCustomer
                        ? 'bg-white border border-slate-200 text-slate-800'
                        : isAi
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-950'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {isAi && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 uppercase mb-1">
                        <Bot className="w-3 h-3" /> AI Virtual Agent Response
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Suggested Response Banner */}
          {aiSuggestedReply && (
            <div className="px-6 py-3 bg-indigo-50 border-t border-indigo-100 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Gemini Copilot Draft Recommendation
                </span>
                <button
                  onClick={() => setAiSuggestedReply(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-indigo-900 italic bg-white p-2.5 rounded border border-indigo-100">
                "{aiSuggestedReply}"
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReplyText(aiSuggestedReply);
                    setAiSuggestedReply(null);
                  }}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Use This Reply
                </button>
                <button
                  onClick={() => handleToneImprovement('empathetic')}
                  className="px-2 py-1 bg-white border border-indigo-200 text-indigo-700 rounded text-xs font-medium cursor-pointer"
                >
                  Make More Empathetic
                </button>
                <button
                  onClick={() => handleToneImprovement('professional')}
                  className="px-2 py-1 bg-white border border-indigo-200 text-indigo-700 rounded text-xs font-medium cursor-pointer"
                >
                  Make More Professional
                </button>
              </div>
            </div>
          )}

          {/* Reply Composer */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsInternalNote(false)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded cursor-pointer ${
                    !isInternalNote
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Public Customer Reply
                </button>
                <button
                  onClick={() => setIsInternalNote(true)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded cursor-pointer ${
                    isInternalNote
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Internal Note (Private)
                </button>
              </div>

              <button
                onClick={handleGenerateAiReply}
                disabled={aiGenerating}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {aiGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Copilot Suggest</span>
              </button>
            </div>

            <div className="flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSend();
                  }
                }}
                rows={2}
                placeholder={
                  isInternalNote
                    ? 'Write an internal note visible only to agents...'
                    : `Reply to ${activeConv.customerName} via ${activeConv.channel}...`
                }
                className={`flex-1 p-2.5 text-sm rounded border focus:outline-none focus:ring-1 ${
                  isInternalNote
                    ? 'border-amber-300 bg-amber-50/30 focus:ring-amber-500'
                    : 'border-slate-200 focus:ring-indigo-500'
                }`}
              ></textarea>

              <button
                onClick={handleSend}
                disabled={!replyText.trim()}
                className={`px-4 rounded font-medium text-white flex items-center justify-center transition-colors cursor-pointer ${
                  isInternalNote
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
              <span>Press ⌘+Enter or Ctrl+Enter to send</span>
              <span>Encrypted via NDPA-compliant gateway</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. RIGHT: Customer 360 Mini-Card + AI Copilot Intelligence */}
      {activeConv && (
        <div className="w-80 bg-white p-5 flex flex-col gap-5 overflow-y-auto shrink-0 border-l border-slate-200">
          {/* Customer Mini 360 Card */}
          <div className="border border-slate-200 rounded p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Customer 360 Profile
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-semibold text-slate-800">{activeConv.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone:
                </span>
                <span className="font-mono text-slate-700">{activeConv.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email:
                </span>
                <span className="text-slate-700 truncate max-w-[140px]">{activeConv.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location:
                </span>
                <span className="text-slate-700">Lagos, Nigeria</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Segment:
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase text-[9px]">
                  VIP Priority
                </span>
              </div>
            </div>
          </div>

          {/* AI Copilot Intelligence Panel */}
          <div className="border border-slate-200 rounded p-4 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              AI Copilot Assistant
            </h3>

            {/* Sentiment & Intent Pill */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Sentiment</div>
                <div className="font-semibold text-rose-600 capitalize mt-0.5">
                  {activeConv.sentiment.replace('_', ' ')}
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Intent</div>
                <div className="font-semibold text-slate-800 truncate mt-0.5">
                  {activeConv.intent}
                </div>
              </div>
            </div>

            {/* Next Best Action */}
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded text-xs space-y-1">
              <span className="text-[10px] font-bold text-indigo-800 uppercase flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Next Best Action
              </span>
              <p className="text-indigo-950 text-[11px] leading-relaxed">
                Acknowledge NIBSS transfer session ID. Check core banking reversal ledger within 15m.
              </p>
            </div>

            {/* AI Summary Generator */}
            <div>
              <button
                onClick={handleSummarize}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 rounded text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Summarize Conversation
              </button>
              {aiSummary && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                  {aiSummary}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
