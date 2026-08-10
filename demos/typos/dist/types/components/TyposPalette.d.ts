import type { TyposEngine } from "../engine/TyposEngine.js";
/**
 * Palette : deux sections — Éléments (briques atomiques) et Squelettes
 * (templates prêts à l'emploi issus de src/config/defaults.ts).
 * Un clic insère dans la sélection courante (si elle peut nester) ou
 * dans la racine, puis sélectionne le nouvel élément.
 */
export declare class TyposPalette {
    private container;
    private engine;
    private disposer;
    constructor(container: HTMLElement, engine: TyposEngine);
    private targetParentId;
    private render;
    destroy(): void;
}
