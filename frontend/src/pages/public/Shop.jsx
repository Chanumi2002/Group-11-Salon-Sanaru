import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

export default function Shop() {
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
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="absolute inset-0 gradient-soft opacity-60" />
        <div className="container relative mx-auto flex items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Salon Sanaru Shop
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="rounded-lg px-3 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              Home
            </Link>
            <Link to="/login" className="rounded-lg px-3 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[280px_1fr] md:px-6">
        <CategoryBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          isLoading={categoriesLoading}
        />

        <section className="space-y-5">
          <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-salon md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">Beauty Products</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedCategoryId ? `Showing ${selectedCategoryName}` : 'Showing all categories'}
                </p>
              </div>
              <div className="relative w-full md:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products"
                  className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none ring-ring transition focus:ring-2"
                />
              </div>
            </div>
          </div>

          <ProductList
            products={visibleProducts}
            isLoading={productsLoading}
            selectedCategoryId={selectedCategoryId}
            selectedCategoryName={selectedCategoryName}
          />
        </section>
      </main>
    </div>
  );
}
