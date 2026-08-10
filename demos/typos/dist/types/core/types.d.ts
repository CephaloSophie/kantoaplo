/**
 * @kanto-aplo/typos — types du noyau.
 *
 * Invariant fondateur : le JSON est la seule source de vérité.
 * Tout ce qui existe (HTML généré, rendu canvas, graphe nodal) dérive
 * de ces structures — jamais l'inverse.
 */
/** Valeur admissible d'une directive (sérialisable telle quelle). */
export type DirectiveValue = string | number | boolean | null;
/** Sac de directives d'un élément (clés = clé complète, ex. "tekton-tag-id"). */
export type DirectiveBag = Record<string, DirectiveValue>;
/** Cible d'affichage d'un template. */
export type TemplateTarget = "web" | "tablet" | "mobile";
/** Nature d'un élément, dérivée de sa forme. */
export type ElementKind = "element" | "component-root" | "component-instance";
/** Provenance d'un élément dans le projet. */
export type ElementOrigin = "palette" | "template" | "layout" | "clone" | "import" | "paste" | "api" | "migration";
/**
 * Profil d'émission des directives dans le HTML généré.
 * Le traçage JSON est toujours complet ; le profil ne gouverne que
 * ce qui est estampillé sur le HTML de sortie.
 *
 * - "none"    : HTML propre, aucune directive (export externe).
 * - "minimal" : identité seule (id, name, type).
 * - "runtime" : identité + topologie + frontières de composants —
 *               ce dont le moteur KANTO APLO a besoin pour adresser
 *               et scoper chaque élément sans reparcourir le DOM.
 * - "full"    : tout, y compris provenance, horodatage, hash.
 */
export type EmitProfile = "none" | "minimal" | "runtime" | "full";
/** Référence vers un composant sauvegardé (portée par une instance). */
export interface ComponentRef {
    type: string;
    name: string;
    componentId: string;
}
/**
 * Options de style structurées (panneau Style).
 * Clés CSS en kebab-case ou camelCase (normalisées en kebab à l'émission).
 */
export type StyleOptions = Record<string, string>;
/**
 * La brique de base : un élément de l'arbre.
 *
 * Règles héritées de la v1, conservées à l'identique :
 * - `innerHtml` est du HTML brut opaque, émis tel quel SEULEMENT si
 *   l'élément n'a pas d'enfants (les enfants sont toujours prioritaires) ;
 * - `customCss` l'emporte sur tout le reste, classes comprises ;
 * - les directives dérivées sont recalculées par le noyau et ne sont
 *   jamais éditables à la main.
 *
 * Nouveautés v2 :
 * - `attrs` : attributs HTML arbitraires (src, href, alt, placeholder,
 *   data-*, aria-*…) — la v1 ne pouvait pas exprimer un `src` d'image ;
 * - `meta` : sac libre pour extensions d'éditeur, jamais émis en HTML,
 *   toujours sérialisé.
 */
export interface TyposElement {
    id: string;
    /** Tag HTML (div, p, img, section…). */
    type: string;
    isComponentRoot: boolean;
    componentRef: ComponentRef | null;
    directives: DirectiveBag;
    /** Attributs HTML arbitraires, émis échappés. */
    attrs: Record<string, string>;
    styleOptions: StyleOptions;
    customCss: string;
    classes: string[];
    innerHtml: string;
    script: string;
    children: TyposElement[];
    /** Extensions libres de l'éditeur (jamais émis en HTML). */
    meta: Record<string, unknown>;
}
/**
 * Un template = un arbre racine + son identité.
 *
 * Mécanisme unifié v2 : en mode "page", les templates sont les pages /
 * déclinaisons parallèles du projet ; en mode "component", les templates
 * jouent le rôle des *versions* du composant (`isMain` marque la
 * principale). Un seul mécanisme, deux lectures.
 */
export interface TyposTemplate {
    id: string;
    name: string;
    target: TemplateTarget;
    /** Version principale (mode composant). */
    isMain?: boolean;
    tree: TyposElement;
}
export type DocumentKind = "page" | "component";
/** Réglages persistés du document. */
export interface DocumentSettings {
    /** Préfixe des directives (compat runtime : "tekton" par défaut). */
    directivePrefix: string;
    /** Profil d'émission HTML par défaut. */
    emitProfile: EmitProfile;
}
/**
 * Le document Typos : l'unité de sérialisation.
 * `formatVersion` gouverne les migrations.
 */
