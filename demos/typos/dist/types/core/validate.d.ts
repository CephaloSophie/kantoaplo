import type { TyposDocument, TyposElement, ValidationIssue, ValidationResult } from "./types.js";
export declare function validateElement(el: TyposElement, path: string, seenIds: Map<string, string>, issues: ValidationIssue[]): void;
export declare function validateDocument(doc: TyposDocument): ValidationResult;
