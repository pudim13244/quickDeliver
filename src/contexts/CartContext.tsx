import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definir a interface para as opções selecionadas
interface SelectedOption {
  name: string;
  additional_price: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number; // Preço base do produto
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image: string;
  customizations?: SelectedOption[]; // Agora é um array de objetos SelectedOption
  observations?: string;
  totalPrice: number; // Preço total do item (base + opções) * quantidade
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'totalPrice'> & { quantity?: number, customizations?: SelectedOption[] }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const deliveryFee = 4.99; // Exemplo, pode vir do backend
  const discount = 0; // Exemplo, pode vir de cupom

  const addItem = (newItem: Omit<CartItem, 'quantity' | 'totalPrice'> & { quantity?: number, customizations?: SelectedOption[] }) => {
    setItems(prev => {
      // Calcular o preço total do item com base no preço base e nas opções
      const itemBasePrice = newItem.price;
      const optionsPrice = newItem.customizations ? newItem.customizations.reduce((sum, option) => sum + (Number(option.additional_price) || 0), 0) : 0;
      const calculatedItemTotalPrice = (itemBasePrice + optionsPrice);

      const existingItemIndex = prev.findIndex(
        item => item.id === newItem.id &&
                JSON.stringify(item.customizations) === JSON.stringify(newItem.customizations)
      );

      if (existingItemIndex > -1) {
        // Item com as mesmas opções já existe, atualizar quantidade e total
        const updatedItems = [...prev];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + (newItem.quantity || 1);
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: calculatedItemTotalPrice * newQuantity, // Atualizar totalPrice
        };
        return updatedItems;
      } else {
        // Item não existe, adicionar novo item
        const quantity = newItem.quantity || 1;
        const newItemWithTotal = {
          ...newItem,
          quantity,
          totalPrice: calculatedItemTotalPrice * quantity, // Adicionar totalPrice ao novo item
          customizations: newItem.customizations || [], // Garantir que customizations seja um array
        };
        return [...prev, newItemWithTotal];
      }
    });
  };

  const removeItem = (id: string) => {
    // A lógica de remoção por ID pode precisar ser ajustada
    // se houver múltiplos itens com o mesmo ID mas opções diferentes.
    // Por enquanto, remove o primeiro encontrado.
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => {
      const updatedItems = prev.map(item => {
        if (item.id === id) {
          const newQuantity = quantity;
           // Recalcular totalPrice com a nova quantidade
          const itemBasePrice = item.price;
          const optionsPrice = item.customizations ? item.customizations.reduce((sum, option) => sum + (option.additional_price || 0), 0) : 0;
          const calculatedItemTotalPrice = (itemBasePrice + optionsPrice);

          return { ...item, quantity: newQuantity, totalPrice: calculatedItemTotalPrice * newQuantity };
        }
        return item;
      });
      // Remover item se a quantidade for <= 0
      return updatedItems.filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  // Recalcular o totalPrice total do carrinho somando o totalPrice de cada item
  const totalCartPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  const finalTotal = totalCartPrice + deliveryFee - discount;

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: totalCartPrice, // Usar o total recalculado
      deliveryFee,
      discount,
      finalTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
