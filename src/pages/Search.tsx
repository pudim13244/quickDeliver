import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search as SearchIcon, Filter, Star, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { fetchRestaurants, EstablishmentDetail, fetchCategories, Category } from '@/services/dataService';

const Search = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Fetch categories using React Query
  const { data: categories, isLoading: isLoadingCategories, error: errorCategories } = useQuery<Category[]>(
    { queryKey: ['categories'], queryFn: fetchCategories }
  );

  // Fetch restaurants using React Query
  const { data: restaurants, isLoading: isLoadingRestaurants, error: errorRestaurants } = useQuery<EstablishmentDetail[]>(
    { queryKey: ['restaurants'], queryFn: fetchRestaurants }
  );

  // Tratar estados de carregamento e erro
  if (isLoadingCategories || isLoadingRestaurants) {
    return <div>Carregando...</div>;
  }

  if (errorCategories || errorRestaurants) {
    console.error('Erro ao buscar dados:', errorCategories || errorRestaurants);
    return <div>Ocorreu um erro ao carregar os dados.</div>;
  }

  // Garantir que categories e restaurants não sejam undefined após o carregamento
  const categoriesData = categories || [];
  const restaurantsData = restaurants || [];

  const filteredRestaurants = restaurantsData.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (restaurant.cuisine_type && restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || (restaurant.cuisine_type && restaurant.cuisine_type.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Buscar" showBack />
      
      <div className="max-w-md mx-auto px-4 pb-20">
        {/* Search Bar */}
        <div className="py-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por restaurante ou comida"
              className="pl-10 pr-4 py-3 rounded-full border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Categorias</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              key="all"
              variant={selectedCategory === 'all' ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0 rounded-full"
              onClick={() => setSelectedCategory('all')}
            >
              Todos
            </Button>
            {categoriesData.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name.toLowerCase() ? "default" : "outline"}
                size="sm"
                className="flex-shrink-0 rounded-full"
                onClick={() => setSelectedCategory(category.name.toLowerCase())}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {filteredRestaurants.length} restaurantes encontrados
          </p>
          
          <div className="space-y-3">
            {filteredRestaurants.map((restaurant) => (
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

export default Search;
