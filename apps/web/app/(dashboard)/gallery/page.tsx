'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Share2, Download, Trash2, Plus, Grid3x3, List } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Mock gallery items
const MOCK_GALLERY_ITEMS = [
  {
    id: '1',
    type: 'hair',
    thumbnail: '',
    style_name: 'Purple Dream',
    created_at: '2026-01-15T10:30:00Z',
    is_favorite: true,
  },
  {
    id: '2',
    type: 'nails',
    thumbnail: '',
    style_name: 'Rose Gold Glitter',
    created_at: '2026-01-14T15:20:00Z',
    is_favorite: false,
  },
  {
    id: '3',
    type: 'hair',
    thumbnail: '',
    style_name: 'Beach Waves',
    created_at: '2026-01-13T09:15:00Z',
    is_favorite: true,
  },
  {
    id: '4',
    type: 'nails',
    thumbnail: '',
    style_name: 'French Manicure',
    created_at: '2026-01-12T14:45:00Z',
    is_favorite: false,
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
                <Button>Try Hair Styles</Button>
                <Button variant="outline">Try Nail Designs</Button>
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
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex-shrink-0" />
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
            <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative">
              {/* Placeholder for actual image */}
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                {item.type === 'hair' ? '💇' : '💅'}
              </div>

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
                  <Heart className="w-5 h-5 fill-brand-pink text-brand-pink drop-shadow" />
                </div>
              )}

              {/* Type Badge */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium capitalize">
                {item.type}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-semibold text-sm truncate">{item.style_name}</h3>
              <p className="text-xs text-gray-500 mt-1">{formatDate(item.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
