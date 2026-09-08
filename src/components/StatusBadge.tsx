import React from 'react';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral' | 'accent';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  children,
  size = 'md',
  icon,
}) => {
  let styleClasses = '';

  switch (variant) {
    case 'success':
      // #00C853 positive/met target
      styleClasses = 'bg-[#00C853]/10 text-[#008f3b] border border-[#00C853]/20';
      break;
    case 'danger':
      // #D32F2F anomaly/action required
      styleClasses = 'bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/20 font-semibold';
      break;
    case 'warning':
      styleClasses = 'bg-amber-50 text-amber-800 border border-amber-200';
      break;
    case 'accent':
      styleClasses = 'bg-[#2251FF]/10 text-[#2251FF] border border-[#2251FF]/20';
      break;
    case 'neutral':
    default:
      styleClasses = 'bg-gray-100 text-[#555555] border border-gray-200';
      break;
  }

  const paddingClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      className={`status-pill inline-flex items-center gap-1.5 leading-none transition-transform ${paddingClasses} ${styleClasses}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
