import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import ReviewForm from '@/components/ReviewForm';
import { ArrowLeft } from 'lucide-react';

export default function WriteReview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const productId = searchParams.get('productId');
  const serviceId = searchParams.get('serviceId');
  const productName = searchParams.get('productName');
  const serviceName = searchParams.get('serviceName');
  const itemName = productName || serviceName;
  const itemId = productId || serviceId;

  const handleReviewAdded = () => {
    // After review is submitted, redirect to customer's reviews page
    navigate('/customer_dashboard/reviews');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Write a Review</h1>
            <p className="mt-1 text-sm text-gray-600">
              Share your feedback about this {productId ? 'product' : 'service'}.
            </p>
          </div>
        </div>

        {/* Review Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ReviewForm
            productId={productId}
            serviceId={serviceId}
            itemName={itemName}
            onReviewAdded={handleReviewAdded}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
