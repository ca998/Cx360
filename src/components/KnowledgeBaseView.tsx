import React, { useState } from 'react';
import { KnowledgeArticle } from '../types';
import { Search, BookOpen, Sparkles, Tag, Eye, ShieldAlert } from 'lucide-react';

interface KnowledgeBaseViewProps {
  articles: KnowledgeArticle[];
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ articles }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ragQuery, setRagQuery] = useState('');
  const [ragResult, setRagResult] = useState<string | null>(null);
  const [searchingRag, setSearchingRag] = useState(false);

  const filteredArticles = articles.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleRunRag = () => {
    if (!ragQuery.trim()) return;
    setSearchingRag(true);
    setTimeout(() => {
      setRagResult(
        `[RAG Retrieval Match 94.2% Confidence - Cosine Distance 0.08]: Under Central Bank of Nigeria (CBN) regulations circular BPS/DIR/CIR/GEN/05/012, failed instant transfers where the sending bank debited but receiving bank did not credit must be reconciled automatically within 24 hours. Recommended action: log automated ticket on NDRS portal.`
      );
      setSearchingRag(false);
    }, 450);
  };

  return (
    <div id="knowledge-base-view" className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#F8FAFC]">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Enterprise Knowledge Base & Semantic RAG Vector Store
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          All articles are indexed with vector embeddings for instant grounding of the CX360 AI Agent and human agent copilot.
        </p>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search policies, CBN dispute regulations, iOS token resets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Interactive RAG Grounding Simulator */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Test RAG Vector Retrieval & Grounding
          </span>
          <span className="text-[10px] font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
            Vector Model: text-embedding-004
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question as a customer (e.g., 'What is the CBN rule on failed transfer reversal?')"
            value={ragQuery}
            onChange={(e) => setRagQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunRag()}
            className="flex-1 p-2 text-xs bg-white rounded border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleRunRag}
            disabled={searchingRag || !ragQuery.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            {searchingRag ? 'Retrieving...' : 'Run RAG'}
          </button>
        </div>

        {ragResult && (
          <div className="p-3 bg-white border border-indigo-200 rounded text-xs text-indigo-950 font-sans leading-relaxed">
            {ragResult}
          </div>
        )}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white border border-slate-200 rounded p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                  {article.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {article.views}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 leading-snug mb-2">
                {article.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                {article.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {article.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{article.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
