import React, { useState } from 'react';

const AddressForm = ({ 
  userAddress,
  onSubmit, 
  onBack, 
  loading,
  deliveryInstructions,
  setDeliveryInstructions, 
  // click
}) => {
  const [address, setAddress] = useState({
    street: userAddress?.street ?? '',
    city: userAddress?.city ?? '',
    state: userAddress?.state ?? '',
    zipCode: userAddress?.zipCode ?? '',
    country: userAddress?.country ?? 'NG'
  });

  const [saveAddress, setSaveAddress] = useState(true);
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!address.street.trim()) newErrors.street = 'Street address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state.trim()) newErrors.state = 'State is required';
    if (!address.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    return newErrors;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(address);
    // return;
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          ← Back to Cart
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Delivery Address</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={address.street ?? ''}
              onChange={(e) => {
                setAddress({...address, street: e.target.value});
                setErrors({...errors, street: ''});
              }}
              required
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.street ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123 Main Street"
            />
            {errors.street && (
              <p className="text-sm text-red-500 mt-1">{errors.street}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={address.city ?? ''}
                onChange={(e) => {
                  setAddress({...address, city: e.target.value});
                  setErrors({...errors, city: ''});
                }}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Lagos"
              />
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">{errors.city}</p>
              )}            
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                value={address.state ?? ''}
                onChange={(e) => {
                  setAddress({...address, state: e.target.value})
                  setErrors({...errors, state: ''});
                }}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Lagos"
              />
              {errors.state && (
                <p className="text-sm text-red-500 mt-1">{errors.state}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                value={address.zipCode ?? ''}
                onChange={(e) =>{
                  setAddress({...address, zipCode: e.target.value})
                  setErrors({...errors, zipCode: ''});
                }}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="10001"
              />
              {errors.zipCode && (
                <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>
              )}
            </div>
            
          </div>
          {/* Delivery Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Instructions (Optional)
            </label>
            <textarea
              value={deliveryInstructions ?? ''}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Leave at the gate, Ring doorbell, etc."
            />
          </div>
        </div>
        {/* Save Address Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="saveAddress"
            checked={saveAddress}
            onChange={(e) => setSaveAddress(e.target.checked)}
            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
          />
          <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-700">
            Save this address for future orders
          </label>
        </div>
        <button
          type="submit"
          // onClick={onClick}
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};
export default AddressForm;