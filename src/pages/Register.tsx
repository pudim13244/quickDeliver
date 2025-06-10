import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { type UserRegistrationData, type AuthResponse } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const { mutate: handleRegister, isPending: isLoading } = useMutation<AuthResponse, Error, UserRegistrationData>({
    mutationFn: register,
    onSuccess: (data) => {
      toast.success('Cadastro realizado com sucesso!');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(`Erro no cadastro: ${error.message || 'Ocorreu um erro.'}`);
      console.error('Erro:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone || !address) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    handleRegister({ name, email, password, role: 'CUSTOMER', phone, address });
  };

  return (
    <div className="min-h-screen flex flex-col bg-marjoriatira-500">
      {/* Topo com logo */}
      <div className="flex-1 flex flex-col items-center justify-center relative pb-12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg">
            <span className="text-marjoriatira-500 text-4xl font-bold">Q</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-wide">QuickDeliver</h1>
          <p className="text-white text-sm opacity-80 mt-1">Seu delivery rápido e fácil</p>
        </div>
      </div>
      {/* Formulário */}
      <div className="bg-white rounded-t-3xl shadow-lg px-6 pt-8 pb-6 w-full max-w-md mx-auto -mt-16 z-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold text-marjoriatira-500">Criar Conta</h2>
            <p className="text-gray-500 text-sm">Preencha os campos abaixo para se cadastrar</p>
          </div>
          {/* Social login (apenas visual) */}
          <div className="flex justify-center gap-4 mb-2">
            <button type="button" className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition"><img src="/google.svg" alt="Google" className="w-6 h-6" /></button>
            <button type="button" className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition"><img src="/facebook.svg" alt="Facebook" className="w-6 h-6" /></button>
            <button type="button" className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition"><img src="/twitter.svg" alt="Twitter" className="w-6 h-6" /></button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(XX) XXXXX-XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              type="text"
              placeholder="Sua rua, número, bairro"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="bg-gray-50"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-secondary text-white font-semibold rounded-full py-3 text-base shadow-md transition"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cadastrando...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-600">Já tem uma conta?{' '}
              <button
                type="button"
                className="text-marjoriatira-500 font-semibold hover:underline"
                onClick={() => navigate('/login')}
              >
                Entrar
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
} 