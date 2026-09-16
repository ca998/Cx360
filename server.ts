import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Multi-tenant Enterprise Database
interface TenantData {
  organization: {
    id: string;
    name: string;
    tenantId: string;
    industry: string;
    countryCode: string;
    currency: string;
    timezone: string;
    dbUsageGB: number;
    dbMaxGB: number;
    apiRequests: number;
  };
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    agentStatus: string;
    initials: string;
  };
  customers: Array<{
    id: string;
    customerCode: string;
    fullName: string;
    email: string;
    phone: string;
    accountNumber: string;
    segment: 'vip' | 'standard' | 'enterprise' | 'sme';
    location: string;
    preferredChannel: string;
    tags: string[];
    firstSeenAt: string;
    lastInteractionAt: string;
    totalConversations: number;
    openTicketsCount: number;
  }>;
  conversations: Array<{
    id: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    channel: 'whatsapp' | 'web_chat' | 'voice' | 'email' | 'sms';
    status: 'open' | 'assigned' | 'pending' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignedAgentName: string;
    sentiment: 'positive' | 'neutral' | 'negative' | 'very_negative';
    intent: string;
    subject: string;
    slaBreachRisk: boolean;
    slaRemainingFormatted: string;
    slaRemainingSeconds: number;
    createdAt: string;
    lastMessageAt: string;
    lastMessagePreview: string;
    messages: Array<{
      id: string;
      senderType: 'customer' | 'agent' | 'ai' | 'system';
      senderName: string;
      body: string;
      contentType: 'text' | 'image' | 'document' | 'audio';
      isInternalNote: boolean;
      createdAt: string;
      status: 'sent' | 'delivered' | 'read';
    }>;
  }>;
  tickets: Array<{
    id: string;
    ticketNumber: string;
    customerId: string;
    customerName: string;
    conversationId?: string;
    subject: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'new' | 'open' | 'pending' | 'escalated' | 'resolved' | 'closed';
    assignedAgentName: string;
    slaDueAt: string;
    slaStatusText: string;
    createdAt: string;
    updatedAt: string;
  }>;
  knowledgeBase: Array<{
    id: string;
    title: string;
    category: string;
    content: string;
    tags: string[];
    status: 'published' | 'draft' | 'archived';
    views: number;
    updatedAt: string;
  }>;
}

