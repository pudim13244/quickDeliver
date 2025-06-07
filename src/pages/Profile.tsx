import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserProfile, updateUserProfile, type UserProfile, type UpdateUserProfileData } from '@/services/dataService';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState<UpdateUserProfileData>({});

  // Buscar dados completos do perfil do usuário logado
  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile } = useQuery<UserProfile>({
    queryKey: ['userProfile', user?.id], // Depende do ID do usuário
    queryFn: () => fetchUserProfile(user!.id), // Chamar a função com o ID do usuário
    enabled: isAuthenticated && !!user?.id, // Habilitar a query apenas se autenticado e com ID de usuário disponível
  });

  // Efeito para preencher o formulário de edição quando os dados do perfil carregam
  useEffect(() => {
    if (profile) {
      setEditableProfile({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
    }
  }, [profile]);

  // Mutação para atualizar o perfil
  const { mutate: handleUpdateProfile, isPending: isUpdatingProfile } = useMutation<UserProfile, Error, UpdateUserProfileData>({
    mutationFn: (data: UpdateUserProfileData) => updateUserProfile(user!.id, data), // Chamar updateUserProfile com ID do usuário e dados
    onSuccess: (updatedProfile) => {
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false); // Sair do modo de edição
      // Invalidar ou atualizar o cache da query de perfil para refletir as mudanças
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      // Opcional: setEditableProfile(updatedProfile); se a resposta da API retornar o perfil completo
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar perfil: ${error.message || 'Ocorreu um erro.'}`);
      console.error('Erro ao atualizar perfil:', error);
    },
  });

  const handleInputChange = (field: keyof UpdateUserProfileData, value: string) => {
    setEditableProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      handleUpdateProfile(editableProfile);
    } else {
      toast.error('Usuário não identificado para atualização.');
    }
  };

  // Renderizar loader enquanto carrega a autenticação ou o perfil
  if (authLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Redirecionar se não autenticado (embora PrivateRoute já faça isso)
  if (!isAuthenticated) {
     return null; 
  }

  // Renderizar erro se houver na busca do perfil
  if (isErrorProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Perfil" showBack />
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <p className="text-red-600">Ocorreu um erro ao carregar seu perfil.</p>
        </div>
      </div>
    );
  }

  // Exibir perfil ou formulário de edição se os dados estiverem carregados
  if (profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={isEditing ? "Editar Perfil" : "Meu Perfil"} showBack showCart={false} />
        
        <div className="max-w-md mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{isEditing ? "Editar Informações" : "Informações do Perfil"}</CardTitle>
              <CardDescription>{isEditing ? "Atualize seus dados abaixo." : "Visualize seus dados."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      value={editableProfile.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Não Editável)</Label>
                    <Input id="email" type="email" value={profile.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={editableProfile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      type="text"
                      value={editableProfile.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>
                   {/* TODO: Adicionar outros campos editáveis */}
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdatingProfile}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isUpdatingProfile}>
                       {isUpdatingProfile ? (
                         <>
                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                           Salvando...
                         </>
                       ) : (
                         'Salvar Alterações'
                       )}
                    </Button>
                  </div>
                </form>
              ) : (
                <> {/* Visualização */}
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nome:</p>
                    <p className="text-gray-900">{profile.name}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email:</p>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                  <Separator />
                  {profile.phone && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Telefone:</p>
                        <p className="text-gray-900">{profile.phone}</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  {profile.address && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Endereço:</p>
                        <p className="text-gray-900">{profile.address}</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">Função:</p>
                    <p className="text-gray-900">{profile.role}</p>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </Button>
                  </div>
                   {/* TODO: Adicionar link para histórico de pedidos */}
                </>
              )}
              {/* Adicionar link para histórico de pedidos FORA DO CARD DE INFORMAÇÕES */}
            </CardContent>
          </Card>
           {/* Adicionar link para histórico de pedidos FORA DO CARD DE INFORMAÇÕES */}
             <div className="mt-4 text-center">
                <Link to="/order-tracking" className="underline">
                  Ver Histórico de Pedidos
                </Link>
              </div>
            <div className="mt-4 text-center">
              <Button onClick={logout} variant="destructive">
                Sair da Conta
              </Button>
            </div>
        </div>
      </div>
    );
  }

  // Fallback (não deve acontecer se loaders e erros forem tratados)
  return null;
} 