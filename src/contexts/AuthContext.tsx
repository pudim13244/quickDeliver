import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type AuthResponse, login, registerUser, type UserCredentials, type UserRegistrationData } from '@/services/dataService'; // Importar tipos e funções de autenticação

// Definir o tipo para o contexto de autenticação
interface AuthContextType {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean; // Adicionar propriedade loading
  login: (credentials: UserCredentials) => Promise<void>;
  logout: () => void;
  register: (data: UserRegistrationData) => Promise<AuthResponse>; // Opcional: pode ser tratado diretamente na página de registro
}

// Criar o contexto com um valor inicial null ou undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provedor de autenticação
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Estado para indicar se a autenticação inicial está carregando

  // Efeito para carregar o token e usuário do localStorage ao iniciar a aplicação
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Falha ao parsear user do localStorage:', e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  // Função de login
  const loginFn = async (credentials: UserCredentials) => {
    try {
      const data = await login(credentials);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
    } catch (error) {
      console.error('Login falhou:', error);
      // Opcional: relançar o erro para a UI lidar
      throw error;
    }
  };

  // Função de registro
  const registerFn = async (data: UserRegistrationData) => {
    try {
      const response = await registerUser(data);
      // Se o registro for bem-sucedido e a API retornar dados de autenticação
      if (response && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('authUser', JSON.stringify(response.user));
      } else {
        // Se o registro for bem-sucedido mas não retornar token/usuário, apenas logar a mensagem
        console.log('Registro bem-sucedido, mas sem token/usuário para login automático.', response);
      }
      return response; // Retornar a resposta completa
    } catch (error) {
      console.error('Registro falhou:', error);
      throw error; // Relançar o erro para a UI lidar
    }
  };

  // Função de logout
  const logoutFn = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    // Opcional: redirecionar para a página de login
    // navigate('/login'); // Não usar navigate aqui, pois o contexto não tem acesso direto ao navigate
  };

  // Renderizar um loader enquanto carrega a autenticação inicial
  if (loading) {
    return <div>Carregando autenticação...</div>; // Substituir por um componente de loading real, se desejar
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user, // Considerar autenticado se houver um usuário
      loading,
      login: loginFn,
      logout: logoutFn,
      register: registerFn, // Adicionar a função de registro
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 