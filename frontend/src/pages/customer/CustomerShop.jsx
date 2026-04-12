import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import CategoryBar from '@/components/CategoryBar';
import ProductList from '@/components/ProductList';
import AllReviewsDisplay from '@/components/AllReviewsDisplay';
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

export default function CustomerShop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCategoryId = searchParams.get('categoryId');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await shopService.getCategories();
        setCategories(data);
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
      try {
        setProductsLoading(true);
        const data = await shopService.getProducts(selectedCategoryId);
        const productList = Array.isArray(data) ? data : [];
        setProducts(productList.filter((product) => productMatchesCategory(product, selectedCategoryId)));
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Failed to load products');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategoryId]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) {
      return 'All products';
    }

    const match = categories.find((category) => String(category.id) === String(selectedCategoryId));
    return match?.name || 'Selected category';
  }, [categories, selectedCategoryId]);

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

  const handleSelectCategory = (categoryId) => {
    if (!categoryId) {
      setSearchParams({});
      return;
    }

    setSearchParams({ categoryId: String(categoryId) });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="grid w-full gap-6 md:grid-cols-[280px_1fr]"
        >
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
          >
            <CategoryBar
              categories={categories}
              selectedCategoryId={selectedCategoryId}
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
                  <h1 className="text-2xl font-medium text-[#1A1717] md:text-3xl">Beauty Products</h1>
                  <p className="text-sm text-[#7D746F]">
                    {selectedCategoryId ? `Showing ${selectedCategoryName}` : 'Showing all categories'}
                  </p>
                </div>
                <div className="relative w-full md:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D8681]" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products"
                    className="w-full rounded-xl border border-[#DDD4CF] bg-[#F8F5F3] py-2.5 pl-9 pr-3 text-sm text-[#1A1717] outline-none transition focus:border-[#A31A11]"
                  />
                </div>
              </div>
            </motion.div>

            <ProductList
              products={visibleProducts}
              isLoading={productsLoading}
              selectedCategoryId={selectedCategoryId}
              selectedCategoryName={selectedCategoryName}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-8 pt-8 border-t border-[#E4D8D2]"
            >
              <h2 className="mb-6 text-2xl font-medium text-[#1A1717]">All Product Reviews</h2>
              <AllReviewsDisplay feedbackType="PRODUCT" />
            </motion.div>
          </motion.section>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
