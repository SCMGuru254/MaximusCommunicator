import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { MessageSquare, Settings, Users, Menu, BarChart, Shield, HelpCircle } from 'lucide-react';

export function MainNavigation() {
  const [location] = useLocation();
  
  const navItems = [
    { href: '/', label: 'Home', icon: <Menu className="h-5 w-5" /> },
    { href: '/contacts', label: 'Contacts', icon: <Users className="h-5 w-5" /> },
    { href: '/nous-chat', label: 'Nous Chat', icon: <MessageSquare className="h-5 w-5" /> },
    { href: '/menu-builder', label: 'Menu Builder', icon: <Menu className="h-5 w-5" /> },
    { href: '/analytics', label: 'Analytics', icon: <BarChart className="h-5 w-5" /> },
    { href: '/security', label: 'Security', icon: <Shield className="h-5 w-5" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
    { href: '/nous-settings', label: 'Nous Settings', icon: <Settings className="h-5 w-5" /> },
    { href: '/help', label: 'Help', icon: <HelpCircle className="h-5 w-5" /> },
  ];
  
  return (
    <nav className="flex flex-col space-y-1 p-4 bg-sidebar border-r border-border h-screen">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Maximus</h1>
        <p className="text-sm text-muted-foreground">Communicator</p>
      </div>
      
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={location === item.href ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </Button>
        </Link>
      ))}
    </nav>
  );
}

export default MainNavigation;