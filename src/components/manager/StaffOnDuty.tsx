'use client';
import { useApi } from '@/hooks/use-api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center animate-pulse">
            <div className="h-7 w-7 bg-muted rounded-full"></div>
            <div className="ml-3 space-y-1 flex-1">
              <div className="h-3 bg-muted rounded w-20"></div>
              <div className="h-2 bg-muted rounded w-14"></div>
            </div>
            <div className="h-5 bg-muted rounded w-14"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !staffMembers) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Users className="h-6 w-6 text-muted-foreground mb-1" />
        <p className="text-xs text-muted-foreground">Failed to load staff data</p>
      </div>
    );
  }

  // Filter and deduplicate staff members
  const onDutyStaff = staffMembers
    .filter(member => member.status === 'On Shift')
    .reduce((unique, member) => {
      // Remove duplicates based on name and role combination
      const key = `${member.name}-${member.role}`;
      if (!unique.find(item => `${item.name}-${item.role}` === key)) {
        unique.push(member);
      }
      return unique;
    }, [] as StaffMember[]);

  if (onDutyStaff.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Clock className="h-6 w-6 text-muted-foreground mb-1" />
        <p className="text-xs text-muted-foreground">No staff currently on duty</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {onDutyStaff.slice(0, 6).map((member) => (
        <div key={`${member.name}-${member.role}-${member.id}`} className="flex items-center">
          <Avatar className="h-6 w-6">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-2 space-y-0.5 flex-1 min-w-0">
            <p className="text-xs font-medium leading-none truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground truncate">{member.role}</p>
          </div>
          <div className="ml-2">
            <Badge variant="outline" className="text-xs">{member.shift}</Badge>
          </div>
        </div>
      ))}
      {onDutyStaff.length > 6 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
          onClick={() => router.push('/staff')}
        >
          <Users className="h-3 w-3 mr-1" />
          +{onDutyStaff.length - 6} more staff
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
}
