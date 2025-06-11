import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserProfile, updateUserProfile, type UserProfile, type UpdateUserProfileData, type UserAddress } from '@/services/dataService';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, LogOut, Trash2, User, ChevronRight, Settings, HelpCircle, FileText, CreditCard, Star, History, Lock, MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
      let addressesToSet: UserAddress[] = [];
      if (Array.isArray(profile.address)) {
        addressesToSet = profile.address;
      } else if (typeof profile.address === 'string' && profile.address) {
        // Se for uma string, crie um objeto UserAddress a partir dela
        addressesToSet = [{ id: 'initial', name: 'Principal', fullAddress: profile.address, isDefault: true }];
      }
      // Se profile.address for undefined ou null, addressesToSet permanecerá vazio, o que é o comportamento esperado.

      setEditableProfile({
        name: profile.name,
        phone: profile.phone,
        address: addressesToSet, // Garante que é sempre um array de UserAddress
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
    setEditableProfile(prev => {
      if (field === 'address') {
        const currentAddresses = Array.isArray(prev.address) ? [...prev.address] : [];
        if (currentAddresses.length > 0) {
          const defaultIndex = currentAddresses.findIndex(addr => addr.isDefault);
          if (defaultIndex !== -1) {
            currentAddresses[defaultIndex] = { ...currentAddresses[defaultIndex], fullAddress: value };
          } else {
            currentAddresses[0] = { ...currentAddresses[0], fullAddress: value };
          }
        } else {
          currentAddresses.push({ id: 'new', name: 'Principal', fullAddress: value, isDefault: true });
        }
        return { ...prev, address: currentAddresses };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      // editableProfile.address já deve ser UserAddress[] aqui devido ao useEffect e handleInputChange
      handleUpdateProfile({
        name: editableProfile.name,
        phone: editableProfile.phone,
        address: editableProfile.address, // Passa o array de UserAddress diretamente
      });
    } else {
      toast.error('Usuário não identificado para atualização.');
    }
  };

  if (authLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

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

  if (profile) {
    const currentEditableAddress = Array.isArray(editableProfile.address) 
      && editableProfile.address.length > 0
      ? (editableProfile.address.find(addr => addr.isDefault) || editableProfile.address[0]).fullAddress
      : '';

    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Perfil" showBack={false} showCart={false} />
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-marjoriatira-100 flex items-center justify-center mb-2 border-4 border-marjoriatira-500">
              <User className="w-16 h-16 text-marjoriatira-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name || 'Usuário'}</h2>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <Star className="w-4 h-4" />
              <span>0 . Membro Quick</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow divide-y divide-gray-100">
            <div>
              <p className="px-6 pt-4 pb-2 text-xs font-bold text-gray-500">DETALHES DA CONTA</p>
              <ProfileItem icon={<User className="w-5 h-5" />} label="Informações Pessoais" onClick={() => navigate('/personal-info')} />
              <ProfileItem icon={<Star className="w-5 h-5" />} label="Recompensas" onClick={() => navigate('/rewards')} />
              <ProfileItem icon={<History className="w-5 h-5" />} label="Histórico de Pedidos" onClick={() => navigate('/order-history')} />
              <ProfileItem icon={<CreditCard className="w-5 h-5" />} label="Métodos de Pagamento" onClick={() => navigate('/payment-methods')} />
            </div>
            <div>
              <p className="px-6 pt-4 pb-2 text-xs font-bold text-gray-500">CONFIGURAÇÕES</p>
              <ProfileItem icon={<Settings className="w-5 h-5" />} label="Preferências" onClick={() => navigate('/preferences')} />
              <ProfileItem icon={<Lock className="w-5 h-5" />} label="Segurança" onClick={() => navigate('/security')} />
            </div>
            <div>
              <p className="px-6 pt-4 pb-2 text-xs font-bold text-gray-500">SUPORTE</p>
              <ProfileItem icon={<HelpCircle className="w-5 h-5" />} label="FAQs" onClick={() => navigate('/faqs')} />
              <ProfileItem icon={<MessageCircle className="w-5 h-5" />} label="Feedback" onClick={() => navigate('/feedback')} />
            </div>
            <div>
              <p className="px-6 pt-4 pb-2 text-xs font-bold text-gray-500">LEGAL</p>
              <ProfileItem icon={<FileText className="w-5 h-5" />} label="Termos de Uso" onClick={() => navigate('/terms-of-use')} />
              <ProfileItem icon={<FileText className="w-5 h-5" />} label="Política de Privacidade" onClick={() => navigate('/privacy-policy')} />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700"
              onClick={logout}
            >
              <LogOut className="w-5 h-5 mr-2" /> Sair
            </Button>
            <Button
              variant="ghost"
              className="w-full text-red-600 hover:bg-red-50"
              onClick={() => alert('Funcionalidade de deletar conta em breve!')}
            >
              <Trash2 className="w-5 h-5 mr-2" /> Deletar Conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ProfileItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition group"
    >
      <span className="flex items-center gap-3 text-gray-800">
        {icon}
        <span className="text-base">{label}</span>
      </span>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-marjoriatira-500" />
    </button>
  );
} 