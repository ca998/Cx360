import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { UnifiedInboxView } from './components/UnifiedInboxView';
import { Customer360View } from './components/Customer360View';
import { TicketsView } from './components/TicketsView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { ChannelsView } from './components/ChannelsView';
import { TenantModal } from './components/TenantModal';
import { CreateTicketModal } from './components/CreateTicketModal';
import {
  Organization,
  Conversation,
  Ticket,
  Customer,
  KnowledgeArticle,
  SystemMetrics,
  Priority
} from './types';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTenant, setActiveTenant] = useState<Organization | null>({
    id: 'org-zenith-01',
    name: 'Zenith Financial Services',
    slug: 'zenith-bank',
    industry: 'Banking & Fintech',
    companySize: '5,000+ employees',
    countryCode: 'NG',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    status: 'active',
    tenantId: 'org_NG_00412',
    dbUsageGB: 3.4,
    dbMaxGB: 10,
    monthlyApiRequests: 842112,
  });

  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeConversations: 1240,
    openTickets: 84,
    slaComplianceRate: 92.8,
    avgAiHandoffTime: '4m 12s',
    totalResolutionRate: 98.4,
    dbUsageText: '3.4GB / 10GB',
    apiRequestsCount: 842112,
    activeAgentsCount: 21,
    slaBreachesToday: 2,
    aiContainmentRate: 72,
    trendingIntents: [
      { name: 'Payment Issue', percentage: 44 },
      { name: 'App Login', percentage: 18 },
      { name: 'POS Settlement', percentage: 14 },
      { name: 'Card Delivery', percentage: 8 },
    ],
    channelsActive: true,
  });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);

  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);

  // Fetch initial data from Express API
  const loadData = async () => {
    try {
      const [convRes, tckRes, custRes, kbRes, dashRes] = await Promise.all([
        fetch('/api/v1/conversations').then((r) => r.json()),
        fetch('/api/v1/tickets').then((r) => r.json()),
        fetch('/api/v1/customers').then((r) => r.json()),
        fetch('/api/v1/kb/articles').then((r) => r.json()),
        fetch('/api/v1/analytics/dashboard').then((r) => r.json()),
      ]);

      if (convRes.success) {
        setConversations(convRes.data);
        if (!selectedConversation && convRes.data.length > 0) {
          setSelectedConversation(convRes.data[0]);
        }
      }
      if (tckRes.success) setTickets(tckRes.data);
      if (custRes.success) setCustomers(custRes.data);
      if (kbRes.success) setArticles(kbRes.data);
      if (dashRes.success) setMetrics(dashRes.data);
    } catch (err) {
      console.warn('API fetch error, using pre-seeded state:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle switching tenant
  const handleSwitchTenant = async (tenantId: string) => {
    try {
      const res = await fetch('/api/v1/tenants/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      const data = await res.json();
      if (data.success && data.organization) {
        setActiveTenant({
          ...data.organization,
          slug: data.organization.name.toLowerCase().replace(/\s+/g, '-'),
          companySize: '5,000+ employees',
          status: 'active',
          monthlyApiRequests: data.organization.apiRequests,
        });
        await loadData();
      }
    } catch (err) {
      console.error('Failed to switch tenant:', err);
    }
  };

  // Handle sending a message in Unified Inbox
  const handleSendMessage = async (conversationId: string, body: string, isInternalNote: boolean) => {
    try {
      const res = await fetch(`/api/v1/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, isInternalNote }),
      });
      const data = await res.json();
      if (data.success && data.conversation) {
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? data.conversation : c))
        );
        setSelectedConversation(data.conversation);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Handle creating a new ticket
  const handleCreateTicket = async (ticketData: {
    customerName: string;
    customerId: string;
    subject: string;
    description: string;
    category: string;
    priority: Priority;
  }) => {
    try {
      const res = await fetch('/api/v1/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTickets((prev) => [data.data, ...prev]);
        setMetrics((prev) => ({ ...prev, openTickets: prev.openTickets + 1 }));
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  // Handle resolving a ticket
  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? data.data : t)));
        if (status === 'resolved') {
          setMetrics((prev) => ({
            ...prev,
            openTickets: Math.max(0, prev.openTickets - 1),
          }));
        }
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'inbox':
        return 'Unified Omnichannel Inbox';
      case 'customers':
        return 'Customer 360 Repository';
      case 'tickets':
        return 'Tickets & SLA Helpdesk';
      case 'ai-automations':
      case 'knowledge-base':
        return 'AI Knowledge Base & RAG Engine';
      case 'channels':
        return 'Channels & WhatsApp Cloud API';
      default:
        return 'Control Centre';
    }
  };

  return (
    <div className="w-screen h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex overflow-hidden select-none">
      {/* 1. Geometric Balance Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        unreadCount={12}
        activeTenant={activeTenant}
        onOpenTenantModal={() => setIsTenantModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
        {/* Top Header */}
        <Header
          title={getHeaderTitle()}
          activeTenant={activeTenant}
          onOpenCreateTicket={() => setIsCreateTicketModalOpen(true)}
          resolutionRate={metrics.totalResolutionRate}
        />

        {/* Dynamic Views */}
        <div className="flex-1 flex overflow-hidden">
          {currentView === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              conversations={conversations}
              onSelectConversation={(conv) => {
                setSelectedConversation(conv);
                setCurrentView('inbox');
              }}
            />
          )}

          {currentView === 'inbox' && (
            <UnifiedInboxView
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              onSendMessage={handleSendMessage}
            />
          )}

          {currentView === 'customers' && <Customer360View customers={customers} />}

          {currentView === 'tickets' && (
            <TicketsView
              tickets={tickets}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onOpenCreateTicket={() => setIsCreateTicketModalOpen(true)}
            />
          )}

          {(currentView === 'ai-automations' || currentView === 'knowledge-base') && (
            <KnowledgeBaseView articles={articles} />
          )}

          {currentView === 'channels' && <ChannelsView />}
        </div>
      </main>

      {/* Modals */}
      <TenantModal
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        activeTenantId={activeTenant?.tenantId || 'org_NG_00412'}
        onSwitchTenant={handleSwitchTenant}
      />

      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        customers={customers}
        onCreateTicket={handleCreateTicket}
      />
    </div>
  );
}
