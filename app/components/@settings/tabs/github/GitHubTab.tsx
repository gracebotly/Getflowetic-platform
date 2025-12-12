import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Settings,
  Copy,
  BarChart3,
  Rocket,
  Trash2,
  RefreshCw,
  ExternalLink,
  Sparkles,
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Pause,
  Archive,
  ChevronDown,
  Calendar,
  Globe,
} from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Card, CardContent, CardHeader } from '~/components/ui/Card';

// Types
type DashboardStatus = 'deployed' | 'draft' | 'needs-update' | 'error' | 'paused' | 'archived';

interface Dashboard {
  id: string;
  name: string;
  client: string;
  template: string;
  url?: string;
  status: DashboardStatus;
  createdAt: string;
  lastUpdated: string;
  message?: string;
}

// Mock Data
const MOCK_DASHBOARDS: Dashboard[] = [
  {
    id: '1',
    name: 'Voice ROI Analytics Dashboard',
    client: 'ABC Dental',
    template: 'Voice AI Analytics',
    url: 'abc-dental.getflowetic.com',
    status: 'deployed',
    createdAt: 'Dec 8, 2025',
    lastUpdated: '2 hours ago',
  },
  {
    id: '2',
    name: 'Call Outcome Tracker',
    client: 'XYZ Real Estate',
    template: 'Call Analytics',
    status: 'draft',
    createdAt: 'Dec 9, 2025',
    lastUpdated: '1 day ago',
    message: 'Waiting for data connection',
  },
  {
    id: '3',
    name: 'Chatbot Conversion Analytics',
    client: '123 Legal Services',
    template: 'Chatbot Analytics',
    url: 'legal123.getflowetic.com',
    status: 'needs-update',
    createdAt: 'Dec 5, 2025',
    lastUpdated: '3 days ago',
    message: 'Schema changed - fields need remapping',
  },
];

// Status Badge Component
const StatusBadge: React.FC<{ status: DashboardStatus }> = ({ status }) => {
  const config = {
    deployed: { icon: CheckCircle2, label: 'Deployed', color: 'text-emerald-500 bg-emerald-500/10' },
    draft: { icon: FileText, label: 'Draft', color: 'text-amber-500 bg-amber-500/10' },
    'needs-update': { icon: AlertCircle, label: 'Needs Update', color: 'text-orange-500 bg-orange-500/10' },
    error: { icon: XCircle, label: 'Error', color: 'text-red-500 bg-red-500/10' },
    paused: { icon: Pause, label: 'Paused', color: 'text-gray-500 bg-gray-500/10' },
    archived: { icon: Archive, label: 'Archived', color: 'text-slate-500 bg-slate-500/10' },
  };

  const { icon: Icon, label, color } = config[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4" />
      {label}
    </div>
  );
};

