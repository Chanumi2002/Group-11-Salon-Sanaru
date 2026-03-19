import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/api';
import { toast } from 'sonner';
import { Trash2, Edit2, Plus, Loader } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { AdminDashboardLayout } from '@/components/common/AdminDashboardLayout';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products and categories on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleFileSelect = (file, preview) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Product description is required');
      return;
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Category is required');
      return;
    }
    if (!selectedFile && !editingId) {
      toast.error('Image is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', parseFloat(formData.price));
      const selectedCategoryId = String(parseInt(formData.categoryId, 10));
      // Keep both keys for backend compatibility.
      form.append('categoryIds', selectedCategoryId);
      form.append('categoryId', selectedCategoryId);
      if (selectedFile) {
        form.append('image', selectedFile);
      }

      if (editingId) {
        await adminService.updateProduct(editingId, form);
        toast.success('Product updated successfully');
      } else {
        await adminService.createProduct(form);
        toast.success('Product created successfully');
      }

      // Reset form
      setFormData({ name: '', description: '', price: '', categoryId: '' });
      setSelectedFile(null);
      setPreviewUrl('');
      setEditingId(null);
      setIsFormOpen(false);

      // Refresh products
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (product) => {
    setEditingId(product.id);
    const selectedCategoryId =
      product?.categories?.[0]?.id ||
      product?.categoryId ||
      '';

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: selectedCategoryId ? String(selectedCategoryId) : '',
    });
    setPreviewUrl(resolveImageUrl(product.imageUrl || product.image || product.imagePath || ''));
    setSelectedFile(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(productId);
        toast.success('Product deleted successfully');
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', categoryId: '' });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const getCategoryName = (product) => {
    if (Array.isArray(product?.categories) && product.categories.length > 0) {
      const namesFromProduct = product.categories
        .map((category) => category?.name)
        .filter(Boolean);

      if (namesFromProduct.length > 0) {
        return namesFromProduct.join(', ');
      }

      // Fallback: if backend returns only category IDs inside categories array.
      const namesFromLookup = product.categories
        .map((category) => categories.find((cat) => cat.id === category?.id)?.name)
        .filter(Boolean);

      if (namesFromLookup.length > 0) {
        return namesFromLookup.join(', ');
      }
    }

    if (product?.categoryId) {
      return categories.find((cat) => cat.id === product.categoryId)?.name || 'Unknown';
    }

    return 'Unknown';
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground">Manage product inventory</p>
          </div>
          <button
            onClick={() => {
              handleClose();
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 my-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Product Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    disabled={isSubmitting}
                    rows="3"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
                  />
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
                    Price
                  </label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Product Image
                  </label>
                  <ImageUpload
                    onFileSelect={handleFileSelect}
                    previewUrl={previewUrl}
                    onRemove={handleRemoveImage}
                    isLoading={isSubmitting}
                    maxSize={2}
                    acceptedTypes={['image/jpeg', 'image/png']}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader size={16} className="animate-spin" />}
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader className="animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        {product.imageUrl || product.image || product.imagePath ? (
                          <img
                            src={resolveImageUrl(product.imageUrl || product.image || product.imagePath)}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {getCategoryName(product)}
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">
                        Rs. {parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 rounded-lg transition-colors"
                            aria-label="Edit product"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded-lg transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
