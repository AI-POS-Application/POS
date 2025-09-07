import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import type { StaffMember, StaffRole } from '@/lib/types';

/**
 * GET /api/staff - Retrieves all staff members
 * @param request - Contains optional query parameters for filtering
 * @returns Array of staff members
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    
    const db = getDatabase();
    
    let query = `
      SELECT id, name, role, shift, status, avatar,
             created_at as createdAt, updated_at as updatedAt
      FROM staff
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY name ASC';
    
    const stmt = db.prepare(query);
    const staffMembers = stmt.all(...params) as StaffMember[];
    
    return NextResponse.json(staffMembers);
  } catch (error) {
    console.error('Error fetching staff members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff members' }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/staff - Creates a new staff member
 * @param request - Contains staff member data in body
 * @returns Created staff member object
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, shift, status = 'Off Duty', avatar } = body;
    
    if (!name || !role || !shift || !avatar) {
      return NextResponse.json(
        { error: 'Name, role, shift, and avatar are required' }, 
        { status: 400 }
      );
    }
    
    const validRoles: StaffRole[] = ['Manager', 'Head Waiter', 'Waiter', 'Chef', 'Sous Chef', 'Hostess'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' }, 
        { status: 400 }
      );
    }
    
    const validStatuses = ['On Shift', 'Off Duty'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "On Shift" or "Off Duty"' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO staff (name, role, shift, status, avatar) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, role, shift, status, avatar);
    
    const createdStaff = db.prepare(`
      SELECT id, name, role, shift, status, avatar,
             created_at as createdAt, updated_at as updatedAt
      FROM staff 
      WHERE id = ?
    `).get(result.lastInsertRowid) as StaffMember;
    
    return NextResponse.json(createdStaff, { status: 201 });
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' }, 
      { status: 500 }
    );
  }
}
