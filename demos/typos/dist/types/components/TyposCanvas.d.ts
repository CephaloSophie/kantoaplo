import type { TyposEngine } from "../engine/TyposEngine.js";
/**
 * Canvas WYSIWYG en iframe isolée.
 *
 * POSITIONNEMENT DE L'OVERLAY (modèle des vrais éditeurs visuels) :
 * ─────────────────────────────────────────────────────────────────
 *   .typos-center-pane            (position:relative)
 *     ├ .typos-canvas-stage        (overflow:auto — SCROLLE)
 *     │   └ iframe                  (contenu, hauteur réelle)
 *     └ .typos-overlay-layer        (position:absolute; inset:0 — ÉPINGLÉE
 *                                    sur le viewport du canvas, NE scrolle pas,
 *                                    overflow:hidden pour clipper)
 *         └ .typos-overlay
 *
 * La couche d'overlay est épinglée au viewport du canvas. On calcule la
 * position de l'élément en coordonnées viewport (via getBoundingClientRect,
 * qui reflète DÉJÀ le scroll interne de l'iframe) puis on retranche le
 * coin du stage. AUCUN `scrollTop` ajouté à la main — c'était le bug.
 * On recalcule à chaque scroll (rAF) : l'overlay colle à l'élément.
 */
export declare class TyposCanvas {
    private container;
    private engine;
    private disposer;
    private iframe;
    private stage;
    /** Couche épinglée où vit l'overlay (fournie à TyposSelectionOverlay). */
    overlayLayer: HTMLElement;
    private ready;
    onRectChange: ((rect: DOMRect | null) => void) | null;
    private gesture;
    private pressId;
    private pressX;
    private pressY;
    private dropTargetId;
    private dropZone;
    private rafPending;
    constructor(container: HTMLElement, engine: TyposEngine);
    /** Coalesce les recalculs de position sur un frame. */
    private scheduleEmit;
    /**
     * Rect de l'élément en coordonnées LOCALES à la couche d'overlay
     * (= coin haut-gauche du stage). getBoundingClientRect reflète déjà le
     * scroll : on ne rajoute jamais scrollTop/scrollLeft.
     */
    private toLayer;
    rectFor(id: string): DOMRect | null;
    private emitRect;
    private doc;
    private idKey;
    private cssEscapeAttr;
    private initFrame;
    private installInteraction;
    private isDescendant;
    private resetGesture;
    private zoneFor;
    private performDrop;
    private render;
    private paintHover;
    private paintSelection;
    private paintDrop;
    refreshRect(): void;
    destroy(): void;
}
