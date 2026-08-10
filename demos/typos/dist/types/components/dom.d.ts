/**
 * Micro-couche DOM des composants Typos. Pas un framework : trois
 * fonctions pour écrire du DOM vanilla lisible, et rien d'autre.
 */
type Child = Node | string | null | undefined | false;
export interface HProps {
    class?: string;
    text?: string;
    html?: string;
    title?: string;
    attrs?: Record<string, string>;
    style?: Partial<CSSStyleDeclaration>;
    on?: Partial<{
        [K in keyof HTMLElementEventMap]: (ev: HTMLElementEventMap[K]) => void;
    }>;
}
/** h("div", { class: "x", on: { click } }, child1, child2…) */
export declare function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: HProps, ...children: Child[]): HTMLElementTagNameMap[K];
/** Vide un conteneur puis y monte des enfants. */
export declare function replaceChildren(container: HTMLElement, ...children: Child[]): void;
/** Collecteur de désabonnements : disposer.add(engine.on(...)); disposer.flush(). */
export declare function makeDisposer(): {
    add: (fn: () => void) => void;
    flush: () => void;
};
/** Anti-rebond minimal (rendus groupés). */
export declare function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): (...args: A) => void;
export {};
