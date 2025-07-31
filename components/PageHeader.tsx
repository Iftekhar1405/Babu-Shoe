'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="bg-black hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}