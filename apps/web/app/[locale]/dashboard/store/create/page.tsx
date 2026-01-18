'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    business_name: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    business_type: 'salon',
    specialties: [] as string[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from business name
      ...(name === 'business_name' && {
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      })
    }));
  };

  const handleSpecialtiesChange = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to create a store');
      }

      // Check if slug is available
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', formData.slug)
        .single();

      if (existingStore) {
        setError('This business name is already taken. Please choose a different one.');
        setLoading(false);
        return;
      }

      // Create store
      const { data: newStore, error: createError } = await supabase
        .from('stores')
        .insert([{
          owner_id: user.id,
          business_name: formData.business_name,
          slug: formData.slug,
          description: formData.description,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          business_type: formData.business_type,
          specialties: formData.specialties,
          subscription_tier: 'free',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Create team member entry for owner
      await supabase
        .from('store_team_members')
        .insert([{
          store_id: newStore.id,
          user_id: user.id,
          role: 'owner',
          display_name: formData.business_name,
          is_active: true,
        }]);

      // Redirect to store dashboard
      router.push('/dashboard/store');

    } catch (err: any) {
      setError(err.message || 'Failed to create store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dashboard/store">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-6 h-6 text-brand-purple" />
            Create Your Store
          </CardTitle>
          <CardDescription>
            Fill in your business details to start showcasing your styles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Business Information</h3>

              <div>
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  placeholder="Glamour Studio NYC"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Store URL *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">beautytry-on.app/stores/</span>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="glamour-studio-nyc"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-generated from business name</p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell customers about your salon..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="business_type">Business Type</Label>
                <select
                  id="business_type"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="salon">Hair Salon</option>
                  <option value="barbershop">Barbershop</option>
                  <option value="spa">Spa & Nails</option>
                  <option value="freelance">Freelance Stylist</option>
                </select>
              </div>

              <div>
                <Label>Specialties *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['hair', 'nails', 'color', 'styling', 'extensions', 'braids'].map(specialty => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => handleSpecialtiesChange(specialty)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        formData.specialties.includes(specialty)
                          ? 'bg-brand-purple text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="hello@yoursalon.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Location</h3>

              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                  />
                </div>

                <div>
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🎉 14-Day Free Trial</h4>
              <p className="text-sm text-gray-700">
                Start with our free plan and upgrade anytime. No credit card required.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" size="lg" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Store'}
              </Button>
              <Button type="button" variant="outline" size="lg" asChild>
                <Link href="/dashboard/store">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
