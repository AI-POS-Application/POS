import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import type { Table, TableStatus } from '@/lib/types';

/**
 * GET /api/tables/[id] - Retrieves a specific table
 * @param request - Next request object
 * @param params - Route parameters containing table ID
 * @returns Table object or 404 if not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = parseInt(id);
    
    if (isNaN(tableId)) {
      return NextResponse.json(
        { error: 'Invalid table ID' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, number, status, customer_count as customerCount,
             created_at as createdAt, updated_at as updatedAt
      FROM tables 
      WHERE id = ?
    `);
    
    const table = stmt.get(tableId) as Table | undefined;
    
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table' }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tables/[id] - Updates a specific table
 * @param request - Contains updated table data in body
 * @param params - Route parameters containing table ID
 * @returns Updated table object
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = parseInt(id);
    
    if (isNaN(tableId)) {
      return NextResponse.json(
        { error: 'Invalid table ID' }, 
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { status, customerCount } = body;
    
    const validStatuses: TableStatus[] = ['Free', 'Occupied', 'Serving', 'Billing'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid table status' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if table exists
    const existingTable = db.prepare('SELECT id FROM tables WHERE id = ?').get(tableId);
    if (!existingTable) {
      return NextResponse.json(
        { error: 'Table not found' }, 
        { status: 404 }
      );
    }
    
    const stmt = db.prepare(`
      UPDATE tables 
      SET status = COALESCE(?, status), 
          customer_count = COALESCE(?, customer_count)
      WHERE id = ?
    `);
    
    stmt.run(status || null, customerCount || null, tableId);
    
    const updatedTable = db.prepare(`
      SELECT id, number, status, customer_count as customerCount,
             created_at as createdAt, updated_at as updatedAt
      FROM tables 
      WHERE id = ?
    `).get(tableId) as Table;
    
    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { error: 'Failed to update table' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tables/[id] - Deletes a specific table
 * @param request - Next request object
 * @param params - Route parameters containing table ID
 * @returns Success message or error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = parseInt(id);
    
    if (isNaN(tableId)) {
      return NextResponse.json(
        { error: 'Invalid table ID' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if table exists
    const existingTable = db.prepare('SELECT id FROM tables WHERE id = ?').get(tableId);
    if (!existingTable) {
      return NextResponse.json(
        { error: 'Table not found' }, 
        { status: 404 }
      );
    }
    
    const stmt = db.prepare('DELETE FROM tables WHERE id = ?');
    stmt.run(tableId);
    
    return NextResponse.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { error: 'Failed to delete table' }, 
      { status: 500 }
    );
  }
}
