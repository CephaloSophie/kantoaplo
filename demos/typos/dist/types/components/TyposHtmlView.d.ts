import type { TyposEngine } from "../engine/TyposEngine.js";
/**
 * Rendu code avec :
 *  · numéros de ligne dans une gouttière fixe ;
 *  · coloration syntaxique (HTML et JSON) ;
 *  · fold/unfold (▶/▼) sur les blocs pliables ;
 *  · surlignage de la sélection + scroll auto.
 */
export declare class TyposHtmlView {
    private container;
    private engine;
    private disposer;
    private mode;
    private profile;
    private visible;
    private codeWrap;
    private gutterEl;
    private linesEl;
    private folds;
    private rawLines;
    private refresh;
    constructor(container: HTMLElement, engine: TyposEngine);
    setVisible(visible: boolean): void;
    private renderShell;
    private renderCode;
    /** Peint gouttière + lignes, en respectant les folds. */
    private paintLines;
    private spanFor;
    private highlightSelection;
    destroy(): void;
}
