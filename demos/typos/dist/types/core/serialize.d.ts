import type { DocumentKind, EmitProfile, TemplateTarget, TyposDocument, TyposElement } from "./types.js";
export interface CreateDocumentOptions {
    kind?: DocumentKind;
    name?: string;
    id?: string;
    directivePrefix?: string;
    emitProfile?: EmitProfile;
    target?: TemplateTarget;
    /** Arbre racine initial (une div "root" par défaut). */
    rootTree?: TyposElement;
    now?: () => string;
}
/** Fabrique un document neuf avec un template initial, dérivées à jour. */
export declare function createDocument(options?: CreateDocumentOptions): TyposDocument;
export interface SerializeOptions {
    /** Poser les hashs Merkle avant sérialisation (défaut : true). */
    withHashes?: boolean;
    /** Indentation JSON (défaut : 2 ; 0 = compact). */
    space?: number;
}
/** Document → JSON canonique (déterministe à l'octet près). */
export declare function serializeDocument(doc: TyposDocument, options?: SerializeOptions): string;
/**
 * Hash global du document — calculé sur la forme canonique SANS les
 * champs volatils (updatedAt). Deux documents au même contenu ont le
 * même hash quel que soit le moment de la sauvegarde.
 */
export declare function documentHash(doc: TyposDocument): string;
export interface ParseDocumentResult {
    document: TyposDocument;
    /** true si une migration a été appliquée. */
    migrated: boolean;
}
/**
 * Parse un JSON de document. Reconnaît :
 * - le format v2 courant ("typos-document") ;
 * - le format projet v1 (React) : { templates[], activeTemplateId, … } ;
 * - un arbre d'élément nu (v1 export brut).
 * Valide, recalcule les dérivées, lève une Error explicite si invalide.
 */
export declare function parseDocument(json: string): ParseDocumentResult;
export declare function parseDocumentValue(raw: unknown): ParseDocumentResult;
