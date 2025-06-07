import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const Cart = () => {
  const { items, updateQuantity, removeItem, totalPrice, deliveryFee, finalTotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  React.useEffect(() => {
    console.log('Cart.tsx - Subtotal (totalPrice):', totalPrice);
    console.log('Cart.tsx - Taxa de entrega (deliveryFee):', deliveryFee);
    console.log('Cart.tsx - Desconto (discount):', appliedCoupon ? totalPrice * 0.1 : 0);
    console.log('Cart.tsx - Total Final (finalTotalWithDiscount):', totalPrice + deliveryFee - (appliedCoupon ? totalPrice * 0.1 : 0));
  }, [totalPrice, deliveryFee, appliedCoupon]);

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'desconto10') {
      setAppliedCoupon('DESCONTO10');
      toast.success('Cupom aplicado! 10% de desconto');
    } else {
      toast.error('Cupom inválido');
    }
    setCouponCode('');
  };

  const discount = appliedCoupon ? totalPrice * 0.1 : 0;
  const finalTotalWithDiscount = totalPrice + deliveryFee - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Carrinho" showBack showCart={false} />
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Adicione itens do seu restaurante favorito</p>
          <Link to="/">
            <Button>Explorar restaurantes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Carrinho" showBack showCart={false} />

      <div className="max-w-md mx-auto px-4 pb-24">
        {/* Restaurant Info */}
        <div className="bg-white rounded-lg p-4 mb-4 mt-4">
          <h2 className="font-semibold text-gray-900 mb-1">
            {items[0]?.restaurantName}
          </h2>
          <p className="text-sm text-gray-600">Tempo de entrega: 25-35 min</p>
        </div>

        {/* Cart Items */}
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    {/* Exibir opções selecionadas */}
                    {item.customizations && Array.isArray(item.customizations) && item.customizations.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                        {item.customizations.map((customization, index) => (
                          <p key={index}>
                            - {customization.name} {customization.additional_price !== undefined && Number(customization.additional_price) > 0 && `(+R$ ${Number(customization.additional_price).toFixed(2).replace('.', ',')})`}
                          </p>
                        ))}
                      </div>
                    )}
                    {item.observations && (
                      <p className="text-xs text-gray-600 mt-1">
                        Obs: {item.observations}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary-500">
                    R$ {(item.totalPrice || (item.price * item.quantity)).toFixed(2).replace('.', ',')}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coupon */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-primary-500" />
              <span className="font-medium">Cupom de desconto</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={applyCoupon}>
                Aplicar
              </Button>
            </div>
            {appliedCoupon && (
              <p className="text-sm text-green-600 mt-2">
                Cupom {appliedCoupon} aplicado (10% de desconto)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Resumo do pedido</h3>

            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Taxa de entrega</span>
              <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto</span>
                <span>-R$ {discount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary-500">
                R$ {finalTotalWithDiscount.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <Link to="/address">
            <Button className="w-full py-3 text-lg">
              Continuar para entrega
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
