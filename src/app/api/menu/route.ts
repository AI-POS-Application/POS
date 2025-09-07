import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import type { MenuItem, MenuCategory } from '@/lib/types';

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
    
    const db = getDatabase();
    
    let query = `
      SELECT id, name, price, category, image, is_available as isAvailable,
             created_at as createdAt, updated_at as updatedAt
      FROM menu_items
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    
    if (available !== null) {
      conditions.push('is_available = ?');
      params.push(available === 'true' ? 1 : 0);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY category, name ASC';
    
    const stmt = db.prepare(query);
    const menuItems = stmt.all(...params) as MenuItem[];
    
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
    const { name, price, category, image, isAvailable = true } = body;
    
    if (!name || !price || !category || !image) {
      return NextResponse.json(
        { error: 'Name, price, category, and image are required' }, 
        { status: 400 }
      );
    }
    
    const validCategories: MenuCategory[] = ['Starters', 'Mains', 'Drinks'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be Starters, Mains, or Drinks' }, 
        { status: 400 }
      );
    }
    
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO menu_items (name, price, category, image, is_available) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, price, category, image, isAvailable ? 1 : 0);
    
    const createdItem = db.prepare(`
      SELECT id, name, price, category, image, is_available as isAvailable,
             created_at as createdAt, updated_at as updatedAt
      FROM menu_items 
      WHERE id = ?
    `).get(result.lastInsertRowid) as MenuItem;
    
    return NextResponse.json(createdItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' }, 
      { status: 500 }
    );
  }
}
