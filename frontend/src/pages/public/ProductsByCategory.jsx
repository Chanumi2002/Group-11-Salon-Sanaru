import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import CategoryBar from '@/components/CategoryBar';
import ProductList from '@/components/ProductList';
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
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden border-b border-border/70 bg-card/70 backdrop-blur-xl">
        <div className="absolute inset-0 gradient-soft opacity-30" />
        <div className="container relative mx-auto flex items-center justify-between px-4 py-4 md:px-6">
          <Link to="/products" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground md:text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Salon Sanaru Shop
          </Link>
          <nav className="flex items-center gap-2 text-sm md:text-base">
            <Link to="/" className="rounded-full px-3 py-1.5 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground">
              Home
            </Link>
            <Link to="/login" className="rounded-full px-3 py-1.5 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6 md:px-6 md:py-10">
        <CategoryBar
          categories={categories}
          selectedCategoryId={categoryId}
          onSelectCategory={handleSelectCategory}
          isLoading={categoriesLoading}
        />

        <section className="space-y-5">
          <div className="glass-panel rounded-3xl p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Beauty Products</h1>
                <p className="text-sm text-muted-foreground md:text-base">{`Showing ${selectedCategoryName}`}</p>
              </div>
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/90" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products"
                  className="w-full rounded-full border border-border/70 bg-background/70 py-2.5 pl-9 pr-4 text-sm text-foreground outline-none transition focus:border-primary/70 focus:focus-glow md:text-base"
                />
              </div>
            </div>
          </div>

          <ProductList
            products={visibleProducts}
            isLoading={productsLoading}
            selectedCategoryId={categoryId}
            selectedCategoryName={selectedCategoryName}
            detailsPathBuilder={(product) => `/products/category/${categoryId}/product/${product.id}`}
          />
        </section>
      </main>
    </div>
  );
}
