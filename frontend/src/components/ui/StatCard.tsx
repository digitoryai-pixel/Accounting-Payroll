'use client';

import React from 'react';

/* ─── Types ──────────────────────────────────────────────────────── */

type StatCardColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple';

interface TrendInfo {
  direction: 'up' | 'down';
  percentage: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: TrendInfo;
  icon?: React.ReactNode;
  color?: StatCardColor;
}

/* ─── Color Maps ─────────────────────────────────────────────────── */

const iconBgClasses: Record<StatCardColor, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-emerald-100 text-emerald-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-amber-100 text-amber-600',
  purple: 'bg-purple-100 text-purple-600',
};

const accentBorderClasses: Record<StatCardColor, string> = {
  blue: 'border-t-blue-500',
  green: 'border-t-emerald-500',
  red: 'border-t-red-500',
  yellow: 'border-t-amber-500',
  purple: 'border-t-purple-500',
};

/* ─── Component ──────────────────────────────────────────────────── */

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue',
}: StatCardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 border-t-4
        ${accentBorderClasses[color]}
        p-6 transition-shadow duration-200 hover:shadow-md
      `}
    >
      <div className="flex items-start justify-between">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">
            {value}
          </p>

          {/* Subtitle and/or trend */}
          <div className="mt-2 flex items-center gap-2">
            {trend && (
              <span
                className={`
                  inline-flex items-center gap-0.5 text-sm font-medium
                  ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}
                `}
              >
                {/* Arrow icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${trend.direction === 'down' ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                {trend.percentage}%
              </span>
            )}
            {subtitle && (
              <span className="text-sm text-gray-500 truncate">{subtitle}</span>
            )}
          </div>
        </div>

        {/* Icon */}
        {icon && (
          <div
            className={`
              flex-shrink-0 ml-4 p-3 rounded-lg
              ${iconBgClasses[color]}
            `}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
