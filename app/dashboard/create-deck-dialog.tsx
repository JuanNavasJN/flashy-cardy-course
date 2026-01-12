'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { createDeckAction } from '@/src/actions/decks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PlusIcon } from 'lucide-react';

interface CreateDeckDialogProps {
  onDeckCreated?: () => void;
}

export function CreateDeckDialog({ onDeckCreated }: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await createDeckAction({
          title: formData.title,
          description: formData.description || undefined
        });

        toast.success('Deck created successfully!');
        setFormData({ title: '', description: '' });
        setOpen(false);
        onDeckCreated?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create deck');
      }
    });
  };

  const handleInputChange = (field: 'title' | 'description') => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create New Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogDescription>
            Create a new flashcard deck to organize your study materials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleInputChange('title')}
                placeholder="Enter deck title"
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Enter deck description (optional)"
                rows={3}
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formData.title.trim()}>
              {isPending ? 'Creating...' : 'Create Deck'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}