const tenants: Record<string, TenantData> = {
  'org_NG_00412': {
    organization: {
      id: 'org-zenith-01',
      name: 'Zenith Financial Services',
      tenantId: 'org_NG_00412',
      industry: 'Banking & Fintech',
      countryCode: 'NG',
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      dbUsageGB: 3.4,
      dbMaxGB: 10,
      apiRequests: 842112,
    },
    currentUser: {
      id: 'usr-abiola-01',
      name: 'Abiola Adekunle',
      email: 'a.adekunle@zenithbank.com.ng',
      role: 'Org Admin',
      agentStatus: 'available',
      initials: 'AA',
    },
    customers: [
      {
        id: 'cust-01',
        customerCode: 'CUST-NG-00812',
        fullName: 'Chidi Okoro',
        email: 'chidi.okoro@techpoint.africa',
        phone: '+234 813 942 1049',
        accountNumber: '2084910283',
        segment: 'vip',
        location: 'Victoria Island, Lagos',
        preferredChannel: 'whatsapp',
        tags: ['High Net Worth', 'Corporate Cards', 'USSD User'],
        firstSeenAt: '2025-01-14T09:00:00Z',
        lastInteractionAt: '10 minutes ago',
        totalConversations: 18,
        openTicketsCount: 1,
      },
      {
        id: 'cust-02',
        customerCode: 'CUST-NG-00431',
        fullName: 'Funke Akindele',
        email: 'f.akindele@mail.ng',
        phone: '+234 802 311 9021',
        accountNumber: '1098234190',
        segment: 'standard',
        location: 'Ikeja, Lagos',
        preferredChannel: 'web_chat',
        tags: ['Mobile App User', 'Retail Banking'],
        firstSeenAt: '2025-04-10T11:20:00Z',
        lastInteractionAt: '35 minutes ago',
        totalConversations: 5,
        openTicketsCount: 1,
      },
      {
        id: 'cust-03',
        customerCode: 'CUST-NG-00994',
        fullName: 'Musa Ibrahim',
        email: 'musa.ibrahim@kanoagric.ng',
        phone: '+234 905 442 8192',
        accountNumber: '5039281920',
        segment: 'enterprise',
        location: 'Nassarawa, Kano',
        preferredChannel: 'voice',
        tags: ['Agri-Business', 'Forex Desk', 'SME Tier 3'],
        firstSeenAt: '2024-11-02T14:40:00Z',
        lastInteractionAt: '1 hour ago',
        totalConversations: 24,
        openTicketsCount: 0,
      },
      {
        id: 'cust-04',
        customerCode: 'CUST-NG-01052',
        fullName: 'Ngozi Eze',
        email: 'ngozi.eze@enuguent.com',
        phone: '+234 817 992 4810',
        accountNumber: '3029184712',
        segment: 'standard',
        location: 'Independence Layout, Enugu',
        preferredChannel: 'email',
        tags: ['POS Merchant', 'Dispute Pending'],
        firstSeenAt: '2025-08-19T08:15:00Z',
        lastInteractionAt: '2 hours ago',
        totalConversations: 7,
        openTicketsCount: 1,
      },
    ],
    conversations: [
      {
        id: 'conv-01',
        customerId: 'cust-01',
        customerName: 'Chidi Okoro',
        customerPhone: '+234 813 942 1049',
        customerEmail: 'chidi.okoro@techpoint.africa',
        channel: 'whatsapp',
        status: 'open',
        priority: 'critical',
        assignedAgentName: 'Abiola Adekunle',
        sentiment: 'very_negative',
        intent: 'Failed Transaction',
        subject: 'NIBSS Instant Payment (NIP) Debit without credit ₦450,000',
        slaBreachRisk: true,
        slaRemainingFormatted: '08:42 BREACH RISK',
        slaRemainingSeconds: 522,
        createdAt: '2026-09-03T07:15:00Z',
        lastMessageAt: '8 mins ago',
        lastMessagePreview: 'I tried sending ₦450,000 to my vendor via Zenith Mobile app and got debited immediately, but his GTBank account is not credited. Please reverse immediately!',
        messages: [
          {
            id: 'msg-01',
            senderType: 'customer',
            senderName: 'Chidi Okoro',
            body: 'Good morning. I have an urgent issue with my mobile transfer.',
            contentType: 'text',
            isInternalNote: false,
            createdAt: '07:15 AM',
            status: 'read',
          },
          {
            id: 'msg-02',
            senderType: 'ai',
            senderName: 'CX360 AI Virtual Banker',
            body: 'Hello Mr. Chidi! I can help you with transaction queries right away. Please share the transaction reference or amount and beneficiary bank.',
            contentType: 'text',
            isInternalNote: false,
            createdAt: '07:15 AM',
            status: 'read',
          },
          {
            id: 'msg-03',
            senderType: 'customer',
            senderName: 'Chidi Okoro',
            body: 'I tried sending ₦450,000 to my vendor via Zenith Mobile app and got debited immediately, but his GTBank account is not credited. Please reverse immediately! Session ID: 99920126090307123910.',
            contentType: 'text',
            isInternalNote: false,
            createdAt: '07:18 AM',
            status: 'read',
          },
          {
            id: 'msg-04',
            senderType: 'agent',
            senderName: 'Abiola Adekunle',
            body: 'Checking NIBSS clearing logs for Session ID 99920126090307123910. One moment please.',
            contentType: 'text',
            isInternalNote: true,
            createdAt: '07:20 AM',
            status: 'delivered',
          },
        ],
      },
      {
        id: 'conv-02',
        customerId: 'cust-02',
        customerName: 'Funke Akindele',
        customerPhone: '+234 802 311 9021',
        customerEmail: 'f.akindele@mail.ng',
        channel: 'web_chat',
        status: 'assigned',
        priority: 'medium',
        assignedAgentName: 'Kemi Martins',
        sentiment: 'neutral',
        intent: 'App Login Issue',
        subject: 'Biometric face ID registration error on iOS 18',
        slaBreachRisk: false,
        slaRemainingFormatted: '42:15 Remaining',
        slaRemainingSeconds: 2535,
        createdAt: '2026-09-03T06:50:00Z',
        lastMessageAt: '25 mins ago',
        lastMessagePreview: 'App keeps saying "Device token mismatch" after updating my iPhone last night.',
        messages: [
          {
            id: 'msg-05',
            senderType: 'customer',
            senderName: 'Funke Akindele',
            body: 'Hi support team, my mobile app is refusing my face recognition.',
            contentType: 'text',
            isInternalNote: false,
            createdAt: '06:50 AM',
            status: 'read',
          },
          {
            id: 'msg-06',
            senderType: 'ai',
            senderName: 'CX360 AI Assistant',
            body: 'Hello Funke, this is commonly resolved by resetting the hardware token in Settings > Security > Re-enroll Biometrics. Would you like me to walk you through it?',
            contentType: 'text',
            isInternalNote: false,
            createdAt: '06:51 AM',
            status: 'read',
          },
        ],
      },
      {
        id: 'conv-03',
        customerId: 'cust-03',
        customerName: 'Musa Ibrahim',
        customerPhone: '+234 905 442 8192',
        customerEmail: 'musa.ibrahim@kanoagric.ng',
        channel: 'voice',
        status: 'open',
        priority: 'high',
        assignedAgentName: 'Tunde Yusuf',
        sentiment: 'positive',
        intent: 'Corporate Upgrade',
        subject: 'Commercial Letter of Credit documentation & FX rate enquiry',
        slaBreachRisk: false,
        slaRemainingFormatted: '12:05 Remaining',
        slaRemainingSeconds: 725,
        createdAt: '2026-09-03T07:05:00Z',
        lastMessageAt: '12 mins ago',
        lastMessagePreview: 'Call recording completed (04:18 mins). Customer requested Form M validation checklist.',
        messages: [
          {
            id: 'msg-07',
            senderType: 'system',
            senderName: 'Voice IVR PBX',
            body: 'Inbound Call received from +234 905 442 8192 routed to Commercial Desk queue.',
            contentType: 'text',
            isInternalNote: true,
            createdAt: '07:05 AM',
            status: 'read',
          },
          {
            id: 'msg-08',
            senderType: 'agent',
            senderName: 'Tunde Yusuf',
            body: 'Spoke with Alhaji Musa. Form M checklist dispatched via automated WhatsApp channel to his registered phone.',
            contentType: 'text',
            isInternalNote: true,
            createdAt: '07:10 AM',
            status: 'read',
          },
        ],
      },
      {
        id: 'conv-04',
        customerId: 'cust-04',
        customerName: 'Ngozi Eze',
        customerPhone: '+234 817 992 4810',
        customerEmail: 'ngozi.eze@enuguent.com',
        channel: 'email',
        status: 'pending',
        priority: 'medium',
        assignedAgentName: 'John Obi',
        sentiment: 'negative',
        intent: 'POS Settlement',
        subject: 'End-of-day POS settlement delay for Enugu Supermarket terminal',
        slaBreachRisk: false,
        slaRemainingFormatted: '58:00 Remaining',
        slaRemainingSeconds: 3480,
        createdAt: '2026-09-03T06:10:00Z',
        lastMessageAt: '1 hour ago',
        lastMessagePreview: 'Our terminal TID: 20384192 batch 0041 did not drop into our merchant account at 04:00 AM.',
        messages: [
          {
            id: 'msg-09',
            senderType: 'customer',
            senderName: 'Ngozi Eze',
            body: 'Please investigate POS batch 0041 for terminal 20384192. Total value ₦1,240,000.',
            contentType: 'text',
            isInternalNote: false,
            createdAt: '06:10 AM',
            status: 'read',
          },
        ],
      },
    ],
    tickets: [
      {
        id: 'tck-01',
        ticketNumber: 'TCK-2026-00412',
        customerId: 'cust-01',
        customerName: 'Chidi Okoro',
        conversationId: 'conv-01',
        subject: 'NIP Inward/Outward transfer debit reversal ₦450,000',
        description: 'Customer debited at 07:12 AM without beneficiary credit. Session ID: 99920126090307123910.',
        category: 'Failed Transaction',
        priority: 'critical',
        status: 'open',
        assignedAgentName: 'Abiola Adekunle',
        slaDueAt: '07:45 AM (15m SLA)',
        slaStatusText: '08:42 BREACH RISK',
        createdAt: '2026-09-03T07:15:00Z',
        updatedAt: '2026-09-03T07:20:00Z',
      },
      {
        id: 'tck-02',
        ticketNumber: 'TCK-2026-00388',
        customerId: 'cust-02',
        customerName: 'Funke Akindele',
        conversationId: 'conv-02',
        subject: 'Biometric token mismatch error on iOS',
        description: 'Customer unable to complete biometric authentication after iOS 18 update.',
        category: 'Technical Issue',
        priority: 'medium',
        status: 'pending',
        assignedAgentName: 'Kemi Martins',
        slaDueAt: '09:00 AM (2h SLA)',
        slaStatusText: '42:15 Remaining',
        createdAt: '2026-09-03T06:50:00Z',
        updatedAt: '2026-09-03T07:00:00Z',
      },
      {
        id: 'tck-03',
        ticketNumber: 'TCK-2026-00350',
        customerId: 'cust-04',
        customerName: 'Ngozi Eze',
        conversationId: 'conv-04',
        subject: 'POS Batch settlement reconciliation ₦1,240,000',
        description: 'Terminal TID 20384192 reconciliation with Interswitch switch logs.',
        category: 'POS & Merchant Dispute',
        priority: 'high',
        status: 'open',
        assignedAgentName: 'John Obi',
        slaDueAt: '08:30 AM (1h SLA)',
        slaStatusText: '58:00 Remaining',
        createdAt: '2026-09-03T06:10:00Z',
        updatedAt: '2026-09-03T06:45:00Z',
      },
    ],
    knowledgeBase: [
      {
        id: 'kb-01',
        title: 'CBN Guidelines on NIP Electronic Funds Transfer Reversals',
        category: 'Payment Policies',
        content: 'Under Central Bank of Nigeria (CBN) regulations circular BPS/DIR/CIR/GEN/05/012, failed instant transfers where the sending bank debited but receiving bank did not credit must be reconciled automatically within 24 hours. For VIP priority accounts, initiate manual recall via NIBSS NIP Dispute Resolution System (NDRS).',
        tags: ['CBN', 'NIP', 'Reversal', 'NIBSS', 'Dispute'],
        status: 'published',
        views: 3410,
        updatedAt: '2026-08-15',
      },
      {
        id: 'kb-02',
        title: 'Resolving Biometric & iOS Device Token Mismatch',
        category: 'Digital Banking',
        content: 'When an iOS or Android user encounters "Device Token Mismatch" after OS updates, the agent should instruct the customer to access Security Settings > Unlink Device Token. If locked, trigger the SMS OTP reset workflow to verify BVN and release security lock.',
        tags: ['Mobile App', 'iOS', 'Biometrics', 'Token Reset'],
        status: 'published',
        views: 1892,
        updatedAt: '2026-08-28',
      },
      {
        id: 'kb-03',
        title: 'Commercial Foreign Exchange (FX) Form M Documentation',
        category: 'Trade & Corporate',
        content: 'Customers applying for FX import validation require: Proforma Invoice, Regulatory Certificate (NAFDAC/SONCAP), Tax Clearance Certificate (TCC), and Certificate of Incorporation. Submissions go through the Trade Monitoring System (TRMS).',
        tags: ['FX', 'Form M', 'Trade', 'CBN'],
        status: 'published',
        views: 940,
        updatedAt: '2026-09-01',
      },
    ],
  },
  'org_NG_00881': {
    organization: {
      id: 'org-pay-02',
      name: 'PaySwitch Africa Technologies',
      tenantId: 'org_NG_00881',
      industry: 'Payment Gateway & Fintech',
      countryCode: 'NG',
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      dbUsageGB: 5.1,
      dbMaxGB: 15,
      apiRequests: 1420800,
    },
    currentUser: {
      id: 'usr-segun-02',
      name: 'Olusegun Balogun',
      email: 'o.balogun@payswitch.io',
      role: 'Contact Centre Manager',
      agentStatus: 'available',
      initials: 'OB',
    },
    customers: [
      {
        id: 'cust-ps-01',
        customerCode: 'CUST-NG-07412',
        fullName: 'Folake Solanke',
        email: 'folake@boutique.ng',
        phone: '+234 803 555 1290',
        accountNumber: 'SUB_ACC_99410',
        segment: 'enterprise',
        location: 'Lekki Phase 1, Lagos',
        preferredChannel: 'whatsapp',
        tags: ['E-Commerce Merchant', 'Paystack Connect'],
        firstSeenAt: '2025-02-11T10:00:00Z',
        lastInteractionAt: '15 minutes ago',
        totalConversations: 12,
        openTicketsCount: 1,
      },
    ],
    conversations: [
      {
        id: 'conv-ps-01',
        customerId: 'cust-ps-01',
        customerName: 'Folake Solanke',
        customerPhone: '+234 803 555 1290',
        customerEmail: 'folake@boutique.ng',
        channel: 'whatsapp',
        status: 'open',
        priority: 'high',
        assignedAgentName: 'Olusegun Balogun',
        sentiment: 'negative',
        intent: 'Webhook Delivery Failure',
        subject: 'Production API webhook failing with 504 timeout',
        slaBreachRisk: true,
        slaRemainingFormatted: '14:20 BREACH RISK',
        slaRemainingSeconds: 860,
        createdAt: '2026-09-03T07:25:00Z',
        lastMessageAt: '5 mins ago',
        lastMessagePreview: 'Our store webhook endpoint is returning 504 gateway timeout for card checkout callbacks.',
        messages: [
          {
            id: 'msg-ps-01',
            senderType: 'customer',
            senderName: 'Folake Solanke',
            body: 'Urgent: checkout callbacks are failing on our web store since 07:00 AM.',
            contentType: 'text',
            isInternalNote: false,
            createdAt: '07:25 AM',
            status: 'read',
          },
        ],
      },
    ],
    tickets: [
      {
        id: 'tck-ps-01',
        ticketNumber: 'TCK-2026-00991',
        customerId: 'cust-ps-01',
        customerName: 'Folake Solanke',
        conversationId: 'conv-ps-01',
        subject: 'Merchant webhook timeout investigation (HTTP 504)',
        description: 'Customer experiencing delayed callbacks for card transactions on endpoint https://api.boutique.ng/webhooks/paystack.',
        category: 'API & Integrations',
        priority: 'high',
        status: 'open',
        assignedAgentName: 'Olusegun Balogun',
        slaDueAt: '08:00 AM',
        slaStatusText: '14:20 BREACH RISK',
        createdAt: '2026-09-03T07:25:00Z',
        updatedAt: '2026-09-03T07:28:00Z',
      },
    ],
    knowledgeBase: [
      {
        id: 'kb-ps-01',
        title: 'Webhook Signature Verification and Retry Policy',
        category: 'Developer Docs',
        content: 'PaySwitch signs all event payloads with HMAC SHA512 using your secret key. If your server returns any status outside 200 OK, the event is re-attempted with exponential backoff for up to 72 hours.',
        tags: ['Webhooks', 'HMAC', 'API', 'Retries'],
        status: 'published',
        views: 4510,
        updatedAt: '2026-08-30',
      },
    ],
  },
};

