'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Link, Check } from 'lucide-react';
import {
  shareToSocial,
  downloadImage,
  saveToGallery,
  generateCaption,
  type SocialPlatform,
} from '@/lib/social/share';
import { cn } from '@/lib/utils/cn';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  styleType: 'hair' | 'nails';
  styleName: string;
  styleId?: string;
  userId?: string;
}

const socialPlatforms = [
  {
    id: 'twitter' as SocialPlatform,
    name: 'Twitter/X',
    icon: '𝕏',
    color: 'bg-black hover:bg-gray-800',
  },
  {
    id: 'instagram' as SocialPlatform,
    name: 'Instagram',
    icon: '📷',
    color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90',
  },
  {
    id: 'pinterest' as SocialPlatform,
    name: 'Pinterest',
    icon: '📌',
    color: 'bg-red-600 hover:bg-red-700',
  },
  {
    id: 'facebook' as SocialPlatform,
    name: 'Facebook',
    icon: '👍',
    color: 'bg-blue-600 hover:bg-blue-700',
  },
];

export function ShareDialog({
  open,
  onOpenChange,
  imageUrl,
  styleType,
  styleName,
  styleId,
  userId,
}: ShareDialogProps) {
  const [sharing, setSharing] = useState<SocialPlatform | null>(null);
  const [saved, setSaved] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleShare = async (platform: SocialPlatform) => {
    if (!userId) {
      alert('Please sign in to share');
      return;
    }

    setSharing(platform);

    try {
      const result = await shareToSocial(userId, {
        platform,
        image_url: imageUrl,
        title: `My ${styleName} look!`,
        description: `Check out this amazing ${styleType} style I tried with BeautyTryOn!`,
        style_type: styleType,
        style_name: styleName,
        hashtags: ['BeautyTryOn', 'VirtualTryOn', styleType === 'hair' ? 'HairStyle' : 'NailArt'],
      });

      if (result.success) {
        // Show success feedback
        console.log(`Shared to ${platform}:`, result.share_url);
      } else {
        alert(result.error || 'Failed to share');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share. Please try again.');
    } finally {
      setSharing(null);
    }
  };

  const handleCopyLink = async () => {
    if (!userId) {
      alert('Please sign in to copy link');
      return;
    }

    setSharing('copy-link');

    try {
      await shareToSocial(userId, {
        platform: 'copy-link',
        image_url: imageUrl,
        style_type: styleType,
        style_name: styleName,
      });

      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      alert('Failed to copy link');
    } finally {
      setSharing(null);
    }
  };

  const handleDownload = async () => {
    setDownloaded(false);
    const success = await downloadImage(
      imageUrl,
      `beautytry-on-${styleType}-${styleName.replace(/\s+/g, '-').toLowerCase()}.jpg`
    );

    if (success) {
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } else {
      alert('Failed to download image');
    }
  };

  const handleSave = async () => {
    if (!userId || !styleId) {
      alert('Please sign in to save');
      return;
    }

    setSaved(false);

    const result = await saveToGallery(userId, {
      type: styleType,
      style_id: styleId,
      image_url: imageUrl,
    });

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert(result.error || 'Failed to save to gallery');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Look</DialogTitle>
          <DialogDescription>
            Share your {styleName} {styleType === 'hair' ? 'hairstyle' : 'nail design'} with the
            world!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            <img src={imageUrl} alt={styleName} className="h-full w-full object-cover" />
          </div>

          {/* Social Platforms */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Share to Social Media</h3>
            <div className="grid grid-cols-2 gap-3">
              {socialPlatforms.map((platform) => (
                <Button
                  key={platform.id}
                  onClick={() => handleShare(platform.id)}
                  disabled={sharing === platform.id}
                  className={cn(
                    'w-full text-white border-0',
                    platform.color
                  )}
                  variant="outline"
                >
                  <span className="mr-2 text-lg">{platform.icon}</span>
                  {sharing === platform.id ? 'Sharing...' : platform.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                onClick={handleCopyLink}
                disabled={sharing === 'copy-link'}
                variant="outline"
                className="w-full justify-start"
              >
                {linkCopied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-green-600">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>

              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full justify-start"
              >
                {downloaded ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-green-600">Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </>
                )}
              </Button>

              {userId && styleId && (
                <Button onClick={handleSave} variant="outline" className="w-full justify-start">
                  {saved ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      <span className="text-green-600">Saved to Gallery!</span>
                    </>
                  ) : (
                    <>
                      💾 Save to Gallery
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Caption Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Caption</h3>
            <p className="text-sm text-gray-600">
              {generateCaption({
                style_type: styleType,
                style_name: styleName,
                platform: 'instagram',
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
