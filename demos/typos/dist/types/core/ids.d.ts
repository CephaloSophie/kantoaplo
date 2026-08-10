/**
 * Génération d'identifiants : courts, uniques, stables, triables
 * grossièrement dans le temps (base36 de l'horloge + entropie).
 */
/** Crée un id préfixé, ex. createId("el") → "el_lx2k9…". */
export declare function createId(prefix: string): string;
export declare const createElementId: () => string;
export declare const createTemplateId: () => string;
export declare const createDocumentId: () => string;
export declare const createComponentId: () => string;
