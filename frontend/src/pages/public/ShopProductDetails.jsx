import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ProductDetails from '@/components/ProductDetails';
import { shopService } from '@/services/shopApi';

export default function ShopProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await shopService.getProductById(id);
        setProduct(data || null);
      } catch (error) {
        console.error('Failed to load product details:', error);
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleBack = () => {
    const categoryId = searchParams.get('categoryId');
    const target = categoryId ? `/shop?categoryId=${encodeURIComponent(categoryId)}` : '/shop';
    navigate(target);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="absolute inset-0 gradient-soft opacity-60" />
        <div className="container relative mx-auto flex items-center justify-between px-4 py-4 md:px-6">
          <Link to="/shop" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Salon Sanaru Shop
          </Link>
          <Link to="/shop" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
            Browse all
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6">
        <ProductDetails product={product} isLoading={isLoading} onBack={handleBack} />
      </main>
    </div>
  );
}
