/**
 * EXAMPLE: How to Create a Form with Image Upload
 * This file serves as a reference for implementing image upload in custom forms
 */

import React, { useState } from 'react';
import { adminService } from '@/services/api';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

/**
 * Example 1: Simple Category Form
 */
export function SimpleCategoryForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (file, preview) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!selectedFile) {
      toast.error('Image is required');
      return;
    }

    try {
      setIsLoading(true);

      const form = new FormData();
      form.append('name', formData.name);
      form.append('image', selectedFile);

      const response = await adminService.createCategory(form);

      toast.success('Category created successfully');
      setFormData({ name: '' });
      setSelectedFile(null);
      setPreviewUrl('');

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-2">Category Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter category name"
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Image</label>
        <ImageUpload
          onFileSelect={handleFileSelect}
          previewUrl={previewUrl}
          onRemove={() => {
            setSelectedFile(null);
            setPreviewUrl('');
          }}
          isLoading={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading && <Loader size={16} className="animate-spin" />}
        Create Category
      </button>
    </form>
  );
}

/**
 * Example 2: Advanced Product Form with Validation
 */
export function AdvancedProductForm({ onSuccess, categories = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFileSelect = (file, preview) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!selectedFile) {
      newErrors.image = 'Image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      setIsLoading(true);

      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', parseFloat(formData.price));
      form.append('categoryId', parseInt(formData.categoryId));
      form.append('image', selectedFile);

      const response = await adminService.createProduct(form);

      toast.success('Product created successfully');
      setFormData({ name: '', description: '', price: '', categoryId: '' });
      setSelectedFile(null);
      setPreviewUrl('');

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Product Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter product name"
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter product description"
          disabled={isLoading}
          rows="3"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium mb-2">Price</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            errors.price ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            errors.categoryId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Product Image</label>
        <ImageUpload
          onFileSelect={handleFileSelect}
          previewUrl={previewUrl}
          onRemove={() => {
            setSelectedFile(null);
            setPreviewUrl('');
          }}
          isLoading={isLoading}
        />
        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading && <Loader size={16} className="animate-spin" />}
        Create Product
      </button>
    </form>
  );
}

/**
 * Example 3: Edit Form with Existing Image
 */
export function EditProductForm({
  product,
  categories = [],
  onSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    categoryId: product?.categoryId || '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(product?.imageUrl || product?.image || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (file, preview) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    try {
      setIsLoading(true);

      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', parseFloat(formData.price));
      form.append('categoryId', parseInt(formData.categoryId));

      // Only append image if a new one was selected
      if (selectedFile) {
        form.append('image', selectedFile);
      }

      const response = await adminService.updateProduct(product.id, form);

      toast.success('Product updated successfully');

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-2">Product Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter product name"
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter product description"
          disabled={isLoading}
          rows="3"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Price</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Product Image</label>
        <ImageUpload
          onFileSelect={handleFileSelect}
          previewUrl={previewUrl}
          onRemove={() => {
            setSelectedFile(null);
            // Reset to original image if new one was selected
            if (!selectedFile) {
              setPreviewUrl(product?.imageUrl || product?.image || '');
            }
          }}
          isLoading={isLoading}
        />
        <p className="text-xs text-gray-500 mt-2">Leave empty to keep current image</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader size={16} className="animate-spin" />}
          Update Product
        </button>
      </div>
    </form>
  );
}

/**
 * Example 4: Using with Inline Form (No Modal)
 */
export function InlineProductForm({ onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [formState, setFormState] = useState({
    formData: {
      name: '',
      description: '',
      price: '',
      categoryId: '',
    },
    selectedFile: null,
    previewUrl: '',
    isLoading: false,
  });

  // Fetch categories on mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  return (
    <AdvancedProductForm
      onSuccess={onSuccess}
      categories={categories}
    />
  );
}

export default {
  SimpleCategoryForm,
  AdvancedProductForm,
  EditProductForm,
  InlineProductForm,
};
