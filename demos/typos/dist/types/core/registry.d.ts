import type { DirectiveSpec, EmitProfile } from "./types.js";
/**
 * Registre exhaustif des directives Typos.
 *
 * Chaque élément de l'arbre porte un traçage JSON complet ; le HTML
 * généré n'estampille que ce que le profil d'émission autorise.
 *
 * Préfixe par défaut : "tekton" (compat moteur runtime KANTO APLO,
 * qui lit ces attributs comme Angular lit ses ng-* ou Alpine ses x-*).
 * Le préfixe est configurable document par document.
 */
export declare const DEFAULT_DIRECTIVE_PREFIX = "tekton";
/** Construit la clé complète d'une directive pour un préfixe donné. */
export declare function directiveKey(short: string, prefix?: string): string;
/**
 * LE registre. Ordre = ordre d'émission dans le HTML (déterminisme).
 */
export declare const DIRECTIVE_REGISTRY: readonly DirectiveSpec[];
/** Index par suffixe court. */
export declare const DIRECTIVES_BY_SHORT: ReadonlyMap<string, DirectiveSpec>;
/** Index par clé complète (préfixe par défaut). */
export declare const DIRECTIVES_BY_KEY: ReadonlyMap<string, DirectiveSpec>;
/** Suffixes des directives dérivées (jamais éditables). */
export declare const DERIVED_SHORTS: ReadonlySet<string>;
/** Une directive est-elle émise pour ce profil ? */
export declare function emittedInProfile(specItem: DirectiveSpec, profile: EmitProfile): boolean;
/**
 * Reconnaît une clé de directive pour un préfixe donné.
 * Retourne la spec si connue, sinon null (les clés inconnues au format
 * "<prefix>-…" sont conservées telles quelles à l'import : forward-compat).
 */
export declare function specForKey(key: string, prefix?: string): DirectiveSpec | null;
/** Une clé appartient-elle à l'espace de noms Typos pour ce préfixe ? */
export declare function isTyposDirectiveKey(key: string, prefix?: string): boolean;
