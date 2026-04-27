'use client';

import { useTranslated } from '@/hooks/useTranslated';

interface TranslatedTextProps {
  /** Texte source (FR) à traduire dans la locale courante. */
  children: string | null | undefined;
  /** Limite de caractères. Coupe le texte source AVANT traduction (économise des appels API). */
  maxLength?: number;
  /** Tag HTML wrapping (défaut: pas de wrapper, retourne juste le texte). */
  as?: keyof React.JSX.IntrinsicElements;
  /** ClassName appliqué au tag wrapper si `as` est défini. */
  className?: string;
}

/**
 * Wrapper léger pour traduire un texte API dans la locale courante.
 *
 * Usage :
 *   <T>{product.name}</T>
 *   <T as="p" className="text-sm">{product.description}</T>
 */
export default function TranslatedText({
  children,
  maxLength,
  as,
  className,
}: TranslatedTextProps) {
  const source = typeof children === 'string' ? children : '';
  const truncated = maxLength && source.length > maxLength
    ? source.slice(0, maxLength).trimEnd() + '…'
    : source;
  const translated = useTranslated(truncated);

  if (!as) return <>{translated}</>;
  const Tag = as as React.ElementType;
  return <Tag className={className}>{translated}</Tag>;
}

/** Alias court pour la lisibilité dans les composants. */
export { TranslatedText as T };
