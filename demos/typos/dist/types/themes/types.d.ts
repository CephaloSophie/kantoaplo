/**
 * Types du système de thèmes.
 *
 * Un thème est un identifiant + une map de jetons (les mêmes clés que le
 * contrat SCSS `src/themes/common/_contract.scss`, sans le préfixe
 * `--typos-`). Les thèmes built-in sont compilés dans la feuille et
 * sélectionnés par classe ; les thèmes personnalisés fournissent leurs
 * jetons au runtime et sont injectés par ThemeService.
 */
/** Clé de jeton (sans préfixe) → valeur CSS. Ex. `{ "accent": "#0a84ff" }`. */
export type ThemeTokens = Record<string, string>;
export type ThemeFamily = "base" | "os" | "browser" | "custom";
export interface ThemeDefinition {
    /** Identifiant unique, utilisé comme classe `typos-theme-<id>`. */
    id: string;
    /** Libellé lisible (sélecteur de thème). */
    label: string;
    /** Regroupement indicatif. */
    family: ThemeFamily;
    /** Compilé dans la feuille (true) ou injecté au runtime (false). */
    builtIn: boolean;
    /**
     * Jetons du thème. Requis pour un thème personnalisé (injecté).
     * Optionnel pour un built-in (déjà présent dans la feuille compilée).
     */
    tokens?: ThemeTokens;
}
