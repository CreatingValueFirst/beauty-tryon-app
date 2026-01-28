'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Download, Check, X, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useHaptic } from '@/hooks/use-haptic';

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface InstantShareProps {
  imageUrl?: string;
  imageBlob?: Blob;
  title?: string;
  description?: string;
  hashtags?: string[];
  onShareComplete?: (platform: string) => void;
  className?: string;
  variant?: 'button' | 'icon' | 'fab';
}

export function InstantShare({
  imageUrl,
  imageBlob,
  title = 'Check out my look!',
  description = 'Created with BeautyTryOn',
  hashtags = ['BeautyTryOn', 'VirtualMakeup', 'ARBeauty'],
  onShareComplete,
  className,
  variant = 'button',
}: InstantShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const haptic = useHaptic();

  // Generate share text with hashtags
  const shareText = `${description}\n\n${hashtags.map(h => `#${h}`).join(' ')}`;

  // Native share (mobile)
  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return false;

    setIsSharing(true);
    haptic.medium();

    try {
      const shareData: ShareData = {
        title,
        text: shareText,
      };

      // Add image if available
      if (imageBlob) {
        const file = new File([imageBlob], 'beautytry-on.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      } else if (imageUrl) {
        shareData.url = imageUrl;
      }

      await navigator.share(shareData);
      haptic.success();
      onShareComplete?.('native');
      setIsOpen(false);
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [title, shareText, imageBlob, imageUrl, haptic, onShareComplete]);

  // Copy link
  const handleCopyLink = useCallback(async () => {
    haptic.light();
    const textToCopy = imageUrl || window.location.href;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      haptic.success();
      setTimeout(() => setCopied(false), 2000);
      onShareComplete?.('copy');
    } catch (err) {
      console.error('Copy failed:', err);
      haptic.error();
    }
  }, [imageUrl, haptic, onShareComplete]);

  // Download image
  const handleDownload = useCallback(async () => {
    haptic.light();

    try {
      let url = imageUrl;

      if (imageBlob) {
        url = URL.createObjectURL(imageBlob);
      }

      if (!url) return;

      const link = document.createElement('a');
      link.href = url;
      link.download = `beautytry-on-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (imageBlob) {
        URL.revokeObjectURL(url);
      }

      haptic.success();
      onShareComplete?.('download');
    } catch (err) {
      console.error('Download failed:', err);
      haptic.error();
    }
  }, [imageUrl, imageBlob, haptic, onShareComplete]);

  // Share to specific platform
  const handlePlatformShare = useCallback((platform: string) => {
    haptic.light();
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(imageUrl || window.location.href);

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'tiktok':
        // TikTok doesn't have direct share URL, use native share instead
        handleNativeShare();
        return;
      case 'instagram':
        // Instagram requires native app, use native share
        handleNativeShare();
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      onShareComplete?.(platform);
    }
  }, [shareText, imageUrl, handleNativeShare, haptic, onShareComplete]);

  // Quick share button handler
  const handleQuickShare = useCallback(async () => {
    // Try native share first on mobile
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      const success = await handleNativeShare();
      if (success) return;
    }

    // Fall back to opening share menu
    setIsOpen(true);
  }, [handleNativeShare]);

  // Render button variant
  const renderTrigger = () => {
    switch (variant) {
      case 'icon':
        return (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickShare}
            className={cn(
              "w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm",
              "flex items-center justify-center",
              className
            )}
          >
            <Share2 className="w-5 h-5 text-white" />
          </motion.button>
        );

      case 'fab':
        return (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickShare}
            className={cn(
              "w-14 h-14 rounded-full",
              "bg-gradient-to-r from-purple-600 to-pink-500",
              "flex items-center justify-center shadow-lg",
              "neon-glow-purple",
              className
            )}
          >
            <Share2 className="w-6 h-6 text-white" />
          </motion.button>
        );

      default:
        return (
          <Button
            onClick={handleQuickShare}
            className={cn("gap-2", className)}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        );
    }
  };

  return (
    <>
      {renderTrigger()}

      {/* Share menu modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Share sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl pb-safe"
            >
              <div className="p-6">
                {/* Handle */}
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Share your look</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Preview */}
                {imageUrl && (
                  <div className="mb-6 rounded-xl overflow-hidden bg-gray-100 aspect-square max-w-[200px] mx-auto">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Social platforms */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePlatformShare('tiktok')}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                      <TikTokIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-600">TikTok</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePlatformShare('instagram')}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-600">Instagram</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePlatformShare('twitter')}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                      <Twitter className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-600">X</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePlatformShare('whatsapp')}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">WhatsApp</span>
                  </motion.button>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium">Copy Link</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Download</span>
                  </motion.button>
                </div>

                {/* Hashtags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
