import type { ThemeDefinition } from "./types.js";
/**
 * Les cinq thèmes livrés. Leurs jetons vivent dans la feuille compilée
 * (`src/themes/<id>/_tokens.scss`) — ici on ne déclare que l'identité,
 * l'application se fait par simple bascule de classe sur la racine.
 */
export declare const BUILT_IN_THEMES: readonly ThemeDefinition[];
export interface ThemeServiceOptions {
    /** Thème appliqué à la construction (défaut : "dark"). */
    initial?: string;
    /** Document hôte (défaut : `document`) — testabilité. */
    doc?: Document;
}
/**
 * Applique et gère les thèmes de l'éditeur.
 *
 * Built-in : bascule de la classe `typos-theme-<id>` sur la racine, les
 * jetons venant de la feuille compilée. Personnalisé : `register()` avec
 * une map de jetons injecte une balise `<style>` scopée, puis `apply()`
 * bascule la classe comme pour un built-in — un seul chemin d'application.
 *
 * Le service ne détient aucun état de rendu : la source de vérité est la
 * classe sur la racine et les styles injectés dans le document.
 */
export declare class ThemeService {
    private root;
    private themes;
    private listeners;
    private injected;
    private currentId;
    private doc;
    constructor(root: HTMLElement, options?: ThemeServiceOptions);
    /** Liste des thèmes disponibles (built-in + personnalisés enregistrés). */
    list(): ThemeDefinition[];
    /** Identifiant du thème actif. */
    get current(): string;
    has(id: string): boolean;
    get(id: string): ThemeDefinition | null;
    /** Applique un thème connu. Retourne false si l'id est inconnu. */
    apply(id: string): boolean;
    /**
     * Enregistre un thème personnalisé. Si des jetons sont fournis, la
     * feuille scopée correspondante est injectée dans le document. Écrase
     * une définition de même id (sauf built-in, protégé).
     */
    register(theme: ThemeDefinition): void;
    /** Retire un thème personnalisé (les built-in sont protégés). */
    unregister(id: string): boolean;
    /** S'abonne aux changements de thème. Retourne la fonction de désabonnement. */
    onChange(cb: (id: string) => void): () => void;
    private applyClass;
    private injectTokens;
    private removeInjected;
    /** Nettoie classes de thème et styles injectés par cette instance. */
    destroy(): void;
}
