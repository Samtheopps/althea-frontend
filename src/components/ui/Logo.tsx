'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'default' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  href?: string;
}

const SIZE_MAP = {
  sm: { full: { width: 130, height: 36 }, icon: { width: 32, height: 32 } },
  md: { full: { width: 160, height: 44 }, icon: { width: 40, height: 40 } },
  lg: { full: { width: 200, height: 56 }, icon: { width: 52, height: 52 } },
};

export default function Logo({
  size = 'md',
  className = '',
  href = '/',
}: LogoProps) {
  const dims = SIZE_MAP[size];

  const content = (
    <div className={`inline-flex items-center ${className}`}>
      {/* Desktop : logo complet avec texte */}
      <Image
        src="/althea-logo-full.png"
        alt="Althea Systems"
        width={dims.full.width}
        height={dims.full.height}
        className="hidden sm:block object-contain"
        priority
      />
      {/* Mobile : icône seule */}
      <Image
        src="/althea-logo-icon.png"
        alt="Althea Systems"
        width={dims.icon.width}
        height={dims.icon.height}
        className="block sm:hidden object-contain"
        priority
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}

export function LogoWithFallback({ className = '', ...props }: LogoProps) {
  return <Logo className={className} {...props} />;
}
