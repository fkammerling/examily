import React from 'react';
import { NavLink } from 'react-router-dom';
import { GraduationCap, BookOpen, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const TeacherNav: React.FC = () => {
  const navItems = [
    { href: '/', icon: BookOpen, label: 'Exams' },
    { href: '/classes', icon: Users, label: 'Classes' },
  ];

  return (
    <nav className="flex items-center space-x-4">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            )
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default TeacherNav;
