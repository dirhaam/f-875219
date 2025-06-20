
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Briefcase, 
  FolderOpen, 
  FileText,
  Settings,
  Globe
} from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardSidebar = ({ activeTab, setActiveTab }: DashboardSidebarProps) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
    { id: 'services', label: 'Layanan', icon: Briefcase },
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen },
    { id: 'invoices', label: 'Invoice', icon: FileText },
    { id: 'content', label: 'Konten', icon: Globe },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="w-64 bg-card border-r border-border p-4 space-y-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
          <div className="h-4 w-4 rounded-sm bg-primary-foreground"></div>
        </div>
        <span className="font-semibold text-foreground">Digital Service Admin</span>
      </div>
      
      <nav className="space-y-2">
        <div className="text-xs text-muted-foreground uppercase mb-3">Menu Utama</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardSidebar;
