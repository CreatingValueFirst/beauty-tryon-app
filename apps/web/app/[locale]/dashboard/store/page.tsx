'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Store, TrendingUp, Calendar, Star } from 'lucide-react';
import Link from 'next/link';

interface StoreData {
  id: string;
  business_name: string;
  slug: string;
  subscription_tier: string;
  total_styles: number;
  total_bookings: number;
  rating: number;
  review_count: number;
}

export default function StoreDashboardPage() {
  const router = useRouter();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(false);

  useEffect(() => {
    async function checkStore() {
      const supabase = createClient();

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirect=/dashboard/store');
        return;
      }

      // Check if user has a store
      const { data: storeData } = await supabase
        .from('stores')
        .select('id, business_name, slug, subscription_tier, total_styles, total_bookings, rating, review_count')
        .eq('owner_id', user.id)
        .single();

      if (storeData) {
        setStore(storeData);
        setHasStore(true);
      }

      setLoading(false);
    }

    checkStore();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your store...</p>
        </div>
      </div>
    );
  }

  if (!hasStore) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <Store className="w-16 h-16 mx-auto text-brand-purple mb-4" />
            <CardTitle className="text-3xl">Welcome to Store Dashboard</CardTitle>
            <CardDescription className="text-lg">
              Start earning by showcasing your hair and nail styles to thousands of customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-brand-purple">1000+</div>
                  <div className="text-sm text-gray-600 mt-1">Active Customers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-brand-pink">500+</div>
                  <div className="text-sm text-gray-600 mt-1">Partner Salons</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-brand-purple">$2.5M+</div>
                  <div className="text-sm text-gray-600 mt-1">Monthly Bookings</div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">What you get:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-brand-purple">✓</span>
                  <span>Showcase unlimited hair and nail styles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-purple">✓</span>
                  <span>Accept bookings directly from customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-purple">✓</span>
                  <span>Analytics dashboard to track performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-purple">✓</span>
                  <span>Build your brand and grow your business</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/dashboard/store/create">
                  <Store className="w-5 h-5 mr-2" />
                  Create Your Store
                </Link>
              </Button>
              <p className="text-sm text-gray-500 mt-3">Free for 14 days • No credit card required</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">{store.business_name}</h1>
          <p className="text-gray-600 mt-1">Store Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/stores/${store.slug}`}>View Public Page</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/store/styles/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Style
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Styles</p>
                <p className="text-2xl font-bold mt-1">{store.total_styles}</p>
              </div>
              <Store className="w-8 h-8 text-brand-purple" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold mt-1">{store.total_bookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-brand-pink" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold mt-1">{store.rating.toFixed(1)}</p>
                <p className="text-xs text-gray-500">{store.review_count} reviews</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subscription</p>
                <p className="text-2xl font-bold mt-1 capitalize">{store.subscription_tier}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/store/styles')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-brand-purple" />
              Manage Styles
            </CardTitle>
            <CardDescription>
              Add, edit, or remove hair and nail styles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View All Styles</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/store/bookings')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-pink" />
              Bookings
            </CardTitle>
            <CardDescription>
              Manage appointments and customer requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Bookings</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/store/analytics')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Analytics
            </CardTitle>
            <CardDescription>
              Track views, try-ons, and conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Analytics</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Your bookings and try-ons will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
