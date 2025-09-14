import type { MenuItem } from '@/lib/types';

export const menuItems: MenuItem[] = [
  // Indian Breakfast
  { id: 1, name: 'Idli', price: 95, category: 'Indian Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 2, name: 'Vada', price: 95, category: 'Indian Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 3, name: 'Dosa (Ghee Roast/Masala/Plain)', price: 130, category: 'Indian Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 4, name: 'Dosa with Cheese & Paneer', price: 155, category: 'Indian Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 5, name: 'Onion and Tomato Uthappam', price: 130, category: 'Indian Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 6, name: 'Kerala Paratha with Mutta Roast', price: 175, category: 'Indian Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 7, name: 'Poori Bhaji', price: 150, category: 'Indian Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 8, name: 'Paratha with Dahi (Potato/Cottage Cheese)', price: 150, category: 'Indian Breakfast', image: 'https://placehold.co/100x100.png' },

  // Western Breakfast
  { id: 9, name: 'Seasonal Fresh Juice', price: 120, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 10, name: 'Seasonal Fruit Platter', price: 120, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 11, name: 'Porridge with Hot or Cold Milk', price: 100, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 12, name: 'Choice of Cereal', price: 100, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 13, name: 'Bircher Muesli', price: 130, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 14, name: 'Tall Oaks Continental Breakfast', price: 395, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 15, name: 'Eggs to Order (Masala/Cheese/Plain)', price: 150, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 16, name: 'Jumbo Croissant Breakfast Sandwich', price: 175, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 17, name: 'Eggs Benedict', price: 175, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 18, name: 'Egg Bhurji with Pav', price: 175, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 19, name: 'Giant Belgian Waffles', price: 175, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 20, name: 'Classic Pancakes', price: 175, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 21, name: 'Bruleed French Toast', price: 175, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },
  { id: 22, name: 'Oven Fresh Bread Basket', price: 150, category: 'Western Breakfast', image: 'https://placehold.co/100x100.png' },

  // North Indian Main Course
  { id: 23, name: 'Dal Makhani', price: 250, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },
  { id: 24, name: 'Tadka wali Dal', price: 225, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },
  { id: 25, name: 'Aloo Apki Pasand', price: 250, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },
  { id: 26, name: 'Lasooni Sada Palak', price: 250, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },
  { id: 27, name: 'Bhindi Do Pyaza', price: 275, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },
  { id: 28, name: 'Khumb Mutter Butter Masala', price: 275, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },
  { id: 29, name: 'Saag wale Paneer', price: 350, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },
  { id: 30, name: 'Shahi Paneer', price: 350, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },
  { id: 31, name: 'Punjabi Chole Masala', price: 250, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },
  { id: 32, name: 'Best Butter Chicken', price: 375, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },
  { id: 33, name: 'Chicken Badami', price: 375, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },
  { id: 34, name: 'Chicken Kali Mirch', price: 375, category: 'North Indian Main Course', image: 'https://placehold.co/100x100.png' },

  // Biryani
  { id: 35, name: 'Mixed Vegetable Dum Biryani', price: 350, category: 'Biryani', image: 'https://placehold.co/100x100.png' },
  { id: 36, name: 'Hyderabadi Chicken Biryani', price: 415, category: 'Biryani', image: 'https://placehold.co/100x100.png' },
  { id: 37, name: 'Hyderabadi Lamb Biryani', price: 495, category: 'Biryani', image: 'https://placehold.co/100x100.png' },

  // Rice
  { id: 38, name: 'Steam Rice', price: 150, category: 'Rice', image: 'https://placehold.co/100x100.png' },
  { id: 39, name: 'Ghee Rice', price: 175, category: 'Rice', image: 'https://placehold.co/100x100.png' },
  { id: 40, name: 'Jeera Rice', price: 175, category: 'Rice', image: 'https://placehold.co/100x100.png' },
  { id: 41, name: 'Basmati Pulao', price: 195, category: 'Rice', image: 'https://placehold.co/100x100.png' },

  // Indian Breads
  { id: 42, name: 'Naan (Plain)', price: 65, category: 'Indian Breads', image: 'https://placehold.co/100x100.png' },
  { id: 43, name: 'Naan (Garlic)', price: 75, category: 'Indian Breads', image: 'https://placehold.co/100x100.png' },
  { id: 44, name: 'Naan (Butter)', price: 85, category: 'Indian Breads', image: 'https://placehold.co/100x100.png' },
  { id: 45, name: 'Naan (Cheese)', price: 95, category: 'Indian Breads', image: 'https://placehold.co/100x100.png' },
  { id: 46, name: 'Kulcha (Plain)', price: 75, category: 'Indian Breads', image: 'https://placehold.co/100x100.png' },
  { id: 47, name: 'Kulcha (Garlic)', price: 85, category: 'Indian Breads', image: 'https://placehold.co/100x100.png' },
  { id: 48, name: 'Kulcha (Butter)', price: 95, category: 'Indian Breads', image: 'https://placehold.co/100x100.png' },
  { id: 49, name: 'Kulcha (Chili Garlic)', price: 105, category: 'Indian Breads', image: 'https://placehold.co/100x100.png' },
  { id: 50, name: 'Tandoori Roti', price: 65, category: 'Indian Breads', image: 'https://placehold.co/100x100.png' },
  { id: 51, name: 'Paratha (Laccha/Pudina/Mirch)', price: 75, category: 'Indian Breads', image: 'https://placehold.co/100x100.png' },

  // Pasta
  { id: 52, name: 'Pasta Arrabbiata', price: 350, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 53, name: 'Pasta Pesto', price: 350, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 54, name: 'Pasta Alfredo', price: 350, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 55, name: 'Pasta Carbonara', price: 350, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 56, name: 'Lasagna (Veg)', price: 375, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 57, name: 'Spaghetti Aglio E Olio', price: 350, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 58, name: 'Mac & Cheese', price: 350, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 59, name: 'Gnocchi with Creamy Pesto', price: 350, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 60, name: 'Spinach and Mushroom Ravioli', price: 375, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 61, name: 'Prawn Tortellini with Butter Cream Sauce', price: 450, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 62, name: 'Pasta with Exotic Veggies', price: 350, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 63, name: 'Pasta with Chicken', price: 375, category: 'Pasta', image: 'https://placehold.co/100x100.png' },
  { id: 64, name: 'Pasta with Prawns', price: 450, category: 'Pasta', image: 'https://placehold.co/100x100.png' },

  // Western Full Plate
  { id: 65, name: 'Risotto Al Fungi', price: 350, category: 'Western Full Plate', image: 'https://placehold.co/100x100.png' },
  { id: 66, name: 'Risotto Verdure', price: 350, category: 'Western Full Plate', image: 'https://placehold.co/100x100.png' },
  { id: 67, name: 'Baked Ratatouille', price: 375, category: 'Western Full Plate', image: 'https://placehold.co/100x100.png' },
  { id: 68, name: 'Pesto Marinated Tofu and Exotic Vegetable', price: 350, category: 'Western Full Plate', image: 'https://placehold.co/100x100.png' },
  { id: 69, name: 'Herbs and Garlic Rubbed Chicken', price: 395, category: 'Western Full Plate', image: 'https://placehold.co/100x100.png' },
  { id: 70, name: 'Bourbon and Barbecue Chicken', price: 395, category: 'Western Full Plate', image: 'https://placehold.co/100x100.png' },
  { id: 71, name: 'Seared Sea Bass', price: 450, category: 'Western Full Plate', image: 'https://placehold.co/100x100.png' },
  { id: 72, name: 'Norwegian Salmon', price: 795, category: 'Western Full Plate', image: 'https://placehold.co/100x100.png' },

  // Cold Beverages
  { id: 73, name: 'Cold Coffee', price: 120, category: 'Cold Beverages', image: 'https://placehold.co/100x100.png' },
  { id: 74, name: 'Butter Milk (Plain/Masala/Salted)', price: 120, category: 'Cold Beverages', image: 'https://placehold.co/100x100.png' },
  { id: 75, name: 'Lassi (Sweet/Salt)', price: 120, category: 'Cold Beverages', image: 'https://placehold.co/100x100.png' },
  { id: 76, name: 'Milk Shakes (Vanilla/Chocolate/Seasonal)', price: 120, category: 'Cold Beverages', image: 'https://placehold.co/100x100.png' },

  // Tea & Coffee
  { id: 77, name: 'Thattu Chai', price: 100, category: 'Tea & Coffee', image: 'https://placehold.co/100x100.png' },
  { id: 78, name: 'Masala Tea', price: 100, category: 'Tea & Coffee', image: 'https://placehold.co/100x100.png' },
  { id: 79, name: 'Green Tea', price: 100, category: 'Tea & Coffee', image: 'https://placehold.co/100x100.png' },
  { id: 80, name: 'Assam Tea', price: 100, category: 'Tea & Coffee', image: 'https://placehold.co/100x100.png' },
  { id: 81, name: 'Darjeeling Tea', price: 100, category: 'Tea & Coffee', image: 'https://placehold.co/100x100.png' },
  { id: 82, name: 'English Breakfast Tea', price: 100, category: 'Tea & Coffee', image: 'https://placehold.co/100x100.png' },
  { id: 83, name: 'Lemon Tea', price: 100, category: 'Tea & Coffee', image: 'https://placehold.co/100x100.png' },
  { id: 84, name: 'Chamomile', price: 100, category: 'Tea & Coffee', image: 'https://placehold.co/100x100.png' },
  { id: 85, name: 'South Indian Filter Coffee', price: 120, category: 'Tea & Coffee', image: 'https://placehold.co/100x100.png' },
];
