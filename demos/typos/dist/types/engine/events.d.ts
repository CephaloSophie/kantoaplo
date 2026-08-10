import type { EngineEventMap, EngineListener, EngineWildcardListener } from "../core/types.js";
/**
 * Émetteur d'événements typé, minuscule et sans dépendance.
 * Invariant moteur : UN SEUL flux d'événements — tout ce qui arrive
 * dans le moteur passe par ici, l'UI ne fait que s'y abonner.
 */
export declare class Emitter {
    private listeners;
    on<K extends keyof EngineEventMap>(name: K, fn: EngineListener<K>): () => void;
    on(name: "*", fn: EngineWildcardListener): () => void;
    off(name: string, fn: (payload: never, name: never) => void): void;
    emit<K extends keyof EngineEventMap>(name: K, payload: EngineEventMap[K]): void;
    clear(): void;
}
