import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import type { StaffMember, StaffRole } from '@/lib/types';

/**
 * GET /api/staff/[id] - Retrieves a specific staff member
 * @param request - Next request object
 * @param params - Route parameters containing staff member ID
 * @returns Staff member object or 404 if not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);
    
    if (isNaN(staffId)) {
      return NextResponse.json(
        { error: 'Invalid staff member ID' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, name, role, shift, status, avatar,
             created_at as createdAt, updated_at as updatedAt
      FROM staff 
      WHERE id = ?
    `);
    
    const staffMember = stmt.get(staffId) as StaffMember | undefined;
    
    if (!staffMember) {
      return NextResponse.json(
        { error: 'Staff member not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(staffMember);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff member' }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/staff/[id] - Updates a specific staff member
 * @param request - Contains updated staff member data in body
 * @param params - Route parameters containing staff member ID
 * @returns Updated staff member object
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);
    
    if (isNaN(staffId)) {
      return NextResponse.json(
        { error: 'Invalid staff member ID' }, 
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { name, role, shift, status, avatar } = body;
    
    if (role) {
      const validRoles: StaffRole[] = ['Manager', 'Head Waiter', 'Waiter', 'Chef', 'Sous Chef', 'Hostess'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role' }, 
          { status: 400 }
        );
      }
    }
    
    if (status) {
      const validStatuses = ['On Shift', 'Off Duty'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be "On Shift" or "Off Duty"' }, 
          { status: 400 }
        );
      }
    }
    
    const db = getDatabase();
    
    // Check if staff member exists
    const existingStaff = db.prepare('SELECT id FROM staff WHERE id = ?').get(staffId);
    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' }, 
        { status: 404 }
      );
    }
    
    const stmt = db.prepare(`
      UPDATE staff 
      SET name = COALESCE(?, name),
          role = COALESCE(?, role),
          shift = COALESCE(?, shift),
          status = COALESCE(?, status),
          avatar = COALESCE(?, avatar)
      WHERE id = ?
    `);
    
    stmt.run(name || null, role || null, shift || null, status || null, avatar || null, staffId);
    
    const updatedStaff = db.prepare(`
      SELECT id, name, role, shift, status, avatar,
             created_at as createdAt, updated_at as updatedAt
      FROM staff 
      WHERE id = ?
    `).get(staffId) as StaffMember;
    
    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/staff/[id] - Deletes a specific staff member
 * @param request - Next request object
 * @param params - Route parameters containing staff member ID
 * @returns Success message or error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);
    
    if (isNaN(staffId)) {
      return NextResponse.json(
        { error: 'Invalid staff member ID' }, 
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Check if staff member exists
    const existingStaff = db.prepare('SELECT id FROM staff WHERE id = ?').get(staffId);
    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' }, 
        { status: 404 }
      );
    }
    
    const stmt = db.prepare('DELETE FROM staff WHERE id = ?');
    stmt.run(staffId);
    
    return NextResponse.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff member' }, 
      { status: 500 }
    );
  }
}
