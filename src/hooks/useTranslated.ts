'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { translateText } from '@/services/translationService';

/**
 * Traduit un texte dynamique (provenant de l'API) dans la locale courante.
 * Retourne immédiatement le texte original (FR) en fallback, puis le remplace
 * par la version traduite dès qu'elle est disponible.
 *
 * Utilisation :
 *   const name = useTranslated(product.name);
 *   return <h1>{name}</h1>;
 */
export function useTranslated(text: string | null | undefined): string {
  const { locale } = useI18n();
  const [translated, setTranslated] = useState<string>(text || '');
  const lastInputRef = useRef<string>('');

  useEffect(() => {
    const source = text || '';
    lastInputRef.current = source;

    if (!source || locale === 'fr') {
      setTranslated(source);
      return;
    }

    // Affiche le texte source en attendant la traduction
    setTranslated(source);

    let cancelled = false;
    translateText(source, locale).then((result) => {
      // Évite les race conditions si l'input change pendant la requête
      if (!cancelled && lastInputRef.current === source) {
        setTranslated(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [text, locale]);

  return translated;
}

/**
 * Variante batch : traduit un objet entier en mappant un sous-ensemble de ses
 * champs string. Pratique pour Product, Category, etc.
 *
 *   const localized = useTranslatedFields(product, ['name', 'shortDescription']);
 */
export function useTranslatedFields<T extends Record<string, unknown>, K extends keyof T>(
  obj: T | null | undefined,
  fields: readonly K[],
): T | null {
  const { locale } = useI18n();
  const [result, setResult] = useState<T | null>(obj ?? null);

  useEffect(() => {
    if (!obj) {
      setResult(null);
      return;
    }
    if (locale === 'fr') {
      setResult(obj);
      return;
    }

    setResult(obj); // affiche FR en fallback

    let cancelled = false;

    Promise.all(
      fields.map((f) => {
        const value = obj[f];
        if (typeof value !== 'string' || !value) return Promise.resolve(value);
        return translateText(value, locale);
      }),
    ).then((translatedValues) => {
      if (cancelled) return;
      const next = { ...obj } as T;
      fields.forEach((f, i) => {
        const v = translatedValues[i];
        if (typeof v === 'string') (next as Record<string, unknown>)[f as string] = v;
      });
      setResult(next);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obj, locale, fields.join(',')]);

  return result;
}
