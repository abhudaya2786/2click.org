import React from 'react';
import { cn } from '../../lib/cn';
import {
  IconToken,
  IconSize,
  ICON_COMPONENTS,
  ICON_SIZES,
  ICON_STROKE,
  ICON_COLORS,
  ICON_LABELS,
  iconTokenFromLucideName,
  iconTokenFromServiceId,
  iconTokenFromGoalId,
} from '../../lib/iconSystem';

export type { IconToken } from '../../lib/iconSystem';

export interface AppIconProps {
  name: IconToken;
  size?: IconSize;
  className?: string;
  label?: string;
  labelHi?: string;
  decorative?: boolean;
  language?: 'en' | 'hi';
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 'md',
  className,
  label,
  labelHi,
  decorative = false,
  language = 'en',
}) => {
  const Icon = ICON_COMPONENTS[name];
  const px = ICON_SIZES[size];
  const defaultLabel = language === 'hi' && labelHi ? labelHi : (label ?? ICON_LABELS[name][language]);

  return (
    <Icon
      size={px}
      strokeWidth={ICON_STROKE}
      className={cn('shrink-0', ICON_COLORS[name], className)}
      aria-hidden={decorative}
      aria-label={decorative ? undefined : defaultLabel}
      role={decorative ? undefined : 'img'}
    />
  );
};

export const ServiceRegistryIcon: React.FC<{
  iconName: string;
  size?: IconSize;
  className?: string;
  decorative?: boolean;
}> = ({ iconName, size = 'md', className, decorative = true }) => (
  <AppIcon
    name={iconTokenFromLucideName(iconName)}
    size={size}
    className={className}
    decorative={decorative}
  />
);

export const ServiceIdIcon: React.FC<{
  serviceId: string;
  size?: IconSize;
  className?: string;
  decorative?: boolean;
}> = ({ serviceId, size = 'md', className, decorative = true }) => (
  <AppIcon
    name={iconTokenFromServiceId(serviceId)}
    size={size}
    className={className}
    decorative={decorative}
  />
);

export const GoalIcon: React.FC<{
  goalId: string;
  size?: IconSize;
  className?: string;
}> = ({ goalId, size = 'lg', className }) => (
  <AppIcon name={iconTokenFromGoalId(goalId)} size={size} className={className} decorative />
);
