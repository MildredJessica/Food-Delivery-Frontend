import  { useState} from 'react';
import axios from 'axios';

// Add Restaurant Form Component
const AddRestaurantForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    deliveryTime: '30-40 minutes',
    address: '',
    countryCode: '+1',
    phone: '',
    openingHours: '9:00 AM - 10:00 PM',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageSource, setImageSource] = useState('file'); // 'file' or 'link'
  const [imageUrl, setImageUrl] = useState('');
  const backend_url = import.meta.env.VITE_BACKEND_URL;


  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsImage = reader.readAsDataURL;
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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files.length > 0) {
      const file = files[0];
      compressImage(file).then((compressedImage) => {
        setFormData({
          ...formData,
          image: compressedImage
        });
      });
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
      const response = await axios.post(`${backend_url}/api/restaurants`, formData);
      
      if (response.data.success) {
        onSuccess();
      } else {
        setError(response.data.message || 'Failed to add restaurant');
      }
    } catch (err) {
      console.error('Error adding restaurant:', err);
      setError(err.response?.data?.message || 'Failed to add restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Restaurant</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Pizza Palace"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type *
                </label>
                <select
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select cuisine</option>
                  <option value="Italian">Italian</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Indian">Indian</option>
                  <option value="Mexican">Mexican</option>
                  <option value="American">American</option>
                  <option value="African">African</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Thai">Thai</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Fast Food">Fast Food</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time *
                </label>
                <select
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="15-25 minutes">15-25 minutes</option>
                  <option value="20-30 minutes">20-30 minutes</option>
                  <option value="25-35 minutes">25-35 minutes</option>
                  <option value="30-40 minutes">30-40 minutes</option>
                  <option value="35-45 minutes">35-45 minutes</option>
                  <option value="40-50 minutes">40-50 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="+1">+1 (US/CA)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+91">+91 (India)</option>
                    <option value="+61">+61 (Australia)</option>
                    <option value="+33">+33 (France)</option>
                    <option value="+49">+49 (Germany)</option>
                    <option value="+39">+39 (Italy)</option>
                    <option value="+81">+81 (Japan)</option>
                    <option value="+86">+86 (China)</option>
                    <option value="+55">+55 (Brazil)</option>
                    <option value="+27">+27 (South Africa)</option>
                    <option value="+971">+971 (UAE)</option>
                    <option value="+234">+234 (Nigeria)</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="10-digit phone number"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Full restaurant address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Describe your restaurant..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Hours
                </label>
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 9:00 AM - 10:00 PM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Image
                </label>
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
                    placeholder="https://example.com/restaurant-image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                )}

                {/* Image preview */}
                {(formData.image || imageUrl) && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={formData.image || imageUrl}
                      alt="Restaurant preview"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/800x600?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Restaurant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurantForm;