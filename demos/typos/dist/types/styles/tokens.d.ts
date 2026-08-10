/**
 * Jetons de design de l'éditeur Typos — fondation de la phase 2 (UI).
 * Identité : accent Typos #D4A373 (satellite de Tektôn, système KANTO APLO),
 * interface sombre, précision d'atelier.
 *
 * Miroir TS des variables CSS de typos.css : l'UI vanilla lira les
 * variables ; ce module sert aux calculs (canvas, graphe) et aux tests.
 */
export declare const TOKENS: {
    readonly color: {
        /** Accent Typos (or clair du satellite). */
        readonly accent: "#D4A373";
        readonly accentSoft: "#d4a37333";
        readonly accentText: "#1c1712";
        /** Surfaces, du fond de scène au premier plan. */
        readonly bg0: "#141210";
        readonly bg1: "#1c1916";
        readonly bg2: "#252019";
        readonly surface: "#252019";
        readonly surfaceRaised: "#2e2820";
        readonly border: "#3a332a";
        readonly borderStrong: "#4d4436";
        readonly text: "#eae4da";
        readonly textMuted: "#a89c8c";
        readonly textFaint: "#6f6559";
        /** États. */
        readonly success: "#2DD4A0";
        readonly warning: "#E8B44A";
        readonly danger: "#E84A4A";
        readonly info: "#3D8EE8";
        /** Sélection / survol dans le canvas et l'arbre. */
        readonly selection: "#D4A373";
        readonly hover: "#d4a3731f";
    };
    readonly font: {
        readonly ui: "'Inter', 'Segoe UI', system-ui, sans-serif";
        readonly mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
    };
    readonly radius: {
        readonly sm: "4px";
        readonly md: "8px";
        readonly lg: "12px";
    };
    readonly space: (n: number) => string;
    readonly z: {
        readonly canvas: 1;
        readonly overlay: 40;
        readonly popup: 50;
        readonly modal: 60;
        readonly toast: 70;
    };
};
export type Tokens = typeof TOKENS;
