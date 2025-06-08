import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { fetchEstablishmentDetail, fetchProductsByEstablishment, fetchOptionGroupsByProduct, EstablishmentDetail, Product, OptionGroup, Option } from '@/services/dataService';

const Restaurant = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{
    [groupId: number]: number[]; // { [id do grupo de opção]: [ids das opções selecionadas] }
  }>({});
  const [observations, setObservations] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  const { data: restaurant, isLoading: isLoadingRestaurant, error: errorRestaurant } = useQuery<EstablishmentDetail>({
    queryKey: ['establishment', id],
    queryFn: () => fetchEstablishmentDetail(id as string),
    enabled: !!id,
  });

  const { data: products, isLoading: isLoadingProducts, error: errorProducts } = useQuery<Product[]>({
    queryKey: ['establishment-products', id],
    queryFn: () => fetchProductsByEstablishment(id as string),
    enabled: !!id,
  });

  const { data: optionGroups, isLoading: isLoadingOptionGroups, error: errorOptionGroups } = useQuery<OptionGroup[]>({
    queryKey: ['product-option-groups', selectedItem?.id],
    queryFn: () => fetchOptionGroupsByProduct(selectedItem!.id.toString()),
    enabled: !!selectedItem?.id,
  });

  React.useEffect(() => {
    setSelectedOptions({});
    setItemQuantity(1);
    setObservations('');
  }, [selectedItem]);

  const handleOptionChange = (groupId: number, optionId: number, isChecked: boolean) => {
    setSelectedOptions(prev => {
      const groupSelections = prev[groupId] || [];
      const optionGroup = optionGroups?.find(group => group.id === groupId);

      if (!optionGroup) return prev; // Should not happen if data is loaded

      let newGroupSelections;
      if (isChecked) {
        // Check max selections
        if (optionGroup.max_selections === 1) {
           // If only one selection allowed, replace the existing one
          newGroupSelections = [optionId];
        } else {
          // If multiple selections allowed, add the new option
           if (groupSelections.length < (optionGroup.max_selections || Infinity)) {
             newGroupSelections = [...groupSelections, optionId];
           } else {
             newGroupSelections = groupSelections; // Do not add if max reached
           }
        }
      } else {
        // Remove the option
        newGroupSelections = groupSelections.filter(id => id !== optionId);
      }
       // Check min selections (optional - can be enforced on backend or validation before adding to cart)
      if (optionGroup.is_required && newGroupSelections.length < (optionGroup.min_selections || 1)) {
         console.warn(`Minimum selections for ${optionGroup.name} not met.`); // Or show a user-friendly message
      }

      return {
        ...prev,
        [groupId]: newGroupSelections
      };
    });
  };

  const handleAddToCart = () => {
    if (!selectedItem || !restaurant || !optionGroups) return;

    // Basic validation for required groups
     const isValid = optionGroups.every(group => {
      if (group.is_required && (!selectedOptions[group.id] || selectedOptions[group.id].length < (group.min_selections || 1))) {
         toast.error(`Selecione pelo menos ${group.min_selections || 1} opção para ${group.name}`);
         return false;
       }
       // Check max selections only if some options are selected for this group
       if (selectedOptions[group.id] && selectedOptions[group.id].length > (group.max_selections || Infinity)) {
          toast.error(`Selecione no máximo ${group.max_selections || 1} opção para ${group.name}`);
          return false;
       }
       return true;
     });

     if (!isValid) return;

    // Construir a lista de opções selecionadas com detalhes (nome, preço)
    const selectedOptionsDetails = Object.keys(selectedOptions).reduce((details, groupIdStr) => {
      const groupId = parseInt(groupIdStr);
      const selectedOptionIds = selectedOptions[groupId] || [];
      const optionGroup = optionGroups.find(group => group.id === groupId);

      if (!optionGroup || !optionGroup.options) return details; // Should not happen if data is correct

      const optionsInGroup = optionGroup.options;
      const selected = optionsInGroup.filter(option => selectedOptionIds.includes(option.id));

      return [...details, ...selected.map(option => ({ // Adiciona nome e preço das opções selecionadas
         id: option.id,
         name: option.name,
         additional_price: option.additional_price || 0,
         groupId: groupId,
      }))];
    }, [] as {id: number; name: string; additional_price: number; groupId: number}[]);

    // Calcular preço total incluindo adicionais das opções
    const optionsTotal = selectedOptionsDetails.reduce((sum, option) => sum + (option.additional_price || 0), 0);
    const itemTotal = (selectedItem.price + optionsTotal) * itemQuantity;

    addItem({
      id: `${selectedItem.id}-${Date.now()}`,
      name: selectedItem.name,
      price: Number(selectedItem.price || 0),
      restaurantId: restaurant.id.toString(),
      restaurantName: restaurant.name,
      image: selectedItem.image_url || '',
      customizations: selectedOptionsDetails, // Passar detalhes das opções selecionadas
      observations: observations.trim() || undefined,
      quantity: itemQuantity,
    });

    toast.success(`${itemQuantity} ${selectedItem.name} adicionado(s) ao carrinho!`);
    setSelectedItem(null); // Fechar modal
    setSelectedOptions({});
    setObservations('');
    setItemQuantity(1);
  };

  const handleQuantityChange = (amount: number) => {
    setItemQuantity(prev => Math.max(1, prev + amount));
  };

  if (isLoadingRestaurant || isLoadingProducts) {
    return <div>Carregando restaurante...</div>;
  }

  if (errorRestaurant || errorProducts) {
    console.error('Erro ao buscar dados do restaurante:', errorRestaurant || errorProducts);
    return <div>Ocorreu um erro ao carregar os dados do restaurante.</div>;
  }

  if (!restaurant) {
    return <div>Restaurante não encontrado.</div>;
  }

  const menuSections = products ? products.reduce((acc, product) => {
    const categoryName = product.category_name || 'Outros';
    const existingSection = acc.find(section => section.name === categoryName);

    if (existingSection) {
      existingSection.items.push(product);
    } else {
      acc.push({ id: product.category_id, name: categoryName, items: [product] });
    }
    return acc;
  }, [] as { id: number; name: string; items: Product[] }[]) : [];

  const currentItemPrice = selectedItem ? Number(selectedItem.price || 0) : 0;
  const selectedOptionsTotal = selectedItem && optionGroups ?
    Object.keys(selectedOptions).reduce((sum, groupIdStr) => {
      const groupId = parseInt(groupIdStr);
      const selectedOptionIds = selectedOptions[groupId] || [];
      const optionGroup = optionGroups.find(group => group.id === groupId);

      if (!optionGroup || !optionGroup.options) return sum;

      const optionsInGroup = optionGroup.options;
      const selected = optionsInGroup.filter(option => selectedOptionIds.includes(option.id));

      return sum + selected.reduce((optionSum, option) => optionSum + Number(option.additional_price || 0), 0);
    }, 0)
    : 0;
  const modalItemTotal = (currentItemPrice + selectedOptionsTotal) * itemQuantity;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={restaurant.name} showBack />
      
      <div className="max-w-md mx-auto">
        <div className="bg-white">
          <img
            src={restaurant.image || '/placeholder-restaurant-banner.png'}
            alt={restaurant.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-gray-600 mb-2">{restaurant.description || 'Sem descrição.'}</p>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      restaurant.rating && i < restaurant.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span>{restaurant.rating?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{restaurant.deliveryTime || 'N/A'}</span>
              </div>
              <span>{restaurant.deliveryFee === 0 ? 'Grátis' : `R$ ${restaurant.deliveryFee?.toFixed(2).replace('.', ',') || 'N/A'}`}</span>
              <span>N/A</span>
            </div>
            {restaurant.address && <p className="text-sm text-gray-600 mt-2">Endereço: {restaurant.address}</p>}
            {restaurant.phone && <p className="text-sm text-gray-600">Contato: {restaurant.phone}</p>}
            {restaurant.business_hours && <p className="text-sm text-gray-600">Horário: {restaurant.business_hours}</p>}
          </div>
        </div>

        <div className="px-4 pb-20">
          {menuSections.length === 0 && !isLoadingProducts && !errorProducts && (
            <div className="text-center text-gray-600 mt-8">Nenhum produto encontrado para este restaurante.</div>
          )}
          {menuSections.map((section) => (
            <div key={section.name} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 mt-4">
                {section.name}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="flex-1 p-3">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <p className="text-lg font-bold text-primary-500">
                            R$ {Number(item.price || 0).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        <div className="w-24 h-24 relative">
                          <img
                            src={item.image_url || '/placeholder-product.png'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                                onClick={() => setSelectedItem(item)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md mx-auto">
                              <DialogHeader>
                                <DialogTitle>{selectedItem?.name}</DialogTitle>
                                <DialogDescription>
                                  {selectedItem?.description || 'Sem descrição.'}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedItem && (
                                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                                  {selectedItem.image_url && (
                                  <img
                                       src={selectedItem.image_url}
                                    alt={selectedItem.name}
                                    className="w-full h-32 object-cover rounded"
                                  />
                                  )}

                                  {isLoadingOptionGroups ? (
                                    <div>Carregando opções...</div>
                                  ) : errorOptionGroups ? (
                                    <div>Erro ao carregar opções.</div>
                                  ) : optionGroups && optionGroups.length > 0 ? (
                                    <div>
                                      <h3 className="font-semibold mb-2">Personalizações</h3>
                                      {optionGroups.map(group => (
                                        <div key={group.id} className="space-y-2 mb-4 border-b pb-4 last:border-b-0 last:pb-0">
                                          <h4 className="font-medium mb-1">{group.name} {group.is_required && <span className="text-red-500 text-xs">(Obrigatório)</span>}</h4>
                                          {group.description && <p className="text-sm text-gray-600">{group.description}</p>}
                                          <p className="text-sm text-gray-600">Selecione: Min {group.min_selections || 0}, Max {group.max_selections || 1}</p>
                                      <div className="space-y-2">
                                            {group.options && group.options.map(option => (
                                              <div key={option.id} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                   {group.max_selections === 1 ? (
                                                    <input
                                                       type="radio"
                                                       name={`option-group-${group.id}`}
                                                       id={`option-${option.id}`}
                                                       checked={selectedOptions[group.id]?.includes(option.id) || false}
                                                       onChange={() => handleOptionChange(group.id, option.id, true)}
                                                       className="form-radio text-primary-500 focus:ring-primary-500"
                                                    />
                                                  ) : (
                                            <Checkbox
                                                      id={`option-${option.id}`}
                                                      checked={selectedOptions[group.id]?.includes(option.id) || false}
                                                      onCheckedChange={(isChecked) => handleOptionChange(group.id, option.id, !!isChecked)}
                                                    />
                                                  )}
                                                  <label
                                                    htmlFor={`option-${option.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                  >
                                                    {option.name}
                                                  </label>
                                                </div>
                                                {option.additional_price !== undefined && option.additional_price > 0 && (
                                                  <span className="text-sm text-gray-600">+ R$ {Number(option.additional_price).toFixed(2).replace('.', ',')}</span>
                                                )}
                                          </div>
                                        ))}
                                      </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div>Nenhuma opção de personalização disponível.</div>
                                  )}
                                  
                                  <div>
                                    <h3 className="font-medium mb-2">Observações</h3>
                                    <Textarea
                                      placeholder="Ex: sem cebola, ponto da carne..."
                                      value={observations}
                                      onChange={(e) => setObservations(e.target.value)}
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleQuantityChange(-1)}
                                       disabled={itemQuantity <= 1}
                                    >
                                       <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="text-lg font-semibold">{itemQuantity}</span>
                                     <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleQuantityChange(1)}
                                     >
                                       <Plus className="w-4 h-4" />
                                     </Button>
                                  </div>
                                  
                                  <div className="flex items-center justify-between pt-4 border-t">
                                    <span className="text-lg font-bold">
                                      Total: R$ {modalItemTotal.toFixed(2).replace('.', ',')}
                                    </span>
                                    <Button onClick={handleAddToCart} className="px-6">
                                      Adicionar {itemQuantity > 1 ? `${itemQuantity} itens` : 'item'} ao carrinho
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Restaurant;
