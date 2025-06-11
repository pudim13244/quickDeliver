import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserProfile, type UserProfile } from '@/services/dataService';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PersonalInfo() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const { data: profile, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ['userProfile', user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: isAuthenticated && !!user?.id,
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Informações Pessoais" showBack />
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <p className="text-red-600">Ocorreu um erro ao carregar suas informações.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Informações Pessoais" showBack />
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-marjoriatira-100 flex items-center justify-center mb-2 border-4 border-marjoriatira-500">
            <User className="w-16 h-16 text-marjoriatira-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{profile?.name || 'Usuário'}</h2>
          <span className="text-sm text-gray-500">{profile?.email}</span>
        </div>
        <Card className="bg-white rounded-2xl shadow">
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>Veja suas informações cadastradas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={profile?.name || ''} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={profile?.email || ''} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={profile?.phone || ''} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={Array.isArray(profile?.address) && profile.address.length > 0 ? (profile.address.find(addr => addr.isDefault)?.fullAddress || profile.address[0].fullAddress) : ''} readOnly className="mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 