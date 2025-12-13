import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useRouteLoaderData } from '@remix-run/react';
import type { loader as rootLoader } from '~/root';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Globe, 
  Activity, 
  LayoutDashboard, 
  Link as LinkIcon,
  Settings,
  Trash2,
  Copy,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Eye,
  Download,
  Send,
  Zap
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Client {
  id: string;
  name: string;
  email: string;
  subdomain: string;
  status: 'connected' | 'not-connected' | 'schema-changed' | 'error';
  statusMessage?: string;
  lastConnected?: string;
  dashboardCount: number;
  activeDashboards: number;
  magicLinkCount: number;
  industry?: string;
  notes?: string;
  connectionType?: string;
  webhookUrl?: string;
  totalRecords?: number;
  createdAt?: string;
}

interface MagicLink {
  id: string;
  label?: string;
  url: string;
  created: string;
  expires: string | null;
  lastUsed?: string;
  usageCount: number;
  isRevoked?: boolean;
}

interface ConnectionDetails {
  type: string;
  webhookUrl: string;
  status: 'active' | 'inactive' | 'error';
  lastDataReceived: string;
  totalRecords: number;
  createdAt: string;
  schema: {
    version: string;
    fields: Array<{
      name: string;
      type: string;
      description?: string;
    }>;
    lastUpdated: string;
  };
  health: {
    webhooksReceived24h: number;
    successRate: number;
    failedCount: number;
  };
}

// ==========================================
// MOCK DATA
// ==========================================



const mockMagicLinks: Record<string, MagicLink[]> = {
  '1': [
    {
      id: 'ml1',
      url: 'https://abc-dental.getflowetic.com/access/xyz789abc',
      created: 'Dec 10, 2025 at 2:00 PM',
      expires: 'Jan 10, 2026',
      lastUsed: '2 hours ago',
      usageCount: 47,
    },
    {
      id: 'ml2',
      label: 'For CEO Review',
      url: 'https://abc-dental.getflowetic.com/access/ceo-review-456',
      created: 'Dec 5, 2025',
      expires: null,
      lastUsed: '3 days ago',
      usageCount: 5,
    },
  ],
  '3': [
    {
      id: 'ml3',
      label: 'Partner Portal',
      url: 'https://legal123.getflowetic.com/access/partner-portal-123',
      created: 'Dec 1, 2025',
      expires: 'Mar 1, 2026',
      lastUsed: '1 day ago',
      usageCount: 89,
    },
  ],
};

const mockConnectionDetails: Record<string, ConnectionDetails> = {
  '1': {
    type: 'Vapi Webhook',
    webhookUrl: 'https://getflowetic.com/webhooks/abc-dental-xyz123',
    status: 'active',
    lastDataReceived: '2 minutes ago',
    totalRecords: 1247,
    createdAt: 'Dec 3, 2025',
    schema: {
      version: '1.0',
      fields: [
        { name: 'call_id', type: 'string' },
        { name: 'duration', type: 'number', description: 'seconds' },
        { name: 'status', type: 'string' },
        { name: 'transcript', type: 'string' },
        { name: 'cost', type: 'number', description: 'USD' },
        { name: 'timestamp', type: 'datetime' },
        { name: 'caller_phone', type: 'string' },
      ],
      lastUpdated: '2 minutes ago',
    },
    health: {
      webhooksReceived24h: 156,
      successRate: 99.4,
      failedCount: 1,
    },
  },
  '3': {
    type: 'Retell Webhook',
    webhookUrl: 'https://getflowetic.com/webhooks/legal123-abc456',
    status: 'active',
    lastDataReceived: '5 hours ago',
    totalRecords: 892,
    createdAt: 'Nov 28, 2025',
    schema: {
      version: '1.0',
      fields: [
        { name: 'call_id', type: 'string' },
        { name: 'duration', type: 'number', description: 'seconds' },
        { name: 'status', type: 'string' },
        { name: 'recording_url', type: 'string' },
        { name: 'timestamp', type: 'datetime' },
      ],
      lastUpdated: '5 hours ago',
    },
    health: {
      webhooksReceived24h: 94,
      successRate: 98.9,
      failedCount: 1,
    },
  },
};

