'use client';

import { MessageSquare } from 'lucide-react';
import { ConversationList } from '@/components/chat';

export default function MessagesPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">შეტყობინებები</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList />
        </div>
      </div>

      {/* Empty state (desktop) */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">აირჩიეთ საუბარი</p>
          <p className="text-sm">ან დაიწყეთ ახალი საუბარი პროფილის გვერდიდან</p>
        </div>
      </div>
    </div>
  );
}
