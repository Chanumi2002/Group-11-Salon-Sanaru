import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '@/services/api';
import { toast } from 'sonner';
import { Edit2, AlertTriangle, CheckCircle, PackageX, Loader, Search } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/common/AdminDashboardLayout';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'instock', 'lowstock', 'outofstock'

  // Modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updateForm, setUpdateForm] = useState({ stockQuantity: 0, lowStockThreshold: 5 });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (product) => {
    setSelectedProduct(product);
    setUpdateForm({
      stockQuantity: product.stockQuantity ?? 0,
      lowStockThreshold: product.lowStockThreshold ?? 5
    });
    setIsUpdateModalOpen(true);
  };

  const submitStockUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setIsUpdating(true);
      await adminService.updateProductStock(selectedProduct.id, {
        stockQuantity: parseInt(updateForm.stockQuantity, 10),
        lowStockThreshold: parseInt(updateForm.lowStockThreshold, 10)
      });
      toast.success('Stock updated successfully');
      setIsUpdateModalOpen(false);
      setSelectedProduct(null);
      await fetchInventory();
    } catch (error) {
      console.error('Error updating stock', error);
      toast.error('Failed to update stock');
    } finally {
      setIsUpdating(false);
    }
  };

  // Derived Summary
  const { totalProducts, outOfStockCount, lowStockCount, inStockCount } = useMemo(() => {
    let out = 0, low = 0, inS = 0;
    products.forEach(p => {
      if (p.outOfStock) out++;
      else if (p.lowStock) low++;
      else inS++;
    });
    return {
      totalProducts: products.length,
      outOfStockCount: out,
      lowStockCount: low,
      inStockCount: inS
    };
  }, [products]);

  // Derived List
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      
      if (filterStatus === 'outofstock') return p.outOfStock;
      if (filterStatus === 'lowstock') return p.lowStock && !p.outOfStock;
      if (filterStatus === 'instock') return !p.outOfStock && !p.lowStock;
      return true;
    });
  }, [products, searchTerm, filterStatus]);

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor stock levels and prevent overselling</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border p-6 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Products</p>
              <h3 className="text-2xl font-bold text-foreground">{totalProducts}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
              <PackageX className="opacity-0" size={24} /> 
              {/* Invisible placeholder for alignment, or use a proper icon like Box */}
              <span className="absolute -ml-[24px]">📦</span>
            </div>
          </div>
          
          <div 
            onClick={() => setFilterStatus('instock')}
            className={`bg-card text-foreground border border-border p-6 rounded-lg flex items-center justify-between cursor-pointer hover:border-green-500 transition-colors ${filterStatus === 'instock' ? 'ring-2 ring-green-500' : ''}`}
          >
            <div>
              <p className="text-sm text-muted-foreground font-medium">Healthy Stock</p>
              <h3 className="text-2xl font-bold">{inStockCount}</h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-full dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle size={24} />
            </div>
          </div>

          <div 
            onClick={() => setFilterStatus('lowstock')}
            className={`bg-card text-foreground border border-border p-6 rounded-lg flex items-center justify-between cursor-pointer hover:border-yellow-500 transition-colors ${filterStatus === 'lowstock' ? 'ring-2 ring-yellow-500' : ''}`}
          >
            <div>
              <p className="text-sm text-muted-foreground font-medium">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold">{lowStockCount}</h3>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">
              <AlertTriangle size={24} />
            </div>
          </div>

          <div 
            onClick={() => setFilterStatus('outofstock')}
            className={`bg-card text-foreground border border-border p-6 rounded-lg flex items-center justify-between cursor-pointer hover:border-red-500 transition-colors ${filterStatus === 'outofstock' ? 'ring-2 ring-red-500' : ''}`}
          >
            <div>
              <p className="text-sm text-muted-foreground font-medium">Out of Stock</p>
              <h3 className="text-2xl font-bold">{outOfStockCount}</h3>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-full dark:bg-red-900/30 dark:text-red-400">
              <PackageX size={24} />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
          </div>
          <div>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-card border border-input rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="instock">In Stock</option>
              <option value="lowstock">Low Stock</option>
              <option value="outofstock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground">
               <Loader className="animate-spin mx-auto mb-2" size={32} />
               <p>Loading inventory...</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted border-b border-border text-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium">Price</th>
                    <th className="px-6 py-3 font-medium">Stock Left</th>
                    <th className="px-6 py-3 font-medium">Threshold</th>
                    <th className="px-6 py-3 font-medium text-center">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                        No products match your search or filter criteria.
                      </td>
                    </tr>
                  ) : filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {product.imageUrl || product.image || product.imagePath ? (
                          <img
                            src={resolveImageUrl(product.imageUrl || product.image || product.imagePath)}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover border border-border"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center border border-border" />
                        )}
                        <span className="font-medium text-foreground">{product.name}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        Rs. {parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-foreground font-semibold">
                        {product.stockQuantity ?? 0}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {product.lowStockThreshold ?? 5}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.outOfStock ? (
                          <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full dark:bg-red-900/40 dark:text-red-400 whitespace-nowrap">
                            Out of Stock
                          </span>
                        ) : product.lowStock ? (
                          <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900/40 dark:text-yellow-400 whitespace-nowrap">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full dark:bg-green-900/40 dark:text-green-400 whitespace-nowrap">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUpdateClick(product)}
                          className="flex items-center gap-1.5 justify-end w-full px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400"
                        >
                          <Edit2 size={14} /> Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Quick Update Modal */}
      {isUpdateModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-xl p-6 shadow-xl border border-border">
            <h3 className="text-xl font-bold text-foreground mb-1">Update Stock</h3>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-1">
              {selectedProduct.name}
            </p>

            <form onSubmit={submitStockUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={updateForm.stockQuantity}
                    onChange={(e) => setUpdateForm({ ...updateForm, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={updateForm.lowStockThreshold}
                    onChange={(e) => setUpdateForm({ ...updateForm, lowStockThreshold: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Trigger warning when stock hits or falls below this number.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="flex-1 py-2 text-foreground bg-muted hover:bg-muted/80 font-medium rounded-lg transition-colors border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isUpdating ? <Loader className="animate-spin" size={16} /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
