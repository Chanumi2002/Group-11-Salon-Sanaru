import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/api';
import { toast } from 'sonner';
import { Trash2, Edit2, Plus, Loader } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { AdminDashboardLayout } from '@/components/common/AdminDashboardLayout';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

const MAX_SERVICE_PHOTO_MB = 10;

export default function ServicePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await adminService.getServices();
      setServices(response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error(error.response?.data?.message || 'Failed to load services');
    } finally {
      setLoading(false);
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Service description is required');
      return;
    }

    if (!formData.price || Number.isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      toast.error('Valid service price is required');
      return;
    }

    if (!selectedFile && !editingId) {
      toast.error('Service photo is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('description', formData.description.trim());
      payload.append('price', Number(formData.price).toFixed(2));
      if (selectedFile) {
        payload.append('image', selectedFile);
      }

      if (editingId) {
        await adminService.updateService(editingId, payload);
        toast.success('Service updated successfully');
      } else {
        await adminService.createService(payload);
        toast.success('Service created successfully');
      }

      handleClose();
      await fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.message || `Failed to save service. Maximum photo size is ${MAX_SERVICE_PHOTO_MB}MB.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
    });
    setPreviewUrl(resolveImageUrl(service.imageUrl || service.image || service.imagePath || ''));
    setSelectedFile(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await adminService.deleteService(serviceId);
      toast.success('Service deleted successfully');
      await fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setIsSubmitting(false);
    setFormData({
      name: '',
      description: '',
      price: '',
    });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Services</h1>
            <p className="text-muted-foreground">Manage salon services and pricing</p>
          </div>
          <button
            onClick={() => {
              handleClose();
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Service
          </button>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 my-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                {editingId ? 'Edit Service' : 'Add New Service'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Service Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter service name"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter service description"
                    disabled={isSubmitting}
                    rows="4"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
                    Price (LKR)
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

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Service Photo
                  </label>
                  <ImageUpload
                    onFileSelect={handleFileSelect}
                    previewUrl={previewUrl}
                    onRemove={handleRemoveImage}
                    isLoading={isSubmitting}
                    maxSize={MAX_SERVICE_PHOTO_MB}
                    acceptedTypes={['image/jpeg', 'image/png']}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Maximum photo size: {MAX_SERVICE_PHOTO_MB}MB (JPG or PNG)
                  </p>
                </div>

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

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader className="animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No services found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Photo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Service
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
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        {service.imageUrl || service.image || service.imagePath ? (
                          <img
                            src={resolveImageUrl(service.imageUrl || service.image || service.imagePath)}
                            alt={service.name}
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
                          <p className="font-medium text-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {service.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">
                        Rs. {Number(service.price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 rounded-lg transition-colors"
                            aria-label="Edit service"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded-lg transition-colors"
                            aria-label="Delete service"
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
