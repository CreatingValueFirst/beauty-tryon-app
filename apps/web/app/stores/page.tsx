'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, TrendingUp, Store, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface StoreType {
  id: string;
  business_name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  cover_image_url: string | null;
  city: string | null;
  state: string | null;
  specialties: string[];
  rating: number;
  review_count: number;
  total_styles: number;
  is_featured: boolean;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      const supabase = createClient();

      const { data } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (data) {
        setStores(data);
        setFilteredStores(data);
      }

      setLoading(false);
    }

    fetchStores();
  }, []);

  useEffect(() => {
    let filtered = stores;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(store =>
        store.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(store =>
        store.specialties.includes(selectedSpecialty)
      );
    }

    setFilteredStores(filtered);
  }, [searchQuery, selectedSpecialty, stores]);

  const specialties = ['hair', 'nails', 'color', 'styling', 'extensions', 'braids'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Salons
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Browse styles from top-rated salons and book your next appointment
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl bg-white rounded-lg p-2 flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Search salons, cities, or styles..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button
              size="lg"
              className="bg-brand-purple hover:bg-brand-purple/90"
              onClick={() => {
                if (!searchQuery) {
                  document.querySelector<HTMLInputElement>('input')?.focus();
                }
              }}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant={selectedSpecialty === null ? 'default' : 'outline'}
              onClick={() => setSelectedSpecialty(null)}
              size="sm"
            >
              All
            </Button>
            {specialties.map((specialty) => (
              <Button
                key={specialty}
                variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                onClick={() => setSelectedSpecialty(specialty)}
                size="sm"
                className="capitalize"
              >
                {specialty}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Store className="w-8 h-8 mx-auto mb-2 text-brand-purple" />
              <div className="text-2xl font-bold">{stores.length}</div>
              <div className="text-sm text-gray-600">Active Salons</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-brand-pink" />
              <div className="text-2xl font-bold">
                {stores.reduce((sum, s) => sum + s.total_styles, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Styles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">
                {stores.length > 0
                  ? (stores.reduce((sum, s) => sum + s.rating, 0) / stores.length).toFixed(1)
                  : '0.0'}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">
                {new Set(stores.map(s => s.city).filter(Boolean)).size}
              </div>
              <div className="text-sm text-gray-600">Cities</div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="mb-4 text-gray-600">
          {filteredStores.length} salon{filteredStores.length !== 1 ? 's' : ''} found
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No salons found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters
              </p>
              <Button onClick={() => { setSearchQuery(''); setSelectedSpecialty(null); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <Link key={store.id} href={`/stores/${store.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
                  {/* Cover Image */}
                  <div className="relative h-48 bg-gradient-to-r from-purple-400 to-pink-400">
                    {store.cover_image_url && (
                      <Image
                        src={store.cover_image_url}
                        alt={store.business_name}
                        fill
                        className="object-cover"
                      />
                    )}
                    {store.is_featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Logo & Name */}
                    <div className="flex items-start gap-3 mb-3">
                      {store.logo_url ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md -mt-8 bg-white">
                          <Image
                            src={store.logo_url}
                            alt={store.business_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl -mt-8 shadow-md">
                          {store.business_name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg leading-tight">
                          {store.business_name}
                        </h3>
                        {store.city && store.state && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            {store.city}, {store.state}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {store.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {store.description}
                      </p>
                    )}

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {store.specialties.slice(0, 3).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs capitalize"
                        >
                          {specialty}
                        </span>
                      ))}
                      {store.specialties.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{store.specialties.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{store.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">
                          ({store.review_count})
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {store.total_styles} style{store.total_styles !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
