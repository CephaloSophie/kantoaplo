/**
 * cyrb53 — hash 53 bits rapide et stable, sans dépendance.
 * Sert de brique au hash Merkle des éléments : le hash d'un élément
 * intègre les hashs de ses enfants, donc deux sous-arbres identiques
 * ont le même hash et toute différence remonte à la racine.
 */
export declare function cyrb53(str: string, seed?: number): string;
