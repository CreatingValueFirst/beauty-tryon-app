/**
 * Social Sharing Utilities
 * Integrates with n8n workflows for automated social media posting
 */

export type SocialPlatform = 'twitter' | 'instagram' | 'pinterest' | 'facebook' | 'copy-link';

export interface ShareOptions {
  platform: SocialPlatform;
  image_url: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  style_type?: 'hair' | 'nails';
  style_name?: string;
}

export interface ShareResult {
  success: boolean;
  platform: SocialPlatform;
  share_url?: string;
  error?: string;
}

/**
 * Share to social media via n8n webhook
 */
export async function shareToSocial(
  userId: string,
  options: ShareOptions
): Promise<ShareResult> {
  const { platform, image_url, title, description, hashtags, style_type, style_name } = options;

  // For copy-link, just copy to clipboard
  if (platform === 'copy-link') {
    try {
      await navigator.clipboard.writeText(image_url);
      return {
        success: true,
        platform: 'copy-link',
        share_url: image_url,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'copy-link',
        error: 'Failed to copy link',
      };
    }
  }

  // Call n8n webhook for automated posting
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_SOCIAL_SHARE_WEBHOOK;

  if (!webhookUrl) {
    console.warn('N8N webhook not configured, using fallback share');
    return fallbackShare(platform, image_url, title, description);
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        platform,
        image_url,
        title,
        description,
        hashtags: hashtags || ['BeautyTryOn', 'VirtualTryOn', 'BeautyTech'],
        style_type,
        style_name,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      platform,
      share_url: data.share_url,
    };
  } catch (error) {
    console.error('Error sharing to social media:', error);

    // Fallback to direct sharing
    return fallbackShare(platform, image_url, title, description);
  }
}

/**
 * Fallback share using Web Share API or platform URLs
 */
async function fallbackShare(
  platform: SocialPlatform,
  imageUrl: string,
  title?: string,
  description?: string
): Promise<ShareResult> {
  const text = title || 'Check out my new look with BeautyTryOn!';
  const fullDescription = description || 'Created with BeautyTryOn - Virtual Beauty Try-On';

  // Try Web Share API first (mobile devices)
  if (navigator.share && platform !== 'twitter' && platform !== 'pinterest') {
    try {
      await navigator.share({
        title: text,
        text: fullDescription,
        url: imageUrl,
      });

      return {
        success: true,
        platform,
        share_url: imageUrl,
      };
    } catch (error) {
      // User cancelled or error - fall through to platform URLs
      console.log('Web Share API failed, using platform URLs');
    }
  }

  // Platform-specific share URLs
  const shareUrls: Record<Exclude<SocialPlatform, 'copy-link'>, string> = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `${text} 🎨✨ #BeautyTryOn`
    )}&url=${encodeURIComponent(imageUrl)}`,

    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(text)}`,

    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
      imageUrl
    )}&description=${encodeURIComponent(text)}&media=${encodeURIComponent(imageUrl)}`,

    instagram: '', // Instagram doesn't support web sharing directly
  };

  const shareUrl = shareUrls[platform];

  if (!shareUrl) {
    return {
      success: false,
      platform,
      error: 'Instagram sharing requires the mobile app. Please save the image and share manually.',
    };
  }

  // Open share URL in new window
  window.open(shareUrl, '_blank', 'width=600,height=400');

  return {
    success: true,
    platform,
    share_url: shareUrl,
  };
}

/**
 * Download image to device
 */
export async function downloadImage(imageUrl: string, filename?: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `beautytry-on-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error downloading image:', error);
    return false;
  }
}

/**
 * Save try-on to gallery
 */
export async function saveToGallery(
  userId: string,
  tryOnData: {
    type: 'hair' | 'nails';
    style_id: string;
    image_url: string;
    settings?: any;
  }
): Promise<{ success: boolean; try_on_id?: string; error?: string }> {
  try {
    // This would call your Supabase client to save the try-on
    // For now, return success
    // In production:
    /*
    const { data, error } = await supabase
      .from('try_ons')
      .insert({
        user_id: userId,
        type: tryOnData.type,
        style_id: tryOnData.style_id,
        result_image_url: tryOnData.image_url,
        settings: tryOnData.settings,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, try_on_id: data.id };
    */

    return {
      success: true,
      try_on_id: 'mock-id',
    };
  } catch (error) {
    console.error('Error saving to gallery:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save',
    };
  }
}

/**
 * Get shareable link for a try-on
 */
export function getShareableLink(tryOnId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://beautytry-on.app';
  return `${baseUrl}/share/${tryOnId}`;
}

/**
 * Generate social media caption
 */
export function generateCaption(options: {
  style_type: 'hair' | 'nails';
  style_name: string;
  platform: SocialPlatform;
}): string {
  const { style_type, style_name, platform } = options;

  const emoji = style_type === 'hair' ? '💇✨' : '💅💖';
  const action = style_type === 'hair' ? 'hairstyle' : 'nail design';

  const captions: Record<SocialPlatform, string> = {
    twitter: `Just tried this amazing ${style_name} ${action} with @BeautyTryOn! ${emoji} #BeautyTryOn #VirtualTryOn`,

    instagram: `Loving this ${style_name} look! ${emoji}

Created with BeautyTryOn - the virtual beauty try-on app.

#BeautyTryOn #VirtualMakeup #BeautyTech #${style_type === 'hair' ? 'Hairstyle' : 'NailArt'}`,

    pinterest: `${style_name} - ${style_type === 'hair' ? 'Hairstyle' : 'Nail Design'} Inspiration | Try it yourself with BeautyTryOn ${emoji}`,

    facebook: `Check out this gorgeous ${style_name} ${action} I just tried! ${emoji}

You can try it too with BeautyTryOn - a free virtual beauty app.`,

    'copy-link': `${style_name} - Created with BeautyTryOn`,
  };

  return captions[platform];
}
