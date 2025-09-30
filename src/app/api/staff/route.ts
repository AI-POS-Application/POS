import { NextRequest, NextResponse } from 'next/server';
import { getStaff, getStaffByRole, createStaff } from '@/services/staff';

/**
 * GET /api/staff - Retrieves all staff members
 * @param request - Contains optional query parameters for filtering
 * @returns Array of staff members
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    let staffMembers;
    
    if (role) {
      staffMembers = await getStaffByRole(role);
    } else {
      staffMembers = await getStaff();
    }
    
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
    const { name, role } = body;
    
    if (!name || !role) {
      return NextResponse.json(
        { error: 'Name and role are required' }, 
        { status: 400 }
      );
    }
    
    const createdStaff = await createStaff(name, role);
    
    return NextResponse.json(createdStaff, { status: 201 });
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' }, 
      { status: 500 }
    );
  }
}
