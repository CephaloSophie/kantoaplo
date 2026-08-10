import type { ElementPatch, EmitProfile, EngineEventMap, EngineListener, EngineWildcardListener, HtmlGenOptions, TemplateTarget, TyposDocument, TyposElement, TyposTemplate } from "../core/types.js";
import { type CreateDocumentOptions, type SerializeOptions } from "../core/serialize.js";
import { type CreateElementOptions } from "../core/element.js";
import { type ElementDefinition } from "../config/defaults.js";
export interface EngineOptions {
    document?: TyposDocument;
    /** Profondeur maximale d'historique (défaut : 200). */
    historyLimit?: number;
    /** Fenêtre de coalescence en ms (défaut : 1000). */
    coalesceWindowMs?: number;
    now?: () => string;
}
export interface AddElementOptions extends CreateElementOptions {
    parentId?: string;
    index?: number;
    templateId?: string;
}
export declare class TyposEngine {
    private emitter;
    private doc;
    private selectionIds;
    private undoStack;
    private redoStack;
    private savedHash;
    private dirtyFlag;
    private batchDepth;
    private batchBefore;
    private batchEmits;
    private batchLabel;
    private readonly historyLimit;
    private readonly coalesceWindowMs;
    private readonly now;
    constructor(options?: EngineOptions);
    get document(): TyposDocument;
    get activeTemplate(): TyposTemplate;
    /** Arbre du template actif. */
    get tree(): TyposElement;
    get selection(): readonly string[];
    get canUndo(): boolean;
    get canRedo(): boolean;
    get isDirty(): boolean;
    findElement(id: string, templateId?: string): TyposElement | null;
    /** HTML du template actif (ou donné), profil du document par défaut. */
    getHtml(options?: HtmlGenOptions, templateId?: string): string;
    on<K extends keyof EngineEventMap>(name: K, fn: EngineListener<K>): () => void;
    on(name: "*", fn: EngineWildcardListener): () => void;
    off(name: string, fn: (payload: never, name: never) => void): void;
    newDocument(options?: CreateDocumentOptions): TyposDocument;
    /** Charge un document : objet v2, JSON v2, ou n'importe quel format v1. */
    loadDocument(input: string | object): TyposDocument;
    toJSON(options?: SerializeOptions): string;
    markSaved(): void;
    rename(name: string): boolean;
    /** Profil d'émission HTML par défaut du document. */
    setEmitProfile(profile: EmitProfile): boolean;
    addTemplate(options?: {
        name?: string;
        target?: TemplateTarget;
        cloneFromId?: string;
    }): string;
    /** Refuse de supprimer le dernier template. */
    removeTemplate(templateId: string): boolean;
    renameTemplate(templateId: string, name: string): boolean;
    setTemplateTarget(templateId: string, target: TemplateTarget): boolean;
    /** Marque la version principale (mode composant) — exclusif. */
    setMainVersion(templateId: string): boolean;
    /** L'activation ne mute pas le contenu : hors historique. */
    setActiveTemplate(templateId: string): boolean;
    /**
     * Insère un sous-arbre décrit en JSON (squelette prêt à l'emploi).
     * Retourne l'id de la racine insérée, ou null.
     */
    insertTemplate(definition: ElementDefinition, options?: {
        parentId?: string;
        index?: number;
        templateId?: string;
    }): string | null;
    /**
     * Ajoute un élément (type + options, ou élément déjà construit).
     * Parent par défaut : racine du template actif. Retourne l'id, ou null.
     */
    addElement(typeOrElement: string | TyposElement, options?: AddElementOptions): string | null;
    removeElement(id: string, templateId?: string): boolean;
    moveElement(id: string, newParentId: string, index?: number, templateId?: string): boolean;
    reorderElement(id: string, newIndex: number, templateId?: string): boolean;
    /**
     * Patch partiel. `coalesceKey` fusionne les frappes successives dans
     * une seule entrée d'historique (ex. "style:el_x:width").
     */
    updateElement(id: string, patch: ElementPatch, options?: {
        templateId?: string;
        coalesceKey?: string;
    }): boolean;
    cloneElement(id: string, templateId?: string): string | null;
    wrapElement(id: string, wrapperType?: string, templateId?: string): string | null;
    unwrapElement(id: string, templateId?: string): boolean;
    /** Remplace l'arbre du template (actif par défaut) par du HTML importé. */
    importHtml(html: string, css?: string, templateId?: string): boolean;
    select(ids: string[]): void;
    clearSelection(): void;
    /**
     * Regroupe plusieurs mutations en UNE entrée d'historique et un seul
     * document:changed final. Imbriquable.
     */
    batch(label: string, fn: () => void): void;
    undo(): boolean;
    redo(): boolean;
    private template;
    private withTemplate;
    /**
     * LE point de passage de toute mutation : produit le nouveau document,
     * recalcule les dérivées des templates touchés, gère l'historique
     * (avec coalescence), émet les événements, met à jour le dirty.
     * Retourne false si la mutation n'a rien changé.
     */
    private commit;
    private pushHistory;
    private afterChange;
    private setDirty;
    private pruneSelection;
    private resetTransient;
}