// Dashboard Card Component
const DashboardCard: React.FC<{
  dashboard: Dashboard;
  onPreview: () => void;
  onEdit: () => void;
  onSettings: () => void;
  onCopyLink: () => void;
  onAnalytics: () => void;
  onDeploy?: () => void;
  onDelete?: () => void;
  onUpdateSchema?: () => void;
}> = ({ dashboard, onPreview, onEdit, onSettings, onCopyLink, onAnalytics, onDeploy, onDelete, onUpdateSchema }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="relative overflow-hidden border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark hover:border-purple-500/50 dark:hover:border-purple-400/50 transition-all duration-300">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />

        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1">
                <LayoutDashboard className="w-6 h-6 text-purple-500 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-1">
                  {dashboard.name}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">Client:</span>
                    <span>{dashboard.client}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">Template:</span>
                    <span>{dashboard.template}</span>
                  </div>
                </div>
              </div>
            </div>
            <StatusBadge status={dashboard.status} />
          </div>

          {/* URL & Metadata */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark" />
              <span className="text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                {dashboard.url ? (
                  <a
                    href={`https://${dashboard.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-500 dark:text-purple-400 hover:underline"
                  >
                    {dashboard.url}
                  </a>
                ) : (
                  'Not deployed'
                )}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Created: {dashboard.createdAt}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated: {dashboard.lastUpdated}</span>
              </div>
            </div>
          </div>

          {/* Warning/Info Message */}
          {dashboard.message && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">{dashboard.message}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPreview}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-4 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-4 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </motion.button>

            {dashboard.status === 'needs-update' && onUpdateSchema && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onUpdateSchema}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Update Schema
              </motion.button>
            )}

            {dashboard.status === 'draft' && onDeploy && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDeploy}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              >
                <Rocket className="w-4 h-4" />
                Deploy
              </motion.button>
            )}

            {dashboard.url && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCopyLink}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-4 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSettings}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-4 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </motion.button>

            {dashboard.status === 'deployed' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAnalytics}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-4 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </motion.button>
            )}

            {dashboard.status === 'draft' && onDelete && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDelete}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Draft
              </motion.button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard: React.FC<{ label: string; value: number; icon: React.ElementType; color: string }> = ({
  label,
  value,
  icon: Icon,
  color,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden"
    >
      <Card className="border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark hover:border-purple-500/30 dark:hover:border-purple-400/30 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark mb-1">
                {label}
              </p>
              <p className="text-3xl font-bold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                {value}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Create Dashboard Modal Component
const CreateDashboardModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-bolt-elements-background-depth-1 dark:bg-bolt-elements-background-depth-1-dark rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark"
        >
          {/* Header */}
          <div className="p-6 border-b border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                Create New Dashboard
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-3 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark" />
              </button>
            </div>
            <p className="mt-2 text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
              Choose how to start:
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Option 1 */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full text-left p-6 rounded-xl border-2 border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-2-dark"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-1">
                    🎨 Start from Scratch
                  </h3>
                  <p className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark mb-3">
                    Use AI to build a custom dashboard
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-purple-500 dark:text-purple-400">
                    Go to Vibe Coder
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Option 2 */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full text-left p-6 rounded-xl border-2 border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-2-dark"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-1">
                    📋 Start from Template
                  </h3>
                  <p className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark mb-3">
                    Choose from 14 pre-built templates
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 dark:text-blue-400">
                    Browse Templates
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Option 3 */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full text-left p-6 rounded-xl border-2 border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-2-dark"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <Upload className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-1">
                    📂 Import Existing
                  </h3>
                  <p className="text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark mb-3">
                    Upload a dashboard you built elsewhere
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-500 dark:text-emerald-400">
                    Import Files
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
            <Button
              onClick={onClose}
              className="w-full bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark hover:bg-bolt-elements-background-depth-3 dark:hover:bg-bolt-elements-background-depth-4"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Main Dashboards Tab Component
export function GitHubTab() {
  const [dashboards] = useState<Dashboard[]>(MOCK_DASHBOARDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: dashboards.length,
      active: dashboards.filter((d) => d.status === 'deployed').length,
      deployed: dashboards.filter((d) => d.status === 'deployed').length,
      draft: dashboards.filter((d) => d.status === 'draft').length,
    };
  }, [dashboards]);

  // Filter and sort dashboards
  const filteredDashboards = useMemo(() => {
    let filtered = [...dashboards];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.template.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    // Client filter
    if (clientFilter !== 'all') {
      filtered = filtered.filter((d) => d.client === clientFilter);
    }

    // Sort
    if (sortBy === 'recent') {
      // Most recent first (already in order)
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'client') {
      filtered.sort((a, b) => a.client.localeCompare(b.client));
    }

    return filtered;
  }, [dashboards, searchQuery, statusFilter, clientFilter, sortBy]);

  // Get unique clients for filter
  const uniqueClients = useMemo(() => {
    return Array.from(new Set(dashboards.map((d) => d.client)));
  }, [dashboards]);

  // Handler functions
  const handleCopyLink = (dashboard: Dashboard) => {
    if (dashboard.url) {
      navigator.clipboard.writeText(`https://${dashboard.url}`);
      // TODO: Show toast notification
      console.log('Link copied:', dashboard.url);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <LayoutDashboard className="w-6 h-6 text-purple-500 dark:text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
              Dashboards
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-5 h-5" />
            Create New
          </motion.button>
        </div>
        <p className="text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
          Manage and deploy your client dashboards
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total" value={stats.total} icon={LayoutDashboard} color="bg-purple-500/10 text-purple-500" />
        <StatsCard label="Active" value={stats.active} icon={CheckCircle2} color="bg-emerald-500/10 text-emerald-500" />
        <StatsCard label="Deployed" value={stats.deployed} icon={Rocket} color="bg-blue-500/10 text-blue-500" />
        <StatsCard label="Draft" value={stats.draft} icon={FileText} color="bg-amber-500/10 text-amber-500" />
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark" />
              <input
                type="text"
                placeholder="🔍 Search dashboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark placeholder-bolt-elements-textSecondary dark:placeholder-bolt-elements-textSecondary-dark focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="deployed">Deployed</option>
                <option value="draft">Draft</option>
                <option value="needs-update">Needs Update</option>
                <option value="error">Error</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
              >
                <option value="all">All Clients</option>
                {uniqueClients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-lg bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
              >
                <option value="recent">Sort: Recent</option>
                <option value="name">Sort: Name</option>
                <option value="client">Sort: Client</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredDashboards.length > 0 ? (
            filteredDashboards.map((dashboard) => (
              <DashboardCard
                key={dashboard.id}
                dashboard={dashboard}
                onPreview={() => console.log('Preview:', dashboard.id)}
                onEdit={() => console.log('Edit:', dashboard.id)}
                onSettings={() => console.log('Settings:', dashboard.id)}
                onCopyLink={() => handleCopyLink(dashboard)}
                onAnalytics={() => console.log('Analytics:', dashboard.id)}
                onDeploy={dashboard.status === 'draft' ? () => console.log('Deploy:', dashboard.id) : undefined}
                onDelete={dashboard.status === 'draft' ? () => console.log('Delete:', dashboard.id) : undefined}
                onUpdateSchema={
                  dashboard.status === 'needs-update' ? () => console.log('Update Schema:', dashboard.id) : undefined
                }
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 mb-4">
                <Search className="w-8 h-8 text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark" />
              </div>
              <h3 className="text-lg font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark mb-2">
                No dashboards found
              </h3>
              <p className="text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
                Try adjusting your search or filters
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <CreateDashboardModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}

export default GitHubTab;