let currentActiveTenantId = 'org_NG_00412';

// Helper to get active tenant data
function getTenant(tenantId?: string): TenantData {
  const tid = tenantId || currentActiveTenantId;
  if (!tenants[tid]) {
    return tenants['org_NG_00412'];
  }
  return tenants[tid];
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'CX360 AI Enterprise Platform',
    region: 'europe-west2 / Lagos Gateway (LOS_01)',
    version: '1.4.0',
    database: {
      status: 'connected',
      activeTenants: Object.keys(tenants).length,
      storageEngine: 'PostgreSQL-Compatible Multi-Tenant DB',
    },
    channels: {
      whatsapp: 'operational (Meta Cloud API v20.0)',
      webChat: 'operational (WSS / HTTP2)',
      voice: 'operational (SIP / Africa’s Talking PBX)',
      email: 'operational (IMAP / SES)',
      sms: 'operational (DND Routing Active)',
    },
  });
});

// 2. Tenants & Organizations
app.get('/api/v1/tenants', (req, res) => {
  const list = Object.values(tenants).map((t) => ({
    id: t.organization.id,
    name: t.organization.name,
    tenantId: t.organization.tenantId,
    industry: t.organization.industry,
    countryCode: t.organization.countryCode,
    currency: t.organization.currency,
  }));
  res.json({ success: true, activeTenantId: currentActiveTenantId, tenants: list });
});

