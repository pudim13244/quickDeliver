import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitOrderRating, type OrderRatingData } from '@/services/dataService';

interface OrderRatingModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted?: () => void; // Callback opcional ao submeter com sucesso
}

export default function OrderRatingModal({
  orderId,
  isOpen,
  onClose,
  onRatingSubmitted,
}: OrderRatingModalProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { mutate: submitRating, isPending: isSubmitting } = useMutation<void, Error, OrderRatingData>({
    mutationFn: (data: OrderRatingData) => submitOrderRating(orderId, data),
    onSuccess: () => {
      toast.success('Avaliação submetida com sucesso!');
      // Opcional: invalidar a query do pedido para atualizar o estado (ex: desabilitar botão de avaliar)
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      onClose();
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao submeter avaliação: ${error.message || 'Ocorreu um erro.'}`);
      console.error('Erro ao submeter avaliação:', error);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Por favor, selecione uma nota.');
      return;
    }
    submitRating({ rating, comment });
  };

  // Resetar estado ao abrir/fechar a modal
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Avalie seu Pedido #{orderId}</DialogTitle>
          <DialogDescription>
            Nos diga o que você achou do seu pedido.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="rating">Nota:</Label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`cursor-pointer w-6 h-6 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">Comentário (Opcional):</Label>
            <Textarea
              id="comment"
              placeholder="Deixe seu comentário..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Avaliação'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 