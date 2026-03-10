import React, { useState } from 'react';
import axios from 'axios';

// Add Menu Form Component
const AddMenuForm = ({ restaurantId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageSource, setImageSource] = useState('file'); // 'file' or 'link'
  const [imageUrl, setImageUrl] = useState('');

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Compress to max 800x600
          if (width > height) {
            if (width > 800) {
              height = Math.round(height * (800 / width));
              width = 800;
            }
          } else {
            if (height > 600) {
              width = Math.round(width * (600 / height));
              height = 600;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to 70% quality
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressed);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files.length > 0) {
      const compressedImage = await compressImage(files[0]);
      setFormData({
        ...formData,
        [name]: compressedImage
      });
      setImageUrl('');
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setFormData({
      ...formData,
      image: url
    });
  };
  const handleImageSourceChange = (source) => {
    setImageSource(source);
    // Clear image data when switching sources
    setFormData({
      ...formData,
      image: ''
    });
    setImageUrl('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate image input
    if (imageSource === 'file' && !formData.image && !imageUrl) {
      setError('Please select an image file');
      setLoading(false);
      return;
    }

    if (imageSource === 'link' && !imageUrl) {
      setError('Please enter an image URL');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:3000/api/restaurant-owner/${restaurantId}/menu`,
        formData
      );
      
      if (response.data.success) {
        onSuccess();
      } else {
        setError(response.data.message || 'Failed to add menu item');
      }
    } catch (err) {
      console.error('Error adding menu item:', err);
      setError(err.response?.data?.message || 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Appetizers',
    'Main Course',
    'Desserts',
    'Beverages',
    'Salads',
    'Soups',
    'Sides',
    'Specials'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add Menu Item</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">✕</button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Margherita Pizza"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Describe the menu item..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="9.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              {/* Image source toggle */}
              <div className="flex space-x-4 mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={imageSource === 'file'}
                    onChange={() => handleImageSourceChange('file')}
                    className="form-radio h-4 w-4 text-orange-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Upload File</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="link"
                    checked={imageSource === 'link'}
                    onChange={() => handleImageSourceChange('link')}
                    className="form-radio h-4 w-4 text-orange-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Image URL</span>
                </label>
              </div>

              {/* File upload input */}
              {imageSource === 'file' && (
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              )}

              {/* URL input */}
              {imageSource === 'link' && (
                <input
                  type="url"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              )}

              {/* Image preview */}
              {(formData.image || imageUrl) && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={formData.image || imageUrl}
                    alt="Menu item preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50">
                {loading ? 'Adding...' : 'Add Menu Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMenuForm;