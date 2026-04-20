import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import CategoryBar from '@/components/CategoryBar';
import ProductList from '@/components/ProductList';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Footer } from '@/components/common/Footer';
import { shopService } from '@/services/shopApi';

const productMatchesCategory = (product, selectedCategoryId) => {
  if (!selectedCategoryId) {
    return true;
  }

  const normalizedSelectedId = String(selectedCategoryId);

  if (product?.categoryId && String(product.categoryId) === normalizedSelectedId) {
    return true;
  }

  if (product?.category?.id && String(product.category.id) === normalizedSelectedId) {
    return true;
  }

  if (Array.isArray(product?.categories)) {
    return product.categories.some((category) => {
      const id = category?.id ?? category?.categoryId;
      return id !== undefined && id !== null && String(id) === normalizedSelectedId;
    });
  }

  return false;
};

export default function ProductsByCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await shopService.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId) {
        setProducts([]);
        return;
      }

      try {
        setProductsLoading(true);
        const data = await shopService.getProducts(categoryId);
        const productList = Array.isArray(data) ? data : [];
        setProducts(productList.filter((product) => productMatchesCategory(product, categoryId)));
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Failed to load products');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  const selectedCategoryName = useMemo(() => {
    const match = categories.find((category) => String(category.id) === String(categoryId));
    return match?.name || 'Selected category';
  }, [categories, categoryId]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const productName = String(product?.name || '').toLowerCase();
      const description = String(product?.description || '').toLowerCase();
      return productName.includes(query) || description.includes(query);
    });
  }, [products, search]);

  const handleSelectCategory = (nextCategoryId) => {
    if (!nextCategoryId) {
      navigate('/products');
      return;
    }

    navigate(`/products/category/${nextCategoryId}`);
  };

  return (
    <DashboardLayout>
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mx-auto grid w-full max-w-[1380px] flex-1 gap-6 px-4 py-8 md:grid-cols-[280px_1fr] md:px-6 lg:px-10"
      >
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
        >
          <CategoryBar
            categories={categories}
            selectedCategoryId={categoryId}
            onSelectCategory={handleSelectCategory}
            isLoading={categoriesLoading}
          />
        </motion.div>

        <motion.section
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
          className="space-y-5"
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
            className="rounded-[16px] border border-[#DED6D2] bg-[#FDFDFD] p-4 shadow-[0_12px_24px_-20px_rgba(73,61,61,0.28)] md:p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-medium tracking-tight text-[#1A1717] md:text-3xl">Beauty Products</h1>
                <p className="text-sm text-[#7D746F] md:text-base">{`Showing ${selectedCategoryName}`}</p>
              </div>
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D8681]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products"
                  className="w-full rounded-xl border border-[#DDD4CF] bg-[#F8F5F3] py-2.5 pl-9 pr-4 text-sm text-[#1A1717] outline-none transition focus:border-[#A31A11] md:text-base"
                />
              </div>
            </div>
          </motion.div>

          <ProductList
            products={visibleProducts}
            isLoading={productsLoading}
            selectedCategoryId={categoryId}
            selectedCategoryName={selectedCategoryName}
            detailsPathBuilder={(product) => `/products/category/${categoryId}/product/${product.id}`}
          />
        </motion.section>
      </motion.main>

      <Footer />
    </DashboardLayout>
  );
}
