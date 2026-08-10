import type { TyposEngine } from "../engine/TyposEngine.js";
/**
 * Graphe nodal de l'arbre : layout en couches (profondeur → colonne,
 * ordre feuille → ligne, parents centrés sur leurs enfants), arêtes en
 * Bézier, sélection au clic, molette = zoom, glisser le fond = pan.
 */
export declare class TyposNodeGraph {
    private container;
    private engine;
    private disposer;
    private svg;
    private vb;
    private panning;
    private visible;
    constructor(container: HTMLElement, engine: TyposEngine);
    setVisible(visible: boolean): void;
    private applyViewBox;
    /** Layout : x = profondeur, y = compteur de feuilles, parents centrés. */
    private layout;
    private render;
    destroy(): void;
}
