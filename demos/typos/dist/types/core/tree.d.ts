import type { ElementPatch, TyposElement } from "./types.js";
/**
 * Opérations d'arbre : toutes PURES et IMMUABLES.
 * Aucune ne mute son entrée ; toutes retournent un nouvel arbre avec
 * partage structurel (les branches non touchées sont réutilisées telles
 * quelles — l'historique undo/redo s'appuie dessus).
 */
export declare function findById(root: TyposElement, id: string): TyposElement | null;
/** Résout une adresse "0-1-2" (racine = "0"). */
export declare function findByPath(root: TyposElement, path: string): TyposElement | null;
export declare function getParent(root: TyposElement, id: string): TyposElement | null;
/** Chaîne d'ancêtres, de la racine (incluse) au parent direct. */
export declare function ancestorsOf(root: TyposElement, id: string): TyposElement[];
/** `maybeAncestorId` est-il un ancêtre (strict) de `id` ? */
export declare function isAncestor(root: TyposElement, maybeAncestorId: string, id: string): boolean;
/** Parcours préfixe complet. */
export declare function walk(root: TyposElement, visit: (el: TyposElement, parent: TyposElement | null, depth: number) => void): void;
/** Aplatit l'arbre en liste (ordre préfixe). */
export declare function flatten(root: TyposElement): TyposElement[];
/** Compte les éléments. */
export declare function countElements(root: TyposElement): number;
/**
 * Remplace le sous-arbre dont la racine a l'id donné.
 * Brique interne de toutes les mutations. Retourne l'arbre d'origine
 * si l'id est introuvable (référence identique = aucun changement).
 */
export declare function replaceById(root: TyposElement, id: string, replacer: (el: TyposElement) => TyposElement): TyposElement;
export interface InsertResult {
    root: TyposElement;
    inserted: TyposElement;
}
/**
 * Insère `element` comme enfant de `parentId` à `index`
 * (fin si index absent ou hors bornes). Refuse d'insérer dans une
 * balise void (l'arbre d'origine est retourné inchangé).
 */
export declare function insertAt(root: TyposElement, parentId: string, element: TyposElement, index?: number): InsertResult;
/** Retire l'élément (interdit sur la racine — retourne l'arbre inchangé). */
export declare function removeById(root: TyposElement, id: string): TyposElement;
/**
 * Déplace `id` sous `newParentId` à `index`.
 * Refus (arbre inchangé) si : élément ou parent introuvable, déplacement
 * dans soi-même ou un de ses descendants, parent void, ou id = racine.
 */
export declare function moveTo(root: TyposElement, id: string, newParentId: string, index?: number): TyposElement;
/** Réordonne un élément parmi ses frères. */
export declare function reorder(root: TyposElement, id: string, newIndex: number): TyposElement;
/**
 * Applique un patch partiel à un élément.
 * Les directives dérivées présentes dans `patch.directives` sont
 * ignorées (elles appartiennent au noyau) ; `revision` est incrémentée
 * et `updated-at` reposée.
 */
export declare function updateElement(root: TyposElement, id: string, patch: ElementPatch, prefix?: string, now?: () => string): TyposElement;
export interface CloneResult {
    root: TyposElement;
    clone: TyposElement;
}
/**
 * Clone profond d'un sous-arbre : nouveaux ids partout, origin="clone",
 * source-id = id d'origine, revision remise à 0. Le clone est inséré
 * juste après l'original (même parent).
 */
export declare function cloneSubtree(root: TyposElement, id: string, prefix?: string, now?: () => string): CloneResult;
/**
 * Enveloppe un élément dans un nouveau parent (ex. wrap dans une div).
 * Le wrapper prend la place de l'élément, qui devient son unique enfant.
 * Interdit sur la racine.
 */
export declare function wrapElement(root: TyposElement, id: string, wrapper: TyposElement): TyposElement;
/**
 * Dissout un élément : ses enfants remontent à sa place chez son parent.
 * Interdit sur la racine.
 */
export declare function unwrapElement(root: TyposElement, id: string): TyposElement;
