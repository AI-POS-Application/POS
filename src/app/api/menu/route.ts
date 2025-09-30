import { NextRequest, NextResponse } from 'next/server';
import { getMenuItems, getMenuItemsByCategory, getAvailableMenuItems, createMenuItem } from '@/services/menuItems';

/**
 * GET /api/menu - Retrieves all menu items
 * @param request - Contains optional query parameters for filtering
 * @returns Array of menu items
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const available = searchParams.get('available');
    
    let menuItems;
    
    if (available === 'true') {
      menuItems = await getAvailableMenuItems();
    } else if (category) {
      menuItems = await getMenuItemsByCategory(category);
    } else {
      menuItems = await getMenuItems();
    }
    
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/menu - Creates a new menu item
 * @param request - Contains menu item data in body
 * @returns Created menu item object
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, category, description, isAvailable = true } = body;
    
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' }, 
        { status: 400 }
      );
    }
    
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' }, 
        { status: 400 }
      );
    }
    
    const createdItem = await createMenuItem({
      name,
      price,
      category,
      description,
      isAvailable
    });
    
    return NextResponse.json(createdItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' }, 
      { status: 500 }
    );
  }
}
