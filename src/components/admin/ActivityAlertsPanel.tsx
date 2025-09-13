'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Users, 
  FileText,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface WebhookLog {
  id: string;
  webhook_type: string;
  event_type: 'success' | 'error' | 'duplicate';
  submission_id: string;
  details: any;
  ip_address?: string;
  created_at: string;
}

interface ActivityItem {
  id: string;
  type: 'webhook_error' | 'webhook_success' | 'duplicate_email' | 'kyc_verification' | 'application_status';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  timestamp: string;
  data?: any;
  read: boolean;
}

interface ActivityAlertsPanelProps {
  className?: string;
}

export default function ActivityAlertsPanel({ className = '' }: ActivityAlertsPanelProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'errors' | 'unread'>('all');

  useEffect(() => {
    loadActivities();
    
    // Set up real-time subscription for webhook logs
    const subscription = supabase
      .channel('webhook_logs')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'webhook_logs' },
        (payload) => {
          console.log('New webhook log:', payload);
          loadActivities();
        }
      )
      .subscribe();

    // Refresh activities every 30 seconds
    const interval = setInterval(loadActivities, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Load webhook logs
      const { data: logs, error: logsError } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError && !logsError.message.includes('relation "webhook_logs" does not exist')) {
        console.error('Error loading webhook logs:', logsError);
      }

      if (logs) {
        setWebhookLogs(logs);
        
        // Convert webhook logs to activity items
        const webhookActivities: ActivityItem[] = logs.map(log => ({
          id: log.id,
          type: log.event_type === 'error' ? 'webhook_error' : 
                log.event_type === 'duplicate' ? 'duplicate_email' : 'webhook_success',
          title: getActivityTitle(log),
          description: getActivityDescription(log),
          severity: getActivitySeverity(log),
          timestamp: log.created_at,
          data: log,
          read: false
        }));
        
        setActivities(webhookActivities);
      } else {
        // Generate mock activities for demonstration
        const mockActivities: ActivityItem[] = [
          {
            id: '1',
            type: 'webhook_error',
            title: 'Webhook Processing Failed',
            description: 'Failed to process Jotform submission JF_001 - Invalid field mapping',
            severity: 'high',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            read: false
          },
          {
            id: '2',
            type: 'duplicate_email',
            title: 'Duplicate Email Application',
            description: 'john.smith@email.com attempted to submit another application',
            severity: 'medium',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            read: false
          },
          {
            id: '3',
            type: 'kyc_verification',
            title: 'KYC Documents Verified',
            description: 'Sarah Chen - All documents verified and approved',
            severity: 'info',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            read: true
          },
          {
            id: '4',
            type: 'webhook_success',
            title: 'New Application Received',
            description: 'Successfully processed application from Mike Wilson',
            severity: 'info',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            read: true
          },
          {
            id: '5',
            type: 'application_status',
            title: 'Application Approved',
            description: 'Lisa Rodriguez application approved and invite sent',
            severity: 'info',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            read: true
          }
        ];
        
        setActivities(mockActivities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTitle = (log: WebhookLog): string => {
    switch (log.event_type) {
      case 'error':
        return 'Webhook Processing Failed';
      case 'duplicate':
        return 'Duplicate Submission Detected';
      case 'success':
        return 'New Application Received';
      default:
        return 'Webhook Event';
    }
  };

  const getActivityDescription = (log: WebhookLog): string => {
    const details = log.details || {};
    
    switch (log.event_type) {
      case 'error':
        return `Failed to process submission ${log.submission_id}: ${details.error || 'Unknown error'}`;
      case 'duplicate':
        return `Duplicate submission ${log.submission_id}: ${details.reason || 'Already processed'}`;
      case 'success':
        return `Successfully processed application from ${details.name || 'Unknown applicant'}`;
      default:
        return `Webhook event for submission ${log.submission_id}`;
    }
  };

  const getActivitySeverity = (log: WebhookLog): 'high' | 'medium' | 'low' | 'info' => {
    switch (log.event_type) {
      case 'error':
        return 'high';
      case 'duplicate':
        return 'medium';
      case 'success':
        return 'info';
      default:
        return 'low';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-[#F04444] text-white';
      case 'medium': return 'bg-[#FFB020] text-white';
      case 'low': return 'bg-[#3EA8FF] text-white';
      case 'info': return 'bg-[#21D07A] text-white';
      default: return 'bg-[#A8B3C2] text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="h-3 w-3" />;
      case 'medium': return <AlertTriangle className="h-3 w-3" />;
      case 'low': return <Clock className="h-3 w-3" />;
      case 'info': return <CheckCircle className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'webhook_error': return <XCircle className="h-4 w-4 text-[#F04444]" />;
      case 'webhook_success': return <CheckCircle className="h-4 w-4 text-[#21D07A]" />;
      case 'duplicate_email': return <Mail className="h-4 w-4 text-[#FFB020]" />;
      case 'kyc_verification': return <FileText className="h-4 w-4 text-[#3EA8FF]" />;
      case 'application_status': return <Users className="h-4 w-4 text-[#2EE6A6]" />;
      default: return <AlertTriangle className="h-4 w-4 text-[#A8B3C2]" />;
    }
  };

  const handleViewDetails = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setSheetOpen(true);
    
    // Mark as read
    if (!activity.read) {
      setActivities(prev => prev.map(a => 
        a.id === activity.id ? { ...a, read: true } : a
      ));
    }
  };

  const filteredActivities = activities.filter(activity => {
    switch (filter) {
      case 'errors':
        return activity.type === 'webhook_error' || activity.severity === 'high';
      case 'unread':
        return !activity.read;
      default:
        return true;
    }
  });

  const unreadCount = activities.filter(a => !a.read).length;
  const errorCount = activities.filter(a => a.type === 'webhook_error' || a.severity === 'high').length;

  return (
    <Card className={`bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg ${className}`}>
      <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[18px] font-semibold text-[#E6ECF2] flex items-center" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              <AlertTriangle className="h-5 w-5 mr-2 text-[#FFB020]" />
              Activity & Alerts
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-[#F04444] text-white text-[10px] px-2 py-1">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
              System events and notifications
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadActivities}
              disabled={loading}
              className="border-[rgba(230,236,242,0.12)] text-[#A8B3C2] hover:bg-[rgba(230,236,242,0.08)] hover:text-[#E6ECF2] rounded-[6px] h-8 px-3 text-[12px]"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Filter Tabs */}
        <div className="flex border-b border-[rgba(230,236,242,0.08)]">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-3 text-[13px] font-medium transition-colors ${
              filter === 'all' 
                ? 'text-[#2EE6A6] border-b-2 border-[#2EE6A6] bg-[rgba(46,230,166,0.05)]' 
                : 'text-[#A8B3C2] hover:text-[#E6ECF2] hover:bg-[rgba(230,236,242,0.04)]'
            }`}
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            All ({activities.length})
          </button>
          <button
            onClick={() => setFilter('errors')}
            className={`flex-1 px-4 py-3 text-[13px] font-medium transition-colors ${
              filter === 'errors' 
                ? 'text-[#F04444] border-b-2 border-[#F04444] bg-[rgba(240,68,68,0.05)]' 
                : 'text-[#A8B3C2] hover:text-[#E6ECF2] hover:bg-[rgba(230,236,242,0.04)]'
            }`}
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            Errors ({errorCount})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-4 py-3 text-[13px] font-medium transition-colors ${
              filter === 'unread' 
                ? 'text-[#FFB020] border-b-2 border-[#FFB020] bg-[rgba(255,176,32,0.05)]' 
                : 'text-[#A8B3C2] hover:text-[#E6ECF2] hover:bg-[rgba(230,236,242,0.04)]'
            }`}
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Activities List */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#2EE6A6] border-t-transparent"></div>
              <span className="ml-2 text-[#A8B3C2] text-[14px]" style={{fontFamily: 'Inter, sans-serif'}}>Loading...</span>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-[#A8B3C2] mx-auto mb-2" />
              <p className="text-[#A8B3C2] text-[14px]" style={{fontFamily: 'Inter, sans-serif'}}>
                {filter === 'all' ? 'No activities found' : 
                 filter === 'errors' ? 'No errors found' : 'No unread activities'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(230,236,242,0.08)]">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-4 hover:bg-[rgba(230,236,242,0.04)] transition-colors cursor-pointer ${
                    !activity.read ? 'bg-[rgba(46,230,166,0.02)]' : ''
                  }`}
                  onClick={() => handleViewDetails(activity)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-[14px] font-medium truncate ${
                          !activity.read ? 'text-[#E6ECF2]' : 'text-[#A8B3C2]'
                        }`} style={{fontFamily: 'Inter, sans-serif'}}>
                          {activity.title}
                        </h4>
                        <div className="flex items-center space-x-2 ml-2">
                          <Badge className={`${getSeverityColor(activity.severity)} text-[10px] font-medium flex items-center gap-1`} style={{fontFamily: 'Inter, sans-serif'}}>
                            {getSeverityIcon(activity.severity)}
                            {activity.severity.toUpperCase()}
                          </Badge>
                          {!activity.read && (
                            <div className="w-2 h-2 bg-[#2EE6A6] rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-[12px] text-[#A8B3C2] mt-1 line-clamp-2" style={{fontFamily: 'Inter, sans-serif'}}>
                        {activity.description}
                      </p>
                      <p className="text-[11px] text-[#A8B3C2] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Activity Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[500px] bg-[#101826] border-l border-[rgba(230,236,242,0.12)] text-[#E6ECF2] overflow-y-auto">
          {selectedActivity && (
            <>
              <SheetHeader className="pb-6 border-b border-[rgba(230,236,242,0.08)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(selectedActivity.type)}
                    <div>
                      <SheetTitle className="text-[20px] font-bold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                        {selectedActivity.title}
                      </SheetTitle>
                      <SheetDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
                        {new Date(selectedActivity.timestamp).toLocaleString()}
                      </SheetDescription>
                    </div>
                  </div>
                  <Badge className={`${getSeverityColor(selectedActivity.severity)} text-[11px] font-medium flex items-center gap-1`} style={{fontFamily: 'Inter, sans-serif'}}>
                    {getSeverityIcon(selectedActivity.severity)}
                    {selectedActivity.severity.toUpperCase()}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="py-6 space-y-6">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#E6ECF2] mb-3" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Description</h3>
                  <p className="text-[14px] text-[#A8B3C2] leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>
                    {selectedActivity.description}
                  </p>
                </div>

                {selectedActivity.data && (
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#E6ECF2] mb-3" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Details</h3>
                    <div className="bg-[rgba(230,236,242,0.04)] border border-[rgba(230,236,242,0.08)] rounded-[8px] p-4">
                      <pre className="text-[12px] text-[#A8B3C2] font-mono whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(selectedActivity.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedActivity.type === 'webhook_error' && (
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#E6ECF2] mb-3" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Recommended Actions</h3>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-[#2EE6A6] rounded-full mt-2"></div>
                        <p className="text-[14px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Check Jotform field mappings</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-[#2EE6A6] rounded-full mt-2"></div>
                        <p className="text-[14px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Verify webhook signature configuration</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-[#2EE6A6] rounded-full mt-2"></div>
                        <p className="text-[14px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Review IP allowlist settings</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}