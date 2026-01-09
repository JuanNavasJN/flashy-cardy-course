'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateDeckAction } from '@/src/actions/decks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

interface EditDeckFormProps {
  deck: {
    id: number;
    title: string;
    description: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
}

export function EditDeckForm({
  deck,
  open,
  onOpenChange,
  onSuccess
}: EditDeckFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: deck.title,
    description: deck.description || ''
  });
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    const newErrors: { title?: string; description?: string } = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (formData.title.length > 255) {
      newErrors.title = 'Title is too long (max 255 characters)';
    }
    if (formData.description.length > 1000) {
      newErrors.description = 'Description is too long (max 1000 characters)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    startTransition(async () => {
      try {
        await updateDeckAction({
          deckId: deck.id,
          title: formData.title.trim(),
          description: formData.description.trim() || undefined
        });

        onSuccess('Deck updated successfully!');
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to update deck:', error);
        // You could add toast notification here for errors
      }
    });
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
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
          <DialogTitle>Edit Deck</DialogTitle>
          <DialogDescription>
            Update the title and description of your deck.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter deck title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isPending}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter deck description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isPending}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Deck'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}