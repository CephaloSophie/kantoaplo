import type { HtmlGenOptions, TyposElement } from "./types.js";
export declare function escapeAttr(value: string): string;
/** camelCase → kebab-case (backgroundColor → background-color). */
export declare function toKebab(prop: string): string;
/**
 * Génère le HTML d'un élément (et de son sous-arbre).
 * N'inclut PAS le bloc <style> agrégé — voir treeToHtml() pour la
 * sortie complète d'un arbre.
 */
export declare function elementToHtml(el: TyposElement, options?: HtmlGenOptions): string;
/**
 * Agrège les customCss de l'arbre en un bloc CSS unique.
 * - Déclarations nues (pas de "{") : enveloppées dans
 *   [<prefix>-tag-id="…"] { … } — l'attribut-sélecteur, émis après le
 *   style inline dans la cascade du bloc, garantit l'override.
 * - Règles complètes (contiennent "{") : émises telles quelles.
 */
export declare function collectCustomCss(root: TyposElement, prefix?: string): string;
/**
 * Sortie complète d'un arbre : <style> agrégé (si demandé) + HTML.
 */
export declare function treeToHtml(root: TyposElement, options?: HtmlGenOptions): string;
