import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Star, ChevronRight, Pizza, Sandwich, Coffee, Cake, UtensilsCrossed, Salad, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchRestaurants, Category, EstablishmentDetail, fetchUserProfile, UserProfile } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';

const categoryIcons: { [key: string]: React.ElementType } = {
  'pizzaria': Pizza,
  'lanches': Sandwich,
  'brasileira': UtensilsCrossed,
  'japonesa': UtensilsCrossed,
  'doces': Cake,
  'sobremesas': Cake,
  'bebidas': Coffee,
  'pratos principais': UtensilsCrossed,
  'saladas': Salad,
  // Adicione mais mapeamentos conforme necessário
};

const Index = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Fetch user profile
  const { data: userProfile, isLoading: isLoadingUserProfile, isError: isErrorUserProfile } = useQuery<UserProfile>({
    queryKey: ['userProfile', user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: isAuthenticated && !!user?.id, // Only fetch if user is authenticated and ID is available
  });

  // Fetch categories using React Query
  const { data: categories, isLoading: isLoadingCategories, error: errorCategories } = useQuery<Category[]>(
    { queryKey: ['categories'], queryFn: fetchCategories }
  );

  // Fetch restaurants using React Query
  const { data: restaurants, isLoading: isLoadingRestaurants, error: errorRestaurants } = useQuery<EstablishmentDetail[]>(
    { queryKey: ['restaurants'], queryFn: fetchRestaurants }
  );

  // Dados mockados para promoções (manter por enquanto)
  const promos = [
    {
      id: 1,
      title: 'Frete Grátis',
      subtitle: 'Em pedidos acima de R$ 30',
      image: '/placeholder.svg',
      color: 'bg-gradient-to-r from-marjoriatira-500 to-marjoriatira-600'
    },
    {
      id: 2,
      title: '20% OFF',
      subtitle: 'Na primeira compra',
      image: '/placeholder.svg',
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
  ];

  // Tratar estados de carregamento
  if (authLoading || isLoadingCategories || isLoadingRestaurants || isLoadingUserProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Tratar erros
  if (isErrorUserProfile || errorCategories || errorRestaurants) {
    console.error('Erro ao buscar dados:', isErrorUserProfile || errorCategories || errorRestaurants);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Início" />
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <p className="text-red-600">Ocorreu um erro ao carregar os dados.</p>
        </div>
      </div>
    );
  }

  const categoriesData = categories || [];
  const restaurantsData = restaurants || [];
  const displayAddress = userProfile?.address && Array.isArray(userProfile.address) && userProfile.address.length > 0
    ? (userProfile.address.find(addr => addr.isDefault) || userProfile.address[0]).fullAddress
    : 'Endereço não definido';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Location Banner */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <MapPin className="w-5 h-5 text-primary-500" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Entregar em</p>
            <p className="font-medium text-gray-900">{displayAddress}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/address')}>
            Alterar
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-20">
        {/* Search Bar */}
        <div className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por restaurante ou comida"
              className="pl-10 pr-4 py-3 rounded-full border-gray-300"
              onClick={() => window.location.href = '/search'}
            />
          </div>
        </div>

        {/* Promos */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-3">
            {promos.map((promo) => (
              <Card key={promo.id} className="flex-shrink-0 w-64 overflow-hidden">
                <div className={`${promo.color} text-white p-4 h-24 flex items-center justify-between`}>
                  <div>
                    <h3 className="font-bold text-lg">{promo.title}</h3>
                    <p className="text-sm opacity-90">{promo.subtitle}</p>
                  </div>
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Categorias</h2>
          <div className="flex overflow-x-auto gap-3 pb-3">
            {categoriesData.map((category) => {
              const IconComponent = categoryIcons[category.name.toLowerCase()] || UtensilsCrossed; // Padrão se não encontrar
              return (
                <Link
                  key={category.id}
                  to={{ pathname: "/search", search: `?category=${category.name}` }}
                  className="w-32 flex-shrink-0 flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-marjoriatira-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gray-200 text-marjoriatira-500">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Restaurants */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Restaurantes próximos</h2>
          <div className="space-y-3">
            {restaurantsData.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/restaurant/${restaurant.id}`}
                className="block"
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img
                      src={restaurant.image || '/placeholder-restaurant.png'}
                      alt={restaurant.name}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine_type}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{restaurant.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{restaurant.deliveryTime || 'N/A'}</span>
                      </div>
                      <span>{restaurant.deliveryFee === 0 ? 'Grátis' : `R$ ${restaurant.deliveryFee?.toFixed(2).replace('.', ',') || 'N/A'}`}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
