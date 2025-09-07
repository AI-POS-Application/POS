import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import type { MenuItem, MenuCategory } from '@/lib/types';

/**
 * GET /api/menu/[id] - Retrieves a specific menu item
 * @param request - Next request object
 * @param params - Route parameters containing menu item ID
 * @returns Menu item object or 404 if not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, name, price, category, image, is_available as isAvailable,
             created_at as createdAt, updated_at as updatedAt
      FROM menu_items 
      WHERE id = ?
    `);
    
    const menuItem = stmt.get(itemId) as MenuItem | undefined;
    
    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/menu/[id] - Updates a specific menu item
 * @param request - Contains updated menu item data in body
 * @param params - Route parameters containing menu item ID
 * @returns Updated menu item object
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' }, 
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { name, price, category, image, isAvailable } = body;
    
    if (category) {
      const validCategories: MenuCategory[] = ['Starters', 'Mains', 'Drinks'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category. Must be Starters, Mains, or Drinks' }, 
          { status: 400 }
        );
      }
    }
    
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return NextResponse.json(
        { error: 'Price must be a positive number' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if menu item exists
    const existingItem = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(itemId);
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Menu item not found' }, 
        { status: 404 }
      );
    }
    
    const stmt = db.prepare(`
      UPDATE menu_items 
      SET name = COALESCE(?, name),
          price = COALESCE(?, price),
          category = COALESCE(?, category),
          image = COALESCE(?, image),
          is_available = COALESCE(?, is_available)
      WHERE id = ?
    `);
    
    stmt.run(
      name || null, 
      price || null, 
      category || null, 
      image || null, 
      isAvailable !== undefined ? (isAvailable ? 1 : 0) : null, 
      itemId
    );
    
    const updatedItem = db.prepare(`
      SELECT id, name, price, category, image, is_available as isAvailable,
             created_at as createdAt, updated_at as updatedAt
      FROM menu_items 
      WHERE id = ?
    `).get(itemId) as MenuItem;
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/menu/[id] - Deletes a specific menu item
 * @param request - Next request object
 * @param params - Route parameters containing menu item ID
 * @returns Success message or error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if menu item exists
    const existingItem = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(itemId);
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Menu item not found' }, 
        { status: 404 }
      );
    }
    
    const stmt = db.prepare('DELETE FROM menu_items WHERE id = ?');
    stmt.run(itemId);
    
    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' }, 
      { status: 500 }
    );
  }
}
