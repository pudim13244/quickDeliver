import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { type UserRegistrationData, type AuthResponse } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  // const [role, setRole] = useState<'CUSTOMER' | 'ESTABLISHMENT' | 'DELIVERY'>('CUSTOMER'); // Default role

  const { mutate: handleRegister, isPending: isLoading } = useMutation<AuthResponse, Error, UserRegistrationData>({
    mutationFn: register,
    onSuccess: (data) => {
      console.log('Cadastro bem-sucedido:', data);
      toast.success('Cadastro realizado com sucesso!');
      // Redirecionar para a página inicial (o usuário já estará logado via AuthContext)
      navigate('/');
    },
    onError: (error: any) => {
      // Melhorar o tratamento de erro para exibir mensagens específicas do backend, se houver
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>Preencha os campos abaixo para criar sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
              />
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="role">Eu sou</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'CUSTOMER' | 'ESTABLISHMENT' | 'DELIVERY')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="CUSTOMER">Cliente</option>
                <option value="ESTABLISHMENT">Estabelecimento</option>
                <option value="DELIVERY">Entregador</option>
              </select>
            </div> */}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
            <div className="text-center text-sm mt-4">
              Já tem uma conta? {''}
              <Link to="/login" className="underline">
                Entrar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 