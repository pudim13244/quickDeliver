import api from './api';
import { type CartItem } from '@/contexts/CartContext';

const API_URL = 'http://localhost:3000';

// Definir interfaces baseadas na estrutura do banco de dados e uso atual
export interface Category {
  id: string;
  name: string;
  // icon: string; // Ícone pode vir de outra forma ou ser mockado no frontend
}

export interface EstablishmentDetail {
  id: number;
  name: string; // Mapeia de restaurant_name ou nome
  description?: string; // Descrição do estabelecimento
  cuisine_type?: string; // Tipo de culinária
  rating?: number; // Avaliação
  deliveryTime?: string; // Tempo estimado de entrega
  deliveryFee: number; // Taxa de entrega
  image?: string; // URL da imagem (banner ou logo)
  address?: string; // Endereço
  phone?: string; // Telefone/Whatsapp
  business_hours?: string; // Horário de funcionamento
  // Adicionar outros campos relevantes do establishment_profile
}

// Nova interface para os dados brutos de estabelecimento vindos do backend
export interface RawEstablishmentData {
  id: number;
  name: string;
  category?: string; // Propriedade como vem do backend para tipo de culinária
  delivery_fee: string; // Vem como string do backend
  business_hours?: string;
  delivery_radius?: number;
  minimum_order?: number;
  image_url?: string; // Propriedade como vem do backend para imagem
  banner_url?: string;
  instagram?: string;
  whatsapp?: string;
  rating?: number;
  description?: string; // Adicionado
  address?: string; // Adicionado
  phone?: string; // Adicionado
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string; // Imagem do produto
  category_id: number; // ID da categoria
  category_name?: string; // Nome da categoria, adicionado
  establishment_id: number; // ID do estabelecimento
  option_groups?: OptionGroup[]; // Grupos de opções associados ao produto
}

export interface OptionGroup {
  id: number;
  name: string;
  description?: string;
  is_required?: boolean;
  min_selections?: number;
  max_selections?: number;
  options?: Option[]; // Opções dentro do grupo
}

export interface Option {
  id: number;
  group_id: number;
  name: string;
  description?: string;
  additional_price?: number;
  is_available?: boolean;
}

// Interfaces para pagamento
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

export interface PaymentDetails {
  method: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  cardName?: string;
  changeFor?: string;
  pixCode?: string;
}

// Nova interface para dados do entregador
export interface DeliveryPerson {
  id: string;
  name: string;
  photo?: string; // URL da foto
  rating?: number; // Avaliação do entregador
}

export interface Order {
  id: string;
  items: CartItem[];
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  estimatedTime?: number; // Pode ser opcional
  createdAt: string;
  establishment_id: number;
  customer_id: number;
  deliveryFee: number; // Adicionado
  amount_paid?: number; // Adicionado, pode ser opcional
  change_amount?: number; // Adicionado, pode ser opcional
  payment_status: 'PENDING' | 'PAID'; // Adicionado
  order_type: 'DELIVERY' | 'DINE_IN' | 'PICKUP'; // Adicionado
  deliveryPerson?: DeliveryPerson; // Adicionar propriedade do entregador
}

// Nova interface para os dados de criação do pedido
export interface CreateOrderData {
  items: CartItem[];
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  paymentDetails: PaymentDetails;
}

// Interfaces para autenticação
export interface UserCredentials {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// Nova interface para representar um único endereço do usuário
export interface UserAddress {
  id: string; // Usar UUID ou timestamp para unicidade no frontend
  name: string; // Ex: "Casa", "Trabalho"
  fullAddress: string;
  isDefault: boolean;
}

// Nova interface para o perfil do usuário como vem ou vai para o backend (address como string)
export interface RawUserProfile {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ESTABLISHMENT' | 'DELIVERY';
  phone?: string;
  address?: string; // Endereço como string JSON para o backend
}

// Nova interface para o perfil do usuário (pode incluir mais detalhes para o frontend)
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ESTABLISHMENT' | 'DELIVERY';
  phone?: string;
  // `address` é um array de UserAddress para o frontend
  address?: UserAddress[];
  // Adicionar outros campos do perfil conforme necessário
}

// Nova interface para dados de atualização do perfil do usuário para o frontend
export interface UpdateUserProfileData {
  name?: string;
  phone?: string;
  address?: UserAddress[]; // Para o frontend, aceita array de UserAddress
  // Adicionar outros campos editáveis conforme necessário
}

// Nova interface para dados de atualização do perfil do usuário para o backend (address como string)
export interface RawUpdateUserProfileData {
  name?: string;
  phone?: string;
  address?: string | null; // Para o backend, é uma string JSON ou null/undefined
}

// Nova interface para dados de cadastro de usuário
export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role: 'CUSTOMER' | 'ESTABLISHMENT' | 'DELIVERY';
}

// Nova interface para dados de avaliação de pedido
export interface OrderRatingData {
  rating: number; // Nota da avaliação (ex: 1 a 5)
  comment?: string; // Comentário opcional
}

// Nova interface para a resposta da API de processamento de pagamento
export interface ProcessPaymentResponse {
  message: string;
  orderId: string;
}

// Função para buscar categorias
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

// Função para buscar restaurantes (estabelecimentos) para a lista
export const fetchRestaurants = async (): Promise<EstablishmentDetail[]> => {
  try {
    const response = await api.get('/api/establishments');
    return response.data.map((establishment: RawEstablishmentData) => ({
      id: establishment.id,
      name: establishment.name,
      description: establishment.description,
      cuisine_type: establishment.category,
      rating: Number(establishment.rating) || 0,
      deliveryFee: Number(establishment.delivery_fee),
      image: establishment.image_url || establishment.banner_url,
      address: establishment.address,
      phone: establishment.phone || establishment.whatsapp,
      business_hours: establishment.business_hours
    }));
  } catch (error) {
    console.error('Erro ao buscar restaurantes:', error);
    throw error;
  }
};