// ==========================================
// STATUS BADGE COMPONENT
// ==========================================

const StatusBadge = ({ status, message }: { status: Client['status']; message?: string }) => {
  const configs = {
    connected: {
      icon: '🟢',
      text: 'Connected',
      bg: 'bg-green-500/10',
      text_color: 'text-green-600 dark:text-green-400',
      border: 'border-green-500/20',
    },
    'not-connected': {
      icon: '⚠️',
      text: 'Not Connected',
      bg: 'bg-yellow-500/10',
      text_color: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-500/20',
    },
    'schema-changed': {
      icon: '⚠️',
      text: 'Schema Changed',
      bg: 'bg-orange-500/10',
      text_color: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/20',
    },
    error: {
      icon: '🔴',
      text: 'Error',
      bg: 'bg-red-500/10',
      text_color: 'text-red-600 dark:text-red-400',
      border: 'border-red-500/20',
    },
  };

  const config = configs[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg} ${config.text_color} border ${config.border} text-sm font-medium`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
      {message && <span className="opacity-70">({message})</span>}
    </div>
  );
};

// ==========================================
// ADD NEW CLIENT MODAL
// ==========================================

const AddNewClientModal = ({ 
  isOpen, 
  onClose, 
  convexUser, 
  createClient 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  convexUser: any;
  createClient: any;
}) => {
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [industry, setIndustry] = useState('');
  const [notes, setNotes] = useState('');
  const [connectDataSource, setConnectDataSource] = useState(true);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  const handleSubdomainChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(sanitized);
    // Simulate availability check
    setSubdomainAvailable(sanitized.length > 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!convexUser) {
    console.error('User not synced to Convex yet');
    return;
  }

  try {
    const formData = new FormData(e.target as HTMLFormElement);
    const clientData = {
      userId: convexUser._id,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subdomain: formData.get('subdomain') as string,
      industry: formData.get('industry') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };

    await createClient(clientData);
    console.log('✅ Client created successfully');
    onClose();
  } catch (error) {
    console.error('❌ Failed to create client:', error);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-bolt-elements-background-depth-2 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white dark:bg-bolt-elements-background-depth-2 border-b border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
            Add New Client
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-3 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-2">
              Client Name *
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="ABC Dental"
              className="w-full px-4 py-2.5 bg-white dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@abcdental.com"
              className="w-full px-4 py-2.5 bg-white dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-2">
              Subdomain *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={subdomain}
                onChange={(e) => handleSubdomainChange(e.target.value)}
                placeholder="abc-dental"
                className="flex-1 px-4 py-2.5 bg-white dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark"
              />
              <span className="text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                .getflowetic.com
              </span>
            </div>
            {subdomainAvailable !== null && (
              <p className={`text-sm mt-2 flex items-center gap-1 ${subdomainAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {subdomainAvailable ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Available
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" /> Not available
                  </>
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-2">
              Industry (optional)
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark"
            >
              <option value="">Select industry</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Legal">Legal</option>
              <option value="Finance">Finance</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dental practice with 3 locations..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="connectDataSource"
              checked={connectDataSource}
              onChange={(e) => setConnectDataSource(e.target.checked)}
              className="w-4 h-4 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="connectDataSource" className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
              Connect data source after creating
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark rounded-lg hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-4 transition-colors border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
            >
              Create Client
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// GENERATE MAGIC LINK MODAL
// ==========================================

const GenerateMagicLinkModal = ({ 
  isOpen, 
  onClose, 
  clientName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  clientName: string;
}) => {
  const [expiration, setExpiration] = useState('30days');
  const [label, setLabel] = useState('');
  const [sendEmail, setSendEmail] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Generating magic link:', { expiration, label, sendEmail });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-bolt-elements-background-depth-2 rounded-2xl shadow-2xl w-full max-w-md mx-4"
      >
        <div className="bg-white dark:bg-bolt-elements-background-depth-2 border-b border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
            Generate Magic Link
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-3 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          <div className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark mb-4">
            Creating magic link for <span className="font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">{clientName}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-3">
              Expiration
            </label>
            <div className="space-y-2">
              {[
                { value: '24h', label: '24 hours' },
                { value: '7days', label: '7 days' },
                { value: '30days', label: '30 days (default)' },
                { value: 'never', label: 'Never expires' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="expiration"
                    value={option.value}
                    checked={expiration === option.value}
                    onChange={(e) => setExpiration(e.target.value)}
                    className="w-4 h-4 text-purple-500"
                  />
                  <span className="text-sm text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-2">
              Label (optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g., "For CEO review", "Team demo"'
              className="w-full px-4 py-2.5 bg-white dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="sendEmail"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-4 h-4 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="sendEmail" className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
              Email link to client
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark rounded-lg hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-4 transition-colors border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
            >
              Generate Link
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// MAGIC LINK MANAGEMENT MODAL
// ==========================================

const MagicLinkManagementModal = ({ 
  isOpen, 
  onClose, 
  client 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  client: Client;
}) => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const links = mockMagicLinks[client.id] || [];

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    console.log('Copied:', url);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-bolt-elements-background-depth-2 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="bg-white dark:bg-bolt-elements-background-depth-2 border-b border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
              Magic Links - {client.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-3 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-4">
                Active Links
              </h3>
              
              {links.length === 0 ? (
                <div className="text-center py-12 bg-bolt-elements-background-depth-1 dark:bg-bolt-elements-background-depth-3 rounded-xl border border-dashed border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
                  <LinkIcon className="w-12 h-12 mx-auto text-bolt-elements-textTertiary dark:text-bolt-elements-textTertiary-dark mb-3" />
                  <p className="text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                    No magic links created yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {links.map((link) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-bolt-elements-background-depth-1 dark:bg-bolt-elements-background-depth-3 rounded-xl p-5 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                            {link.label || `Link #${link.id}`}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Created: {link.created}
                            </span>
                            <span>
                              Expires: {link.expires || 'Never'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                            <span>Last used: {link.lastUsed || 'Never'}</span>
                            <span>Usage: {link.usageCount} times</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-bolt-elements-background-depth-2 rounded-lg p-3 mb-3 font-mono text-sm break-all text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
                        {link.url}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(link.url)}
                          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark rounded-lg hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-4 transition-colors text-sm border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark rounded-lg hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-4 transition-colors text-sm border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
                          <RefreshCw className="w-4 h-4" />
                          Regenerate
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm border border-red-500/20">
                          <X className="w-4 h-4" />
                          Revoke
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowGenerateModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Generate New Magic Link
            </button>
          </div>
        </motion.div>
      </div>

      <GenerateMagicLinkModal 
        isOpen={showGenerateModal} 
        onClose={() => setShowGenerateModal(false)}
        clientName={client.name}
      />
    </>
  );
};

// ==========================================
// CONNECTION DETAILS MODAL
// ==========================================

const ConnectionDetailsModal = ({ 
  isOpen, 
  onClose, 
  client 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  client: Client;
}) => {
  const connectionDetails = mockConnectionDetails[client.id];

  const handleCopyUrl = () => {
    if (connectionDetails) {
      navigator.clipboard.writeText(connectionDetails.webhookUrl);
      console.log('Copied webhook URL');
    }
  };

  if (!isOpen || !connectionDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-bolt-elements-background-depth-2 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="bg-white dark:bg-bolt-elements-background-depth-2 border-b border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
              Data Connection - {client.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={client.status} message={client.statusMessage} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-3 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Connection Info */}
          <div className="bg-bolt-elements-background-depth-1 dark:bg-bolt-elements-background-depth-3 rounded-xl p-5 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                Connection Type: {connectionDetails.type}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark mb-2 block">
                  Webhook URL
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white dark:bg-bolt-elements-background-depth-2 rounded-lg p-3 font-mono text-sm break-all text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
                    {connectionDetails.webhookUrl}
                  </div>
                  <button
                    onClick={handleCopyUrl}
                    className="px-4 py-2 bg-white dark:bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark rounded-lg hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-4 transition-colors border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <p className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">Last data received</p>
                  <p className="font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                    {connectionDetails.lastDataReceived}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">Total records</p>
                  <p className="font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                    {connectionDetails.totalRecords.toLocaleString()} calls
                  </p>
                </div>
                <div>
                  <p className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">Created</p>
                  <p className="font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                    {connectionDetails.createdAt}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schema */}
          <div>
            <h3 className="font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-3">
              Detected Schema (v{connectionDetails.schema.version})
            </h3>
            <div className="bg-bolt-elements-background-depth-1 dark:bg-bolt-elements-background-depth-3 rounded-xl p-5 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
              <div className="space-y-2">
                {connectionDetails.schema.fields.map((field) => (
                  <div key={field.name} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="font-mono text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                      {field.name}
                    </span>
                    <span className="text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                      ({field.type}{field.description && `, ${field.description}`})
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
                <span className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                  Last updated: {connectionDetails.schema.lastUpdated}
                </span>
                <button className="text-sm text-purple-500 hover:text-purple-600 font-medium">
                  View Sample Data
                </button>
                <button className="text-sm text-purple-500 hover:text-purple-600 font-medium">
                  Update Mapping
                </button>
              </div>
            </div>
          </div>

          {/* Connection Health */}
          <div>
            <h3 className="font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-3">
              Connection Health (Last 24 Hours)
            </h3>
            <div className="bg-bolt-elements-background-depth-1 dark:bg-bolt-elements-background-depth-3 rounded-xl p-5 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark mb-1">
                    Webhooks Received
                  </p>
                  <p className="text-2xl font-bold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                    {connectionDetails.health.webhooksReceived24h}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark mb-1">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {connectionDetails.health.successRate}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark mb-1">
                    Failed
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {connectionDetails.health.failedCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark rounded-lg hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-4 transition-colors border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
              <Zap className="w-4 h-4" />
              Send Test Webhook
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark rounded-lg hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-4 transition-colors border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
              <RefreshCw className="w-4 h-4" />
              Regenerate URL
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark rounded-lg hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-4 transition-colors border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
              <Eye className="w-4 h-4" />
              View Logs
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20">
              <X className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN CLIENTS TAB COMPONENT
// ==========================================

export function GitHubTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeModal, setActiveModal] = useState<'magicLinks' | 'connection' | null>(null);

  // ==========================================
  // CONVEX DATA
  // ==========================================
  
  const rootData = useRouteLoaderData<typeof rootLoader>('root');
  const workosUser = rootData?.user;

  const convexUser = useQuery(
    api.users.getByWorkosId,
    workosUser?.id ? { workosId: workosUser.id } : "skip"
  );

  const clientsData = useQuery(
    api.clients.list,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const createClient = useMutation(api.clients.create);
  const updateClient = useMutation(api.clients.update);
  const deleteClient = useMutation(api.clients.remove);

  const clients = useMemo(() => {
    if (!clientsData) return [];
    
    return clientsData.map(client => ({
      id: client._id,
      name: client.name,
      email: client.email,
      subdomain: client.subdomain,
      status: client.status,
      statusMessage: client.statusMessage,
      lastConnected: client.lastConnected,
      dashboardCount: client.dashboardCount,
      activeDashboards: client.activeDashboards,
      magicLinkCount: client.magicLinkCount,
      industry: client.industry,
      notes: client.notes,
      connectionType: client.connectionType,
      webhookUrl: client.webhookUrl,
      totalRecords: client.totalRecords,
      createdAt: client.createdAt,
    }));
  }, [clientsData]);

  const filteredClients = useMemo(() => {
  let filtered = [...clients];

  if (searchQuery) {
    filtered = filtered.filter(
      (client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (filterStatus !== 'all') {
    filtered = filtered.filter((client) => client.status === filterStatus);
  }

  return filtered;
}, [clients, searchQuery, filterStatus]);

  if (clientsData === undefined || convexUser === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
            Loading clients...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark bg-white dark:bg-bolt-elements-background-depth-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                Clients
              </h1>
              <p className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                Manage your client relationships and dashboards
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => setShowAddClientModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-lg shadow-purple-500/25"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            Add New Client
          </motion.button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bolt-elements-textTertiary dark:text-bolt-elements-textTertiary-dark" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark"
          >
            <option value="all">All Status</option>
            <option value="connected">Connected</option>
            <option value="not-connected">Not Connected</option>
            <option value="schema-changed">Schema Changed</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Client Cards */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="bg-white dark:bg-bolt-elements-background-depth-2 rounded-xl border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-2">
                    {client.name}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                      <Globe className="w-4 h-4" />
                      {client.subdomain}.getflowetic.com
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <StatusBadge status={client.status} message={client.statusMessage} />
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboards: <span className="font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">{client.activeDashboards} active</span>
                      </span>
                      <span className="flex items-center gap-1 text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                        <LinkIcon className="w-4 h-4" />
                        Magic Links: <span className="font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">{client.magicLinkCount}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Required (conditional) */}
              {client.status === 'not-connected' && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-2">
                    ⚠️ Action Required:
                  </p>
                  <button className="text-sm text-yellow-800 dark:text-yellow-200 underline font-medium">
                    Connect Data Source
                  </button>
                </div>
              )}

              {client.status === 'schema-changed' && (
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-2">
                    ⚠️ Action Required: Dashboard needs schema update
                  </p>
                  <button className="text-sm text-orange-800 dark:text-orange-200 underline font-medium">
                    Fix Schema
                  </button>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <p className="text-sm font-semibold text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark mb-3">
                  Quick Actions:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setActiveModal('magicLinks');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-bolt-elements-background-depth-1 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark rounded-lg hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-4 transition-colors text-sm border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Manage Magic Links
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-bolt-elements-background-depth-1 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark rounded-lg hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-4 transition-colors text-sm border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
                    <LayoutDashboard className="w-4 h-4" />
                    View Dashboards
                  </button>
                  {client.status === 'connected' && (
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setActiveModal('connection');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-bolt-elements-background-depth-1 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark rounded-lg hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-4 transition-colors text-sm border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark"
                    >
                      <Settings className="w-4 h-4" />
                      Connection Details
                    </button>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2 bg-bolt-elements-background-depth-1 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark rounded-lg hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-4 transition-colors text-sm border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
                    Edit Client
                  </button>
                  <button 
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to delete ${client.name}?`)) return;

                      try {
                        await deleteClient({ clientId: client.id as any });
                        console.log('✅ Client deleted');
                      } catch (error) {
                        console.error('❌ Failed to delete client:', error);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm border border-red-500/20">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredClients.length === 0 && (
            <div className="text-center py-20">
              <Users className="w-16 h-16 mx-auto text-bolt-elements-textTertiary dark:text-bolt-elements-textTertiary-dark mb-4" />
              <h3 className="text-xl font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-2">
                No clients found
              </h3>
              <p className="text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark mb-6">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by adding your first client'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <button
                  onClick={() => setShowAddClientModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Client
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AddNewClientModal 
        isOpen={showAddClientModal} 
        onClose={() => setShowAddClientModal(false)} 
        convexUser={convexUser}
        createClient={createClient}
      />
      
      {selectedClient && (
        <>
          <MagicLinkManagementModal
            isOpen={activeModal === 'magicLinks'}
            onClose={() => {
              setActiveModal(null);
              setSelectedClient(null);
            }}
            client={selectedClient}
          />
          
          <ConnectionDetailsModal
            isOpen={activeModal === 'connection'}
            onClose={() => {
              setActiveModal(null);
              setSelectedClient(null);
            }}
            client={selectedClient}
          />
        </>
      )}
    </div>
  );
}
