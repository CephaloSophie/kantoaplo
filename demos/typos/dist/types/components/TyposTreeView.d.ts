import type { TyposEngine } from "../engine/TyposEngine.js";
/**
 * Vue arbre : reflet fidèle de l'arbre du template actif.
 * Sélection au clic, pliage par chevron, réorganisation par glisser-déposer
 * (tiers haut = avant, tiers bas = après, centre = dedans).
 */
export declare class TyposTreeView {
    private container;
    private engine;
    private disposer;
    private collapsed;
    private dragId;
    constructor(container: HTMLElement, engine: TyposEngine);
    private render;
    private renderNode;
    /** Tiers haut = avant, tiers bas = après, centre = dedans (si possible). */
    private zoneFor;
    private markDrop;
    private clearDropMarks;
    private performDrop;
    destroy(): void;
}
/** Garde d'existence utilisée par le shell (sélection → panneau). */
export declare function elementExists(engine: TyposEngine, id: string): boolean;
