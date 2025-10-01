'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  apartmentId: string;
  apartmentName: string;
  onReviewAdded?: () => void;
}

export function AddReviewDialog({
  open,
  onOpenChange,
  bookingId,
  apartmentId,
  apartmentName,
  onReviewAdded
}: AddReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Prosím vyberte hodnotenie');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Komentár musí obsahovať aspoň 10 znakov');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apartmentId,
          bookingId,
          rating,
          comment: comment.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodarilo sa pridať hodnotenie');
      }

      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component
      onReviewAdded?.();
      
      // Close dialog
      onOpenChange(false);

      // Show success message
      alert('Ďakujeme za vaše hodnotenie!');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'Nepodarilo sa pridať hodnotenie');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pridať hodnotenie</DialogTitle>
          <DialogDescription>
            Ohodnoťte svoj pobyt v apartmáne {apartmentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Hodnotenie *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                  disabled={isSubmitting}
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      (hoverRating >= star || rating >= star)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Váš komentár * 
              <span className="text-xs text-muted-foreground ml-2">
                (min. 10 znakov)
              </span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Popíšte svoju skúsenosť s pobytom v tomto apartmáne..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              disabled={isSubmitting}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {comment.length} znakov
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Info Note */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <p>
              <strong>Poznámka:</strong> Vaše hodnotenie bude zverejnené po schválení administrátorom.
              Pomôže to budúcim hosťom pri výbere apartmánu.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Zrušiť
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Odosielam...
              </>
            ) : (
              'Odoslať hodnotenie'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddReviewDialog;

