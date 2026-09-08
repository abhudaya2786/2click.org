import React from 'react';
import { UserRole } from '../../types/auth';
import { ShieldCheck, UserCheck, Briefcase, Users, Crown } from 'lucide-react';
import { cn } from '../../lib/cn';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm', showIcon = true }) => {
  const getBadgeConfig = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          label: 'Super Admin',
          icon: Crown,
          className: 'bg-[#F2E8FF] text-[#6B21A8] border-[#D8B4FE]',
        };
      case 'ADMIN':
        return {
          label: 'Platform Admin',
          icon: ShieldCheck,
          className: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border-[#C3DCCF]',
        };
      case 'EMPLOYEE':
        return {
          label: 'Operations Coordinator',
          icon: Users,
          className: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
        };
      case 'CONSULTANT':
        return {
          label: 'Verified Specialist',
          icon: Briefcase,
          className: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
        };
      case 'VENDOR':
        return {
          label: 'Vendor Partner',
          icon: Briefcase,
          className: 'bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74]',
        };
      case 'CUSTOMER':
      default:
        return {
          label: 'Client Member',
          icon: UserCheck,
          className: 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border',
        size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1',
        config.className
      )}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
};
