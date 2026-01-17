'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Share2, Download, Trash2, Plus, Grid3x3, List } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

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

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">My Gallery</h1>
          <p className="text-gray-600 mt-1">
            {MOCK_GALLERY_ITEMS.length} saved looks
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
          <TabsTrigger value="all">All ({MOCK_GALLERY_ITEMS.length})</TabsTrigger>
          <TabsTrigger value="hair">
            Hair ({MOCK_GALLERY_ITEMS.filter((i) => i.type === 'hair').length})
          </TabsTrigger>
          <TabsTrigger value="nails">
            Nails ({MOCK_GALLERY_ITEMS.filter((i) => i.type === 'nails').length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({MOCK_GALLERY_ITEMS.filter((i) => i.is_favorite).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <GalleryGrid items={MOCK_GALLERY_ITEMS} viewMode={viewMode} />
        </TabsContent>

        <TabsContent value="hair" className="mt-6">
          <GalleryGrid
            items={MOCK_GALLERY_ITEMS.filter((i) => i.type === 'hair')}
            viewMode={viewMode}
          />
        </TabsContent>

        <TabsContent value="nails" className="mt-6">
          <GalleryGrid
            items={MOCK_GALLERY_ITEMS.filter((i) => i.type === 'nails')}
            viewMode={viewMode}
          />
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <GalleryGrid
            items={MOCK_GALLERY_ITEMS.filter((i) => i.is_favorite)}
            viewMode={viewMode}
          />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {MOCK_GALLERY_ITEMS.length === 0 && (
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
}: {
  items: typeof MOCK_GALLERY_ITEMS;
  viewMode: 'grid' | 'list';
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
                    src={item.thumbnail}
                    alt={item.style_name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.style_name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{item.type} Try-On</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(item.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Heart
                      className={cn(
                        'w-4 h-4',
                        item.is_favorite && 'fill-brand-pink text-brand-pink'
                      )}
                    />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
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
                src={item.thumbnail}
                alt={item.style_name}
                width={400}
                height={400}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Favorite Badge */}
              {item.is_favorite && (
                <div className="absolute top-2 right-2">
                  <Heart className="w-5 h-5 fill-brand-pink text-brand-pink drop-shadow-lg" />
                </div>
              )}

              {/* Type Badge */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium capitalize shadow-sm">
                {item.type === 'hair' ? '💇 Hair' : '💅 Nails'}
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-white">
              <h3 className="font-semibold text-sm truncate">{item.style_name}</h3>
              <p className="text-xs text-gray-500 mt-1">{formatDate(item.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
