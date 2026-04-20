/**
 * Utilitaires de validation pour l'application
 */

/**
 * Valide qu'un ID est valide (non null, non undefined, non vide)
 * @param id L'ID à valider
 * @param context Contexte pour le log d'erreur (optionnel)
 * @returns true si l'ID est valide, false sinon
 */
export function isValidId(id: any, context?: string): boolean {
  const isValid = id !== null && 
                  id !== undefined && 
                  id !== 'undefined' && 
                  id !== 'null' &&
                  String(id).trim() !== '';
  
  if (!isValid && context) {
    console.warn(`ID invalide dans ${context}:`, id);
  }
  
  return isValid;
}

/**
 * Valide qu'un ID est valide et lance une erreur si ce n'est pas le cas
 * @param id L'ID à valider
 * @param fieldName Nom du champ pour le message d'erreur
 * @param context Contexte pour identifier où la validation échoue
 */
export function validateId(id: any, fieldName: string, context?: string): void {
  if (!isValidId(id, context)) {
    throw new Error(`${fieldName} requis et ne peut pas être vide${context ? ` (${context})` : ''}`);
  }
}

/**
 * Valide qu'une chaîne est non vide
 * @param value La valeur à valider
 * @param fieldName Nom du champ pour le message d'erreur
 * @param context Contexte pour identifier où la validation échoue
 */
export function validateNonEmptyString(value: any, fieldName: string, context?: string): void {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} requis et ne peut pas être vide${context ? ` (${context})` : ''}`);
  }
}

/**
 * Valide qu'un nombre est dans une plage donnée
 * @param value La valeur à valider
 * @param min Valeur minimum (incluse)
 * @param max Valeur maximum (incluse)
 * @param fieldName Nom du champ pour le message d'erreur
 * @param context Contexte pour identifier où la validation échoue
 */
export function validateNumberRange(value: any, min: number, max: number, fieldName: string, context?: string): void {
  if (typeof value !== 'number' || isNaN(value) || value < min || value > max) {
    throw new Error(`${fieldName} doit être un nombre entre ${min} et ${max}${context ? ` (${context})` : ''}`);
  }
}