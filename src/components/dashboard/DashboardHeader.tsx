
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: SupabaseUser | null;
  onSignOut: () => void;
}

const DashboardHeader = ({ user, onSignOut }: DashboardHeaderProps) => {
  return (
    <header className="bg-card border-b border-border p-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard Admin</h1>
        <p className="text-sm text-muted-foreground">Kelola layanan digital Anda</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium text-foreground">
              {user?.user_metadata?.full_name || user?.email || 'Admin'}
            </div>
            <div className="text-muted-foreground">{user?.email}</div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onSignOut}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