app.post('/api/v1/tenants/switch', (req, res) => {
  const { tenantId } = req.body;
  if (tenantId && tenants[tenantId]) {
    currentActiveTenantId = tenantId;
    return res.json({ success: true, activeTenantId: currentActiveTenantId, organization: tenants[tenantId].organization });
  }
  res.status(400).json({ success: false, error: 'Invalid tenant identifier' });
});

// 3. Current User & Tenant Profile
app.get('/api/v1/auth/me', (req, res) => {
  const tenant = getTenant();
  res.json({
    success: true,
    user: tenant.currentUser,
    organization: tenant.organization,
  });
});

// 4. Dashboard Metrics
app.get('/api/v1/analytics/dashboard', (req, res) => {
  const tenant = getTenant();
  const openTickets = tenant.tickets.filter((t) => t.status === 'open' || t.status === 'new').length;
  const breachesToday = tenant.tickets.filter((t) => t.priority === 'critical' && t.status === 'open').length;

  res.json({
    success: true,
    data: {
      activeConversations: tenant.conversations.filter((c) => c.status !== 'closed').length,
      openTickets: openTickets,
      slaComplianceRate: 92.8,
      avgAiHandoffTime: '4m 12s',
      totalResolutionRate: 98.4,
      dbUsageText: `${tenant.organization.dbUsageGB}GB / ${tenant.organization.dbMaxGB}GB`,
      apiRequestsCount: tenant.organization.apiRequests,
      activeAgentsCount: 21,
      slaBreachesToday: breachesToday,
      aiContainmentRate: 72,
      trendingIntents: [
        { name: 'Payment Issue', percentage: 44 },
        { name: 'App Login', percentage: 18 },
        { name: 'POS Settlement', percentage: 14 },
        { name: 'Card Delivery', percentage: 8 },
      ],
      channelsActive: true,
    },
  });
});

