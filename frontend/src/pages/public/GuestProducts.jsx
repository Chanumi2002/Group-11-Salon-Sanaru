import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Star, Search } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import AllReviewsDisplay from '@/components/AllReviewsDisplay';
import { shopService } from '@/services/shopApi';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

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

export default function GuestProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productStats, setProductStats] = useState({});
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCategoryId = searchParams.get('categoryId');

  // Fetch categories
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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const data = await shopService.getProducts(selectedCategoryId);
        const productList = Array.isArray(data) ? data : [];
        const filtered = productList.filter((product) =>
          productMatchesCategory(product, selectedCategoryId)
        );
        setProducts(filtered);

        // Fetch stats for each product
        const stats = {};
        for (const product of filtered) {
          try {
            const productStats = await shopService.getReviewStats(product.id, 'PRODUCT');
            stats[product.id] = productStats;
          } catch (err) {
            // Stats might not exist yet, that's fine
            stats[product.id] = null;
          }
        }
        setProductStats(stats);
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

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}${selectedCategoryId ? `?categoryId=${encodeURIComponent(selectedCategoryId)}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-[#EBEBEB] flex flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 py-8 md:px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-6 rounded-[16px] border border-[#DED6D2] bg-[#FDFDFD] p-5 shadow-[0_12px_24px_-20px_rgba(73,61,61,0.28)]"
        >
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-medium text-[#1A1717]">Beauty Products</h1>
            <p className="text-sm text-[#7D746F] mt-1">Browse our premium collection of beauty and salon products.</p>
          </div>

          {/* Category Filter */}
          {!categoriesLoading && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelectCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  !selectedCategoryId
                    ? 'bg-[#A31A11] text-white'
                    : 'bg-[#F0EDE9] text-[#6E6662] hover:bg-[#E8E3DD]'
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    String(selectedCategoryId) === String(category.id)
                      ? 'bg-[#A31A11] text-white'
                      : 'bg-[#F0EDE9] text-[#6E6662] hover:bg-[#E8E3DD]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D8681]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-[#DDD4CF] bg-[#F8F5F3] py-2.5 pl-9 pr-3 text-sm text-[#1A1717] outline-none transition focus:border-[#A31A11]"
            />
          </div>
        </motion.div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="rounded-[16px] border border-[#E2D4CD] bg-[#FDFDFD] p-10 text-center text-[#7D746F]">
            Loading products...
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[#E2D4CD] bg-[#FDFDFD] p-10 text-center">
            <h3 className="text-lg font-medium text-[#1A1717]">No products found</h3>
            <p className="mt-2 text-sm text-[#7D746F]">
              {search ? 'Try adjusting your search terms.' : 'Please check back soon.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product, index) => {
              const imageSource = product.imageUrl || product.image || product.imagePath;
              const inStock = (product.stockQuantity || 0) > 0;

              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.05, 0.35),
                    ease: 'easeOut',
                  }}
                  className="overflow-hidden rounded-[16px] border border-[#E4D8D2] bg-[#FDFDFD] shadow-[0_10px_22px_-18px_rgba(75,58,58,0.35)]"
                >
                  <div className="relative h-[220px] overflow-hidden bg-[#F2ECE8]">
                    {!inStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                    {imageSource ? (
                      <img
                        src={resolveImageUrl(imageSource)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-[#7B706B]">
                        No image available
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 p-4">
                    <h2 className="text-[1.05rem] font-medium text-[#1A1717] line-clamp-1">{product.name}</h2>
                    <p className="text-sm text-[#6E6662] line-clamp-2">{product.description}</p>

                    {productStats[product.id]?.averageRating ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < Math.round(productStats[product.id].averageRating)
                                  ? 'fill-[#FFA500] text-[#FFA500]'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[#7D746F]">
                          {productStats[product.id].averageRating.toFixed(1)} ({productStats[product.id].count}{' '}
                          review{productStats[product.id].count !== 1 ? 's' : ''})
                        </span>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[1.1rem] font-semibold text-[#A31A11]">
                        Rs. {Number(product.price || 0).toFixed(2)}
                      </p>
                      <p className="text-xs font-medium text-[#5E5753] bg-[#F0EDE9] px-2 py-1 rounded">
                        {product.stockQuantity || 0} in stock
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewDetails(product.id)}
                      disabled={!inStock}
                      className="mt-2 inline-flex w-full items-center justify-center rounded-[10px] bg-[#8E1616] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#741212] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8E1616]"
                    >
                      View Details
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Customer Reviews Section - Show ALL reviews across all products */}
        {!productsLoading && visibleProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="mt-12"
          >
            <AllReviewsDisplay
              feedbackType="PRODUCT"
              title="All Product Reviews"
            />
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
