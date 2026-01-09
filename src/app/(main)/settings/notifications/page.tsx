'use client';

import { useState } from 'react';
import { Loader2, Bell, Mail, MessageSquare, Heart, UserPlus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/lib/toast';

export default function NotificationSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState({
    // Push notifications
    pushEnabled: true,
    pushLikes: true,
    pushComments: true,
    pushFollowers: true,
    pushMessages: true,
    pushMentions: true,
    // Email notifications
    emailEnabled: true,
    emailDigest: true,
    emailNewFollower: false,
    emailMessages: false,
    emailMarketing: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // TODO: Implement save notification settings
    toast.info('Notification settings functionality coming soon');
    console.log('Notification settings:', settings);
  };

  if (authLoading || !user) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Manage notifications on your devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-enabled">Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications on your devices.
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={settings.pushEnabled}
              onCheckedChange={() => handleToggle('pushEnabled')}
            />
          </div>

          {settings.pushEnabled && (
            <>
              <Separator />

              <div className="space-y-4 pl-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="push-likes">Likes</Label>
                  </div>
                  <Switch
                    id="push-likes"
                    checked={settings.pushLikes}
                    onCheckedChange={() => handleToggle('pushLikes')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="push-comments">Comments</Label>
                  </div>
                  <Switch
                    id="push-comments"
                    checked={settings.pushComments}
                    onCheckedChange={() => handleToggle('pushComments')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="push-followers">New Followers</Label>
                  </div>
                  <Switch
                    id="push-followers"
                    checked={settings.pushFollowers}
                    onCheckedChange={() => handleToggle('pushFollowers')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="push-messages">Direct Messages</Label>
                  </div>
                  <Switch
                    id="push-messages"
                    checked={settings.pushMessages}
                    onCheckedChange={() => handleToggle('pushMessages')}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Manage email notifications you receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email.
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={settings.emailEnabled}
              onCheckedChange={() => handleToggle('emailEnabled')}
            />
          </div>

          {settings.emailEnabled && (
            <>
              <Separator />

              <div className="space-y-4 pl-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-digest">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      A summary of your activity each week.
                    </p>
                  </div>
                  <Switch
                    id="email-digest"
                    checked={settings.emailDigest}
                    onCheckedChange={() => handleToggle('emailDigest')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-follower">New Follower Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone follows you.
                    </p>
                  </div>
                  <Switch
                    id="email-follower"
                    checked={settings.emailNewFollower}
                    onCheckedChange={() => handleToggle('emailNewFollower')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-messages">Message Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new messages.
                    </p>
                  </div>
                  <Switch
                    id="email-messages"
                    checked={settings.emailMessages}
                    onCheckedChange={() => handleToggle('emailMessages')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-marketing">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and offers.
                    </p>
                  </div>
                  <Switch
                    id="email-marketing"
                    checked={settings.emailMarketing}
                    onCheckedChange={() => handleToggle('emailMarketing')}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