export interface TyposDocument {
    format: "typos-document";
    formatVersion: 2;
    id: string;
    kind: DocumentKind;
    name: string;
    createdAt: string;
    updatedAt: string;
    settings: DocumentSettings;
    templates: TyposTemplate[];
    activeTemplateId: string;
    /** Sac libre au niveau document (jamais émis en HTML). */
    meta: Record<string, unknown>;
}
/**
 * Mode d'une directive :
 * - "declared" : posée par l'utilisateur ou l'éditeur, persistée telle quelle ;
 * - "derived"  : recalculée par recomputeDerivedDirectives() à chaque
 *                mutation, jamais éditable ;
 * - "computed" : calculée à la demande (hash) via computeHashes().
 */
export type DirectiveMode = "declared" | "derived" | "computed";
/** Portée d'application d'une directive. */
export type DirectiveScope = "all" | "component-root" | "component-instance" | "script";
export interface DirectiveSpec {
    /** Suffixe court, sans préfixe (ex. "id" → "tekton-tag-id"). */
    short: string;
    /** Clé complète avec le préfixe par défaut. */
    key: string;
    mode: DirectiveMode;
    scope: DirectiveScope;
    /** Catégorie fonctionnelle (identité, topologie, composant, traçage…). */
    category: "identity" | "topology" | "component" | "document" | "tracing" | "editor" | "script" | "runtime-reserved";
    /** Profil minimal à partir duquel la directive est émise en HTML. */
    emitFrom: EmitProfile;
    /** Directive réservée pour le mapping runtime futur (aucun comportement). */
    reserved?: boolean;
    description: string;
}
/** Contexte de recalcul des directives dérivées. */
export interface DeriveContext {
    documentId: string;
    templateId: string;
    target: TemplateTarget;
    directivePrefix?: string;
}
/** Options du générateur HTML. */
export interface HtmlGenOptions {
    profile?: EmitProfile;
    /** Indentation (2 espaces par défaut) ; "" = sortie compacte. */
    indent?: string;
    /** Émettre les <script data-…-script-for> scopés. */
    includeScripts?: boolean;
    /** Émettre le bloc <style> agrégé des customCss. */
    includeStyle?: boolean;
    directivePrefix?: string;
}
/** Options du parseur HTML → arbre. */
export interface HtmlParseOptions {
    html: string;
    /** CSS optionnel, rattaché au customCss de la racine. */
    css?: string;
    directivePrefix?: string;
}
export type ValidationLevel = "error" | "warning";
export interface ValidationIssue {
    level: ValidationLevel;
    code: string;
    message: string;
    /** Chemin lisible vers l'endroit fautif (ex. "templates[0].tree.children[2]"). */
    path: string;
    elementId?: string;
}
export interface ValidationResult {
    ok: boolean;
    issues: ValidationIssue[];
}
export interface EngineEventMap {
    "document:new": {
        document: TyposDocument;
    };
    "document:loaded": {
        document: TyposDocument;
    };
    "document:changed": {
        document: TyposDocument;
        label: string;
    };
    "document:renamed": {
        name: string;
    };
    "template:added": {
        templateId: string;
    };
    "template:removed": {
        templateId: string;
    };
    "template:renamed": {
        templateId: string;
        name: string;
    };
    "template:activated": {
        templateId: string;
    };
    "template:target": {
        templateId: string;
        target: TemplateTarget;
    };
    "element:added": {
        templateId: string;
        elementId: string;
        parentId: string;
    };
    "element:removed": {
        templateId: string;
        elementId: string;
    };
    "element:moved": {
        templateId: string;
        elementId: string;
        parentId: string;
        index: number;
    };
    "element:updated": {
        templateId: string;
        elementId: string;
    };
    "element:cloned": {
        templateId: string;
        sourceId: string;
        cloneId: string;
    };
    "selection:changed": {
        ids: string[];
    };
    "history:push": {
        label: string;
        depth: number;
    };
    "history:undo": {
        label: string;
    };
    "history:redo": {
        label: string;
    };
    "dirty:changed": {
        dirty: boolean;
    };
}
export type EngineEventName = keyof EngineEventMap | "*";
export type EngineListener<K extends keyof EngineEventMap> = (payload: EngineEventMap[K], eventName: K) => void;
export type EngineWildcardListener = (payload: EngineEventMap[keyof EngineEventMap], eventName: keyof EngineEventMap) => void;
/** Patch partiel d'élément (updateElement). */
export type ElementPatch = Partial<Pick<TyposElement, "type" | "attrs" | "styleOptions" | "customCss" | "classes" | "innerHtml" | "script" | "componentRef" | "isComponentRoot" | "meta">> & {
    /** Directives *déclarées* uniquement ; les dérivées sont ignorées. */
    directives?: DirectiveBag;
};
