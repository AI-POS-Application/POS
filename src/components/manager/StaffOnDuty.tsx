'use client';
import { useApi } from '@/hooks/use-api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '../ui/badge';
import { Clock, Users } from 'lucide-react';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  shift: string;
  status: string;
  avatar: string;
}

export default function StaffOnDuty() {
  const { data: staffMembers, loading, error } = useApi<StaffMember[]>('/api/staff');

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center animate-pulse">
            <div className="h-9 w-9 bg-muted rounded-full"></div>
            <div className="ml-4 space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </div>
            <div className="h-6 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !staffMembers) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Users className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Failed to load staff data</p>
      </div>
    );
  }

  const onDutyStaff = staffMembers.filter(member => member.status === 'On Shift');

  if (onDutyStaff.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No staff currently on duty</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onDutyStaff.map((member) => (
        <div key={member.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{member.name}</p>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
          <div className="ml-auto font-medium">
            <Badge variant="outline">{member.shift}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
