import type { ComponentRef, DirectiveBag, DirectiveValue, ElementKind, ElementOrigin, TyposElement } from "./types.js";
/** Balises HTML void : fermées automatiquement, jamais d'enfants ni d'innerHtml. */
export declare const VOID_TAGS: ReadonlySet<string>;
export interface CreateElementOptions {
    id?: string;
    name?: string;
    origin?: ElementOrigin;
    isComponentRoot?: boolean;
    componentRef?: ComponentRef | null;
    attrs?: Record<string, string>;
    styleOptions?: Record<string, string>;
    customCss?: string;
    classes?: string[];
    innerHtml?: string;
    script?: string;
    children?: TyposElement[];
    meta?: Record<string, unknown>;
    directives?: DirectiveBag;
    directivePrefix?: string;
    /** Horloge injectable (tests). */
    now?: () => string;
}
/**
 * Fabrique un élément neuf, traçage complet posé dès la naissance.
 * Les directives dérivées seront complétées par recomputeDerivedDirectives().
 */
export declare function createElement(type: string, options?: CreateElementOptions): TyposElement;
/** Nature effective d'un élément. */
export declare function elementKind(el: TyposElement): ElementKind;
/** Lit une directive par suffixe court (préfixe configurable). */
export declare function getDirective(el: TyposElement, short: string, prefix?: string): DirectiveValue | undefined;
/**
 * Pose une directive *déclarée* (retourne un nouvel élément — immuable).
 * Refuse silencieusement d'écrire une dérivée : elles appartiennent au noyau.
 */
export declare function withDirective(el: TyposElement, short: string, value: DirectiveValue, prefix?: string): TyposElement;
