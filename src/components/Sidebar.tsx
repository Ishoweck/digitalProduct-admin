// import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Tags,
  // Wallet,
} from 'lucide-react';

const links = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/vendors', label: 'Vendors', icon: Store },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  { path: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { path: '/admin/categories', label: 'Categories', icon: Tags },
  { path: '/admin/signup', label: 'Create Admin', icon: Users },

  // { path: '/admin/wallet', label: 'Wallet', icon: Wallet },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 shadow-md flex flex-col">
      {/* Logo / Title */}
      <div className="h-16 flex items-center justify-center text-2xl font-semibold text-[#d7195b] tracking-wide border-b border-gray-100 shadow-sm">
        Admin Panel
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#d7195b] text-white shadow'
                  : 'text-gray-700 hover:bg-[#fce6ed]'
              }`
            }
          >
            <Icon size={20} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Version */}
      <div className="p-4 text-xs text-gray-400 text-center border-t">
        © 2025 Admin System
      </div>
    </aside>
  );
}
