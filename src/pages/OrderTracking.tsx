import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Truck, Star, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import { useOrder } from '@/contexts/OrderContext';
import { useQuery } from '@tanstack/react-query';
import { fetchOrderById, fetchUserOrders, type Order } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OrderRatingModal from '@/components/OrderRatingModal';
import { Separator } from '@/components/ui/separator';

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const { getOrder } = useOrder();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const { data: singleOrder, isLoading: isLoadingSingleOrder, isError: isErrorSingleOrder } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId,
  });

  const [order, setOrder] = useState<Order | undefined>(singleOrder);

  useEffect(() => {
    if (singleOrder) {
      setOrder(singleOrder);
    }
  }, [singleOrder]);

  const [progress, setProgress] = useState(0);

  const statusSteps = [
    { id: 'PENDING', label: 'Pendente', icon: Clock },
    { id: 'PREPARING', label: 'Preparando', icon: Clock },
    { id: 'READY', label: 'Pronto', icon: CheckCircle },
    { id: 'DELIVERING', label: 'Saiu para entrega', icon: Truck },
    { id: 'DELIVERED', label: 'Entregue', icon: CheckCircle },
    { id: 'CANCELLED', label: 'Cancelado', icon: Package },
  ] as const;

  useEffect(() => {
    if (order) {
      const currentStepIndex = statusSteps.findIndex(step => step.id === order.status);
      setProgress(((currentStepIndex + 1) / (statusSteps.length - 1)) * 100);
    }
  }, [order?.status]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const { data: userOrders, isLoading: isLoadingUserOrders, isError: isErrorUserOrders } = useQuery<Order[]>({
    queryKey: ['userOrders', user?.id],
    queryFn: () => fetchUserOrders(user!.id),
    enabled: !orderId && isAuthenticated && !!user?.id,
  });

  if (authLoading || (orderId && isLoadingSingleOrder) || (!orderId && isLoadingUserOrders)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if ((orderId && isErrorSingleOrder) || (!orderId && isErrorUserOrders)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={orderId ? "Erro ao carregar pedido" : "Erro ao carregar pedidos"} showBack />
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <p className="text-red-600">Ocorreu um erro ao carregar os dados.</p>
        </div>
      </div>
    );
  }

  if (orderId && order) {
    const currentStepIndex = statusSteps.findIndex(step => step.id === order.status);

    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Acompanhar pedido" showBack showCart={false} />
        
        <div className="max-w-md mx-auto px-4 pb-8">
          {/* Order Status */}
          <Card className="mt-4 mb-4">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Pedido #{order.id}
                </h2>
                <p className="text-gray-600">
                  Status: {statusSteps.find(step => step.id === order.status)?.label}
                </p>
                {order.estimatedTime && (
                   <p className="text-gray-600">
                     Tempo estimado: {order.estimatedTime} minutos
                   </p>
                )}
              </div>

              {/* Progress Bar */}
              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                <div className="mb-6">
                  <Progress value={progress} className="h-2 mb-4" />
                  <div className="flex justify-between">
                    {statusSteps.filter(step => step.id !== 'CANCELLED' && step.id !== 'DELIVERED').map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      
                      return (
                        <div key={step.id} className="flex flex-col items-center">
                          <div className={`p-2 rounded-full mb-2 ${
                            isCompleted 
                              ? 'bg-primary-500 text-white' 
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-xs text-center ${
                            isCurrent ? 'font-semibold text-primary-500' : 'text-gray-600'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Current Status Message */}
              <div className={`text-center p-4 rounded-lg ${
                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-primary-50 text-primary-700'
              }`}>
                <p className="font-medium">
                  {order.status === 'PENDING' && 'Seu pedido está pendente de confirmação.'}
                  {order.status === 'PREPARING' && 'Seu pedido está sendo preparado'}
                  {order.status === 'READY' && 'Seu pedido está pronto para ser coletado/enviado.'}
                  {order.status === 'DELIVERING' && 'Seu pedido saiu para entrega'}
                  {order.status === 'DELIVERED' && 'Seu pedido foi entregue!'}
                  {order.status === 'CANCELLED' && 'Seu pedido foi cancelado.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Person */}
          {(order.status === 'DELIVERING' || order.status === 'DELIVERED') && order.deliveryPerson && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Entregador</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={order.deliveryPerson.photo} />
                      <AvatarFallback>
                        {order.deliveryPerson.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {order.deliveryPerson.name}
                      </h4>
                      {order.deliveryPerson.rating !== undefined && (
                         <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">
                              {order.deliveryPerson.rating}
                            </span>
                         </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ligar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Detalhes do pedido</h3>
              <div className="space-y-2 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-semibold">
                      R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-3" />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de entrega</span>
                  <span>R$ {order.deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary-500">
                  R$ {(order.total + order.deliveryFee).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment and Delivery Info */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Pagamento e Entrega</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Pagamento: {order.paymentMethod}</p>
                <p>Endereço de entrega: {order.deliveryAddress}</p>
                {order.createdAt && (
                  <p>Realizado em: {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                )}
                {order.paymentMethod === 'CASH' && order.amount_paid !== null && order.amount_paid !== undefined && order.change_amount !== null && order.change_amount !== undefined && (
                  <p>
                    Troco para: R$ {Number(order.amount_paid).toFixed(2).replace('.', ',')} (Troco: R$ {Number(order.change_amount).toFixed(2).replace('.', ',')})
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Avaliar Pedido Button */}
          {order.status === 'DELIVERED' && (
            <Button onClick={() => setIsRatingModalOpen(true)} className="w-full mt-4">
              Avaliar Pedido
            </Button>
          )}
        </div>

        {orderId && (
          <OrderRatingModal
            isOpen={isRatingModalOpen}
            onClose={() => setIsRatingModalOpen(false)}
            orderId={orderId}
          />
        )}
      </div>
    );
  }

  if (!orderId && userOrders && userOrders.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Meus Pedidos" showBack showCart={false} />
        <div className="max-w-md mx-auto px-4 py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Meus Pedidos</h2>
          <div className="space-y-4">
            {userOrders.map((userOrder) => (
              <Card key={userOrder.id} className="cursor-pointer hover:bg-gray-100" onClick={() => navigate(`/order-tracking/${userOrder.id}`)}>
                <CardContent className="p-4">
                  <p className="font-medium">Pedido #{userOrder.id}</p>
                  <p className="text-sm text-gray-600">Status: {statusSteps.find(step => step.id === userOrder.status)?.label}</p>
                  <p className="text-sm text-gray-600">Total: R$ {userOrder.total.toFixed(2).replace('.', ',')}</p>
                  {userOrder.createdAt && (
                    <p className="text-xs text-gray-500">Realizado em: {format(new Date(userOrder.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Meus Pedidos" showBack showCart={false} />
      <div className="max-w-md mx-auto px-4 py-8 text-center text-gray-600">
        <p>Nenhum pedido encontrado.</p>
      </div>
    </div>
  );
};

export default OrderTracking;
