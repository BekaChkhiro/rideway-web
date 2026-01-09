'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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

export default function PrivacySettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState({
    privateProfile: false,
    showOnlineStatus: true,
    showLastSeen: true,
    allowMessages: true,
    showActivity: true,
    allowTagging: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // TODO: Implement save privacy settings
    toast.info('Privacy settings functionality coming soon');
    console.log('Privacy settings:', settings);
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
      {/* Profile Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Privacy</CardTitle>
          <CardDescription>
            Control who can see your profile and content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="private-profile">Private Profile</Label>
              <p className="text-sm text-muted-foreground">
                Only approved followers can see your posts and stories.
              </p>
            </div>
            <Switch
              id="private-profile"
              checked={settings.privateProfile}
              onCheckedChange={() => handleToggle('privateProfile')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-activity">Activity Status</Label>
              <p className="text-sm text-muted-foreground">
                Show your recent activity to other users.
              </p>
            </div>
            <Switch
              id="show-activity"
              checked={settings.showActivity}
              onCheckedChange={() => handleToggle('showActivity')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Online Status */}
      <Card>
        <CardHeader>
          <CardTitle>Online Status</CardTitle>
          <CardDescription>
            Manage your online presence visibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="online-status">Show Online Status</Label>
              <p className="text-sm text-muted-foreground">
                Let others see when you&apos;re online.
              </p>
            </div>
            <Switch
              id="online-status"
              checked={settings.showOnlineStatus}
              onCheckedChange={() => handleToggle('showOnlineStatus')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="last-seen">Show Last Seen</Label>
              <p className="text-sm text-muted-foreground">
                Let others see when you were last active.
              </p>
            </div>
            <Switch
              id="last-seen"
              checked={settings.showLastSeen}
              onCheckedChange={() => handleToggle('showLastSeen')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Interactions */}
      <Card>
        <CardHeader>
          <CardTitle>Interactions</CardTitle>
          <CardDescription>
            Control how others can interact with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-messages">Allow Messages</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to send you direct messages.
              </p>
            </div>
            <Switch
              id="allow-messages"
              checked={settings.allowMessages}
              onCheckedChange={() => handleToggle('allowMessages')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-tagging">Allow Tagging</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to tag you in posts and comments.
              </p>
            </div>
            <Switch
              id="allow-tagging"
              checked={settings.allowTagging}
              onCheckedChange={() => handleToggle('allowTagging')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
