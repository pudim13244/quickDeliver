import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserProfile, updateUserProfile, type UserProfile, type UserAddress, type UpdateUserProfileData } from '@/services/dataService';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs únicos para endereços

const Address = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Estado para a lista de endereços do usuário
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  // Estado para o endereço a ser adicionado/editado no modal
  const [newAddressName, setNewAddressName] = useState('');
  const [newFullAddress, setNewFullAddress] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Buscar dados do perfil do usuário logado
  const { data: userProfile, isLoading: isLoadingProfile, isError: isErrorProfile } = useQuery<UserProfile>({
    queryKey: ['userProfile', user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: isAuthenticated && !!user?.id,
  });

  // Efeito para preencher os endereços a partir do perfil do usuário
  useEffect(() => {
    if (userProfile?.address && Array.isArray(userProfile.address)) {
      setAddresses(userProfile.address);
    } else if (userProfile?.address && typeof userProfile.address === 'string') {
      // Fallback para endereços antigos que eram string única
      try {
        const parsed = JSON.parse(userProfile.address);
        if (Array.isArray(parsed)) {
          setAddresses(parsed);
        } else {
          setAddresses([{
            id: uuidv4(),
            name: 'Endereço Principal',
            fullAddress: userProfile.address,
            isDefault: true
          }]);
        }
      } catch (e) {
        setAddresses([{
          id: uuidv4(),
          name: 'Endereço Principal',
          fullAddress: userProfile.address,
          isDefault: true
        }]);
      }
    } else {
      setAddresses([]);
    }
  }, [userProfile]);

  // Mutação para atualizar o perfil (incluindo endereço)
  const updateAddressMutation = useMutation<UserProfile, Error, UpdateUserProfileData>({
    mutationFn: (data: UpdateUserProfileData) => updateUserProfile(user!.id, data),
    onSuccess: (updatedProfile) => {
      if (updatedProfile.address && Array.isArray(updatedProfile.address)) {
        setAddresses(updatedProfile.address);
      }
      toast.success('Endereço atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      setIsModalOpen(false); // Fechar modal após salvar
      setNewAddressName('');
      setNewFullAddress('');
      setEditingAddressId(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar endereço: ${error.message || 'Ocorreu um erro.'}`);
      console.error('Erro ao atualizar endereço:', error);
    },
  });

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAddressName.trim() || !newFullAddress.trim()) {
      toast.error('Por favor, preencha todos os campos do endereço.');
      return;
    }

    let updatedAddresses: UserAddress[];
    if (editingAddressId) {
      // Editando um endereço existente
      updatedAddresses = addresses.map(addr =>
        addr.id === editingAddressId
          ? { ...addr, name: newAddressName.trim(), fullAddress: newFullAddress.trim() }
          : addr
      );
    } else {
      // Adicionando novo endereço
      const newAddress: UserAddress = {
        id: uuidv4(), // Gerar ID único para o novo endereço
        name: newAddressName.trim(),
        fullAddress: newFullAddress.trim(),
        isDefault: addresses.length === 0, // Primeiro endereço adicionado é o padrão
      };
      updatedAddresses = [...addresses, newAddress];
    }

    if (user?.id) {
      updateAddressMutation.mutate({ address: updatedAddresses });
    } else {
      toast.error('Usuário não identificado para atualização do endereço.');
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id, // Define este como padrão e os outros como não padrão
    }));
    if (user?.id) {
      updateAddressMutation.mutate({ address: updated });
    }
  };

  const handleRemoveAddress = (id: string) => {
    const remainingAddresses = addresses.filter(addr => addr.id !== id);
    if (remainingAddresses.length > 0 && addresses.find(addr => addr.id === id)?.isDefault) {
      // Se o endereço removido era o padrão, define o primeiro restante como padrão
      remainingAddresses[0].isDefault = true;
    }
    if (user?.id) {
      updateAddressMutation.mutate({ address: remainingAddresses });
    }
  };

  const handleOpenAddEditModal = (address?: UserAddress) => {
    if (address) {
      setNewAddressName(address.name);
      setNewFullAddress(address.fullAddress);
      setEditingAddressId(address.id);
    } else {
      setNewAddressName('');
      setNewFullAddress('');
      setEditingAddressId(null);
    }
    setIsModalOpen(true);
  };

  if (authLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (isErrorProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Endereço de entrega" showBack />
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <p className="text-red-500">Ocorreu um erro ao carregar o endereço.</p>
        </div>
      </div>
    );
  }

  const defaultAddress = addresses.find(addr => addr.isDefault);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Endereço de entrega" showBack />

      <div className="max-w-md mx-auto px-4 pb-24">
        <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-3">Endereços salvos</h2>

        {addresses.length === 0 && (
          <p className="text-gray-600 mb-4">Nenhum endereço salvo. Adicione um para continuar.</p>
        )}

        <div className="space-y-3 mb-6">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`cursor-pointer ${address.isDefault ? 'border-primary-500 ring-2 ring-primary-500' : ''}`}
              onClick={() => handleSetDefault(address.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{address.name}</span>
                      {address.isDefault && (
                        <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{address.fullAddress}</p>
                  </div>
                </div>
                {address.isDefault && <Check className="w-5 h-5 text-primary-500" />}
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full py-3" onClick={() => handleOpenAddEditModal()}>
              <Plus className="w-5 h-5 mr-2" />
              Adicionar novo endereço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingAddressId ? 'Editar Endereço' : 'Adicionar Novo Endereço'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveAddress} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="addressName">Nome do Endereço</Label>
                <Input
                  id="addressName"
                  placeholder="Ex: Casa, Trabalho"
                  value={newAddressName}
                  onChange={(e) => setNewAddressName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullAddress">Endereço Completo</Label>
                <Input
                  id="fullAddress"
                  placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP - 01234-567"
                  value={newFullAddress}
                  onChange={(e) => setNewFullAddress(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateAddressMutation.isPending}>
                  {updateAddressMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Endereço'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-md mx-auto">
            <Button className="w-full py-3 text-lg" onClick={() => navigate('/payment')} disabled={!defaultAddress || updateAddressMutation.isPending}>
              Continuar para pagamento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
