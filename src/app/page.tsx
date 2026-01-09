'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  ShoppingBag,
  MessageSquare,
  Wrench,
  TrendingUp,
  Bell
} from 'lucide-react';

export default function HomePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Welcome banner */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome to Rideway</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Connect with motorcycle enthusiasts, buy and sell bikes, and find the best services.
                </p>
                <div className="flex gap-3">
                  <Button>Explore Feed</Button>
                  <Button variant="outline">Browse Marketplace</Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Community</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <ShoppingBag className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Listings</p>
                    <p className="text-2xl font-bold">456</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Forum Topics</p>
                    <p className="text-2xl font-bold">89</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-full bg-orange-500/10">
                    <Wrench className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Services</p>
                    <p className="text-2xl font-bold">32</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Placeholder sections */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Feed will appear here once connected to backend
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Notifications will appear here once connected to backend
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status banner */}
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Development Mode</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  This is the cleaned design shell. Backend (Express.js) and full functionality
                  will be implemented in upcoming sessions.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
