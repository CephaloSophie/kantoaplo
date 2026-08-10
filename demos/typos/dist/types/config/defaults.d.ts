/**
 * @kanto-aplo/typos — TABLEAU DE BORD DE L'ÉDITEUR.
 *
 * Ce fichier est l'unique endroit à modifier pour :
 *  · changer les icônes raccourci du panneau de style (avec leurs teintes) ;
 *  · enrichir l'autocomplete des propriétés et valeurs CSS ;
 *  · déclarer quelles propriétés méritent un sélecteur de couleur natif ;
 *  · ajouter, retirer ou reformuler les squelettes de page proposés
 *    (header, hero, sections en colonnes, cartes, footer…).
 *
 * Tout est déclaratif — aucun code métier ici, juste des données.
 * `elementFromDefinition()` transforme un ElementDefinition en TyposElement.
 */
import type { TyposElement } from "../core/types.js";
/**
 * Un clic → la propriété est ajoutée (ou refocalisée si déjà présente)
 * avec sa valeur par défaut ; le champ correspondant reçoit le focus.
 */
export interface StyleIcon {
    key: string;
    label: string;
    /** Glyphe court (unicode, une à deux lettres). */
    icon: string;
    /** Teinte de fond de la pastille — encre l'identité visuelle. */
    tint: string;
    /** Propriété CSS ciblée (kebab-case). */
    property: string;
    defaultValue: string;
    /** Type de valeur — pilote le widget de saisie. */
    kind: "color" | "length" | "text" | "number";
}
export declare const STYLE_ICONS: readonly StyleIcon[];
/** Propriétés proposées dans le datalist des lignes de style. */
export declare const STYLE_PROPERTIES: readonly string[];
/** Suggestions de valeurs par propriété (datalist contextuel). */
export declare const STYLE_VALUES: Readonly<Record<string, readonly string[]>>;
/** Propriétés déclenchant un `<input type="color">` couplé au champ texte. */
export declare const COLOR_PROPERTIES: ReadonlySet<string>;
export interface OverlayIcon {
    key: "clone" | "delete" | "up" | "down" | "wrap";
    label: string;
    icon: string;
    tint: string;
}
export declare const OVERLAY_ICONS: readonly OverlayIcon[];
export interface ElementDefinition {
    type: string;
    name?: string;
    classes?: string[];
    attrs?: Record<string, string>;
    styleOptions?: Record<string, string>;
    customCss?: string;
    innerHtml?: string;
    script?: string;
    isComponentRoot?: boolean;
    componentRef?: {
        type: string;
        name: string;
        componentId: string;
    };
    children?: ElementDefinition[];
}
export interface TemplateDefinition {
    key: string;
    label: string;
    icon: string;
    category: "structure" | "layout" | "content" | "component";
    tree: ElementDefinition;
}
/**
 * Templates par défaut — objet global exporté, prêt à être étendu.
 * Chaque entrée est un ElementDefinition récursif, construit sans code.
 */
export declare const DEFAULT_TEMPLATES: readonly TemplateDefinition[];
/**
 * Transforme une ElementDefinition (JSON récursif) en TyposElement,
 * en générant des ids frais partout et en marquant `origin: "template"`.
 */
export declare function elementFromDefinition(def: ElementDefinition, directivePrefix?: string, now?: () => string): TyposElement;
/** Table indexée pour lookup rapide. */
export declare const TEMPLATES_BY_KEY: ReadonlyMap<string, TemplateDefinition>;
