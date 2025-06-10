import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Função fictícia para simular alteração de senha
async function changePassword(email: string, newPassword: string) {
  // Aqui você pode integrar com seu backend real
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Simula sucesso
  return true;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await changePassword(email, password);
      toast.success('Senha alterada com sucesso!');
      navigate('/login');
    } catch (err) {
      toast.error('Erro ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-marjoriatira-500">
      <div className="flex-1 flex flex-col items-center justify-center relative pb-12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg">
            <span className="text-marjoriatira-500 text-4xl font-bold">Q</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-wide">QuickDeliver</h1>
          <p className="text-white text-sm opacity-80 mt-1">Redefinir senha</p>
        </div>
      </div>
      <div className="bg-white rounded-t-3xl shadow-lg px-6 pt-8 pb-6 w-full max-w-md mx-auto -mt-16 z-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold text-marjoriatira-500">Alterar Senha</h2>
            <p className="text-gray-500 text-sm">Digite seu e-mail e a nova senha</p>
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
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-50"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-secondary text-white font-semibold rounded-full py-3 text-base shadow-md transition"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Alterando...
              </>
            ) : (
              'Alterar Senha'
            )}
          </Button>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-600">Lembrou da senha?{' '}
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