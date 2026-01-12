'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateCardAction } from '@/src/actions/cards';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface Card {
  id: number;
  front: string;
  back: string;
  createdAt: string;
}

interface EditCardFormProps {
  card: Card;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
}

export function EditCardForm({
  card,
  open,
  onOpenChange,
  onSuccess
}: EditCardFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    front: card.front,
    back: card.back
  });
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    const newErrors: { front?: string; back?: string } = {};
    if (!formData.front.trim()) {
      newErrors.front = 'Front side is required';
    }
    if (!formData.back.trim()) {
      newErrors.back = 'Back side is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    startTransition(async () => {
      try {
        await updateCardAction({
          id: card.id,
          front: formData.front.trim(),
          back: formData.back.trim()
        });

        // Close modal and show success message
        onOpenChange(false);
        onSuccess('Card updated successfully!');
      } catch (error) {
        console.error('Failed to update card:', error);
        // Error handling is done in the server action
      }
    });
  };

  const handleInputChange = (field: 'front' | 'back', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the front and back sides of this flash card.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="front">Front Side</Label>
            <Textarea
              id="front"
              placeholder="Enter the question or prompt..."
              value={formData.front}
              onChange={e => handleInputChange('front', e.target.value)}
              className={errors.front ? 'border-destructive' : ''}
              disabled={isPending}
              rows={3}
            />
            {errors.front && (
              <p className="text-sm text-destructive">{errors.front}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="back">Back Side</Label>
            <Textarea
              id="back"
              placeholder="Enter the answer..."
              value={formData.back}
              onChange={e => handleInputChange('back', e.target.value)}
              className={errors.back ? 'border-destructive' : ''}
              disabled={isPending}
              rows={3}
            />
            {errors.back && (
              <p className="text-sm text-destructive">{errors.back}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating Card...' : 'Update Card'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}