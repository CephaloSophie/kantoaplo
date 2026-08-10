import type { TyposEngine } from "../engine/TyposEngine.js";
/**
 * Overlay flottant sur l'élément sélectionné (icônes + poignées).
 *
 * Vit dans `.typos-overlay-layer` (couche épinglée au viewport du canvas,
 * fournie par TyposCanvas). Le rect reçu est déjà en coordonnées de cette
 * couche → un simple left/top/width/height suffit.
 *
 * RESIZE ROBUSTE (corrige le redimensionnement fantôme) :
 * ────────────────────────────────────────────────────────
 * Le geste utilise POINTER CAPTURE : au pointerdown sur une poignée, la
 * poignée capture le pointeur ; tous les pointermove/pointerup lui sont
 * envoyés jusqu'au relâchement, MÊME hors de la fenêtre. Le listener ne
 * peut donc jamais « rester attaché » et provoquer un resize au survol.
 * La taille de départ est figée au pointerdown. Sous 3px de mouvement,
 * rien ne change. `setRect` est gelé pendant le geste (isResizing).
 */
export declare class TyposSelectionOverlay {
    private container;
    private engine;
    private options;
    private disposer;
    private root;
    private bar;
    private handles;
    private rect;
    private currentId;
    private isResizing;
    constructor(container: HTMLElement, engine: TyposEngine, options?: {
        onResizeEnd?: () => void;
    });
    setRect(rect: DOMRect | null): void;
    private hide;
    private buildBar;
    private dispatch;
    private buildHandles;
    private startResize;
    destroy(): void;
}
