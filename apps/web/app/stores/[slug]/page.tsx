'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Star, Phone, Mail, Calendar, ExternalLink, Camera } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

interface Store {
  id: string;
  business_name: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  specialties: string[];
  rating: number;
  review_count: number;
  total_styles: number;
}

interface HairStyle {
  id: string;
  name: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  price: number | null;
  duration_minutes: number | null;
  tags: string[];
}

interface NailStyle {
  id: string;
  name: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  price: number | null;
  duration_minutes: number | null;
  tags: string[];
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [store, setStore] = useState<Store | null>(null);
  const [hairStyles, setHairStyles] = useState<HairStyle[]>([]);
  const [nailStyles, setNailStyles] = useState<NailStyle[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStoreData() {
      const supabase = createClient();

      // Fetch store
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (!storeData) {
        router.push('/stores');
        return;
      }

      setStore(storeData);

      // Fetch hair styles
      const { data: hairData } = await supabase
        .from('store_hair_styles')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (hairData) setHairStyles(hairData);

      // Fetch nail styles
      const { data: nailData } = await supabase
        .from('store_nail_styles')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (nailData) setNailStyles(nailData);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          created_at,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('store_id', storeData.id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsData) setReviews(reviewsData as any);

      setLoading(false);
    }

    if (slug) {
      fetchStoreData();
    }
  }, [slug, router]);

  const handleBookAppointment = () => {
    // TODO: Open booking modal in future phase
    toast.info('Booking system coming soon! Please call or email the salon to book an appointment.');
  };

  const handleCall = () => {
    if (!store?.phone) {
      toast.error('Phone number not available');
      return;
    }

    // Clean phone number and open dialer
    const cleanPhone = store.phone.replace(/\D/g, '');
    window.location.href = `tel:${cleanPhone}`;
    toast.success('Opening phone dialer...');
  };

  const handleEmail = () => {
    if (!store?.email) {
      toast.error('Email address not available');
      return;
    }

    // Open email client with pre-filled subject
    const subject = encodeURIComponent(`Inquiry about ${store.business_name}`);
    const body = encodeURIComponent(`Hi ${store.business_name},\n\nI'm interested in booking an appointment.\n\nThank you!`);
    window.location.href = `mailto:${store.email}?subject=${subject}&body=${body}`;
    toast.success('Opening email client...');
  };

  const handleTryOnHair = (style: HairStyle) => {
    // Save style to session storage for try-on page to use
    sessionStorage.setItem('selectedHairStyle', JSON.stringify({
      id: style.id,
      name: style.name,
      category: style.category,
      color_base: '#8B5CF6', // Default color
      thumbnail_url: style.thumbnail_url,
      is_premium: false,
    }));

    toast.success(`Redirecting to hair try-on with ${style.name}...`);
    router.push('/dashboard/hair');
  };

  const handleTryOnNails = (style: NailStyle) => {
    // Save style to session storage
    sessionStorage.setItem('selectedNailStyle', JSON.stringify({
      id: style.id,
      name: style.name,
      color_code: '#DC143C', // Default color
      category: style.category,
    }));

    toast.success(`Redirecting to nail try-on with ${style.name}...`);
    router.push('/dashboard/nails');
  };

  const handleBookStyle = (style: HairStyle | NailStyle, type: 'hair' | 'nails') => {
    // TODO: Open booking modal with this style pre-selected in future phase
    toast.info(`To book "${style.name}", please call or email ${store?.business_name}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading salon...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-80 bg-gradient-to-r from-purple-400 to-pink-400">
        {store.cover_image_url && (
          <Image
            src={store.cover_image_url}
            alt={store.business_name}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Store Info */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                {store.logo_url ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-4 border-white shadow-xl bg-white">
                    <Image
                      src={store.logo_url}
                      alt={store.business_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                    {store.business_name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{store.business_name}</h1>

                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{store.rating.toFixed(1)}</span>
                    <span className="text-gray-600">({store.review_count} reviews)</span>
                  </div>

                  {store.city && store.state && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {store.city}, {store.state}
                    </div>
                  )}

                  <div className="text-gray-600">
                    {store.total_styles} styles
                  </div>
                </div>

                {store.description && (
                  <p className="text-gray-700 mb-4">{store.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {store.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Button size="lg" className="gap-2" onClick={handleBookAppointment}>
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </Button>
                  {store.phone && (
                    <Button variant="outline" size="lg" className="gap-2" onClick={handleCall}>
                      <Phone className="w-4 h-4" />
                      Call
                    </Button>
                  )}
                  {store.email && (
                    <Button variant="outline" size="lg" className="gap-2" onClick={handleEmail}>
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="hair" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="hair">Hair ({hairStyles.length})</TabsTrigger>
            <TabsTrigger value="nails">Nails ({nailStyles.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          {/* Hair Styles */}
          <TabsContent value="hair" className="mt-6">
            {hairStyles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No hair styles available yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hairStyles.map((style) => (
                  <Card key={style.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-64 bg-gray-200">
                      {style.thumbnail_url && (
                        <Image
                          src={style.thumbnail_url}
                          alt={style.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute top-3 right-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1"
                          onClick={() => handleTryOnHair(style)}
                        >
                          <Camera className="w-3 h-3" />
                          Try On
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{style.name}</h3>
                      {style.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {style.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          {style.price && (
                            <div className="font-semibold text-brand-purple">
                              ${style.price.toFixed(0)}
                            </div>
                          )}
                          {style.duration_minutes && (
                            <div className="text-xs text-gray-500">
                              {style.duration_minutes} min
                            </div>
                          )}
                        </div>
                        <Button size="sm" onClick={() => handleBookStyle(style, 'hair')}>
                          Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Nail Styles */}
          <TabsContent value="nails" className="mt-6">
            {nailStyles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No nail styles available yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nailStyles.map((style) => (
                  <Card key={style.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-64 bg-gray-200">
                      {style.thumbnail_url && (
                        <Image
                          src={style.thumbnail_url}
                          alt={style.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute top-3 right-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1"
                          onClick={() => handleTryOnNails(style)}
                        >
                          <Camera className="w-3 h-3" />
                          Try On
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{style.name}</h3>
                      {style.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {style.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          {style.price && (
                            <div className="font-semibold text-brand-pink">
                              ${style.price.toFixed(0)}
                            </div>
                          )}
                          {style.duration_minutes && (
                            <div className="text-xs text-gray-500">
                              {style.duration_minutes} min
                            </div>
                          )}
                        </div>
                        <Button size="sm" onClick={() => handleBookStyle(style, 'nails')}>
                          Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="mt-6">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No reviews yet. Be the first to review!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {review.profiles?.avatar_url ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                              <Image
                                src={review.profiles.avatar_url}
                                alt="User"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                              {review.profiles?.full_name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {review.profiles?.full_name || 'Anonymous'}
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.title && (
                            <h4 className="font-semibold mb-1">{review.title}</h4>
                          )}
                          {review.comment && (
                            <p className="text-gray-700">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
