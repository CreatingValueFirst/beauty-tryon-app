'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Share2, Download, Trash2, Plus, Grid3x3, List, Loader2, Scissors, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Sample gallery items with professional images
const MOCK_GALLERY_ITEMS = [
  {
    id: '1',
    type: 'hair',
    thumbnail: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&h=800&fit=crop',
    style_name: 'Platinum Blonde Pixie',
    created_at: '2026-01-15T10:30:00Z',
    is_favorite: true,
  },
  {
    id: '2',
    type: 'nails',
    thumbnail: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=800&fit=crop',
    style_name: 'Rose Gold Glitter',
    created_at: '2026-01-14T15:20:00Z',
    is_favorite: false,
  },
  {
    id: '3',
    type: 'hair',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop',
    style_name: 'Beach Waves',
    created_at: '2026-01-13T09:15:00Z',
    is_favorite: true,
  },
  {
    id: '4',
    type: 'nails',
    thumbnail: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&h=800&fit=crop',
    style_name: 'Classic French Manicure',
    created_at: '2026-01-12T14:45:00Z',
    is_favorite: false,
  },
  {
    id: '5',
    type: 'hair',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=800&fit=crop',
    style_name: 'Sleek Brunette Bob',
    created_at: '2026-01-11T16:20:00Z',
    is_favorite: true,
  },
  {
    id: '6',
    type: 'nails',
    thumbnail: 'https://images.unsplash.com/photo-1599948128020-9a44d19d5f5a?w=800&h=800&fit=crop',
    style_name: 'Silver Glitter',
    created_at: '2026-01-10T11:30:00Z',
    is_favorite: false,
  },
  {
    id: '7',
    type: 'hair',
    thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=800&fit=crop',
    style_name: 'Mermaid Waves',
    created_at: '2026-01-09T13:45:00Z',
    is_favorite: true,
  },
  {
    id: '8',
    type: 'nails',
    thumbnail: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&h=800&fit=crop',
    style_name: 'Floral Nail Art',
    created_at: '2026-01-08T09:00:00Z',
    is_favorite: false,
  },
  {
    id: '9',
    type: 'hair',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop',
    style_name: 'Textured Lob',
    created_at: '2026-01-07T14:15:00Z',
    is_favorite: false,
  },
  {
    id: '10',
    type: 'nails',
    thumbnail: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&h=800&fit=crop',
    style_name: 'Rose Glitter Ombre',
    created_at: '2026-01-06T10:30:00Z',
    is_favorite: true,
  },
  {
    id: '11',
    type: 'hair',
    thumbnail: 'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?w=800&h=800&fit=crop',
    style_name: 'Bohemian Curls',
    created_at: '2026-01-05T15:45:00Z',
    is_favorite: false,
  },
  {
    id: '12',
    type: 'nails',
    thumbnail: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&h=800&fit=crop',
    style_name: 'Gold French Tips',
    created_at: '2026-01-04T12:00:00Z',
    is_favorite: true,
  },
];

interface GalleryItem {
  id: string;
  type: 'hair' | 'nails';
  result_image_url: string;
  created_at: string;
  is_favorite: boolean;
  settings?: any;
}