// Função para buscar detalhes de um estabelecimento específico
export const fetchEstablishmentDetail = async (establishmentId: string): Promise<EstablishmentDetail> => {
  try {
    const response = await api.get(`/api/establishments/${establishmentId}`);
    const establishment = response.data;
    return {
      id: establishment.id,
      name: establishment.name,
      description: establishment.description,
      cuisine_type: establishment.category,
      rating: Number(establishment.rating) || 0,
      deliveryFee: Number(establishment.delivery_fee),
      image: establishment.image_url || establishment.banner_url,
      address: establishment.address,
      phone: establishment.phone || establishment.whatsapp,
      business_hours: establishment.business_hours
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do estabelecimento:', error);
    throw error;
  }
};

// Função para buscar produtos de um estabelecimento
export const fetchProductsByEstablishment = async (establishmentId: string): Promise<Product[]> => {
  try {
    const response = await api.get(`/api/establishments/${establishmentId}/products`);
    return response.data.map((product: Product) => ({
      ...product,
      price: Number(product.price),
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos do estabelecimento:', error);
    throw error;
  }
};

// Função para buscar grupos de opções de um produto
export const fetchOptionGroupsByProduct = async (productId: string): Promise<OptionGroup[]> => {
  try {
    const response = await api.get(`/api/products/${productId}/option-groups`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar grupos de opções do produto:', error);
    throw error;
  }
};

// Função para buscar opções de um grupo de opções
export const fetchOptionsByOptionGroup = async (optionGroupId: string): Promise<Option[]> => {
  const response = await api.get<Option[]>(`/api/option-groups/${optionGroupId}/options`);
  return response.data.map(option => ({
    ...option,
    additional_price: Number(option.additional_price),
  }));
};

// Funções para pagamento
export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const response = await api.get('/api/payment-methods');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    throw error;
  }
};

// Função para processar pagamento e criar pedido
export const processPayment = async (orderData: CreateOrderData): Promise<ProcessPaymentResponse> => {
  try {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    throw error;
  }
};

// Função para login do usuário
export const login = async (credentials: UserCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post('/api/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('authToken', token);
    return { token, user };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

// Nova função para cadastro de usuário
export const registerUser = async (registrationData: UserRegistrationData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/api/register', registrationData);
    const { token, user } = response.data;
    localStorage.setItem('authToken', token);
    return { token, user };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
};

// Função para buscar pedidos de um usuário (cliente)
export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const response = await api.get(`/api/users/${userId}/orders`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    throw error;
  }
};

// Função para buscar detalhes de um pedido específico
export const fetchOrderById = async (orderId: string): Promise<Order> => {
  try {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    throw error;
  }
};

// Função para buscar o perfil do usuário por ID
export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    const userData = response.data;
    return {
      ...userData,
      address: userData.address ? [{
        id: '1',
        name: 'Endereço Principal',
        fullAddress: userData.address,
        isDefault: true
      }] : []
    };
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    throw error;
  }
};

// Função para atualizar o perfil do usuário
export const updateUserProfile = async (userId: string, profileData: UpdateUserProfileData): Promise<UserProfile> => {
  const dataToSend: RawUpdateUserProfileData = {};

  if (profileData.name !== undefined) dataToSend.name = profileData.name;
  if (profileData.phone !== undefined) dataToSend.phone = profileData.phone;

  if (profileData.address !== undefined) {
    if (Array.isArray(profileData.address)) {
      dataToSend.address = JSON.stringify(profileData.address);
    } else {
      dataToSend.address = profileData.address === null ? null : (profileData.address as string); 
    }
  }

  const response = await api.put<RawUserProfile>(`/api/users/${userId}`, dataToSend);
  const updatedRawProfile = response.data;

  const updatedProfile: UserProfile = {
    id: updatedRawProfile.id,
    name: updatedRawProfile.name,
    email: updatedRawProfile.email,
    role: updatedRawProfile.role,
    phone: updatedRawProfile.phone,
  };

  if (updatedRawProfile.address && typeof updatedRawProfile.address === 'string') {
    try {
      const parsedAddresses = JSON.parse(updatedRawProfile.address);
      if (Array.isArray(parsedAddresses) && parsedAddresses.every(item => 'id' in item && 'name' in item && 'fullAddress' in item && 'isDefault' in item)) {
        updatedProfile.address = parsedAddresses as UserAddress[];
      } else {
        updatedProfile.address = [{
          id: 'default',
          name: 'Endereço Principal',
          fullAddress: updatedRawProfile.address,
          isDefault: true,
        }];
      }
    } catch (e) {
      updatedProfile.address = [{
        id: 'default',
        name: 'Endereço Principal',
        fullAddress: updatedRawProfile.address,
        isDefault: true,
      }];
    }
  } else {
    updatedProfile.address = [];
  }
  
  return updatedProfile;
};

// Nova função para submeter a avaliação de um pedido
export const submitOrderRating = async (orderId: string, ratingData: OrderRatingData): Promise<void> => {
  try {
    await api.post(`/api/orders/${orderId}/rating`, ratingData);
  } catch (error) {
    console.error('Erro ao enviar avaliação do pedido:', error);
    throw error;
  }
}; 