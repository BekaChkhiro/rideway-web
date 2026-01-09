'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/user-avatar';
import { createServiceReview } from '@/lib/api/services';
import { cn } from '@/lib/utils';
import type { ServiceReview } from '@/types';

interface ReviewFormProps {
  serviceId: string;
  onReviewCreated?: (review: ServiceReview) => void;
}

export function ReviewForm({ serviceId, onReviewCreated }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 text-center text-muted-foreground">
        <p>შეფასების დასატოვებლად გთხოვთ გაიაროთ ავტორიზაცია</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('გთხოვთ აირჩიოთ შეფასება');
      return;
    }

    setIsSubmitting(true);
    try {
      const review = await createServiceReview(serviceId, {
        rating,
        comment: comment.trim() || undefined,
      });
      setRating(0);
      setComment('');
      onReviewCreated?.(review);
      toast.success('შეფასება დაემატა');
    } catch {
      toast.error('შეცდომა');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <div className="hidden sm:block">
          <UserAvatar
            user={{
              id: session.user.id,
              username: session.user.username,
              fullName: session.user.fullName,
              avatarUrl: session.user.avatarUrl,
            }}
            size="md"
          />
        </div>
        <div className="flex-1 space-y-3">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium mr-2">შეფასება:</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
              >
                <Star
                  className={cn(
                    'h-6 w-6 transition-colors',
                    i < (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground hover:text-yellow-400'
                  )}
                />
              </button>
            ))}
          </div>

          {/* Comment */}
          <Textarea
            placeholder="დაწერეთ კომენტარი (არასავალდებულო)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          შეფასების გაგზავნა
        </Button>
      </div>
    </form>
  );
}