export default function GalleryPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch gallery items on mount
  useEffect(() => {
    async function fetchGalleryItems() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          toast.error('Please log in to view your gallery');
          router.push('/login');
          return;
        }

        setUserId(user.id);

        // Fetch try-ons from database
        const { data, error } = await supabase
          .from('try_ons')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setGalleryItems(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch gallery items:', error);
        toast.error('Failed to load gallery');
        setLoading(false);
      }
    }

    fetchGalleryItems();
  }, [router]);

  const handleToggleFavorite = async (itemId: string, currentValue: boolean) => {
    if (!userId) return;

    // Optimistic update
    setGalleryItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, is_favorite: !currentValue } : item
      )
    );

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('try_ons')
        .update({ is_favorite: !currentValue })
        .eq('id', itemId);

      if (error) throw error;

      toast.success(
        !currentValue
          ? 'Added to favorites'
          : 'Removed from favorites'
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert on error
      setGalleryItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, is_favorite: currentValue } : item
        )
      );
      toast.error('Failed to update favorite');
    }
  };

  const handleShare = async (item: GalleryItem) => {
    const shareUrl = window.location.origin;
    const shareText = `Check out my ${item.type} try-on!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Try-On',
          text: shareText,
          url: shareUrl
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          await handleCopyLink(shareUrl);
        }
      }
    } else {
      await handleCopyLink(shareUrl);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownload = async (item: GalleryItem) => {
    try {
      const response = await fetch(item.result_image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beautytry-on-${item.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded successfully!');
    } catch (error) {
      console.error('Failed to download:', error);
      toast.error('Failed to download image');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!userId) return;

    // Confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete this try-on? This action cannot be undone.'
    );
    if (!confirmed) return;

    // Optimistic update - remove from UI immediately
    setGalleryItems(prev => prev.filter(item => item.id !== itemId));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('try_ons')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Deleted successfully');
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete. Please try again.');
      // Re-fetch on error to restore correct state
      const supabase = createClient();
      const { data } = await supabase
        .from('try_ons')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (data) setGalleryItems(data);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">My Gallery</h1>
          <p className="text-gray-600 mt-1">
            {galleryItems.length} saved looks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode('grid')}>
            <Grid3x3 className={cn('w-4 h-4', viewMode === 'grid' && 'text-brand-purple')} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setViewMode('list')}>
            <List className={cn('w-4 h-4', viewMode === 'list' && 'text-brand-purple')} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({galleryItems.length})</TabsTrigger>
          <TabsTrigger value="hair">
            Hair ({galleryItems.filter((i) => i.type === 'hair').length})
          </TabsTrigger>
          <TabsTrigger value="nails">
            Nails ({galleryItems.filter((i) => i.type === 'nails').length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({galleryItems.filter((i) => i.is_favorite).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <GalleryGrid
            items={galleryItems}
            viewMode={viewMode}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="hair" className="mt-6">
          <GalleryGrid
            items={galleryItems.filter((i) => i.type === 'hair')}
            viewMode={viewMode}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="nails" className="mt-6">
          <GalleryGrid
            items={galleryItems.filter((i) => i.type === 'nails')}
            viewMode={viewMode}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <GalleryGrid
            items={galleryItems.filter((i) => i.is_favorite)}
            viewMode={viewMode}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {galleryItems.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No saved looks yet</h3>
              <p className="text-gray-600 mb-6">
                Start trying on hair styles and nail designs to save your favorites here.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/dashboard/hair">
                  <Button>Try Hair Styles</Button>
                </Link>
                <Link href="/dashboard/nails">
                  <Button variant="outline">Try Nail Designs</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GalleryGrid({
  items,
  viewMode,
  onToggleFavorite,
  onShare,
  onDownload,
  onDelete,
}: {
  items: GalleryItem[];
  viewMode: 'grid' | 'list';
  onToggleFavorite: (itemId: string, currentValue: boolean) => void;
  onShare: (item: GalleryItem) => void;
  onDownload: (item: GalleryItem) => void;
  onDelete: (itemId: string) => void;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100">
                  <Image
                    src={item.result_image_url}
                    alt={`${item.type} try-on`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate capitalize">{item.type} Try-On</h3>
                  <p className="text-sm text-gray-600">Saved look</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(item.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleFavorite(item.id, item.is_favorite)}
                    title={item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={cn(
                        'w-4 h-4',
                        item.is_favorite && 'fill-brand-pink text-brand-pink'
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onShare(item)}
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownload(item)}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all">
          <CardContent className="p-0">
            {/* Thumbnail */}
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <Image
                src={item.result_image_url}
                alt={`${item.type} try-on`}
                width={400}
                height={400}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => onShare(item)}
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => onDownload(item)}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => onDelete(item.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Favorite Badge - Clickable */}
              <button
                className="absolute top-2 right-2 z-10"
                onClick={() => onToggleFavorite(item.id, item.is_favorite)}
                title={item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={cn(
                    'w-5 h-5 drop-shadow-lg transition-all hover:scale-110',
                    item.is_favorite
                      ? 'fill-brand-pink text-brand-pink'
                      : 'fill-white/50 text-white/50 hover:fill-white hover:text-white'
                  )}
                />
              </button>

              {/* Type Badge */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium capitalize shadow-sm flex items-center gap-1">
                {item.type === 'hair' ? (
                  <>
                    <Scissors className="w-3 h-3" />
                    <span>Hair</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Nails</span>
                  </>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-white">
              <h3 className="font-semibold text-sm truncate capitalize">{item.type} Try-On</h3>
              <p className="text-xs text-gray-500 mt-1">{formatDate(item.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
