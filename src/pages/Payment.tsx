import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, Smartphone, DollarSign, Gift, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { useOrder } from '@/contexts/OrderContext';
import { toast } from 'sonner';
import { fetchPaymentMethods, processPayment, type PaymentMethod, type PaymentDetails, type CreateOrderData, type ProcessPaymentResponse } from '@/services/dataService';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Payment = () => {
  const navigate = useNavigate();
  const { items, totalPrice, deliveryFee, finalTotal, clearCart } = useCart();
  const { createOrder } = useOrder();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: '',
  });

  // Buscar métodos de pagamento
  const { data: paymentMethods, isLoading: isLoadingMethods } = useQuery<PaymentMethod[]>({
    queryKey: ['paymentMethods'],
    queryFn: fetchPaymentMethods,
  });

  // Mutação para processar pagamento
  const { mutate: handlePayment, isPending: isProcessing } = useMutation<ProcessPaymentResponse, Error, CreateOrderData>({
    mutationFn: (orderData: CreateOrderData) => processPayment(orderData),
    onSuccess: (data) => {
      console.log('Dados da resposta do pedido:', data);
      toast.success('Pedido realizado com sucesso!');
      clearCart();
      navigate(`/order-tracking/${data.orderId}`);
    },
    onError: (error) => {
      toast.error('Erro ao processar pagamento. Tente novamente.');
      console.error('Erro:', error);
    },
  });

  const handleMethodChange = (value: string) => {
    setSelectedMethod(value);
    setPaymentDetails({ method: value });
  };

  const handleInputChange = (field: keyof PaymentDetails, value: string) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) {
      toast.error('Selecione um método de pagamento');
      return;
    }

    // Validar campos específicos do método de pagamento
    if (selectedMethod === 'credit_card' || selectedMethod === 'debit_card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv || !paymentDetails.cardName) {
        toast.error('Preencha todos os campos do cartão');
        return;
      }
    } else if (selectedMethod === 'money' && !paymentDetails.changeFor) {
      toast.error('Informe o valor para troco');
      return;
    }

    // TODO: Obter endereço de entrega real
    const deliveryAddress = 'Endereço de entrega';

    handlePayment({
      items,
      total: finalTotal,
      deliveryAddress,
      paymentMethod: selectedMethod,
      paymentDetails,
    });
  };

  if (isLoadingMethods) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Pagamento" showBack />
      
      <div className="max-w-md mx-auto px-4 pb-24">
        {/* Order Summary */}
        <Card className="mt-4 mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Resumo do pedido</h3>
            
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-3" />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de entrega</span>
                <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary-500">
                R$ {finalTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-3 mb-4">
          <h3 className="font-semibold text-gray-900">Forma de pagamento</h3>
          
          <form onSubmit={handleSubmit}>
            <RadioGroup
              value={selectedMethod}
              onValueChange={handleMethodChange}
              className="space-y-4"
            >
              {paymentMethods?.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id}>{method.name}</Label>
                      </div>
              ))}
            </RadioGroup>

            {/* Campos específicos do método de pagamento */}
            {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
              <div className="space-y-4">
                      <div>
                  <Label htmlFor="cardName">Nome no Cartão</Label>
              <Input
                    id="cardName"
                    value={paymentDetails.cardName || ''}
                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                    placeholder="Nome como está no cartão"
                  />
                </div>
              <div>
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input
                  id="cardNumber"
                    value={paymentDetails.cardNumber || ''}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="0000 0000 0000 0000"
                />
              </div>
                <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Validade</Label>
                  <Input
                    id="expiry"
                      value={paymentDetails.expiry || ''}
                      onChange={(e) => handleInputChange('expiry', e.target.value)}
                    placeholder="MM/AA"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                      value={paymentDetails.cvv || ''}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                  />
                  </div>
                </div>
              </div>
            )}
              
            {selectedMethod === 'money' && (
              <div>
                <Label htmlFor="changeFor">Valor para Troco</Label>
                <Input
                  id="changeFor"
                  type="number"
                  value={paymentDetails.changeFor || ''}
                  onChange={(e) => handleInputChange('changeFor', e.target.value)}
                  placeholder="Valor em reais"
                />
              </div>
        )}

            {selectedMethod === 'pix' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Após finalizar o pedido, você receberá o código PIX para pagamento.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Finalizar Pedido'
              )}
              </Button>
          </form>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleSubmit}
            className="w-full py-3 text-lg"
          >
            Finalizar pedido
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
