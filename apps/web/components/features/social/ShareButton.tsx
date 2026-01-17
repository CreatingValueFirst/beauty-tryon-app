'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareDialog } from './ShareDialog';

interface ShareButtonProps {
  imageUrl: string;
  styleType: 'hair' | 'nails';
  styleName: string;
  styleId?: string;
  userId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function ShareButton({
  imageUrl,
  styleType,
  styleName,
  styleId,
  userId,
  variant = 'outline',
  size = 'default',
  className,
  showLabel = true,
}: ShareButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Share2 className={showLabel ? 'w-4 h-4 mr-2' : 'w-4 h-4'} />
        {showLabel && 'Share'}
      </Button>

      <ShareDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        imageUrl={imageUrl}
        styleType={styleType}
        styleName={styleName}
        styleId={styleId}
        userId={userId}
      />
    </>
  );
}
