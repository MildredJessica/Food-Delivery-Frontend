import axios from "axios";
import toast from 'react-hot-toast'; 

// Function to handle menu item deletion
const handleDeleteMenuItem = async (restaurantId, menuItemId) => {
  if (!window.confirm('Are you sure you want to delete this menu item?')) return;
  const backend_url = import.meta.env.VITE_BACKEND_URL;

  try {
    await axios.delete(`${backend_url}/api/restaurant-owner/${restaurantId}/menu/${menuItemId}`);
    // Refresh the page or update state
    window.location.reload();
  } catch (error) {
    console.error('Error deleting menu item:', error);
    toast.error('Failed to delete menu item');
  }
};

export default handleDeleteMenuItem;