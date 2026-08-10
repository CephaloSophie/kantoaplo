import type { HtmlParseOptions, TyposElement } from "./types.js";
/**
 * HTML (+ CSS optionnel) → arbre Typos. Chemin inverse de elementToHtml.
 *
 * - Préserve les directives Typos déjà présentes (id compris) ; génère
 *   ce qui manque. Les clés "<prefix>-…" inconnues du registre sont
 *   conservées telles quelles (forward-compat).
 * - Les <script data-<prefix>-script-for="id"> sont extraits du flux et
 *   rattachés au champ `script` de leur élément cible.
 * - class → classes[], style → styleOptions, le reste des attributs → attrs.
 * - Le CSS fourni est rattaché au customCss de la racine.
 * - Si le HTML a plusieurs racines, elles sont enveloppées dans une div.
 *
 * S'appuie sur DOMParser (navigateur, ou happy-dom/jsdom en environnement
 * de test/Node). Erreur explicite si indisponible.
 */
export declare function parseHtmlToTree(options: HtmlParseOptions): TyposElement;
