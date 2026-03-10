import { useState } from 'react';
import AddMenuForm from '../restaurant-owner/AddMenuForm.jsx';
import EditRestaurantForm from '../restaurant-owner/EditRestaurantForm.jsx';
import EditMenuForm from '../restaurant-owner/EditMenuForm.jsx';
import handleDeleteMenuItem from '../restaurant-owner/HandleDeleteMenuForm.jsx';


// Restaurant List Component
const RestaurantOwnerList = ({
    restaurants,
    onRestaurantAdded,
    showEditRestaurant,
    setShowEditRestaurant,
    editRestaurantData,
    setEditRestaurantData,
    showEditMenu,
    setShowEditMenu,
    editMenuItemData,
    setEditMenuItemData 
}) => {
  const [showAddMenu, setShowAddMenu] = useState(null);

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏪</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No restaurants yet</h3>
        <p className="text-gray-500">Add your first restaurant to get started!</p>
      </div>
    );
  }

  return (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
            <div key={restaurant._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                    <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                    restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                    <span>⭐ {restaurant.rating || 'No ratings'}</span>
                    <span className="mx-2">•</span>
                    <span>🕒 {restaurant.deliveryTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{restaurant.address}</p>
                </div>

                {/* Menu Items Section */}
                {restaurant.menu && restaurant.menu.length > 0 && (
                    <div className="mt-4 mb-4 border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Menu Items:</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {restaurant.menu.map((item, index) => (
                            <div key={item._id || index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                <div>
                                <span className="font-medium">{item.name}</span>
                                <span className="text-gray-500 ml-2">${item.price?.toFixed(2)}</span>
                                </div>
                                <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                    setEditMenuItemData({ ...item, restaurantId: restaurant._id });
                                    setShowEditMenu(restaurant._id);
                                    }}
                                    className="text-xs text-orange-500 hover:text-orange-700"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteMenuItem(restaurant._id, item._id)}
                                    className="text-xs text-red-500 hover:text-red-700"
                                >
                                    Delete
                                </button>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                    {restaurant.menu?.length || 0} menu items
                    </div>
                    
                    <div className="flex space-x-2">
                    <button
                        onClick={() => setShowAddMenu(restaurant._id)}
                        className="text-sm text-orange-500 hover:text-orange-700"
                    >
                        Add Menu
                    </button>
                    <button
                        onClick={() => {
                        setEditRestaurantData(restaurant);
                        setShowEditRestaurant(restaurant._id);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Edit
                    </button>
                    </div>
                </div>
                </div>
            </div>
            ))}
      </div>

      {/* Add Menu Modal */}
      {showAddMenu && (
        <AddMenuForm
          restaurantId={showAddMenu}
          onClose={() => setShowAddMenu(null)}
          onSuccess={() => {
            onRestaurantAdded();
            setShowAddMenu(null);
          }}
        />
      )}

      {/* Edit Restaurant Modal */}
      {showEditRestaurant && editRestaurantData && (
        <EditRestaurantForm
          restaurant={editRestaurantData}
          onClose={() => {
            setShowEditRestaurant(null);
            setEditRestaurantData(null);
          }}
          onSuccess={() => {
            onRestaurantAdded();
            setShowEditRestaurant(null);
            setEditRestaurantData(null);
          }}
        />
      )}
      {/* Edit Menu Item Modal */}
      {showEditMenu && editMenuItemData && (
        <EditMenuForm
          menuItem={editMenuItemData}
          restaurantId={editMenuItemData.restaurantId}
          onClose={() => {
            setShowEditMenu(null);
            setEditMenuItemData(null);
          }}
          onSuccess={() => {
            onRestaurantAdded();
            setShowEditMenu(null);
            setEditMenuItemData(null);
          }}
        />
      )}
    </div>
  );
};

export default RestaurantOwnerList;