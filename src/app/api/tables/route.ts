import { NextRequest, NextResponse } from 'next/server';
import { getTables, createTable } from '@/services/tables';

/**
 * GET /api/tables - Retrieves all tables
 * @returns Array of tables with current status
 */
export async function GET() {
  try {
    const tables = await getTables();
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
    const { number, capacity } = body;
    
    if (!number || typeof number !== 'number') {
      return NextResponse.json(
        { error: 'Table number is required and must be a number' }, 
        { status: 400 }
      );
    }

    if (!capacity || typeof capacity !== 'number') {
      return NextResponse.json(
        { error: 'Table capacity is required and must be a number' }, 
        { status: 400 }
      );
    }
    
    const createdTable = await createTable(number, capacity);
    
    return NextResponse.json(createdTable, { status: 201 });
  } catch (error: any) {
    console.error('Error creating table:', error);
    
    if (error.code === 'P2002') {
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
