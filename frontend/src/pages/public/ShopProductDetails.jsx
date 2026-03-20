import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import ProductDetails from '@/components/ProductDetails';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
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
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(130deg, #2A2323 0%, #3B2A2A 45%, #6B2A2A 100%)',
      }}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 py-8 md:px-6 lg:px-10">
        <ProductDetails product={product} isLoading={isLoading} onBack={handleBack} />
      </main>

      <Footer />
    </div>
  );
}
