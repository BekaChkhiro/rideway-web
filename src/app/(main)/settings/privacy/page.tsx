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
    toast.info('კონფიდენციალურობის პარამეტრები მალე დაემატება');
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
          <CardTitle>პროფილის კონფიდენციალურობა</CardTitle>
          <CardDescription>
            აკონტროლე ვინ ხედავს შენს პროფილს და კონტენტს.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="private-profile">პირადი პროფილი</Label>
              <p className="text-sm text-muted-foreground">
                მხოლოდ დამტკიცებული მიმდევრები ხედავენ პოსტებს და სთორებს.
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
              <Label htmlFor="show-activity">აქტივობის სტატუსი</Label>
              <p className="text-sm text-muted-foreground">
                აჩვენე ბოლო აქტივობა სხვა მომხმარებლებს.
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
          <CardTitle>ონლაინ სტატუსი</CardTitle>
          <CardDescription>
            მართე ონლაინ სტატუსის ხილვადობა.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="online-status">ონლაინ სტატუსის ჩვენება</Label>
              <p className="text-sm text-muted-foreground">
                სხვებმა ხედონ როცა ონლაინ ხარ.
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
              <Label htmlFor="last-seen">ბოლოს ნანახის ჩვენება</Label>
              <p className="text-sm text-muted-foreground">
                სხვებმა ხედონ როდის იყავი ბოლოს აქტიური.
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
          <CardTitle>ინტერაქციები</CardTitle>
          <CardDescription>
            აკონტროლე როგორ ურთიერთობენ შენთან სხვები.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-messages">შეტყობინებების დაშვება</Label>
              <p className="text-sm text-muted-foreground">
                დაუშვი მომხმარებლებს პირადი შეტყობინებების გამოგზავნა.
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
              <Label htmlFor="allow-tagging">მონიშვნის დაშვება</Label>
              <p className="text-sm text-muted-foreground">
                დაუშვი სხვებს შენი მონიშვნა პოსტებსა და კომენტარებში.
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
        <Button onClick={handleSave}>შენახვა</Button>
      </div>
    </div>
  );
}
