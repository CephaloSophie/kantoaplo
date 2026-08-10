import type { TyposDocument } from "../core/types.js";
import { TyposEngine, type EngineOptions } from "../engine/TyposEngine.js";
import { TyposSelectionOverlay } from "./TyposSelectionOverlay.js";
import { ThemeService } from "../themes/ThemeService.js";
export interface TyposEditorOptions extends EngineOptions {
    document?: TyposDocument;
    /** Thème initial ("dark" par défaut). */
    theme?: string;
}
/**
 * Éditeur assemblé (phase 3) : toolbar, palette + arbre à gauche,
 * centre à onglets (Canvas / Graphe / Code), panneau d'élément à
 * droite. TyposSelectionOverlay se pose au-dessus du canvas et
 * matérialise la sélection avec ses icônes flottantes et ses poignées
 * de resize — TyposCanvas lui fournit le rect en coordonnées de scène.
 */
export declare class TyposEditor {
    private container;
    readonly engine: TyposEngine;
    /** Service de thème — bascule les 5 thèmes built-in, injecte les customs. */
    readonly themeService: ThemeService;
    private disposer;
    private root;
    private tab;
    private palette;
    private treeView;
    private canvas;
    /** Overlay flottant des icônes et poignées de resize — accessible publiquement. */
    overlay: TyposSelectionOverlay;
    private stylePanel;
    private htmlView;
    private nodeGraph;
    private toolbarEl;
    private tabsEl;
    private centerPanes;
    private keydownHandler;
    constructor(container: HTMLElement, options?: TyposEditorOptions);
    private build;
    private setTab;
    private renderTabs;
    private renderToolbar;
    private select;
    private openImportModal;
    private exportJson;
    private loadJsonFile;
    private onKeydown;
    destroy(): void;
}
export declare function mountTyposEditor(container: HTMLElement, options?: TyposEditorOptions): TyposEditor;
