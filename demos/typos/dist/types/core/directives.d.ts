import type { DeriveContext, DirectiveBag, TyposElement } from "./types.js";
/**
 * Recalcule TOUTES les directives dérivées de l'arbre, en un seul passage.
 * Pur et immuable : retourne un nouvel arbre, l'entrée n'est jamais mutée.
 *
 * Sémantique des frontières de composant (héritée v1, précisée v2) :
 * - component-first-parent = id de la racine de composant la plus proche,
 *   *soi inclus* (une racine appartient à sa propre frontière) ;
 * - component-path = adresse relative à cette frontière : "" hors composant
 *   et sur la racine de composant elle-même, puis "0", "0-1"… pour ses
 *   descendants.
 */
export declare function recomputeDerivedDirectives(root: TyposElement, ctx: DeriveContext): TyposElement;
/**
 * Calcule le hash Merkle de chaque élément (directive "hash").
 * Le hash reflète le CONTENU (type, attrs, classes, styles, css, innerHtml
 * si feuille, script, componentRef, slot, name) + les hashs des enfants.
 * Il exclut le volatil (horodatage, revision, topologie) : deux sous-arbres
 * au même contenu ont le même hash, où qu'ils soient.
 *
 * Séparé du recalcul dérivé (O(n) complet) pour rester optionnel : on
 * l'appelle à la sérialisation, au diff, ou explicitement.
 */
export declare function computeHashes(root: TyposElement, prefix?: string): TyposElement;
/** Filtre un sac de directives : ne garde que les déclarées (patchs utilisateur). */
export declare function stripDerived(bag: DirectiveBag, prefix?: string): DirectiveBag;
