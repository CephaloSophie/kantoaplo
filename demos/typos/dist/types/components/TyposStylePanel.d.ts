import type { TyposEngine } from "../engine/TyposEngine.js";
/**
 * Panneau d'inspection/édition de l'élément sélectionné.
 *
 * Chaque champ committe via updateElement avec sa coalesceKey — la
 * frappe reste fluide, l'historique reste propre (une entrée par champ
 * édité). Les propriétés de style ont : icônes raccourci en tête (ajout
 * instantané avec valeur par défaut), autocomplete propriétés + valeurs,
 * sélecteur de couleur natif pour les propriétés colorées.
 */
export declare class TyposStylePanel {
    private container;
    private engine;
    private disposer;
    private currentId;
    constructor(container: HTMLElement, engine: TyposEngine);
    private el;
    private prefix;
    private patch;
    private render;
    /**
     * En-tête d'icônes raccourci + éditeur clé/valeur avec autocomplete
     * et sélecteur de couleur pour les propriétés colorées.
     */
    private styleSection;
    private styleShortcutButton;
    private focusStyleField;
    private section;
    private fieldRow;
    private metaRow;
    private textInput;
    /**
     * Éditeur clé/valeur générique. `withStyleAutocomplete=true` active :
     *  · datalist des propriétés CSS ;
     *  · datalist contextuel des valeurs (par propriété) ;
     *  · sélecteur de couleur natif pour les propriétés colorées.
     */
    private kvEditor;
    /** Attache le datalist de valeurs et — si couleur — un input color natif. */
    private tuneValueInput;
    /** Réajuste le datalist / la présence du swatch quand la propriété change. */
    private retuneValueInput;
    private valueListIdFor;
    /** Datalists partagés — créés une fois, réutilisés par toutes les instances. */
    private ensureDatalists;
    private tagInput;
    private textArea;
    private toggle;
    private actionBtn;
    /** Choix noir/blanc contrasté sur un fond hex #RRGGBB. */
    private readableOn;
    destroy(): void;
}
