import axios from "axios";

// Function to handle menu item deletion
const handleDeleteMenuItem = async (restaurantId, menuItemId) => {
  if (!window.confirm('Are you sure you want to delete this menu item?')) return;
  
  try {
    await axios.delete(`http://localhost:3000/api/restaurant-owner/${restaurantId}/menu/${menuItemId}`);
    // Refresh the page or update state
    window.location.reload();
  } catch (error) {
    console.error('Error deleting menu item:', error);
    alert('Failed to delete menu item');
  }
};

export default handleDeleteMenuItem;