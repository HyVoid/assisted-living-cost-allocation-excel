import React from 'react';

interface DataBarProps {
  value: number;
  max: number;
  height?: number;
  showText?: boolean;
  prefix?: string;
  suffix?: string;
}

export const DataBar: React.FC<DataBarProps> = ({
  value,
  max,
  height = 6,
  showText = false,
  prefix = '',
  suffix = '',
}) => {
  const percentage = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;

  return (
    <div className="w-full flex items-center gap-2">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{
          height: `${height}px`,
          backgroundColor: 'rgba(5, 28, 44, 0.10)', // 10% opacity track
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: 'var(--color-accent)', // #2251FF
          }}
        />
      </div>
      {showText && (
        <span className="text-[11px] text-[#888888] font-mono tabular-nums whitespace-nowrap">
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </span>
      )}
    </div>
  );
};