// 5. Conversations & Unified Inbox
app.get('/api/v1/conversations', (req, res) => {
  const tenant = getTenant();
  const { channel, priority } = req.query;

  let filtered = tenant.conversations;
  if (channel && channel !== 'all') {
    filtered = filtered.filter((c) => c.channel === channel);
  }
  if (priority && priority !== 'all') {
    filtered = filtered.filter((c) => c.priority === priority);
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

app.get('/api/v1/conversations/:id', (req, res) => {
  const tenant = getTenant();
  const conv = tenant.conversations.find((c) => c.id === req.params.id);
  if (!conv) {
    return res.status(404).json({ success: false, error: 'Conversation not found' });
  }
  res.json({ success: true, data: conv });
});

app.post('/api/v1/conversations/:id/messages', (req, res) => {
  const tenant = getTenant();
  const conv = tenant.conversations.find((c) => c.id === req.params.id);
  if (!conv) {
    return res.status(404).json({ success: false, error: 'Conversation not found' });
  }

  const { body, isInternalNote = false } = req.body;
  if (!body) {
    return res.status(400).json({ success: false, error: 'Message body cannot be empty' });
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    senderType: isInternalNote ? ('agent' as const) : ('agent' as const),
    senderName: tenant.currentUser.name,
    body,
    contentType: 'text' as const,
    isInternalNote,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'sent' as const,
  };

  conv.messages.push(newMsg);
  conv.lastMessageAt = 'Just now';
  conv.lastMessagePreview = body;

  res.json({ success: true, data: newMsg, conversation: conv });
});

// 6. Tickets
app.get('/api/v1/tickets', (req, res) => {
  const tenant = getTenant();
  res.json({ success: true, count: tenant.tickets.length, data: tenant.tickets });
});

app.post('/api/v1/tickets', (req, res) => {
  const tenant = getTenant();
  const { customerName, customerId, subject, description, category, priority } = req.body;

  if (!subject || !customerName) {
    return res.status(400).json({ success: false, error: 'Subject and Customer Name are required' });
  }

  const ticketNumber = `TCK-2026-00${Math.floor(100 + Math.random() * 900)}`;
  const newTicket = {
    id: `tck-${Date.now()}`,
    ticketNumber,
    customerId: customerId || 'cust-01',
    customerName,
    subject,
    description: description || subject,
    category: category || 'General Support',
    priority: priority || 'medium',
    status: 'open' as const,
    assignedAgentName: tenant.currentUser.name,
    slaDueAt: priority === 'critical' ? '15m SLA' : '2h SLA',
    slaStatusText: priority === 'critical' ? '14:50 Remaining' : '01:59 Remaining',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tenant.tickets.unshift(newTicket);
  res.json({ success: true, data: newTicket });
});

app.patch('/api/v1/tickets/:id', (req, res) => {
  const tenant = getTenant();
  const ticket = tenant.tickets.find((t) => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }

  const { status, priority, resolutionSummary } = req.body;
  if (status) ticket.status = status;
  if (priority) ticket.priority = priority;
  ticket.updatedAt = new Date().toISOString();

  res.json({ success: true, data: ticket });
});

// 7. Customer 360
app.get('/api/v1/customers', (req, res) => {
  const tenant = getTenant();
  res.json({ success: true, data: tenant.customers });
});

app.get('/api/v1/customers/:id/360', (req, res) => {
  const tenant = getTenant();
  const customer = tenant.customers.find((c) => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ success: false, error: 'Customer not found' });
  }

  const customerConversations = tenant.conversations.filter((c) => c.customerId === customer.id);
  const customerTickets = tenant.tickets.filter((t) => t.customerId === customer.id);

  res.json({
    success: true,
    customer,
    conversations: customerConversations,
    tickets: customerTickets,
  });
});

// 8. Knowledge Base
app.get('/api/v1/kb/articles', (req, res) => {
  const tenant = getTenant();
  const { query } = req.query;
  let articles = tenant.knowledgeBase;
  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    articles = articles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  res.json({ success: true, data: articles });
});

// 9. AI Copilot (Powered by Gemini API with contextual fallback)
app.post('/api/v1/ai/copilot/suggest', async (req, res) => {
  const tenant = getTenant();
  const { conversationId, lastCustomerMessage, intent } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are CX360 AI, an enterprise contact centre copilot for Nigerian financial & corporate institutions.
Company context: ${tenant.organization.name} (${tenant.organization.industry}).
Customer intent: ${intent || 'Customer Inquiry'}.
Last message from customer: "${lastCustomerMessage}".
Write a polite, professional, and empathetic 2-3 sentence response that a human agent can send to the customer on WhatsApp/LiveChat. If it's a failed transfer, acknowledge the NIBSS Session ID / reversal timeframe (within 24 hours per CBN guidelines). Do NOT fabricate transaction reference numbers.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        return res.json({
          success: true,
          suggestedReply: response.text.trim(),
          source: 'gemini-2.5-flash',
        });
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, using heuristic engine:', err?.message);
    }
  }

  // Smart heuristic fallback
  let fallbackReply = `Hello! Thank you for reaching out to ${tenant.organization.name}. We have logged your request and our team is actively reviewing your account details.`;
  if (intent?.toLowerCase().includes('failed') || lastCustomerMessage?.toLowerCase().includes('transfer') || lastCustomerMessage?.toLowerCase().includes('debit')) {
    fallbackReply = `Good day. We sincerely apologize for the inconvenience caused by this transaction delay. Under CBN guidelines, NIP interbank reconciliation is actively underway. We have flagged your transaction for automated reversal, and funds will reflect in the beneficiary account or revert to you within 24 hours.`;
  } else if (intent?.toLowerCase().includes('login') || lastCustomerMessage?.toLowerCase().includes('app')) {
    fallbackReply = `Hello! To resolve your device token login issue, please go to Settings > Security > Re-enroll Biometrics, or ensure your mobile app is updated to the latest version on Google Play or iOS App Store.`;
  }

  res.json({
    success: true,
    suggestedReply: fallbackReply,
    source: 'cx360-rule-engine',
  });
});

app.post('/api/v1/ai/copilot/improve', async (req, res) => {
  const { text, tone = 'professional' } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: 'Text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Rewrite the following customer service reply to be more ${tone} (e.g. professional, empathetic, concise, or persuasive) for a Nigerian enterprise customer:
"${text}"
Return ONLY the rewritten response text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        return res.json({ success: true, improvedText: response.text.trim() });
      }
    } catch (err) {
      console.warn('Gemini improve text fallback:', err);
    }
  }

  let improved = text;
  if (tone === 'empathetic') {
    improved = `We completely understand how concerning this situation is, and we appreciate your patience. ${text} Rest assured our priority team is resolving this immediately.`;
  } else if (tone === 'shorter') {
    improved = text.slice(0, 120) + '...';
  } else {
    improved = `Dear Esteemed Customer, ${text} Thank you for your continued partnership.`;
  }

  res.json({ success: true, improvedText: improved });
});

// Broadcast approval endpoint
app.post('/api/v1/ai/insights/broadcast', (req, res) => {
  res.json({
    success: true,
    message: 'Broadcast notification queued successfully for 1,840 active customers via WhatsApp & SMS gateway (Lagos Mainland range).',
    sentAt: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE / STATIC ASSETS
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CX360 AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
