import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import type { Table, TableStatus } from '@/lib/types';

/**
 * GET /api/tables - Retrieves all tables
 * @returns Array of tables with current status
 */
export async function GET() {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, number, status, customer_count as customerCount, 
             created_at as createdAt, updated_at as updatedAt
      FROM tables 
      ORDER BY number ASC
    `);
    
    const tables = stmt.all() as Table[];
    
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/tables - Creates a new table
 * @param request - Contains table data in body
 * @returns Created table object
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, status = 'Free', customerCount } = body;
    
    if (!number || typeof number !== 'number') {
      return NextResponse.json(
        { error: 'Table number is required and must be a number' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO tables (number, status, customer_count) 
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(number, status, customerCount || null);
    
    const createdTable = db.prepare(`
      SELECT id, number, status, customer_count as customerCount,
             created_at as createdAt, updated_at as updatedAt
      FROM tables 
      WHERE id = ?
    `).get(result.lastInsertRowid) as Table;
    
    return NextResponse.json(createdTable, { status: 201 });
  } catch (error: any) {
    console.error('Error creating table:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json(
        { error: 'Table number already exists' }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create table' }, 
      { status: 500 }
    );
  }
}
