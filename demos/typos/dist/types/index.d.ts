/**
 * @kanto-aplo/typos — API publique.
 *
 * Trois couches :
 * - core/   : logique pure, sans DOM ni état (arbre, directives,
 *             sérialisation, HTML aller-retour, validation) ;
 * - engine/ : TyposEngine — état immuable, historique, flux d'événements ;
 * - styles/ : jetons de design (l'UI arrive en phase 2).
 */
export type { ComponentRef, DeriveContext, DirectiveBag, DirectiveMode, DirectiveScope, DirectiveSpec, DirectiveValue, DocumentKind, DocumentSettings, ElementKind, ElementOrigin, ElementPatch, EmitProfile, EngineEventMap, EngineEventName, EngineListener, EngineWildcardListener, HtmlGenOptions, HtmlParseOptions, StyleOptions, TemplateTarget, TyposDocument, TyposElement, TyposTemplate, ValidationIssue, ValidationLevel, ValidationResult, } from "./core/types.js";
export { createComponentId, createDocumentId, createElementId, createId, createTemplateId, } from "./core/ids.js";
export { cyrb53 } from "./core/hash.js";
export { DEFAULT_DIRECTIVE_PREFIX, DERIVED_SHORTS, DIRECTIVE_REGISTRY, DIRECTIVES_BY_KEY, DIRECTIVES_BY_SHORT, directiveKey, emittedInProfile, isTyposDirectiveKey, specForKey, } from "./core/registry.js";
export { createElement, elementKind, getDirective, VOID_TAGS, withDirective, type CreateElementOptions, } from "./core/element.js";
export { computeHashes, recomputeDerivedDirectives, stripDerived, } from "./core/directives.js";
export { ancestorsOf, cloneSubtree, countElements, findById, findByPath, flatten, getParent, insertAt, isAncestor, moveTo, removeById, reorder, replaceById, unwrapElement, updateElement, walk, wrapElement, type CloneResult, type InsertResult, } from "./core/tree.js";
export { createDocument, documentHash, parseDocument, parseDocumentValue, serializeDocument, type CreateDocumentOptions, type ParseDocumentResult, type SerializeOptions, } from "./core/serialize.js";
export { validateDocument, validateElement } from "./core/validate.js";
export { collectCustomCss, elementToHtml, escapeAttr, toKebab, treeToHtml, } from "./core/html-gen.js";
export { parseHtmlToTree } from "./core/html-parse.js";
export { Emitter } from "./engine/events.js";
export { TyposEngine, type AddElementOptions, type EngineOptions, } from "./engine/TyposEngine.js";
export { TyposPalette } from "./components/TyposPalette.js";
export { TyposTreeView } from "./components/TyposTreeView.js";
export { TyposCanvas } from "./components/TyposCanvas.js";
export { TyposSelectionOverlay } from "./components/TyposSelectionOverlay.js";
export { TyposStylePanel } from "./components/TyposStylePanel.js";
export { TyposHtmlView } from "./components/TyposHtmlView.js";
export { TyposNodeGraph } from "./components/TyposNodeGraph.js";
export { TyposEditor, mountTyposEditor, type TyposEditorOptions, } from "./components/TyposEditor.js";
export { COLOR_PROPERTIES, DEFAULT_TEMPLATES, OVERLAY_ICONS, STYLE_ICONS, STYLE_PROPERTIES, STYLE_VALUES, TEMPLATES_BY_KEY, elementFromDefinition, type ElementDefinition, type OverlayIcon, type StyleIcon, type TemplateDefinition, } from "./config/defaults.js";
export { ThemeService, BUILT_IN_THEMES } from "./themes/ThemeService.js";
export { type ThemeDefinition, type ThemeTokens, type ThemeFamily, } from "./themes/types.js";
export { type ThemeServiceOptions } from "./themes/ThemeService.js";
export { TOKENS, type Tokens } from "./styles/tokens.js";
