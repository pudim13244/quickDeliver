import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error: any) {
      toast.error('Erro no login. Verifique suas credenciais.');
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-marjoriatira-500">
      {/* Topo com logo */}
      <div className="flex-1 flex flex-col items-center justify-center relative pb-12">
        <div className="flex flex-col items-center justify-center">
          {/* Logo fictício, troque por sua logo se desejar */}
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
            <h2 className="text-xl font-semibold text-marjoriatira-500">Bem-vindo de volta!</h2>
            <p className="text-gray-500 text-sm">Faça login para continuar</p>
          </div>
          {/* Social login (apenas visual) */}
          <div className="flex justify-center gap-4 mb-2">
            <button type="button" className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition"><img src="/google.svg" alt="Google" className="w-6 h-6" /></button>
            <button type="button" className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition"><img src="/facebook.svg" alt="Facebook" className="w-6 h-6" /></button>
            <button type="button" className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition"><img src="/twitter.svg" alt="Twitter" className="w-6 h-6" /></button>
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
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="accent-marjoriatira-500"
              />
              Lembrar de mim
            </label>
            <button
              type="button"
              className="text-marjoriatira-500 text-sm font-medium hover:underline"
              onClick={() => navigate('/forgot-password')}
            >
              Esqueceu a senha?
            </button>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-secondary text-white font-semibold rounded-full py-3 text-base shadow-md transition"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-600">Não tem uma conta?{' '}
              <button
                type="button"
                className="text-marjoriatira-500 font-semibold hover:underline"
                onClick={() => navigate('/register')}
              >
                Cadastre-se
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
} 