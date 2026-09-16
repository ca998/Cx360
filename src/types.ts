export type UserRole =
  | 'super_admin'
  | 'org_admin'
  | 'manager'
  | 'team_leader'
  | 'agent'
  | 'qa_officer'
  | 'analyst'
  | 'billing_admin'
  | 'customer';

export type AgentStatus = 'available' | 'busy' | 'away' | 'offline' | 'on_break';

export type ChannelType = 'whatsapp' | 'web_chat' | 'email' | 'voice' | 'sms' | 'facebook' | 'instagram';

export type ConversationStatus = 'open' | 'assigned' | 'pending' | 'resolved' | 'closed';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type Sentiment = 'positive' | 'neutral' | 'negative' | 'very_negative';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string;
  companySize: string;
  countryCode: string;
  currency: string;
  timezone: string;
  status: 'active' | 'suspended' | 'trial';
  tenantId: string;
  dbUsageGB: number;
  dbMaxGB: number;
  monthlyApiRequests: number;
}

export interface User {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  agentStatus: AgentStatus;
  avatarInitials: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  customerCode: string;
  fullName: string;
  email: string;
  phone: string;
  accountNumber?: string;
  segment: 'vip' | 'standard' | 'enterprise' | 'sme';
  location: string;
  preferredChannel: ChannelType;
  tags: string[];
  firstSeenAt: string;
  lastInteractionAt: string;
  totalConversations: number;
  openTicketsCount: number;
}

export interface Message {
  id: string;
  organizationId: string;
  conversationId: string;
  senderType: 'customer' | 'agent' | 'ai' | 'system';
  senderName: string;
  body: string;
  contentType: 'text' | 'image' | 'document' | 'audio';
  isInternalNote: boolean;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  channel: ChannelType;
  status: ConversationStatus;
  priority: Priority;
  assignedAgentId?: string;
  assignedAgentName?: string;
  sentiment: Sentiment;
  intent: string;
  subject: string;
  slaBreachRisk: boolean;
  slaRemainingFormatted: string;
  slaRemainingSeconds: number;
  createdAt: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  messages: Message[];
}

export interface Ticket {
  id: string;
  organizationId: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  conversationId?: string;
  subject: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: Priority;
  status: 'new' | 'open' | 'pending' | 'escalated' | 'resolved' | 'closed';
  assignedAgentName?: string;
  slaDueAt: string;
  slaStatusText: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArticle {
  id: string;
  organizationId: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  views: number;
  updatedAt: string;
}

export interface SystemMetrics {
  activeConversations: number;
  openTickets: number;
  slaComplianceRate: number;
  avgAiHandoffTime: string;
  totalResolutionRate: number;
  dbUsageText: string;
  apiRequestsCount: number;
  activeAgentsCount: number;
  slaBreachesToday: number;
  aiContainmentRate: number;
  trendingIntents: { name: string; percentage: number }[];
  channelsActive: boolean;
}
