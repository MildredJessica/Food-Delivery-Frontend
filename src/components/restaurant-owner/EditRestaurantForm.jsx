import { useState } from 'react';
import axios from 'axios';


 // Edit Restaurant Form Component
const EditRestaurantForm = ({ restaurant, onClose, onSuccess }) => {
   const [formData, setFormData] = useState({
     name: restaurant.name || '',
     description: restaurant.description || '',
     cuisine: restaurant.cuisine || '',
     deliveryTime: restaurant.deliveryTime || '30-40 minutes',
     address: restaurant.address || '',
     countryCode: restaurant.countryCode || '+1',
     phone: restaurant.phone || '',
     openingHours: restaurant.openingHours || '9:00 AM - 10:00 PM',
     image: restaurant.image || ''
   });
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const backend_url = import.meta.env.VITE_BACKEND_URL;

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
         setFormData({ ...formData, image: compressedImage });
       });
     } else {
       setFormData({ ...formData, [name]: value });
     }
   };
 
   const handleSubmit = async (e) => {
     e.preventDefault();
     setError('');
     setLoading(true);
     try {
       const response = await axios.put(
         `${backend_url}/api/restaurant-owner/${restaurant._id}`,
         formData
       );
       if (response.data.success) {
         onSuccess();
       } else {
         setError(response.data.message || 'Failed to update restaurant');
       }
     } catch (err) {
       console.error('Error updating restaurant:', err);
       setError(err.response?.data?.message || 'Failed to update restaurant');
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
         <div className="p-6">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-gray-900">Edit Restaurant</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-500">✕</button>
           </div>
 
           {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}
 
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name *</label>
                 <input 
                   type="text" 
                   name="name" 
                   value={formData.name} 
                   onChange={handleChange} 
                   required 
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type *</label>
                 <select
                   name="cuisine"
                   value={formData.cuisine}
                   onChange={handleChange}
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
             </div>
 
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
               <textarea 
                 name="address" 
                 value={formData.address} 
                 onChange={handleChange} 
                 required 
                 rows="2" 
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
               />
             </div>
 
             <div className="flex justify-end space-x-4 pt-6 border-t">
               <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700">Cancel</button>
               <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg disabled:opacity-50">
                 {loading ? 'Updating...' : 'Update Restaurant'}
               </button>
             </div>
           </form>
         </div>
       </div>
     </div>
   );
 };

 export default EditRestaurantForm;