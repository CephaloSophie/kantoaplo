let counter = 0;
const rand = () => {
  const g = globalThis;
  if (g.crypto?.getRandomValues) {
    const buf = new Uint32Array(2);
    g.crypto.getRandomValues(buf);
    return ((buf[0] ?? 0).toString(36).padStart(7, "0") + (buf[1] ?? 0).toString(36).padStart(7, "0")).slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12).padEnd(10, "0");
};
function createId(prefix) {
  counter = (counter + 1) % 1296;
  const time = Date.now().toString(36);
  const seq = counter.toString(36).padStart(2, "0");
  return `${prefix}_${time}${seq}${rand()}`;
}
const createElementId = () => createId("el");
const createTemplateId = () => createId("tpl");
const createDocumentId = () => createId("doc");
const createComponentId = () => createId("cmp");
function cyrb53(str, seed = 0) {
  let h1 = 3735928559 ^ seed;
  let h2 = 1103547991 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507);
  h1 ^= Math.imul(h2 ^ h2 >>> 13, 3266489909);
  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507);
  h2 ^= Math.imul(h1 ^ h1 >>> 13, 3266489909);
  const n = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return n.toString(36);
}
const DEFAULT_DIRECTIVE_PREFIX = "tekton";
const PROFILE_ORDER = {
  none: 0,
  minimal: 1,
  runtime: 2,
  full: 3
};
function directiveKey(short, prefix = DEFAULT_DIRECTIVE_PREFIX) {
  if (short === "script-for") return `data-${prefix}-script-for`;
  if (RUNTIME_SHORTS.has(short)) return `${prefix}-${short}`;
  return `${prefix}-tag-${short}`;
}
const RUNTIME_SHORTS = /* @__PURE__ */ new Set([
  "bind",
  "repeat",
  "show",
  "action",
  "class",
  "model",
  "on"
]);
function spec(short, mode, scope, category, emitFrom, description, reserved = false) {
  return {
    short,
    key: directiveKey(short),
    mode,
    scope,
    category,
    emitFrom,
    reserved,
    description
  };
}
const DIRECTIVE_REGISTRY = [
  /* -------------------------------------------------- identité ----- */
  spec(
    "id",
    "declared",
    "all",
    "identity",
    "minimal",
    "Identifiant unique et stable de l'élément, jamais recyclé."
  ),
  spec(
    "name",
    "declared",
    "all",
    "identity",
    "minimal",
    "Nom humain de l'élément (hero, footer…)."
  ),
  spec(
    "type",
    "derived",
    "all",
    "identity",
    "minimal",
    "Tag HTML de l'élément — rend le HTML auto-descriptif."
  ),
  spec(
    "kind",
    "derived",
    "all",
    "identity",
    "runtime",
    "Nature : element | component-root | component-instance."
  ),
  /* -------------------------------------------------- topologie ---- */
  spec(
    "path",
    "derived",
    "all",
    "topology",
    "runtime",
    "Adresse unique et stable dans l'arbre (ex. 0-1-2)."
  ),
  spec(
    "depth",
    "derived",
    "all",
    "topology",
    "runtime",
    "Profondeur (racine = 0)."
  ),
  spec(
    "index",
    "derived",
    "all",
    "topology",
    "runtime",
    "Index parmi les frères."
  ),
  spec(
    "parent-id",
    "derived",
    "all",
    "topology",
    "runtime",
    "Remontée directe au parent sans reparcourir le DOM."
  ),
  spec(
    "parent-type",
    "derived",
    "all",
    "topology",
    "runtime",
    "Tag HTML du parent."
  ),
  spec(
    "prev-id",
    "derived",
    "all",
    "topology",
    "runtime",
    "Frère précédent (navigation latérale sans DOM-walk)."
  ),
  spec(
    "next-id",
    "derived",
    "all",
    "topology",
    "runtime",
    "Frère suivant."
  ),
  spec(
    "child-count",
    "derived",
    "all",
    "topology",
    "runtime",
    "Nombre d'enfants directs."
  ),
  spec(
    "root-id",
    "derived",
    "all",
    "topology",
    "runtime",
    "Id de la racine de l'arbre (utile en multi-template)."
  ),
  /* -------------------------------------------------- composant ---- */
  spec(
    "component-first-parent",
    "derived",
    "all",
    "component",
    "runtime",
    "Frontière : id de la racine de composant la plus proche (soi inclus)."
  ),
  spec(
    "component-path",
    "derived",
    "all",
    "component",
    "runtime",
    "Adresse relative à cette frontière ('' hors composant)."
  ),
  spec(
    "component-type",
    "declared",
    "component-root",
    "component",
    "runtime",
    "Type du composant (racine seulement)."
  ),
  spec(
    "component-name",
    "declared",
    "component-root",
    "component",
    "runtime",
    "Nom du composant (racine seulement)."
  ),
  spec(
    "component-id",
    "declared",
    "component-root",
    "component",
    "runtime",
    "Id du composant sauvegardé (racine seulement)."
  ),
  spec(
    "component-version",
    "declared",
    "component-root",
    "component",
    "runtime",
    "Version du composant instanciée (racine seulement)."
  ),
  spec(
    "slot",
    "declared",
    "all",
    "component",
    "runtime",
    "Nom de slot si l'élément est un emplacement de contenu."
  ),
  /* -------------------------------------------------- document ----- */
  spec(
    "template-id",
    "derived",
    "all",
    "document",
    "full",
    "Template d'appartenance."
  ),
  spec(
    "document-id",
    "derived",
    "all",
    "document",
    "full",
    "Document (projet) d'appartenance."
  ),
  spec(
    "target",
    "derived",
    "all",
    "document",
    "full",
    "Cible du template : web | tablet | mobile."
  ),
  /* -------------------------------------------------- traçage ------ */
  spec(
    "origin",
    "declared",
    "all",
    "tracing",
    "full",
    "Provenance : palette | template | layout | clone | import | paste | api | migration."
  ),
  spec(
    "source-id",
    "declared",
    "all",
    "tracing",
    "full",
    "Id de l'élément d'origine (clone/instanciation)."
  ),
  spec(
    "created-at",
    "declared",
    "all",
    "tracing",
    "full",
    "Horodatage ISO de création."
  ),
  spec(
    "updated-at",
    "declared",
    "all",
    "tracing",
    "full",
    "Horodatage ISO de dernière mutation."
  ),
  spec(
    "revision",
    "declared",
    "all",
    "tracing",
    "full",
    "Compteur de mutations de l'élément (0 à la création)."
  ),
  spec(
    "hash",
    "computed",
    "all",
    "tracing",
    "full",
    "Hash Merkle du sous-arbre (contenu + hashs des enfants) — diff et intégrité."
  ),
  /* -------------------------------------------------- éditeur ------ */
  spec(
    "locked",
    "declared",
    "all",
    "editor",
    "full",
    "Verrouillé dans l'éditeur (pas de sélection/mutation UI)."
  ),
  spec(
    "hidden",
    "declared",
    "all",
    "editor",
    "full",
    "Masqué dans le canvas (persiste, n'émet pas display:none)."
  ),
  /* -------------------------------------------------- script ------- */
  spec(
    "script-for",
    "derived",
    "script",
    "script",
    "minimal",
    'Marqueur du <script> scopé : data-<prefix>-script-for="id".'
  ),
  /* ---------------------------------------- runtime (réservées) ---- */
  spec(
    "bind",
    "declared",
    "all",
    "runtime-reserved",
    "runtime",
    "RÉSERVÉE — liaison de donnée (mapping runtime à concevoir).",
    true
  ),
  spec(
    "repeat",
    "declared",
    "all",
    "runtime-reserved",
    "runtime",
    "RÉSERVÉE — répétition sur collection.",
    true
  ),
  spec(
    "show",
    "declared",
    "all",
    "runtime-reserved",
    "runtime",
    "RÉSERVÉE — visibilité conditionnelle.",
    true
  ),
  spec(
    "action",
    "declared",
    "all",
    "runtime-reserved",
    "runtime",
    "RÉSERVÉE — déclencheur d'action.",
    true
  ),
  spec(
    "class",
    "declared",
    "all",
    "runtime-reserved",
    "runtime",
    "RÉSERVÉE — classes conditionnelles.",
    true
  ),
  spec(
    "model",
    "declared",
    "all",
    "runtime-reserved",
    "runtime",
    "RÉSERVÉE — liaison bidirectionnelle de formulaire.",
    true
  ),
  spec(
    "on",
    "declared",
    "all",
    "runtime-reserved",
    "runtime",
    "RÉSERVÉE — abonnement d'événement.",
    true
  )
];
const DIRECTIVES_BY_SHORT = new Map(
  DIRECTIVE_REGISTRY.map((s) => [s.short, s])
);
const DIRECTIVES_BY_KEY = new Map(
  DIRECTIVE_REGISTRY.map((s) => [s.key, s])
);
const DERIVED_SHORTS = new Set(
  DIRECTIVE_REGISTRY.filter((s) => s.mode === "derived").map((s) => s.short)
);
function emittedInProfile(specItem, profile) {
  if (profile === "none") return false;
  if (specItem.reserved) {
    return PROFILE_ORDER[profile] >= PROFILE_ORDER[specItem.emitFrom];
  }
  return PROFILE_ORDER[profile] >= PROFILE_ORDER[specItem.emitFrom];
}
function specForKey(key, prefix = DEFAULT_DIRECTIVE_PREFIX) {
  for (const s of DIRECTIVE_REGISTRY) {
    if (directiveKey(s.short, prefix) === key) return s;
  }
  return null;
}
function isTyposDirectiveKey(key, prefix = DEFAULT_DIRECTIVE_PREFIX) {
  return key.startsWith(`${prefix}-`) || key === `data-${prefix}-script-for`;
}
const VOID_TAGS = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
function createElement(type, options = {}) {
  const prefix = options.directivePrefix ?? DEFAULT_DIRECTIVE_PREFIX;
  const now = options.now ? options.now() : (/* @__PURE__ */ new Date()).toISOString();
  const id = options.id ?? createElementId();
  const k = (short) => directiveKey(short, prefix);
  const directives = {
    [k("id")]: id,
    [k("name")]: options.name ?? type,
    [k("origin")]: options.origin ?? "api",
    [k("source-id")]: "",
    [k("created-at")]: now,
    [k("updated-at")]: now,
    [k("revision")]: 0,
    [k("locked")]: false,
    [k("hidden")]: false,
    [k("slot")]: "",
    ...options.isComponentRoot ? {
      [k("component-type")]: options.componentRef?.type ?? "",
      [k("component-name")]: options.componentRef?.name ?? options.name ?? type,
      [k("component-id")]: options.componentRef?.componentId ?? "",
      [k("component-version")]: ""
    } : {},
    ...options.directives ?? {}
  };
  return {
    id,
    type,
    isComponentRoot: options.isComponentRoot ?? false,
    componentRef: options.componentRef ?? null,
    directives,
    attrs: { ...options.attrs ?? {} },
    styleOptions: { ...options.styleOptions ?? {} },
    customCss: options.customCss ?? "",
    classes: [...options.classes ?? []],
    innerHtml: options.innerHtml ?? "",
    script: options.script ?? "",
    children: options.children ?? [],
    meta: { ...options.meta ?? {} }
  };
}
function elementKind(el) {
  if (el.isComponentRoot) return "component-root";
  if (el.componentRef) return "component-instance";
  return "element";
}
function getDirective(el, short, prefix = DEFAULT_DIRECTIVE_PREFIX) {
  return el.directives[directiveKey(short, prefix)];
}
function withDirective(el, short, value, prefix = DEFAULT_DIRECTIVE_PREFIX) {
  return {
    ...el,
    directives: { ...el.directives, [directiveKey(short, prefix)]: value }
  };
}
function recomputeDerivedDirectives(root, ctx) {
  const prefix = ctx.directivePrefix ?? DEFAULT_DIRECTIVE_PREFIX;
  const k = (short) => directiveKey(short, prefix);
  const visit = (el, parent, index, path, depth, prevId, nextId, boundaryId, boundaryPath) => {
    const isRoot = el.isComponentRoot;
    const myBoundaryId = isRoot ? el.id : boundaryId;
    const myBoundaryPath = isRoot ? "" : myBoundaryId === "" ? "" : boundaryPath;
    const children = el.children.map(
      (child, i) => visit(
        child,
        el,
        i,
        `${path}-${i}`,
        depth + 1,
        i > 0 ? el.children[i - 1]?.id ?? "" : "",
        i < el.children.length - 1 ? el.children[i + 1]?.id ?? "" : "",
        myBoundaryId,
        myBoundaryId === "" ? "" : myBoundaryPath === "" ? String(i) : `${myBoundaryPath}-${i}`
      )
    );
    const derived = {
      [k("type")]: el.type,
      [k("kind")]: elementKind(el),
      [k("path")]: path,
      [k("depth")]: depth,
      [k("index")]: index,
      [k("parent-id")]: parent?.id ?? "",
      [k("parent-type")]: parent?.type ?? "",
      [k("prev-id")]: prevId,
      [k("next-id")]: nextId,
      [k("child-count")]: children.length,
      [k("root-id")]: rootId,
      [k("component-first-parent")]: myBoundaryId,
      [k("component-path")]: isRoot ? "" : myBoundaryId === "" ? "" : boundaryPath,
      [k("template-id")]: ctx.templateId,
      [k("document-id")]: ctx.documentId,
      [k("target")]: ctx.target
    };
    return { ...el, directives: { ...el.directives, ...derived }, children };
  };
  const rootId = root.id;
  return visit(root, null, 0, "0", 0, "", "", "", "");
}
function computeHashes(root, prefix = DEFAULT_DIRECTIVE_PREFIX) {
  const hashKey = directiveKey("hash", prefix);
  const nameKey = directiveKey("name", prefix);
  const slotKey = directiveKey("slot", prefix);
  const visit = (el) => {
    const children = el.children.map(visit);
    const basis = JSON.stringify([
      el.type,
      el.directives[nameKey] ?? "",
      el.directives[slotKey] ?? "",
      sortedEntries(el.attrs),
      el.classes,
      sortedEntries(el.styleOptions),
      el.customCss,
      children.length === 0 ? el.innerHtml : "",
      el.script,
      el.componentRef,
      el.isComponentRoot,
      children.map((c) => c.directives[hashKey] ?? "")
    ]);
    return {
      ...el,
      children,
      directives: { ...el.directives, [hashKey]: cyrb53(basis) }
    };
  };
  return visit(root);
}
function sortedEntries(obj) {
  return Object.entries(obj).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
}
function stripDerived(bag, prefix = DEFAULT_DIRECTIVE_PREFIX) {
  const out = {};
  for (const [key, value] of Object.entries(bag)) {
    let derived = false;
    for (const short of DERIVED_SHORTS) {
      if (directiveKey(short, prefix) === key) {
        derived = true;
        break;
      }
    }
    if (!derived) out[key] = value;
  }
  return out;
}
function findById(root, id) {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}
function findByPath(root, path) {
  const parts = path.split("-").map(Number);
  if (parts[0] !== 0) return null;
  let node = root;
  for (let i = 1; i < parts.length; i++) {
    const idx = parts[i];
    if (idx === void 0 || Number.isNaN(idx)) return null;
    const next = node.children[idx];
    if (!next) return null;
    node = next;
  }
  return node;
}
function getParent(root, id) {
  if (root.id === id) return null;
  for (const child of root.children) {
    if (child.id === id) return root;
    const found = getParent(child, id);
    if (found) return found;
  }
  return null;
}
function ancestorsOf(root, id) {
  const chain = [];
  const walk2 = (node) => {
    if (node.id === id) return true;
    for (const child of node.children) {
      if (walk2(child)) {
        chain.unshift(node);
        return true;
      }
    }
    return false;
  };
  walk2(root);
  return chain;
}
function isAncestor(root, maybeAncestorId, id) {
  return ancestorsOf(root, id).some((a) => a.id === maybeAncestorId);
}
function walk(root, visit) {
  const rec = (el, parent, depth) => {
    visit(el, parent, depth);
    for (const child of el.children) rec(child, el, depth + 1);
  };
  rec(root, null, 0);
}
function flatten(root) {
  const out = [];
  walk(root, (el) => out.push(el));
  return out;
}
function countElements(root) {
  let n = 0;
  walk(root, () => n++);
  return n;
}
function replaceById(root, id, replacer) {
  if (root.id === id) return replacer(root);
  let changed = false;
  const children = root.children.map((child) => {
    const next = replaceById(child, id, replacer);
    if (next !== child) changed = true;
    return next;
  });
  return changed ? { ...root, children } : root;
}
function insertAt(root, parentId, element, index) {
  const parent = findById(root, parentId);
  if (!parent || VOID_TAGS.has(parent.type)) {
    return { root, inserted: element };
  }
  const next = replaceById(root, parentId, (p) => {
    const children = [...p.children];
    const at = index === void 0 || index < 0 || index > children.length ? children.length : index;
    children.splice(at, 0, element);
    return { ...p, children };
  });
  return { root: next, inserted: element };
}
function removeById(root, id) {
  if (root.id === id) return root;
  const parent = getParent(root, id);
  if (!parent) return root;
  return replaceById(root, parent.id, (p) => ({
    ...p,
    children: p.children.filter((c) => c.id !== id)
  }));
}
function moveTo(root, id, newParentId, index) {
  if (id === root.id || id === newParentId) return root;
  const el = findById(root, id);
  const target = findById(root, newParentId);
  if (!el || !target || VOID_TAGS.has(target.type)) return root;
  if (isAncestor(root, id, newParentId)) return root;
  const without = removeById(root, id);
  if (without === root) return root;
  return insertAt(without, newParentId, el, index).root;
}
function reorder(root, id, newIndex) {
  const parent = getParent(root, id);
  if (!parent) return root;
  return replaceById(root, parent.id, (p) => {
    const from = p.children.findIndex((c) => c.id === id);
    if (from === -1) return p;
    const children = [...p.children];
    const moved = children.splice(from, 1)[0];
    if (!moved) return p;
    const to = Math.max(0, Math.min(newIndex, children.length));
    children.splice(to, 0, moved);
    return { ...p, children };
  });
}
function updateElement(root, id, patch, prefix = DEFAULT_DIRECTIVE_PREFIX, now = () => (/* @__PURE__ */ new Date()).toISOString()) {
  return replaceById(root, id, (el) => {
    const declared = patch.directives ? stripDerived(patch.directives, prefix) : {};
    const revKey = directiveKey("revision", prefix);
    const updKey = directiveKey("updated-at", prefix);
    const currentRev = el.directives[revKey];
    const rev = typeof currentRev === "number" ? currentRev + 1 : 1;
    const { directives: _ignored, ...rest } = patch;
    return {
      ...el,
      ...rest,
      attrs: patch.attrs ? { ...patch.attrs } : el.attrs,
      styleOptions: patch.styleOptions ? { ...patch.styleOptions } : el.styleOptions,
      classes: patch.classes ? [...patch.classes] : el.classes,
      meta: patch.meta ? { ...patch.meta } : el.meta,
      directives: {
        ...el.directives,
        ...declared,
        [revKey]: rev,
        [updKey]: now()
      }
    };
  });
}
function cloneSubtree(root, id, prefix = DEFAULT_DIRECTIVE_PREFIX, now = () => (/* @__PURE__ */ new Date()).toISOString()) {
  const source = findById(root, id);
  const parent = getParent(root, id);
  if (!source || !parent) return { root, clone: root };
  const stamp = now();
  const k = (short) => directiveKey(short, prefix);
  const deepClone = (el) => {
    const newId = createElementId();
    return {
      ...el,
      id: newId,
      attrs: { ...el.attrs },
      styleOptions: { ...el.styleOptions },
      classes: [...el.classes],
      meta: { ...el.meta },
      componentRef: el.componentRef ? { ...el.componentRef } : null,
      directives: {
        ...el.directives,
        [k("id")]: newId,
        [k("origin")]: "clone",
        [k("source-id")]: el.id,
        [k("created-at")]: stamp,
        [k("updated-at")]: stamp,
        [k("revision")]: 0
      },
      children: el.children.map(deepClone)
    };
  };
  const clone = deepClone(source);
  const at = parent.children.findIndex((c) => c.id === id) + 1;
  const next = insertAt(root, parent.id, clone, at).root;
  return { root: next, clone };
}
function wrapElement(root, id, wrapper) {
  if (root.id === id || VOID_TAGS.has(wrapper.type)) return root;
  const parent = getParent(root, id);
  if (!parent) return root;
  return replaceById(root, parent.id, (p) => ({
    ...p,
    children: p.children.map(
      (c) => c.id === id ? { ...wrapper, children: [c] } : c
    )
  }));
}
function unwrapElement(root, id) {
  if (root.id === id) return root;
  const parent = getParent(root, id);
  if (!parent) return root;
  return replaceById(root, parent.id, (p) => {
    const children = [];
    for (const c of p.children) {
      if (c.id === id) children.push(...c.children);
      else children.push(c);
    }
    return { ...p, children };
  });
}
const TAG_RE = /^[a-zA-Z][a-zA-Z0-9-]*$/;
function validateElement(el, path, seenIds, issues) {
  const push = (level, code, message) => {
    issues.push({ level, code, message, path, elementId: el.id });
  };
  if (typeof el.id !== "string" || el.id.length === 0) {
    push("error", "element/id-missing", "Élément sans id.");
  } else if (seenIds.has(el.id)) {
    push(
      "error",
      "element/id-duplicate",
      `Id dupliqué "${el.id}" (déjà vu à ${seenIds.get(el.id)}).`
    );
  } else {
    seenIds.set(el.id, path);
  }
  if (typeof el.type !== "string" || !TAG_RE.test(el.type)) {
    push("error", "element/type-invalid", `Tag invalide "${String(el.type)}".`);
  }
  if (VOID_TAGS.has(el.type)) {
    if (el.children.length > 0) {
      push(
        "error",
        "element/void-children",
        `<${el.type}> est une balise void : enfants interdits.`
      );
    }
    if (el.innerHtml) {
      push(
        "warning",
        "element/void-innerhtml",
        `<${el.type}> est une balise void : innerHtml ignoré à l'émission.`
      );
    }
  }
  if (el.children.length > 0 && el.innerHtml) {
    push(
      "warning",
      "element/innerhtml-shadowed",
      "innerHtml présent mais enfants prioritaires : il ne sera pas émis."
    );
  }
  if (el.componentRef && typeof el.componentRef.componentId !== "string") {
    push(
      "error",
      "element/componentref-invalid",
      "componentRef.componentId manquant."
    );
  }
  if (!Array.isArray(el.classes) || el.classes.some((c) => typeof c !== "string")) {
    push("error", "element/classes-invalid", "classes doit être un tableau de chaînes.");
  }
  for (const [key, value] of Object.entries(el.attrs)) {
    if (typeof value !== "string") {
      push(
        "error",
        "element/attr-invalid",
        `Attribut "${key}" : valeur non textuelle.`
      );
    }
  }
  el.children.forEach(
    (child, i) => validateElement(child, `${path}.children[${i}]`, seenIds, issues)
  );
}
function validateDocument(doc) {
  const issues = [];
  const push = (level, code, message, path) => {
    issues.push({ level, code, message, path });
  };
  if (doc.format !== "typos-document") {
    push("error", "document/format", "format doit valoir 'typos-document'.", "format");
  }
  if (doc.formatVersion !== 2) {
    push(
      "error",
      "document/version",
      `formatVersion ${String(doc.formatVersion)} non supportée (attendu : 2).`,
      "formatVersion"
    );
  }
  if (typeof doc.id !== "string" || !doc.id) {
    push("error", "document/id", "Document sans id.", "id");
  }
  if (doc.kind !== "page" && doc.kind !== "component") {
    push("error", "document/kind", `kind invalide "${String(doc.kind)}".`, "kind");
  }
  if (!Array.isArray(doc.templates) || doc.templates.length === 0) {
    push(
      "error",
      "document/templates-empty",
      "Au moins un template est requis.",
      "templates"
    );
  }
  const templateIds = /* @__PURE__ */ new Set();
  doc.templates?.forEach((t, i) => {
    const tPath = `templates[${i}]`;
    if (!t.id) push("error", "template/id", "Template sans id.", tPath);
    else if (templateIds.has(t.id)) {
      push("error", "template/id-duplicate", `Id de template dupliqué "${t.id}".`, tPath);
    } else templateIds.add(t.id);
    if (t.target !== "web" && t.target !== "tablet" && t.target !== "mobile") {
      push(
        "error",
        "template/target",
        `target invalide "${String(t.target)}".`,
        `${tPath}.target`
      );
    }
    if (!t.tree) {
      push("error", "template/tree-missing", "Template sans arbre.", `${tPath}.tree`);
    } else {
      validateElement(t.tree, `${tPath}.tree`, /* @__PURE__ */ new Map(), issues);
    }
  });
  if (doc.templates?.length && !doc.templates.some((t) => t.id === doc.activeTemplateId)) {
    push(
      "error",
      "document/active-template",
      `activeTemplateId "${doc.activeTemplateId}" ne référence aucun template.`,
      "activeTemplateId"
    );
  }
  if (doc.kind === "component") {
    const mains = doc.templates?.filter((t) => t.isMain) ?? [];
    if (mains.length > 1) {
      push(
        "warning",
        "component/multiple-main",
        "Plusieurs versions marquées isMain ; la première fera foi.",
        "templates"
      );
    }
  }
  return { ok: !issues.some((i) => i.level === "error"), issues };
}
const DOCUMENT_KEY_ORDER = [
  "format",
  "formatVersion",
  "id",
  "kind",
  "name",
  "createdAt",
  "updatedAt",
  "settings",
  "templates",
  "activeTemplateId",
  "meta"
];
const SETTINGS_KEY_ORDER = ["directivePrefix", "emitProfile"];
const TEMPLATE_KEY_ORDER = ["id", "name", "target", "isMain", "tree"];
const ELEMENT_KEY_ORDER = [
  "id",
  "type",
  "isComponentRoot",
  "componentRef",
  "directives",
  "attrs",
  "styleOptions",
  "customCss",
  "classes",
  "innerHtml",
  "script",
  "children",
  "meta"
];
const COMPONENT_REF_KEY_ORDER = ["type", "name", "componentId"];
function createDocument(options = {}) {
  const now = options.now ? options.now() : (/* @__PURE__ */ new Date()).toISOString();
  const id = options.id ?? createDocumentId();
  const prefix = options.directivePrefix ?? DEFAULT_DIRECTIVE_PREFIX;
  const target = options.target ?? "web";
  const templateId = createTemplateId();
  const tree = options.rootTree ?? createElement("div", {
    name: "root",
    origin: "template",
    directivePrefix: prefix,
    now: options.now
  });
  const ctx = {
    documentId: id,
    templateId,
    target,
    directivePrefix: prefix
  };
  return {
    format: "typos-document",
    formatVersion: 2,
    id,
    kind: options.kind ?? "page",
    name: options.name ?? "Sans titre",
    createdAt: now,
    updatedAt: now,
    settings: {
      directivePrefix: prefix,
      emitProfile: options.emitProfile ?? "runtime"
    },
    templates: [
      {
        id: templateId,
        name: options.kind === "component" ? "main" : "Template 1",
        target,
        ...options.kind === "component" ? { isMain: true } : {},
        tree: recomputeDerivedDirectives(tree, ctx)
      }
    ],
    activeTemplateId: templateId,
    meta: {}
  };
}
function orderKeys(value, order) {
  const out = {};
  for (const key of order) {
    if (key in value && value[key] !== void 0) out[key] = value[key];
  }
  const extra = Object.keys(value).filter((k) => !order.includes(k) && value[k] !== void 0).sort();
  for (const key of extra) out[key] = value[key];
  return out;
}
function sortKeys(value) {
  const out = {};
  for (const key of Object.keys(value).sort()) out[key] = value[key];
  return out;
}
function canonicalElement(el) {
  return orderKeys(
    {
      ...el,
      componentRef: el.componentRef ? orderKeys(el.componentRef, COMPONENT_REF_KEY_ORDER) : null,
      directives: sortKeys(el.directives),
      attrs: sortKeys(el.attrs),
      styleOptions: sortKeys(el.styleOptions),
      meta: sortKeys(el.meta),
      children: el.children.map(canonicalElement)
    },
    ELEMENT_KEY_ORDER
  );
}
function canonicalDocument(doc) {
  return orderKeys(
    {
      ...doc,
      settings: orderKeys(
        doc.settings,
        SETTINGS_KEY_ORDER
      ),
      templates: doc.templates.map(
        (t) => orderKeys(
          { ...t, tree: canonicalElement(t.tree) },
          TEMPLATE_KEY_ORDER
        )
      ),
      meta: sortKeys(doc.meta)
    },
    DOCUMENT_KEY_ORDER
  );
}
function serializeDocument(doc, options = {}) {
  const withHashes = options.withHashes ?? true;
  const prepared = withHashes ? {
    ...doc,
    templates: doc.templates.map((t) => ({
      ...t,
      tree: computeHashes(t.tree, doc.settings.directivePrefix)
    }))
  } : doc;
  return JSON.stringify(
    canonicalDocument(prepared),
    null,
    options.space ?? 2
  );
}
function documentHash(doc) {
  const canonical = canonicalDocument({
    ...doc,
    updatedAt: ""
  });
  return cyrb53(JSON.stringify(canonical));
}
function parseDocument(json) {
  let raw;
  try {
    raw = JSON.parse(json);
  } catch (e) {
    throw new Error(
      `Typos: JSON invalide — ${e.message}`
    );
  }
  return parseDocumentValue(raw);
}
function parseDocumentValue(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Typos: document invalide (objet attendu).");
  }
  const obj = raw;
  let doc;
  let migrated = false;
  if (obj["format"] === "typos-document") {
    doc = obj;
  } else {
    doc = migrateLegacy(obj);
    migrated = true;
  }
  const prefix = doc.settings.directivePrefix;
  doc = {
    ...doc,
    templates: doc.templates.map((t) => ({
      ...t,
      tree: recomputeDerivedDirectives(t.tree, {
        documentId: doc.id,
        templateId: t.id,
        target: t.target,
        directivePrefix: prefix
      })
    }))
  };
  const result = validateDocument(doc);
  if (!result.ok) {
    const first = result.issues.find((i) => i.level === "error");
    throw new Error(
      `Typos: document invalide — ${first?.message ?? "erreur inconnue"} (${first?.path ?? "?"})`
    );
  }
  return { document: doc, migrated };
}
function migrateElement(legacy, now) {
  const id = typeof legacy.id === "string" && legacy.id ? legacy.id : createElementId();
  const directives = {};
  for (const [key, value] of Object.entries(legacy.directives ?? {})) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
      const normalized = key.startsWith("tag-component-") ? `tekton-${key}` : key;
      directives[normalized] = value;
    }
  }
  const base = createElement(legacy.type ?? "div", {
    id,
    origin: "migration",
    isComponentRoot: legacy.isComponentRoot ?? false,
    componentRef: legacy.componentRef && typeof legacy.componentRef.componentId === "string" ? {
      type: legacy.componentRef.type ?? "",
      name: legacy.componentRef.name ?? "",
      componentId: legacy.componentRef.componentId
    } : null,
    styleOptions: legacy.styleOptions ?? {},
    customCss: legacy.customCss ?? "",
    classes: legacy.classes ?? [],
    innerHtml: legacy.innerHtml ?? "",
    script: legacy.script ?? "",
    now: () => now
  });
  return {
    ...base,
    // Les directives héritées (déclarées) écrasent les valeurs par défaut ;
    // les dérivées seront de toute façon recalculées derrière.
    directives: { ...base.directives, ...directives, "tekton-tag-id": id },
    children: (legacy.children ?? []).map((c) => migrateElement(c, now))
  };
}
function migrateLegacy(obj) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (typeof obj["type"] === "string" && Array.isArray(obj["children"])) {
    const tree = migrateElement(obj, now);
    const base = createDocument({ name: "Import v1", rootTree: tree, now: () => now });
    return base;
  }
  if (Array.isArray(obj["templates"])) {
    const id = typeof obj["id"] === "string" ? obj["id"] : createDocumentId();
    const kindRaw = obj["kind"] ?? obj["mode"];
    const kind = kindRaw === "component" ? "component" : "page";
    const legacyTemplates = obj["templates"];
    const templates = legacyTemplates.map((t, i) => {
      const treeRaw = t["tree"] ?? t["root"] ?? t["element"];
      const target = t["target"];
      return {
        id: typeof t["id"] === "string" ? t["id"] : createTemplateId(),
        name: typeof t["name"] === "string" ? t["name"] : `Template ${i + 1}`,
        target: target === "mobile" || target === "tablet" || target === "web" ? target : "web",
        tree: treeRaw ? migrateElement(treeRaw, now) : createElement("div", { name: "root", origin: "migration", now: () => now })
      };
    });
    if (templates.length === 0) {
      templates.push({
        id: createTemplateId(),
        name: "Template 1",
        target: "web",
        tree: createElement("div", { name: "root", origin: "migration", now: () => now })
      });
    }
    const active = obj["activeTemplateId"];
    const activeTemplateId = typeof active === "string" && templates.some((t) => t.id === active) ? active : templates[0].id;
    return {
      format: "typos-document",
      formatVersion: 2,
      id,
      kind,
      name: typeof obj["name"] === "string" ? obj["name"] : "Import v1",
      createdAt: typeof obj["createdAt"] === "string" ? obj["createdAt"] : now,
      updatedAt: now,
      settings: {
        directivePrefix: DEFAULT_DIRECTIVE_PREFIX,
        emitProfile: "runtime"
      },
      templates,
      activeTemplateId,
      meta: {}
    };
  }
  throw new Error(
    "Typos: format non reconnu (ni typos-document v2, ni projet v1, ni arbre d'élément)."
  );
}
const ESCAPE_RE = /[&<>"']/g;
const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function escapeAttr(value) {
  return value.replace(ESCAPE_RE, (c) => ESCAPE_MAP[c] ?? c);
}
function toKebab(prop) {
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
function styleAttr(styleOptions) {
  const entries = Object.entries(styleOptions).filter(([, v]) => v !== "").map(([k, v]) => [toKebab(k), v]).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  if (entries.length === 0) return "";
  return entries.map(([k, v]) => `${k}: ${v}`).join("; ");
}
function directiveAttrs(el, profile, prefix) {
  if (profile === "none") return [];
  const out = [];
  for (const spec2 of DIRECTIVE_REGISTRY) {
    if (spec2.scope === "script") continue;
    if (!emittedInProfile(spec2, profile)) continue;
    const key = directiveKey(spec2.short, prefix);
    const value = el.directives[key];
    if (value === void 0 || value === null || value === "") continue;
    if (typeof value === "boolean" && !value) continue;
    out.push(`${key}="${escapeAttr(String(value))}"`);
  }
  return out;
}
function openTag(el, profile, prefix) {
  const parts = [el.type];
  parts.push(...directiveAttrs(el, profile, prefix));
  for (const [key, value] of Object.entries(el.attrs).sort(
    ([a], [b]) => a < b ? -1 : a > b ? 1 : 0
  )) {
    parts.push(value === "" ? key : `${key}="${escapeAttr(value)}"`);
  }
  if (el.classes.length > 0) {
    parts.push(`class="${escapeAttr(el.classes.join(" "))}"`);
  }
  const style = styleAttr(el.styleOptions);
  if (style) parts.push(`style="${escapeAttr(style)}"`);
  return `<${parts.join(" ")}`;
}
function elementToHtml(el, options = {}) {
  const profile = options.profile ?? "runtime";
  const prefix = options.directivePrefix ?? DEFAULT_DIRECTIVE_PREFIX;
  const indent = options.indent ?? "  ";
  const includeScripts = options.includeScripts ?? true;
  const scriptForKey = directiveKey("script-for", prefix);
  const lines = [];
  const emit = (el2, depth) => {
    const pad = indent ? indent.repeat(depth) : "";
    const open = openTag(el2, profile, prefix);
    if (VOID_TAGS.has(el2.type)) {
      lines.push(`${pad}${open} />`);
    } else if (el2.children.length > 0) {
      lines.push(`${pad}${open}>`);
      for (const child of el2.children) emit(child, depth + 1);
      lines.push(`${pad}</${el2.type}>`);
    } else if (el2.innerHtml) {
      lines.push(`${pad}${open}>${el2.innerHtml}</${el2.type}>`);
    } else {
      lines.push(`${pad}${open}></${el2.type}>`);
    }
    if (includeScripts && el2.script) {
      lines.push(
        `${pad}<script ${scriptForKey}="${escapeAttr(el2.id)}">${el2.script}<\/script>`
      );
    }
  };
  emit(el, 0);
  return indent ? lines.join("\n") : lines.join("");
}
function collectCustomCss(root, prefix = DEFAULT_DIRECTIVE_PREFIX) {
  const idKey = directiveKey("id", prefix);
  const blocks = [];
  walk(root, (el) => {
    const css = el.customCss.trim();
    if (!css) return;
    if (css.includes("{")) {
      blocks.push(`/* ${el.id} */
${css}`);
    } else {
      blocks.push(`[${idKey}="${el.id}"] {
  ${css}
}`);
    }
  });
  return blocks.join("\n\n");
}
function treeToHtml(root, options = {}) {
  const prefix = options.directivePrefix ?? DEFAULT_DIRECTIVE_PREFIX;
  const includeStyle = options.includeStyle ?? true;
  const parts = [];
  if (includeStyle) {
    const css = collectCustomCss(root, prefix);
    if (css) {
      parts.push(`<style ${prefix}-tag-style-for="${escapeAttr(root.id)}">
${css}
</style>`);
    }
  }
  parts.push(elementToHtml(root, options));
  return parts.join("\n");
}
function parseHtmlToTree(options) {
  const prefix = options.directivePrefix ?? DEFAULT_DIRECTIVE_PREFIX;
  const ParserCtor = globalThis.DOMParser;
  if (!ParserCtor) {
    throw new Error(
      "Typos: DOMParser indisponible — parseHtmlToTree requiert un environnement DOM (navigateur, happy-dom ou jsdom)."
    );
  }
  const doc = new ParserCtor().parseFromString(options.html, "text/html");
  const scriptForKey = directiveKey("script-for", prefix);
  const idKeyGlobal = directiveKey("id", prefix);
  const docHasStamps = doc.body.querySelector(`[${cssEscape(idKeyGlobal)}]`) !== null;
  const scriptsById = /* @__PURE__ */ new Map();
  for (const script of Array.from(doc.querySelectorAll(`script[${cssEscape(scriptForKey)}]`))) {
    const target = script.getAttribute(scriptForKey);
    if (target) {
      scriptsById.set(
        target,
        `${scriptsById.get(target) ?? ""}${script.textContent ?? ""}`
      );
    }
    script.remove();
  }
  for (const style of Array.from(
    doc.querySelectorAll(`style[${cssEscape(`${prefix}-tag-style-for`)}]`)
  )) {
    style.remove();
  }
  const convert = (node) => {
    const idKey = directiveKey("id", prefix);
    const nameKey = directiveKey("name", prefix);
    const existingId = node.getAttribute(idKey) ?? void 0;
    const attrs = {};
    const directives = {};
    let classes = [];
    const styleOptions = {};
    for (const attr of Array.from(node.attributes)) {
      const { name, value } = attr;
      if (name === "class") {
        classes = value.split(/\s+/).filter(Boolean);
      } else if (name === "style") {
        for (const decl of value.split(";")) {
          const colon = decl.indexOf(":");
          if (colon > 0) {
            const prop = decl.slice(0, colon).trim();
            const val = decl.slice(colon + 1).trim();
            if (prop && val) styleOptions[prop] = val;
          }
        }
      } else if (isTyposDirectiveKey(name, prefix)) {
        const spec2 = specForKey(name, prefix);
        if (spec2?.mode === "derived") continue;
        if (value === "true" || value === "false") {
          directives[name] = value === "true";
        } else if (value !== "" && !Number.isNaN(Number(value)) && spec2?.short === "revision") {
          directives[name] = Number(value);
        } else {
          directives[name] = value;
        }
      } else {
        attrs[name] = value;
      }
    }
    const componentIdKey = directiveKey("component-id", prefix);
    const componentTypeKey = directiveKey("component-type", prefix);
    const componentNameKey = directiveKey("component-name", prefix);
    const isComponentRoot = componentTypeKey in directives || componentNameKey in directives;
    const allChildElements = Array.from(node.children);
    const structural = allChildElements.length > 0 && (!docHasStamps || allChildElements.some((c) => c.hasAttribute(idKeyGlobal)));
    const childElements = structural ? allChildElements : [];
    const hasElementChildren = childElements.length > 0;
    const el = createElement(node.tagName.toLowerCase(), {
      id: existingId,
      name: typeof directives[nameKey] === "string" ? directives[nameKey] : void 0,
      origin: "import",
      isComponentRoot,
      componentRef: isComponentRoot ? {
        type: String(directives[componentTypeKey] ?? ""),
        name: String(directives[componentNameKey] ?? ""),
        componentId: String(directives[componentIdKey] ?? "")
      } : null,
      attrs,
      classes,
      styleOptions,
      innerHtml: hasElementChildren ? "" : (node.innerHTML ?? "").trim(),
      children: childElements.map(convert),
      directivePrefix: prefix
    });
    return {
      ...el,
      // Les déclarées importées écrasent les valeurs par défaut de la
      // factory ; l'id reste cohérent avec el.id.
      directives: {
        ...el.directives,
        ...directives,
        [idKey]: el.id
      },
      script: scriptsById.get(el.id) ?? ""
    };
  };
  const roots = Array.from(doc.body.children);
  let tree;
  if (roots.length === 1 && roots[0]) {
    tree = convert(roots[0]);
  } else if (roots.length === 0) {
    tree = createElement("div", { name: "root", origin: "import" });
  } else {
    tree = createElement("div", {
      name: "root",
      origin: "import",
      children: roots.map(convert)
    });
  }
  if (options.css?.trim()) {
    tree = {
      ...tree,
      customCss: tree.customCss ? `${tree.customCss}
${options.css.trim()}` : options.css.trim()
    };
  }
  return tree;
}
function cssEscape(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}
class Emitter {
  listeners = /* @__PURE__ */ new Map();
  on(name, fn) {
    let set = this.listeners.get(name);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      this.listeners.set(name, set);
    }
    set.add(fn);
    return () => this.off(name, fn);
  }
  off(name, fn) {
    this.listeners.get(name)?.delete(fn);
  }
  emit(name, payload) {
    for (const fn of this.listeners.get(name) ?? []) fn(payload, name);
    for (const fn of this.listeners.get("*") ?? []) fn(payload, name);
  }
  clear() {
    this.listeners.clear();
  }
}
const STYLE_ICONS = [
  { key: "color", label: "Couleur", icon: "A", tint: "#E84A4A", property: "color", defaultValue: "#1c1712", kind: "color" },
  { key: "background", label: "Fond", icon: "▣", tint: "#2DD4A0", property: "background", defaultValue: "#ffffff", kind: "color" },
  { key: "border", label: "Bordure", icon: "▢", tint: "#3D8EE8", property: "border", defaultValue: "1px solid #e5ddcf", kind: "text" },
  { key: "radius", label: "Coins", icon: "◜", tint: "#8B5CF6", property: "border-radius", defaultValue: "8px", kind: "length" },
  { key: "width", label: "Largeur", icon: "↔", tint: "#F472B6", property: "width", defaultValue: "100%", kind: "length" },
  { key: "height", label: "Hauteur", icon: "↕", tint: "#F472B6", property: "height", defaultValue: "auto", kind: "length" },
  { key: "padding", label: "Marge int.", icon: "◫", tint: "#E8B44A", property: "padding", defaultValue: "16px", kind: "length" },
  { key: "margin", label: "Marge ext.", icon: "◪", tint: "#E8B44A", property: "margin", defaultValue: "0", kind: "length" },
  { key: "font-size", label: "Taille texte", icon: "T", tint: "#D4A373", property: "font-size", defaultValue: "16px", kind: "length" },
  { key: "font-weight", label: "Graisse", icon: "B", tint: "#D4A373", property: "font-weight", defaultValue: "600", kind: "text" },
  { key: "text-align", label: "Alignement", icon: "≡", tint: "#D4A373", property: "text-align", defaultValue: "center", kind: "text" },
  { key: "display", label: "Affichage", icon: "▦", tint: "#a89c8c", property: "display", defaultValue: "flex", kind: "text" },
  { key: "gap", label: "Espace enfants", icon: "⧉", tint: "#E8714A", property: "gap", defaultValue: "12px", kind: "length" },
  { key: "flex-dir", label: "Direction", icon: "⇅", tint: "#E8714A", property: "flex-direction", defaultValue: "row", kind: "text" },
  { key: "justify", label: "Justif.", icon: "⇔", tint: "#E8714A", property: "justify-content", defaultValue: "center", kind: "text" },
  { key: "align", label: "Alignement Y", icon: "⇕", tint: "#E8714A", property: "align-items", defaultValue: "center", kind: "text" },
  { key: "shadow", label: "Ombre", icon: "◐", tint: "#6f6559", property: "box-shadow", defaultValue: "0 4px 12px rgba(0,0,0,.08)", kind: "text" },
  { key: "opacity", label: "Opacité", icon: "◔", tint: "#6f6559", property: "opacity", defaultValue: "1", kind: "number" }
];
const STYLE_PROPERTIES = [
  "align-items",
  "background",
  "background-color",
  "background-image",
  "border",
  "border-color",
  "border-radius",
  "border-style",
  "border-width",
  "box-shadow",
  "color",
  "column-gap",
  "cursor",
  "display",
  "flex",
  "flex-direction",
  "flex-wrap",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "gap",
  "grid-template-columns",
  "grid-template-rows",
  "height",
  "justify-content",
  "left",
  "letter-spacing",
  "line-height",
  "margin",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "max-height",
  "max-width",
  "min-height",
  "min-width",
  "opacity",
  "outline",
  "overflow",
  "padding",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "position",
  "right",
  "row-gap",
  "text-align",
  "text-decoration",
  "text-transform",
  "top",
  "transform",
  "transition",
  "vertical-align",
  "visibility",
  "white-space",
  "width",
  "z-index"
];
const STYLE_VALUES = {
  "align-items": ["stretch", "flex-start", "center", "flex-end", "baseline"],
  "cursor": ["default", "pointer", "text", "grab", "move", "not-allowed"],
  "display": ["block", "flex", "grid", "inline", "inline-block", "inline-flex", "none"],
  "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
  "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
  "font-style": ["normal", "italic"],
  "font-weight": ["300", "400", "500", "600", "700", "800", "900"],
  "justify-content": ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"],
  "overflow": ["visible", "hidden", "scroll", "auto"],
  "position": ["static", "relative", "absolute", "fixed", "sticky"],
  "text-align": ["left", "center", "right", "justify"],
  "text-decoration": ["none", "underline", "line-through", "overline"],
  "text-transform": ["none", "uppercase", "lowercase", "capitalize"],
  "visibility": ["visible", "hidden", "collapse"],
  "white-space": ["normal", "nowrap", "pre", "pre-wrap"]
};
const COLOR_PROPERTIES = /* @__PURE__ */ new Set([
  "color",
  "background",
  "background-color",
  "border-color",
  "outline-color",
  "fill",
  "stroke",
  "caret-color"
]);
const OVERLAY_ICONS = [
  { key: "up", label: "Monter parmi les frères", icon: "▲", tint: "#3D8EE8" },
  { key: "down", label: "Descendre parmi les frères", icon: "▼", tint: "#3D8EE8" },
  { key: "clone", label: "Cloner", icon: "❏", tint: "#2DD4A0" },
  { key: "wrap", label: "Envelopper dans un bloc", icon: "▤", tint: "#D4A373" },
  { key: "delete", label: "Supprimer", icon: "✕", tint: "#E84A4A" }
];
const DEFAULT_TEMPLATES = [
  {
    key: "header-nav",
    label: "En-tête + nav",
    icon: "▔",
    category: "structure",
    tree: {
      type: "header",
      name: "header",
      styleOptions: {
        display: "flex",
        "justify-content": "space-between",
        "align-items": "center",
        padding: "16px 32px",
        background: "#ffffff",
        "border-bottom": "1px solid #e5ddcf"
      },
      children: [
        {
          type: "a",
          name: "logo",
          attrs: { href: "#" },
          innerHtml: "τ Marque",
          styleOptions: { color: "#1c1712", "font-weight": "700", "text-decoration": "none", "font-size": "18px" }
        },
        {
          type: "nav",
          name: "nav",
          styleOptions: { display: "flex", gap: "24px" },
          children: [
            { type: "a", attrs: { href: "#" }, innerHtml: "Accueil", styleOptions: { color: "#6f6559", "text-decoration": "none" } },
            { type: "a", attrs: { href: "#" }, innerHtml: "Produit", styleOptions: { color: "#6f6559", "text-decoration": "none" } },
            { type: "a", attrs: { href: "#" }, innerHtml: "Contact", styleOptions: { color: "#6f6559", "text-decoration": "none" } }
          ]
        }
      ]
    }
  },
  {
    key: "hero",
    label: "Hero",
    icon: "★",
    category: "content",
    tree: {
      type: "section",
      name: "hero",
      styleOptions: {
        padding: "80px 32px",
        "text-align": "center",
        background: "linear-gradient(150deg, #1c1712, #3a2f22)",
        color: "#f5efe6"
      },
      children: [
        { type: "h1", innerHtml: "Titre principal", styleOptions: { "font-size": "44px", margin: "0 0 12px", "letter-spacing": "-0.02em" } },
        { type: "p", innerHtml: "Une accroche qui explique en une phrase.", styleOptions: { opacity: "0.75", "max-width": "560px", margin: "0 auto 28px" } },
        { type: "button", innerHtml: "Commencer", styleOptions: { padding: "12px 28px", background: "#d4a373", color: "#1c1712", border: "none", "border-radius": "8px", "font-weight": "600" } }
      ]
    }
  },
  {
    key: "row-2",
    label: "Row · 2 colonnes",
    icon: "▥",
    category: "layout",
    tree: {
      type: "div",
      name: "row",
      classes: ["row"],
      styleOptions: { display: "grid", "grid-template-columns": "1fr 1fr", gap: "16px", padding: "16px" },
      children: [
        { type: "div", name: "col", styleOptions: { padding: "16px", background: "#faf7f2", "border-radius": "8px", "min-height": "80px" } },
        { type: "div", name: "col", styleOptions: { padding: "16px", background: "#faf7f2", "border-radius": "8px", "min-height": "80px" } }
      ]
    }
  },
  {
    key: "row-3",
    label: "Row · 3 colonnes",
    icon: "▦",
    category: "layout",
    tree: {
      type: "div",
      name: "row",
      classes: ["row"],
      styleOptions: { display: "grid", "grid-template-columns": "repeat(3, 1fr)", gap: "16px", padding: "16px" },
      children: [
        { type: "div", name: "col", styleOptions: { padding: "16px", background: "#faf7f2", "border-radius": "8px", "min-height": "80px" } },
        { type: "div", name: "col", styleOptions: { padding: "16px", background: "#faf7f2", "border-radius": "8px", "min-height": "80px" } },
        { type: "div", name: "col", styleOptions: { padding: "16px", background: "#faf7f2", "border-radius": "8px", "min-height": "80px" } }
      ]
    }
  },
  {
    key: "row-4",
    label: "Row · 4 colonnes",
    icon: "▧",
    category: "layout",
    tree: {
      type: "div",
      name: "row",
      classes: ["row"],
      styleOptions: { display: "grid", "grid-template-columns": "repeat(4, 1fr)", gap: "12px", padding: "16px" },
      children: Array.from({ length: 4 }, () => ({
        type: "div",
        name: "col",
        styleOptions: { padding: "12px", background: "#faf7f2", "border-radius": "8px", "min-height": "80px" }
      }))
    }
  },
  {
    key: "card",
    label: "Carte",
    icon: "▧",
    category: "component",
    tree: {
      type: "article",
      name: "carte",
      isComponentRoot: true,
      componentRef: { type: "card", name: "Carte", componentId: "cmp_card" },
      styleOptions: { padding: "22px", background: "#ffffff", border: "1px solid #e5ddcf", "border-radius": "12px" },
      children: [
        { type: "h3", innerHtml: "Titre de la carte", styleOptions: { margin: "0 0 8px", "font-size": "18px" } },
        { type: "p", innerHtml: "Un court descriptif de ce que fait cette carte.", styleOptions: { margin: "0", color: "#6f6559", "font-size": "14px" } }
      ]
    }
  },
  {
    key: "section-empty",
    label: "Section vide",
    icon: "▤",
    category: "structure",
    tree: {
      type: "section",
      name: "section",
      styleOptions: { padding: "48px 32px" }
    }
  },
  {
    key: "footer",
    label: "Pied de page",
    icon: "▁",
    category: "structure",
    tree: {
      type: "footer",
      name: "footer",
      styleOptions: {
        padding: "32px",
        background: "#1c1712",
        color: "#a89c8c",
        "text-align": "center",
        "font-size": "13px"
      },
      children: [
        { type: "p", innerHtml: "© 2026 · Tous droits réservés", styleOptions: { margin: "0" } }
      ]
    }
  }
];
function elementFromDefinition(def, directivePrefix, now) {
  return createElement(def.type, {
    name: def.name,
    origin: "template",
    isComponentRoot: def.isComponentRoot,
    componentRef: def.componentRef ?? null,
    attrs: def.attrs,
    styleOptions: def.styleOptions,
    customCss: def.customCss,
    classes: def.classes,
    innerHtml: def.innerHtml,
    script: def.script,
    children: (def.children ?? []).map(
      (c) => elementFromDefinition(c, directivePrefix, now)
    ),
    directivePrefix,
    now
  });
}
const TEMPLATES_BY_KEY = new Map(
  DEFAULT_TEMPLATES.map((t) => [t.key, t])
);
class TyposEngine {
  emitter = new Emitter();
  doc;
  selectionIds = [];
  undoStack = [];
  redoStack = [];
  savedHash;
  dirtyFlag = false;
  batchDepth = 0;
  batchBefore = null;
  batchEmits = [];
  batchLabel = "";
  historyLimit;
  coalesceWindowMs;
  now;
  constructor(options = {}) {
    this.doc = options.document ?? createDocument();
    this.historyLimit = options.historyLimit ?? 200;
    this.coalesceWindowMs = options.coalesceWindowMs ?? 1e3;
    this.now = options.now ?? (() => (/* @__PURE__ */ new Date()).toISOString());
    this.savedHash = documentHash(this.doc);
  }
  /* ---------------------------------------------------------------- */
  /* Lecture                                                           */
  /* ---------------------------------------------------------------- */
  get document() {
    return this.doc;
  }
  get activeTemplate() {
    const t = this.doc.templates.find((t2) => t2.id === this.doc.activeTemplateId);
    if (!t) throw new Error("Typos: activeTemplateId incohérent.");
    return t;
  }
  /** Arbre du template actif. */
  get tree() {
    return this.activeTemplate.tree;
  }
  get selection() {
    return this.selectionIds;
  }
  get canUndo() {
    return this.undoStack.length > 0;
  }
  get canRedo() {
    return this.redoStack.length > 0;
  }
  get isDirty() {
    return this.dirtyFlag;
  }
  findElement(id, templateId) {
    const t = this.template(templateId);
    return t ? findById(t.tree, id) : null;
  }
  /** HTML du template actif (ou donné), profil du document par défaut. */
  getHtml(options = {}, templateId) {
    const t = this.template(templateId);
    if (!t) return "";
    return treeToHtml(t.tree, {
      profile: this.doc.settings.emitProfile,
      directivePrefix: this.doc.settings.directivePrefix,
      ...options
    });
  }
  on(name, fn) {
    return this.emitter.on(name, fn);
  }
  off(name, fn) {
    this.emitter.off(name, fn);
  }
  /* ---------------------------------------------------------------- */
  /* Cycle de vie du document                                          */
  /* ---------------------------------------------------------------- */
  newDocument(options = {}) {
    this.doc = createDocument({ now: this.now, ...options });
    this.resetTransient();
    this.emitter.emit("document:new", { document: this.doc });
    return this.doc;
  }
  /** Charge un document : objet v2, JSON v2, ou n'importe quel format v1. */
  loadDocument(input) {
    const { document: document2 } = typeof input === "string" ? parseDocument(input) : parseDocumentValue(input);
    this.doc = document2;
    this.resetTransient();
    this.emitter.emit("document:loaded", { document: this.doc });
    return this.doc;
  }
  toJSON(options) {
    return serializeDocument(this.doc, options);
  }
  markSaved() {
    this.savedHash = documentHash(this.doc);
    this.setDirty(false);
  }
  rename(name) {
    return this.commit(
      `Renommer en « ${name} »`,
      (doc) => doc.name === name ? null : { doc: { ...doc, name }, emits: [{ name: "document:renamed", payload: { name } }] }
    );
  }
  /** Profil d'émission HTML par défaut du document. */
  setEmitProfile(profile) {
    return this.commit(
      "Changer le profil d'émission",
      (doc) => doc.settings.emitProfile === profile ? null : {
        doc: { ...doc, settings: { ...doc.settings, emitProfile: profile } },
        emits: []
      }
    );
  }
  /* ---------------------------------------------------------------- */
  /* Templates                                                         */
  /* ---------------------------------------------------------------- */
  addTemplate(options = {}) {
    const id = createTemplateId();
    this.commit("Ajouter un template", (doc) => {
      const source = options.cloneFromId ? doc.templates.find((t) => t.id === options.cloneFromId) : void 0;
      const tree = source ? source.tree : createElement("div", {
        name: "root",
        origin: "template",
        directivePrefix: doc.settings.directivePrefix,
        now: this.now
      });
      const template = {
        id,
        name: options.name ?? `Template ${doc.templates.length + 1}`,
        target: options.target ?? source?.target ?? "web",
        tree
      };
      return {
        doc: { ...doc, templates: [...doc.templates, template] },
        emits: [{ name: "template:added", payload: { templateId: id } }],
        recompute: [id]
      };
    });
    return id;
  }
  /** Refuse de supprimer le dernier template. */
  removeTemplate(templateId) {
    return this.commit("Supprimer un template", (doc) => {
      if (doc.templates.length <= 1) return null;
      if (!doc.templates.some((t) => t.id === templateId)) return null;
      const templates = doc.templates.filter((t) => t.id !== templateId);
      const activeTemplateId = doc.activeTemplateId === templateId ? templates[0].id : doc.activeTemplateId;
      return {
        doc: { ...doc, templates, activeTemplateId },
        emits: [
          { name: "template:removed", payload: { templateId } },
          ...activeTemplateId !== doc.activeTemplateId ? [{ name: "template:activated", payload: { templateId: activeTemplateId } }] : []
        ]
      };
    });
  }
  renameTemplate(templateId, name) {
    return this.commit(`Renommer le template`, (doc) => {
      const t = doc.templates.find((t2) => t2.id === templateId);
      if (!t || t.name === name) return null;
      return {
        doc: this.withTemplate(doc, templateId, { name }),
        emits: [{ name: "template:renamed", payload: { templateId, name } }]
      };
    });
  }
  setTemplateTarget(templateId, target) {
    return this.commit("Changer la cible du template", (doc) => {
      const t = doc.templates.find((t2) => t2.id === templateId);
      if (!t || t.target === target) return null;
      return {
        doc: this.withTemplate(doc, templateId, { target }),
        emits: [{ name: "template:target", payload: { templateId, target } }],
        recompute: [templateId]
        // la cible fait partie des dérivées
      };
    });
  }
  /** Marque la version principale (mode composant) — exclusif. */
  setMainVersion(templateId) {
    return this.commit("Définir la version principale", (doc) => {
      if (!doc.templates.some((t) => t.id === templateId)) return null;
      return {
        doc: {
          ...doc,
          templates: doc.templates.map((t) => ({ ...t, isMain: t.id === templateId }))
        },
        emits: []
      };
    });
  }
  /** L'activation ne mute pas le contenu : hors historique. */
  setActiveTemplate(templateId) {
    if (this.doc.activeTemplateId === templateId || !this.doc.templates.some((t) => t.id === templateId)) {
      return false;
    }
    this.doc = { ...this.doc, activeTemplateId: templateId };
    this.emitter.emit("template:activated", { templateId });
    return true;
  }
  /* ---------------------------------------------------------------- */
  /* Éléments                                                          */
  /* ---------------------------------------------------------------- */
  /**
   * Insère un sous-arbre décrit en JSON (squelette prêt à l'emploi).
   * Retourne l'id de la racine insérée, ou null.
   */
  insertTemplate(definition, options = {}) {
    const element = elementFromDefinition(
      definition,
      this.doc.settings.directivePrefix,
      this.now
    );
    return this.addElement(element, options);
  }
  /**
   * Ajoute un élément (type + options, ou élément déjà construit).
   * Parent par défaut : racine du template actif. Retourne l'id, ou null.
   */
  addElement(typeOrElement, options = {}) {
    const element = typeof typeOrElement === "string" ? createElement(typeOrElement, {
      origin: "palette",
      directivePrefix: this.doc.settings.directivePrefix,
      now: this.now,
      ...options
    }) : typeOrElement;
    const ok = this.commit(`Ajouter <${element.type}>`, (doc) => {
      const t = this.template(options.templateId, doc);
      if (!t) return null;
      const parentId = options.parentId ?? t.tree.id;
      const { root } = insertAt(t.tree, parentId, element, options.index);
      if (root === t.tree) return null;
      return {
        doc: this.withTemplate(doc, t.id, { tree: root }),
        emits: [
          {
            name: "element:added",
            payload: { templateId: t.id, elementId: element.id, parentId }
          }
        ],
        recompute: [t.id]
      };
    });
    return ok ? element.id : null;
  }
  removeElement(id, templateId) {
    return this.commit("Supprimer l'élément", (doc) => {
      const t = this.template(templateId, doc);
      if (!t) return null;
      const root = removeById(t.tree, id);
      if (root === t.tree) return null;
      return {
        doc: this.withTemplate(doc, t.id, { tree: root }),
        emits: [{ name: "element:removed", payload: { templateId: t.id, elementId: id } }],
        recompute: [t.id]
      };
    });
  }
  moveElement(id, newParentId, index, templateId) {
    return this.commit("Déplacer l'élément", (doc) => {
      const t = this.template(templateId, doc);
      if (!t) return null;
      const root = moveTo(t.tree, id, newParentId, index);
      if (root === t.tree) return null;
      return {
        doc: this.withTemplate(doc, t.id, { tree: root }),
        emits: [
          {
            name: "element:moved",
            payload: {
              templateId: t.id,
              elementId: id,
              parentId: newParentId,
              index: index ?? -1
            }
          }
        ],
        recompute: [t.id]
      };
    });
  }
  reorderElement(id, newIndex, templateId) {
    return this.commit("Réordonner l'élément", (doc) => {
      const t = this.template(templateId, doc);
      if (!t) return null;
      const root = reorder(t.tree, id, newIndex);
      if (root === t.tree) return null;
      return {
        doc: this.withTemplate(doc, t.id, { tree: root }),
        emits: [
          {
            name: "element:moved",
            payload: { templateId: t.id, elementId: id, parentId: "", index: newIndex }
          }
        ],
        recompute: [t.id]
      };
    });
  }
  /**
   * Patch partiel. `coalesceKey` fusionne les frappes successives dans
   * une seule entrée d'historique (ex. "style:el_x:width").
   */
  updateElement(id, patch, options = {}) {
    return this.commit(
      "Modifier l'élément",
      (doc) => {
        const t = this.template(options.templateId, doc);
        if (!t) return null;
        const root = updateElement(
          t.tree,
          id,
          patch,
          doc.settings.directivePrefix,
          this.now
        );
        if (root === t.tree) return null;
        return {
          doc: this.withTemplate(doc, t.id, { tree: root }),
          emits: [
            { name: "element:updated", payload: { templateId: t.id, elementId: id } }
          ],
          recompute: [t.id]
        };
      },
      { coalesceKey: options.coalesceKey }
    );
  }
  cloneElement(id, templateId) {
    let cloneId = null;
    this.commit("Cloner l'élément", (doc) => {
      const t = this.template(templateId, doc);
      if (!t) return null;
      const { root, clone } = cloneSubtree(
        t.tree,
        id,
        doc.settings.directivePrefix,
        this.now
      );
      if (root === t.tree) return null;
      cloneId = clone.id;
      return {
        doc: this.withTemplate(doc, t.id, { tree: root }),
        emits: [
          {
            name: "element:cloned",
            payload: { templateId: t.id, sourceId: id, cloneId: clone.id }
          }
        ],
        recompute: [t.id]
      };
    });
    return cloneId;
  }
  wrapElement(id, wrapperType = "div", templateId) {
    const wrapper = createElement(wrapperType, {
      origin: "api",
      directivePrefix: this.doc.settings.directivePrefix,
      now: this.now
    });
    const ok = this.commit(`Envelopper dans <${wrapperType}>`, (doc) => {
      const t = this.template(templateId, doc);
      if (!t) return null;
      const root = wrapElement(t.tree, id, wrapper);
      if (root === t.tree) return null;
      return {
        doc: this.withTemplate(doc, t.id, { tree: root }),
        emits: [
          {
            name: "element:added",
            payload: { templateId: t.id, elementId: wrapper.id, parentId: "" }
          }
        ],
        recompute: [t.id]
      };
    });
    return ok ? wrapper.id : null;
  }
  unwrapElement(id, templateId) {
    return this.commit("Dissoudre l'élément", (doc) => {
      const t = this.template(templateId, doc);
      if (!t) return null;
      const root = unwrapElement(t.tree, id);
      if (root === t.tree) return null;
      return {
        doc: this.withTemplate(doc, t.id, { tree: root }),
        emits: [{ name: "element:removed", payload: { templateId: t.id, elementId: id } }],
        recompute: [t.id]
      };
    });
  }
  /** Remplace l'arbre du template (actif par défaut) par du HTML importé. */
  importHtml(html, css, templateId) {
    return this.commit("Importer du HTML", (doc) => {
      const t = this.template(templateId, doc);
      if (!t) return null;
      const tree = parseHtmlToTree({
        html,
        css,
        directivePrefix: doc.settings.directivePrefix
      });
      return {
        doc: this.withTemplate(doc, t.id, { tree }),
        emits: [
          { name: "element:updated", payload: { templateId: t.id, elementId: tree.id } }
        ],
        recompute: [t.id]
      };
    });
  }
  /* ---------------------------------------------------------------- */
  /* Sélection (hors historique)                                       */
  /* ---------------------------------------------------------------- */
  select(ids) {
    const valid = ids.filter(
      (id) => this.doc.templates.some((t) => findById(t.tree, id))
    );
    if (valid.length === this.selectionIds.length && valid.every((id, i) => id === this.selectionIds[i])) {
      return;
    }
    this.selectionIds = valid;
    this.emitter.emit("selection:changed", { ids: [...valid] });
  }
  clearSelection() {
    this.select([]);
  }
  /* ---------------------------------------------------------------- */
  /* Transactions                                                      */
  /* ---------------------------------------------------------------- */
  /**
   * Regroupe plusieurs mutations en UNE entrée d'historique et un seul
   * document:changed final. Imbriquable.
   */
  batch(label, fn) {
    if (this.batchDepth === 0) {
      this.batchBefore = this.doc;
      this.batchEmits = [];
      this.batchLabel = label;
    }
    this.batchDepth++;
    try {
      fn();
    } finally {
      this.batchDepth--;
      if (this.batchDepth === 0) {
        const before = this.batchBefore;
        this.batchBefore = null;
        if (this.doc !== before) {
          this.pushHistory(this.batchLabel, before);
          for (const e of this.batchEmits) this.emitter.emit(e.name, e.payload);
          this.afterChange(this.batchLabel);
        }
        this.batchEmits = [];
      }
    }
  }
  /* ---------------------------------------------------------------- */
  /* Historique                                                        */
  /* ---------------------------------------------------------------- */
  undo() {
    const entry = this.undoStack.pop();
    if (!entry) return false;
    this.redoStack.push({ label: entry.label, snapshot: this.doc, at: Date.now() });
    this.doc = entry.snapshot;
    this.pruneSelection();
    this.emitter.emit("history:undo", { label: entry.label });
    this.emitter.emit("document:changed", { document: this.doc, label: entry.label });
    this.setDirty(documentHash(this.doc) !== this.savedHash);
    return true;
  }
  redo() {
    const entry = this.redoStack.pop();
    if (!entry) return false;
    this.undoStack.push({ label: entry.label, snapshot: this.doc, at: Date.now() });
    this.doc = entry.snapshot;
    this.pruneSelection();
    this.emitter.emit("history:redo", { label: entry.label });
    this.emitter.emit("document:changed", { document: this.doc, label: entry.label });
    this.setDirty(documentHash(this.doc) !== this.savedHash);
    return true;
  }
  /* ---------------------------------------------------------------- */
  /* Interne                                                           */
  /* ---------------------------------------------------------------- */
  template(templateId, doc = this.doc) {
    const id = templateId ?? doc.activeTemplateId;
    return doc.templates.find((t) => t.id === id) ?? null;
  }
  withTemplate(doc, templateId, patch) {
    return {
      ...doc,
      templates: doc.templates.map(
        (t) => t.id === templateId ? { ...t, ...patch } : t
      )
    };
  }
  /**
   * LE point de passage de toute mutation : produit le nouveau document,
   * recalcule les dérivées des templates touchés, gère l'historique
   * (avec coalescence), émet les événements, met à jour le dirty.
   * Retourne false si la mutation n'a rien changé.
   */
  commit(label, produce, options = {}) {
    const before = this.doc;
    const result = produce(before);
    if (!result || result.doc === before) return false;
    let next = result.doc;
    if (result.recompute?.length) {
      next = {
        ...next,
        templates: next.templates.map(
          (t) => result.recompute?.includes(t.id) ? {
            ...t,
            tree: recomputeDerivedDirectives(t.tree, {
              documentId: next.id,
              templateId: t.id,
              target: t.target,
              directivePrefix: next.settings.directivePrefix
            })
          } : t
        )
      };
    }
    next = { ...next, updatedAt: this.now() };
    this.doc = next;
    this.pruneSelection();
    if (this.batchDepth > 0) {
      this.batchEmits.push(...result.emits);
      return true;
    }
    this.pushHistory(label, before, options.coalesceKey);
    for (const e of result.emits) this.emitter.emit(e.name, e.payload);
    this.afterChange(label);
    return true;
  }
  pushHistory(label, before, coalesceKey) {
    const last = this.undoStack[this.undoStack.length - 1];
    const nowMs = Date.now();
    if (coalesceKey && last?.coalesceKey === coalesceKey && nowMs - last.at < this.coalesceWindowMs) {
      last.at = nowMs;
    } else {
      this.undoStack.push({ label, snapshot: before, at: nowMs, coalesceKey });
      if (this.undoStack.length > this.historyLimit) this.undoStack.shift();
    }
    this.redoStack = [];
    this.emitter.emit("history:push", { label, depth: this.undoStack.length });
  }
  afterChange(label) {
    this.emitter.emit("document:changed", { document: this.doc, label });
    this.setDirty(true);
  }
  setDirty(dirty) {
    if (this.dirtyFlag !== dirty) {
      this.dirtyFlag = dirty;
      this.emitter.emit("dirty:changed", { dirty });
    }
  }
  pruneSelection() {
    if (this.selectionIds.length === 0) return;
    const valid = this.selectionIds.filter(
      (id) => this.doc.templates.some((t) => findById(t.tree, id))
    );
    if (valid.length !== this.selectionIds.length) {
      this.selectionIds = valid;
      this.emitter.emit("selection:changed", { ids: [...valid] });
    }
  }
  resetTransient() {
    this.undoStack = [];
    this.redoStack = [];
    this.selectionIds = [];
    this.savedHash = documentHash(this.doc);
    this.setDirty(false);
  }
}
function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  if (props.class) el.className = props.class;
  if (props.text !== void 0) el.textContent = props.text;
  if (props.html !== void 0) el.innerHTML = props.html;
  if (props.title) el.title = props.title;
  if (props.attrs) {
    for (const [k, v] of Object.entries(props.attrs)) el.setAttribute(k, v);
  }
  if (props.style) Object.assign(el.style, props.style);
  if (props.on) {
    for (const [name, fn] of Object.entries(props.on)) {
      el.addEventListener(name, fn);
    }
  }
  for (const child of children) {
    if (child === null || child === void 0 || child === false) continue;
    el.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return el;
}
function replaceChildren(container, ...children) {
  container.textContent = "";
  for (const child of children) {
    if (child === null || child === void 0 || child === false) continue;
    container.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
}
function makeDisposer() {
  const fns = [];
  return {
    add: (fn) => fns.push(fn),
    flush: () => {
      for (const fn of fns.splice(0)) fn();
    }
  };
}
function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
const PLACEHOLDER_IMG = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="#2e2820"/><path d="M0 90 60 40l30 26 24-16 46 40z" fill="#4d4436"/><circle cx="118" cy="24" r="10" fill="#d4a373"/></svg>`
);
const ENTRIES = [
  { type: "section", label: "Section", glyph: "▤" },
  { type: "div", label: "Bloc", glyph: "□" },
  { type: "header", label: "En-tête", glyph: "▔" },
  { type: "footer", label: "Pied", glyph: "▁" },
  { type: "nav", label: "Nav", glyph: "≡" },
  { type: "h1", label: "Titre 1", glyph: "H₁", options: { innerHtml: "Titre" } },
  { type: "h2", label: "Titre 2", glyph: "H₂", options: { innerHtml: "Sous-titre" } },
  { type: "p", label: "Paragraphe", glyph: "¶", options: { innerHtml: "Texte…" } },
  { type: "span", label: "Span", glyph: "–", options: { innerHtml: "inline" } },
  { type: "a", label: "Lien", glyph: "⤳", options: { innerHtml: "Lien", attrs: { href: "#" } } },
  { type: "button", label: "Bouton", glyph: "▣", options: { innerHtml: "Action" } },
  { type: "img", label: "Image", glyph: "◪", options: { attrs: { src: PLACEHOLDER_IMG, alt: "Image" } } },
  { type: "input", label: "Champ", glyph: "▭", options: { attrs: { type: "text", placeholder: "Saisir…" } } },
  { type: "ul", label: "Liste", glyph: "•≡" },
  { type: "li", label: "Item", glyph: "•", options: { innerHtml: "Item" } }
];
class TyposPalette {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.render();
    this.disposer.add(engine.on("document:changed", () => this.render()));
  }
  disposer = makeDisposer();
  targetParentId() {
    const selected = this.engine.selection[0];
    if (selected) {
      const el = findById(this.engine.tree, selected);
      if (el && !VOID_TAGS.has(el.type)) return el.id;
    }
    return this.engine.tree.id;
  }
  render() {
    const elements = h("div", { class: "typos-palette-grid" });
    for (const entry of ENTRIES) {
      elements.append(
        h(
          "button",
          {
            class: "typos-palette-item",
            title: `<${entry.type}>`,
            on: {
              click: () => {
                const id = this.engine.addElement(entry.type, {
                  ...entry.options,
                  name: entry.type,
                  parentId: this.targetParentId()
                });
                if (id) this.engine.select([id]);
              }
            }
          },
          h("span", { class: "typos-palette-glyph", text: entry.glyph }),
          h("span", { class: "typos-palette-label", text: entry.label })
        )
      );
    }
    const templates = h("div", { class: "typos-palette-list" });
    for (const def of DEFAULT_TEMPLATES) {
      templates.append(
        h(
          "button",
          {
            class: `typos-template-item is-${def.category}`,
            title: `${def.label} · ${def.category}`,
            on: {
              click: () => {
                const id = this.engine.insertTemplate(def.tree, {
                  parentId: this.targetParentId()
                });
                if (id) this.engine.select([id]);
              }
            }
          },
          h("span", { class: "typos-template-icon", text: def.icon }),
          h("span", { class: "typos-template-label", text: def.label })
        )
      );
    }
    replaceChildren(
      this.container,
      h("div", { class: "typos-panel-title", text: "Éléments" }),
      elements,
      h("div", { class: "typos-panel-title typos-palette-heading", text: "Squelettes" }),
      templates
    );
  }
  destroy() {
    this.disposer.flush();
    this.container.textContent = "";
  }
}
class TyposTreeView {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.render();
    this.disposer.add(engine.on("document:changed", () => this.render()));
    this.disposer.add(engine.on("document:loaded", () => this.render()));
    this.disposer.add(engine.on("document:new", () => this.render()));
    this.disposer.add(engine.on("template:activated", () => this.render()));
    this.disposer.add(engine.on("selection:changed", () => this.render()));
  }
  disposer = makeDisposer();
  collapsed = /* @__PURE__ */ new Set();
  dragId = null;
  render() {
    const list = h("div", { class: "typos-tree", attrs: { role: "tree" } });
    this.renderNode(this.engine.tree, 0, list);
    replaceChildren(
      this.container,
      h("div", { class: "typos-panel-title", text: "Arbre" }),
      list
    );
  }
  renderNode(el, depth, into) {
    const selected = this.engine.selection.includes(el.id);
    const hasChildren = el.children.length > 0;
    const isCollapsed = this.collapsed.has(el.id);
    const kind = getDirective(el, "kind");
    const locked = getDirective(el, "locked") === true;
    const hidden = getDirective(el, "hidden") === true;
    const name = String(getDirective(el, "name") ?? el.type);
    const row = h(
      "div",
      {
        class: [
          "typos-tree-row",
          selected ? "is-selected" : "",
          hidden ? "is-hidden" : "",
          kind === "component-root" ? "is-component" : ""
        ].filter(Boolean).join(" "),
        attrs: {
          draggable: el.id === this.engine.tree.id ? "false" : "true",
          "data-id": el.id,
          role: "treeitem"
        },
        style: { paddingLeft: `${8 + depth * 14}px` },
        on: {
          click: (e) => {
            e.stopPropagation();
            this.engine.select([el.id]);
          },
          dragstart: (e) => {
            this.dragId = el.id;
            e.dataTransfer?.setData("text/plain", el.id);
            if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
          },
          dragend: () => {
            this.dragId = null;
            this.clearDropMarks();
          },
          dragover: (e) => {
            if (!this.dragId || this.dragId === el.id) return;
            e.preventDefault();
            this.markDrop(row, this.zoneFor(e, row, el));
          },
          dragleave: () => row.classList.remove("drop-before", "drop-after", "drop-inside"),
          drop: (e) => {
            e.preventDefault();
            const sourceId = this.dragId ?? e.dataTransfer?.getData("text/plain") ?? "";
            this.clearDropMarks();
            if (sourceId) this.performDrop(sourceId, el, this.zoneFor(e, row, el));
            this.dragId = null;
          }
        }
      },
      h("span", {
        class: `typos-tree-chevron ${hasChildren ? "" : "is-leaf"} ${isCollapsed ? "is-collapsed" : ""}`,
        text: hasChildren ? "▾" : "·",
        on: {
          click: (e) => {
            e.stopPropagation();
            if (!hasChildren) return;
            if (isCollapsed) this.collapsed.delete(el.id);
            else this.collapsed.add(el.id);
            this.render();
          }
        }
      }),
      h("span", { class: "typos-tree-type", text: el.type }),
      h("span", { class: "typos-tree-name", text: name !== el.type ? name : "" }),
      kind === "component-root" ? h("span", { class: "typos-badge", text: "⬡", title: "Racine de composant" }) : null,
      locked ? h("span", { class: "typos-badge", text: "🔒", title: "Verrouillé" }) : null,
      hidden ? h("span", { class: "typos-badge", text: "◌", title: "Masqué" }) : null
    );
    into.append(row);
    if (hasChildren && !isCollapsed) {
      for (const child of el.children) this.renderNode(child, depth + 1, into);
    }
  }
  /** Tiers haut = avant, tiers bas = après, centre = dedans (si possible). */
  zoneFor(e, row, el) {
    const rect = row.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const canNest = !VOID_TAGS.has(el.type);
    if (y < rect.height / 3) return "before";
    if (y > rect.height * 2 / 3) return "after";
    return canNest ? "inside" : "after";
  }
  markDrop(row, zone) {
    this.clearDropMarks();
    row.classList.add(`drop-${zone}`);
  }
  clearDropMarks() {
    for (const el of Array.from(this.container.querySelectorAll(".drop-before, .drop-after, .drop-inside"))) {
      el.classList.remove("drop-before", "drop-after", "drop-inside");
    }
  }
  performDrop(sourceId, target, zone) {
    if (sourceId === target.id) return;
    const tree = this.engine.tree;
    if (zone === "inside") {
      this.engine.moveElement(sourceId, target.id);
      return;
    }
    const parent = getParent(tree, target.id);
    if (!parent) return;
    const sourceParent = getParent(tree, sourceId);
    let index = parent.children.findIndex((c) => c.id === target.id);
    if (zone === "after") index += 1;
    if (sourceParent?.id === parent.id) {
      const from = parent.children.findIndex((c) => c.id === sourceId);
      if (from !== -1 && from < index) index -= 1;
    }
    this.engine.moveElement(sourceId, parent.id, index);
  }
  destroy() {
    this.disposer.flush();
    this.container.textContent = "";
  }
}
const DRAG_THRESHOLD = 5;
class TyposCanvas {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.container.classList.add("typos-canvas-pane");
    this.iframe = h("iframe", {
      class: "typos-canvas-frame",
      attrs: { title: "Aperçu Typos", sandbox: "allow-same-origin" }
    });
    this.stage = h("div", { class: "typos-canvas-stage" }, this.iframe);
    this.overlayLayer = h("div", { class: "typos-overlay-layer" });
    replaceChildren(this.container, this.stage, this.overlayLayer);
    this.iframe.addEventListener("load", () => this.initFrame());
    queueMicrotask(() => this.initFrame());
    this.disposer.add(this.engine.on("document:changed", () => this.render()));
    this.disposer.add(this.engine.on("document:loaded", () => this.render()));
    this.disposer.add(this.engine.on("document:new", () => this.render()));
    this.disposer.add(this.engine.on("template:activated", () => this.render()));
    this.disposer.add(this.engine.on("template:target", () => this.render()));
    this.disposer.add(this.engine.on("selection:changed", () => {
      this.paintSelection();
      this.emitRect();
    }));
    const onScrollOrResize = () => this.scheduleEmit();
    this.stage.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    this.disposer.add(() => {
      this.stage.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize);
    });
  }
  disposer = makeDisposer();
  iframe;
  stage;
  /** Couche épinglée où vit l'overlay (fournie à TyposSelectionOverlay). */
  overlayLayer;
  ready = false;
  onRectChange = null;
  gesture = "idle";
  pressId = null;
  pressX = 0;
  pressY = 0;
  dropTargetId = null;
  dropZone = "inside";
  rafPending = false;
  /** Coalesce les recalculs de position sur un frame. */
  scheduleEmit() {
    if (this.rafPending) return;
    this.rafPending = true;
    requestAnimationFrame(() => {
      this.rafPending = false;
      this.emitRect();
    });
  }
  /**
   * Rect de l'élément en coordonnées LOCALES à la couche d'overlay
   * (= coin haut-gauche du stage). getBoundingClientRect reflète déjà le
   * scroll : on ne rajoute jamais scrollTop/scrollLeft.
   */
  toLayer(elRect) {
    const frame = this.iframe.getBoundingClientRect();
    const layerRect = this.overlayLayer.getBoundingClientRect();
    return new DOMRect(
      elRect.left + frame.left - layerRect.left,
      elRect.top + frame.top - layerRect.top,
      elRect.width,
      elRect.height
    );
  }
  rectFor(id) {
    const doc = this.doc();
    if (!doc || !this.ready) return null;
    const el = doc.querySelector(`[${this.cssEscapeAttr(this.idKey())}="${id}"]`);
    if (!el) return null;
    return this.toLayer(el.getBoundingClientRect());
  }
  emitRect() {
    if (!this.onRectChange) return;
    const id = this.engine.selection[0];
    this.onRectChange(id ? this.rectFor(id) : null);
  }
  doc() {
    try {
      return this.iframe.contentDocument;
    } catch {
      return null;
    }
  }
  idKey() {
    return directiveKey("id", this.engine.document.settings.directivePrefix);
  }
  cssEscapeAttr(name) {
    return name.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
  }
  initFrame() {
    const doc = this.doc();
    if (!doc || this.ready) {
      if (this.ready) this.render();
      return;
    }
    try {
      doc.open();
      doc.write(
        `<!doctype html><html><head><meta charset="utf-8"><style data-typos="base"></style><style data-typos="user"></style><style data-typos="selection"></style><style data-typos="hover"></style><style data-typos="drop"></style></head><body><div id="typos-canvas-root"></div></body></html>`
      );
      doc.close();
      this.installInteraction(doc);
      const win = this.iframe.contentWindow;
      if (win) {
        const onFrameScroll = () => this.scheduleEmit();
        win.addEventListener("scroll", onFrameScroll, { passive: true });
        this.disposer.add(() => win.removeEventListener("scroll", onFrameScroll));
      }
      this.ready = true;
      this.render();
    } catch {
    }
  }
  /* ─────────────────────── modèle d'interaction ─────────────────── */
  installInteraction(doc) {
    const idKey = this.idKey();
    const closest = (e) => {
      const el = e.target?.closest?.(`[${idKey}]`);
      const id = el?.getAttribute(idKey);
      return el && id ? { el, id } : null;
    };
    doc.addEventListener("mouseover", (e) => {
      if (this.gesture !== "idle") return;
      const hit = closest(e);
      this.paintHover(hit?.id ?? null);
    });
    doc.addEventListener("mouseout", (e) => {
      if (this.gesture !== "idle") return;
      const related = e.relatedTarget;
      if (related && related.closest?.(`[${idKey}]`)) return;
      this.paintHover(null);
    });
    doc.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      const hit = closest(e);
      if (!hit || hit.id === this.engine.tree.id) return;
      e.preventDefault();
      this.gesture = "pressing";
      this.pressId = hit.id;
      this.pressX = e.clientX;
      this.pressY = e.clientY;
      this.paintHover(null);
    });
    doc.addEventListener("mousemove", (e) => {
      if (this.gesture === "idle") return;
      if (this.gesture === "pressing") {
        const dx = e.clientX - this.pressX;
        const dy = e.clientY - this.pressY;
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        this.gesture = "dragging";
        if (this.pressId) this.engine.select([this.pressId]);
        doc.body.classList.add("typos-dragging");
      }
      if (this.gesture === "dragging" && this.pressId) {
        const hit = closest(e);
        if (hit && hit.id !== this.pressId && !this.isDescendant(hit.id, this.pressId)) {
          const targetEl = findById(this.engine.tree, hit.id);
          if (targetEl) {
            const rect = hit.el.getBoundingClientRect();
            this.dropZone = this.zoneFor(e.clientY, rect, targetEl.type);
            this.dropTargetId = hit.id;
            this.paintDrop(hit.id, this.dropZone);
          }
        } else {
          this.dropTargetId = null;
          this.paintDrop(null, "inside");
        }
      }
    });
    doc.addEventListener("mouseup", (e) => {
      if (e.button !== 0) return;
      if (this.gesture === "pressing" && this.pressId) {
        this.engine.select([this.pressId]);
      } else if (this.gesture === "dragging" && this.pressId && this.dropTargetId) {
        this.performDrop(this.pressId, this.dropTargetId, this.dropZone);
      }
      this.resetGesture(doc);
    });
    doc.addEventListener("mouseleave", () => {
      if (this.gesture !== "idle") this.resetGesture(doc);
    });
    doc.addEventListener("click", (e) => {
      const hit = closest(e);
      if (!hit) this.engine.clearSelection();
    });
  }
  isDescendant(candidateId, ancestorId) {
    const ancestor = findById(this.engine.tree, ancestorId);
    if (!ancestor) return false;
    const walk2 = (node) => {
      for (const child of node.children) {
        if (child.id === candidateId) return true;
        if (walk2(child)) return true;
      }
      return false;
    };
    return walk2(ancestor);
  }
  resetGesture(doc) {
    this.gesture = "idle";
    this.pressId = null;
    this.dropTargetId = null;
    doc.body.classList.remove("typos-dragging");
    this.paintDrop(null, "inside");
  }
  zoneFor(clientY, rect, type) {
    const y = clientY - rect.top;
    const canNest = !VOID_TAGS.has(type);
    if (y < rect.height / 3) return "before";
    if (y > rect.height * 2 / 3) return "after";
    return canNest ? "inside" : "after";
  }
  performDrop(sourceId, targetId, zone) {
    const tree = this.engine.tree;
    if (zone === "inside") {
      this.engine.moveElement(sourceId, targetId);
      return;
    }
    const parent = getParent(tree, targetId);
    if (!parent) return;
    const sourceParent = getParent(tree, sourceId);
    let index = parent.children.findIndex((c) => c.id === targetId);
    if (zone === "after") index += 1;
    if (sourceParent?.id === parent.id) {
      const from = parent.children.findIndex((c) => c.id === sourceId);
      if (from !== -1 && from < index) index -= 1;
    }
    this.engine.moveElement(sourceId, parent.id, index);
  }
  /* ────────────────────────────── rendu ─────────────────────────── */
  render() {
    this.stage.dataset["target"] = this.engine.activeTemplate.target;
    const doc = this.doc();
    if (!doc || !this.ready) return;
    const root = doc.getElementById("typos-canvas-root");
    if (!root) return;
    const prefix = this.engine.document.settings.directivePrefix;
    root.innerHTML = elementToHtml(this.engine.tree, {
      profile: "minimal",
      includeScripts: false,
      directivePrefix: prefix
    });
    const idKey = this.idKey();
    const base = doc.querySelector(`style[data-typos="base"]`);
    if (base) {
      base.textContent = `body{margin:0;font-family:system-ui,sans-serif;color:#1c1712;background:#fff;min-height:100vh}[${idKey}]{min-height:8px;cursor:default}.typos-dragging{cursor:grabbing !important;user-select:none}.typos-dragging *{cursor:grabbing !important}`;
    }
    const user = doc.querySelector(`style[data-typos="user"]`);
    if (user) user.textContent = collectCustomCss(this.engine.tree, prefix);
    this.paintSelection();
    this.emitRect();
  }
  paintHover(id) {
    const doc = this.doc();
    if (!doc || !this.ready) return;
    const style = doc.querySelector(`style[data-typos="hover"]`);
    if (!style) return;
    if (!id || this.engine.selection.includes(id)) {
      style.textContent = "";
      return;
    }
    const sel = `[${this.idKey()}="${id.replace(/"/g, "")}"]`;
    style.textContent = `${sel}{outline:1px dashed var(--typos-hover-outline, #5aa9e6) !important;outline-offset:1px}`;
  }
  paintSelection() {
    const doc = this.doc();
    if (!doc || !this.ready) return;
    const style = doc.querySelector(`style[data-typos="selection"]`);
    if (!style) return;
    style.textContent = this.engine.selection.map((id) => `[${this.idKey()}="${id.replace(/"/g, "")}"]{outline:2px solid var(--typos-selection, #d4a373) !important;outline-offset:2px}`).join("\n");
  }
  paintDrop(id, zone) {
    const doc = this.doc();
    if (!doc || !this.ready) return;
    const style = doc.querySelector(`style[data-typos="drop"]`);
    if (!style) return;
    if (!id) {
      style.textContent = "";
      return;
    }
    const sel = `[${this.idKey()}="${id.replace(/"/g, "")}"]`;
    if (zone === "before") {
      style.textContent = `${sel}{box-shadow:inset 0 3px 0 var(--typos-proposition-before, #3d8ee8) !important}`;
    } else if (zone === "after") {
      style.textContent = `${sel}{box-shadow:inset 0 -3px 0 var(--typos-proposition-after, #2dd4a0) !important}`;
    } else {
      style.textContent = `${sel}{outline:2px solid var(--typos-proposition-inside, #8b5cf6) !important;outline-offset:-2px;background:rgba(139,92,246,0.08) !important}`;
    }
  }
  refreshRect() {
    this.scheduleEmit();
  }
  destroy() {
    this.disposer.flush();
    this.container.textContent = "";
  }
}
const RESIZE_THRESHOLD = 3;
class TyposSelectionOverlay {
  constructor(container, engine, options = {}) {
    this.container = container;
    this.engine = engine;
    this.options = options;
    this.root = h("div", { class: "typos-overlay", attrs: { "aria-hidden": "true" } });
    this.buildBar();
    this.buildHandles();
    this.container.append(this.root);
    this.hide();
    this.disposer.add(
      engine.on("selection:changed", ({ ids }) => {
        this.currentId = ids[0] ?? null;
        if (!this.currentId) this.hide();
      })
    );
  }
  disposer = makeDisposer();
  root;
  bar;
  handles = [];
  rect = null;
  currentId = null;
  isResizing = false;
  setRect(rect) {
    if (this.isResizing) return;
    this.rect = rect;
    if (!rect || !this.currentId) {
      this.hide();
      return;
    }
    this.root.style.display = "block";
    this.root.style.left = `${rect.left}px`;
    this.root.style.top = `${rect.top}px`;
    this.root.style.width = `${rect.width}px`;
    this.root.style.height = `${rect.height}px`;
    this.bar.classList.toggle("is-below", rect.top < 40);
  }
  hide() {
    this.root.style.display = "none";
  }
  /* ─────────────────────────── barre d'icônes ─────────────────────── */
  buildBar() {
    this.bar = h("div", { class: "typos-overlay-bar" });
    for (const icon of OVERLAY_ICONS) {
      this.bar.append(h("button", {
        class: "typos-overlay-btn",
        title: icon.label,
        text: icon.icon,
        style: { color: icon.tint, borderColor: icon.tint },
        on: { click: (e) => {
          e.stopPropagation();
          this.dispatch(icon.key);
        } }
      }));
    }
    this.bar.append(h("span", {
      class: "typos-overlay-grip",
      title: "Astuce : glisse l'élément directement dans le canvas pour le déplacer",
      text: "⋮⋮"
    }));
    this.root.append(this.bar);
  }
  dispatch(key) {
    if (!this.currentId) return;
    const id = this.currentId;
    const parent = getParent(this.engine.tree, id);
    switch (key) {
      case "delete":
        this.engine.removeElement(id);
        break;
      case "clone": {
        const cloneId = this.engine.cloneElement(id);
        if (cloneId) this.engine.select([cloneId]);
        break;
      }
      case "wrap": {
        const wrapId = this.engine.wrapElement(id);
        if (wrapId) this.engine.select([wrapId]);
        break;
      }
      case "up":
        if (parent) {
          const from = parent.children.findIndex((c) => c.id === id);
          if (from > 0) this.engine.reorderElement(id, from - 1);
        }
        break;
      case "down":
        if (parent) {
          const from = parent.children.findIndex((c) => c.id === id);
          if (from >= 0 && from < parent.children.length - 1) {
            this.engine.reorderElement(id, from + 1);
          }
        }
        break;
    }
  }
  /* ────────────────── poignées de resize (pointer capture) ───────── */
  buildHandles() {
    const sides = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
    for (const side of sides) {
      const handle = h("span", {
        class: `typos-overlay-handle handle-${side}`,
        attrs: { "data-side": side },
        on: {
          pointerdown: (e) => this.startResize(side, handle, e),
          // Filet de sécurité si l'environnement n'a pas la capture.
          mousedown: (e) => {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      });
      this.handles.push(handle);
      this.root.append(handle);
    }
  }
  startResize(side, handle, downEvt) {
    if (!this.currentId || !this.rect) return;
    downEvt.preventDefault();
    downEvt.stopPropagation();
    const id = this.currentId;
    const el = this.engine.findElement(id);
    if (!el) return;
    const startW = this.rect.width;
    const startH = this.rect.height;
    const startLeft = this.rect.left;
    const startTop = this.rect.top;
    const startX = downEvt.clientX;
    const startY = downEvt.clientY;
    let started = false;
    this.isResizing = true;
    document.body.classList.add("typos-resizing");
    try {
      handle.setPointerCapture(downEvt.pointerId);
    } catch {
    }
    const move = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!started) {
        if (Math.abs(dx) < RESIZE_THRESHOLD && Math.abs(dy) < RESIZE_THRESHOLD) return;
        started = true;
      }
      let w = startW;
      let h2 = startH;
      if (side.includes("e")) w = startW + dx;
      if (side.includes("w")) w = startW - dx;
      if (side.includes("s")) h2 = startH + dy;
      if (side.includes("n")) h2 = startH - dy;
      w = Math.max(20, Math.round(w));
      h2 = Math.max(20, Math.round(h2));
      const current = this.engine.findElement(id);
      if (!current) return;
      const styleOptions = { ...current.styleOptions };
      if (side.includes("e") || side.includes("w")) styleOptions["width"] = `${w}px`;
      if (side.includes("n") || side.includes("s")) styleOptions["height"] = `${h2}px`;
      this.engine.updateElement(id, { styleOptions }, { coalesceKey: `resize:${id}` });
      this.root.style.width = `${w}px`;
      this.root.style.height = `${h2}px`;
      if (side.includes("w")) this.root.style.left = `${startLeft + (startW - w)}px`;
      if (side.includes("n")) this.root.style.top = `${startTop + (startH - h2)}px`;
    };
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      try {
        handle.releasePointerCapture(downEvt.pointerId);
      } catch {
      }
      document.body.classList.remove("typos-resizing");
      this.isResizing = false;
      this.options.onResizeEnd?.();
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }
  destroy() {
    this.disposer.flush();
    this.root.remove();
  }
}
class TyposStylePanel {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.render();
    this.disposer.add(
      engine.on("selection:changed", ({ ids }) => {
        const next = ids[0] ?? null;
        if (next !== this.currentId) {
          this.currentId = next;
          this.render();
        }
      })
    );
    this.disposer.add(
      engine.on("document:changed", () => {
        if (this.currentId && !this.el()) {
          this.currentId = null;
          this.render();
        }
      })
    );
    this.disposer.add(engine.on("document:loaded", () => this.render()));
    this.disposer.add(engine.on("document:new", () => this.render()));
    this.disposer.add(engine.on("history:undo", () => this.render()));
    this.disposer.add(engine.on("history:redo", () => this.render()));
    this.ensureDatalists();
  }
  disposer = makeDisposer();
  currentId = null;
  el() {
    return this.currentId ? this.engine.findElement(this.currentId) : null;
  }
  prefix() {
    return this.engine.document.settings.directivePrefix;
  }
  patch(patch, field) {
    if (!this.currentId) return;
    this.engine.updateElement(this.currentId, patch, {
      coalesceKey: `${field}:${this.currentId}`
    });
  }
  /* ------------------------------------------------------------ UI - */
  render() {
    const el = this.el();
    if (!el) {
      replaceChildren(
        this.container,
        h("div", { class: "typos-panel-title", text: "Élément" }),
        h("div", {
          class: "typos-empty",
          text: "Sélectionne un élément dans le canvas, l'arbre ou le graphe."
        })
      );
      return;
    }
    const isRoot = el.id === this.engine.tree.id;
    const locked = getDirective(el, "locked", this.prefix()) === true;
    const hidden = getDirective(el, "hidden", this.prefix()) === true;
    replaceChildren(
      this.container,
      h("div", { class: "typos-panel-title", text: "Élément" }),
      this.section(
        "Identité",
        this.fieldRow(
          "Nom",
          this.textInput(
            String(getDirective(el, "name", this.prefix()) ?? ""),
            (v) => this.patch({ directives: { [directiveKey("name", this.prefix())]: v } }, "name")
          )
        ),
        this.fieldRow("Tag", this.tagInput(el)),
        this.metaRow("id", el.id),
        this.metaRow("path", String(getDirective(el, "path", this.prefix()) ?? "")),
        this.metaRow("kind", String(getDirective(el, "kind", this.prefix()) ?? ""))
      ),
      this.section(
        "Classes",
        this.textInput(
          el.classes.join(" "),
          (v) => this.patch({ classes: v.split(/\s+/).filter(Boolean) }, "classes")
        )
      ),
      this.section("Attributs", this.kvEditor(
        el.attrs,
        false,
        (attrs) => this.patch({ attrs }, "attrs")
      )),
      this.styleSection(el),
      this.section(
        "CSS libre",
        this.textArea(
          el.customCss,
          (v) => this.patch({ customCss: v }, "css"),
          "sélecteurs complets, ou déclarations nues scopées par id"
        )
      ),
      this.section(
        "Contenu (innerHtml)",
        el.children.length > 0 ? h("div", { class: "typos-hint", text: "Enfants présents : le contenu est porté par l'arbre." }) : this.textArea(el.innerHtml, (v) => this.patch({ innerHtml: v }, "html"), "HTML riche opaque")
      ),
      this.section(
        "Script scopé",
        this.textArea(el.script, (v) => this.patch({ script: v }, "script"), "émis en <script data-…-script-for>")
      ),
      this.section(
        "Éditeur",
        h(
          "div",
          { class: "typos-toggles" },
          this.toggle(
            "Verrouillé",
            locked,
            (v) => this.patch({ directives: { [directiveKey("locked", this.prefix())]: v } }, "locked")
          ),
          this.toggle(
            "Masqué",
            hidden,
            (v) => this.patch({ directives: { [directiveKey("hidden", this.prefix())]: v } }, "hidden")
          )
        )
      ),
      h(
        "div",
        { class: "typos-actions" },
        this.actionBtn("Cloner", !isRoot, () => {
          const id = this.engine.cloneElement(el.id);
          if (id) this.engine.select([id]);
        }),
        this.actionBtn("Envelopper", !isRoot, () => {
          const id = this.engine.wrapElement(el.id);
          if (id) this.engine.select([id]);
        }),
        this.actionBtn(
          "Dissoudre",
          !isRoot && el.children.length > 0,
          () => this.engine.unwrapElement(el.id)
        ),
        this.actionBtn("Supprimer", !isRoot, () => this.engine.removeElement(el.id), true)
      )
    );
  }
  /* --------------------------------------------- section Style ----- */
  /**
   * En-tête d'icônes raccourci + éditeur clé/valeur avec autocomplete
   * et sélecteur de couleur pour les propriétés colorées.
   */
  styleSection(el) {
    const shortcuts = h("div", { class: "typos-style-shortcuts" });
    for (const icon of STYLE_ICONS) {
      shortcuts.append(this.styleShortcutButton(icon, el));
    }
    return h(
      "section",
      { class: "typos-section" },
      h(
        "div",
        { class: "typos-section-head" },
        h("div", { class: "typos-section-title", text: "Style" }),
        shortcuts
      ),
      this.kvEditor(
        el.styleOptions,
        true,
        (styleOptions) => this.patch({ styleOptions }, "style")
      )
    );
  }
  styleShortcutButton(icon, el) {
    const already = icon.property in el.styleOptions;
    return h("button", {
      class: `typos-style-shortcut ${already ? "is-set" : ""}`,
      title: `${icon.label} — ${icon.property}`,
      text: icon.icon,
      style: {
        background: icon.tint,
        color: this.readableOn(icon.tint),
        borderColor: icon.tint
      },
      on: {
        click: () => {
          const next = { ...el.styleOptions };
          if (!(icon.property in next)) next[icon.property] = icon.defaultValue;
          this.patch({ styleOptions: next }, `style-add:${icon.property}`);
          this.render();
          queueMicrotask(() => this.focusStyleField(icon.property));
        }
      }
    });
  }
  focusStyleField(prop) {
    const rows = this.container.querySelectorAll(
      `.typos-kv-row[data-key="${CSS.escape(prop)}"] input.typos-kv-val`
    );
    rows[0]?.focus();
  }
  /* ------------------------------------------------------ widgets -- */
  section(title, ...children) {
    return h(
      "section",
      { class: "typos-section" },
      h("div", { class: "typos-section-title", text: title }),
      ...children
    );
  }
  fieldRow(label, input) {
    return h(
      "label",
      { class: "typos-field" },
      h("span", { class: "typos-field-label", text: label }),
      input
    );
  }
  metaRow(label, value) {
    return h(
      "div",
      { class: "typos-meta" },
      h("span", { class: "typos-field-label", text: label }),
      h("code", { class: "typos-meta-value", text: value })
    );
  }
  textInput(value, commit) {
    return h("input", {
      class: "typos-input",
      attrs: { type: "text", value },
      on: { input: (e) => commit(e.target.value) }
    });
  }
  /**
   * Éditeur clé/valeur générique. `withStyleAutocomplete=true` active :
   *  · datalist des propriétés CSS ;
   *  · datalist contextuel des valeurs (par propriété) ;
   *  · sélecteur de couleur natif pour les propriétés colorées.
   */
  kvEditor(record, withStyleAutocomplete, commit) {
    const rows = Object.entries(record).map(
      ([key, value]) => ({ key, value })
    );
    const wrap = h("div", { class: "typos-kv" });
    const push = () => {
      const next = {};
      for (const row of rows) {
        const k = row.key.trim();
        if (k) next[k] = row.value;
      }
      commit(next);
    };
    const renderRows = () => {
      wrap.textContent = "";
      rows.forEach((row, i) => {
        const rowEl = h("div", {
          class: "typos-kv-row",
          attrs: { "data-key": row.key || `__${i}` }
        });
        const keyInput = h("input", {
          class: "typos-input typos-kv-key",
          attrs: {
            type: "text",
            value: row.key,
            placeholder: "propriété",
            list: withStyleAutocomplete ? "typos-css-props" : ""
          },
          on: {
            input: (e) => {
              row.key = e.target.value;
              rowEl.setAttribute("data-key", row.key || `__${i}`);
              this.retuneValueInput(rowEl, row.key, withStyleAutocomplete);
              push();
            }
          }
        });
        const valInput = h("input", {
          class: "typos-input typos-kv-val",
          attrs: { type: "text", value: row.value, placeholder: "valeur" },
          on: {
            input: (e) => {
              row.value = e.target.value;
              push();
            }
          }
        });
        rowEl.append(keyInput, valInput);
        if (withStyleAutocomplete) {
          this.tuneValueInput(rowEl, valInput, row.key, (v) => {
            row.value = v;
            valInput.value = v;
            push();
          });
        }
        rowEl.append(
          h("button", {
            class: "typos-btn typos-btn-icon",
            text: "×",
            title: "Retirer",
            on: {
              click: () => {
                rows.splice(i, 1);
                renderRows();
                push();
              }
            }
          })
        );
        wrap.append(rowEl);
      });
      wrap.append(
        h("button", {
          class: "typos-btn typos-btn-icon",
          text: "+",
          title: "Ajouter",
          on: {
            click: () => {
              rows.push({ key: "", value: "" });
              renderRows();
            }
          }
        })
      );
    };
    renderRows();
    return wrap;
  }
  /** Attache le datalist de valeurs et — si couleur — un input color natif. */
  tuneValueInput(rowEl, input, key, commit) {
    const listId = this.valueListIdFor(key);
    if (listId) input.setAttribute("list", listId);
    if (COLOR_PROPERTIES.has(key)) {
      const swatch = h("input", {
        class: "typos-color-swatch",
        attrs: { type: "color", value: toHexColor(input.value) },
        on: {
          input: (e) => commit(e.target.value)
        }
      });
      rowEl.append(swatch);
    }
  }
  /** Réajuste le datalist / la présence du swatch quand la propriété change. */
  retuneValueInput(rowEl, key, withStyleAutocomplete) {
    if (!withStyleAutocomplete) return;
    const valInput = rowEl.querySelector("input.typos-kv-val");
    if (!valInput) return;
    const listId = this.valueListIdFor(key);
    if (listId) valInput.setAttribute("list", listId);
    else valInput.removeAttribute("list");
    const existingSwatch = rowEl.querySelector(".typos-color-swatch");
    if (COLOR_PROPERTIES.has(key)) {
      if (!existingSwatch) {
        const swatch = h("input", {
          class: "typos-color-swatch",
          attrs: { type: "color", value: toHexColor(valInput.value) },
          on: {
            input: (e) => {
              valInput.value = e.target.value;
              valInput.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }
        });
        rowEl.append(swatch);
      }
    } else if (existingSwatch) {
      existingSwatch.remove();
    }
  }
  valueListIdFor(key) {
    return STYLE_VALUES[key] ? `typos-css-values-${cssSafe(key)}` : null;
  }
  /** Datalists partagés — créés une fois, réutilisés par toutes les instances. */
  ensureDatalists() {
    if (!document.getElementById("typos-css-props")) {
      const dl = h("datalist", { attrs: { id: "typos-css-props" } });
      for (const p of STYLE_PROPERTIES) dl.append(h("option", { attrs: { value: p } }));
      document.body.append(dl);
    }
    for (const [key, values] of Object.entries(STYLE_VALUES)) {
      const id = `typos-css-values-${cssSafe(key)}`;
      if (!document.getElementById(id)) {
        const dl = h("datalist", { attrs: { id } });
        for (const v of values) dl.append(h("option", { attrs: { value: v } }));
        document.body.append(dl);
      }
    }
  }
  tagInput(el) {
    const list = "typos-tags-datalist";
    const wrap = h(
      "span",
      {},
      h("input", {
        class: "typos-input",
        attrs: { type: "text", value: el.type, list },
        on: {
          change: (e) => {
            const v = e.target.value.trim();
            if (/^[a-zA-Z][a-zA-Z0-9-]*$/.test(v)) this.patch({ type: v }, "type");
          }
        }
      })
    );
    if (!document.getElementById(list)) {
      const dl = h("datalist", { attrs: { id: list } });
      for (const t of ["div", "section", "header", "footer", "nav", "main", "article", "aside", "h1", "h2", "h3", "p", "span", "a", "button", "img", "input", "ul", "ol", "li", "form", "label"]) {
        dl.append(h("option", { attrs: { value: t } }));
      }
      document.body.append(dl);
    }
    return wrap;
  }
  textArea(value, commit, placeholder) {
    const ta = h("textarea", {
      class: "typos-input typos-textarea",
      attrs: { rows: "4", placeholder, spellcheck: "false" },
      on: { input: (e) => commit(e.target.value) }
    });
    ta.value = value;
    return ta;
  }
  toggle(label, value, commit) {
    const input = h("input", { attrs: { type: "checkbox" } });
    input.checked = value;
    input.addEventListener("change", () => commit(input.checked));
    return h("label", { class: "typos-toggle" }, input, h("span", { text: label }));
  }
  actionBtn(label, enabled, fn, danger = false) {
    const btn = h("button", {
      class: `typos-btn ${danger ? "typos-btn-danger" : ""}`,
      text: label,
      on: { click: fn }
    });
    btn.disabled = !enabled;
    return btn;
  }
  /** Choix noir/blanc contrasté sur un fond hex #RRGGBB. */
  readableOn(hex) {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return "#1c1712";
    const n = parseInt(m[1], 16);
    const r = n >> 16 & 255;
    const g = n >> 8 & 255;
    const b = n & 255;
    return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#1c1712" : "#ffffff";
  }
  destroy() {
    this.disposer.flush();
    this.container.textContent = "";
  }
}
function cssSafe(key) {
  return key.replace(/[^a-z0-9-]/gi, "-");
}
function toHexColor(value) {
  const v = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return "#000000";
}
function tokenizeHtml(line) {
  const tokens = [];
  const re = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][a-zA-Z0-9-]*)|(\s+[a-zA-Z][a-zA-Z0-9_:.-]*)(="[^"]*")?|(>|\/?>)|([^<>]+)/g;
  let m;
  while (m = re.exec(line)) {
    if (m[1]) {
      tokens.push({ kind: "comment", text: m[1] });
    } else if (m[2]) {
      tokens.push({ kind: "tag", text: m[2] });
    } else if (m[3]) {
      tokens.push({ kind: "attr-name", text: m[3] });
      if (m[4]) tokens.push({ kind: "attr-value", text: m[4] });
    } else if (m[5]) {
      tokens.push({ kind: "punct", text: m[5] });
    } else if (m[6]) {
      tokens.push({ kind: "text", text: m[6] });
    }
  }
  if (!tokens.length && line) tokens.push({ kind: "text", text: line });
  return tokens;
}
function tokenizeJson(line) {
  const tokens = [];
  const re = /("(?:[^"\\]|\\.)*")\s*(:)|("(?:[^"\\]|\\.)*")|(true|false)|(null)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}\[\],:])|(\s+)|([^\s"{}[\],:]+)/g;
  let m;
  while (m = re.exec(line)) {
    if (m[1]) {
      tokens.push({ kind: "key", text: m[1] });
      tokens.push({ kind: "punct", text: m[2] });
    } else if (m[3]) {
      tokens.push({ kind: "string", text: m[3] });
    } else if (m[4]) {
      tokens.push({ kind: "boolean", text: m[4] });
    } else if (m[5]) {
      tokens.push({ kind: "null", text: m[5] });
    } else if (m[6]) {
      tokens.push({ kind: "number", text: m[6] });
    } else if (m[7]) {
      tokens.push({ kind: "punct", text: m[7] });
    } else if (m[8]) {
      tokens.push({ kind: "text", text: m[8] });
    } else if (m[9]) {
      tokens.push({ kind: "text", text: m[9] });
    }
  }
  if (!tokens.length && line) tokens.push({ kind: "text", text: line });
  return tokens;
}
function detectFolds(lines, mode) {
  const ranges = [];
  const stack = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (mode === "json") {
      if (trimmed.endsWith("{") || trimmed.endsWith("[") || trimmed.endsWith("{,") || trimmed.endsWith("[,")) {
        stack.push(i);
      } else if (trimmed === "}" || trimmed === "}," || trimmed === "]" || trimmed === "],") {
        const start = stack.pop();
        if (start !== void 0 && i - start > 1) {
          ranges.push({ start, end: i, collapsed: false });
        }
      }
    } else {
      const openMatch = trimmed.match(/^<([a-zA-Z][a-zA-Z0-9-]*)[\s>]/);
      const closeMatch = trimmed.match(/^<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/);
      const selfClose = trimmed.endsWith("/>") || trimmed.match(/^<(img|input|br|hr|meta|link|col)\b/i);
      if (openMatch && !selfClose) {
        stack.push(i);
      } else if (closeMatch) {
        for (let j = stack.length - 1; j >= 0; j--) {
          const openLine = lines[stack[j]].trim();
          const m2 = openLine.match(/^<([a-zA-Z][a-zA-Z0-9-]*)[\s>]/);
          if (m2 && m2[1].toLowerCase() === closeMatch[1].toLowerCase()) {
            const start = stack.splice(j, 1)[0];
            if (i - start > 1) ranges.push({ start, end: i, collapsed: false });
            break;
          }
        }
      }
    }
  }
  return ranges.sort((a, b) => a.start - b.start);
}
class TyposHtmlView {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.profile = engine.document.settings.emitProfile;
    this.gutterEl = h("div", { class: "typos-gutter" });
    this.linesEl = h("div", { class: "typos-lines" });
    this.codeWrap = h("div", { class: "typos-code" }, this.gutterEl, this.linesEl);
    this.renderShell();
    const onChange = () => {
      if (this.visible) this.refresh();
    };
    this.disposer.add(engine.on("document:changed", onChange));
    this.disposer.add(engine.on("document:loaded", onChange));
    this.disposer.add(engine.on("document:new", onChange));
    this.disposer.add(engine.on("template:activated", onChange));
    this.disposer.add(
      engine.on("selection:changed", () => {
        if (this.visible) this.highlightSelection();
      })
    );
  }
  disposer = makeDisposer();
  mode = "html";
  profile;
  visible = false;
  codeWrap;
  gutterEl;
  linesEl;
  folds = [];
  rawLines = [];
  refresh = debounce(() => this.renderCode(), 60);
  setVisible(visible) {
    this.visible = visible;
    if (visible) this.renderCode();
  }
  renderShell() {
    const profileSelect = h("select", {
      class: "typos-select",
      on: { change: (e) => {
        this.profile = e.target.value;
        this.renderCode();
      } }
    });
    for (const p of ["none", "minimal", "runtime", "full"]) {
      const opt = h("option", { attrs: { value: p }, text: p });
      if (p === this.profile) opt.selected = true;
      profileSelect.append(opt);
    }
    const modeBtn = (mode, label) => h("button", {
      class: `typos-chip ${this.mode === mode ? "is-active" : ""}`,
      text: label,
      on: { click: () => {
        this.mode = mode;
        this.renderShell();
        this.renderCode();
      } }
    });
    const expandAll = h("button", {
      class: "typos-btn",
      text: "⊞ Tout",
      title: "Déplier tout",
      on: { click: () => {
        this.folds.forEach((f) => f.collapsed = false);
        this.paintLines();
      } }
    });
    const collapseAll = h("button", {
      class: "typos-btn",
      text: "⊟ Tout",
      title: "Plier tout",
      on: { click: () => {
        this.folds.forEach((f) => f.collapsed = true);
        this.paintLines();
      } }
    });
    replaceChildren(
      this.container,
      h(
        "div",
        { class: "typos-codebar" },
        modeBtn("html", "HTML"),
        modeBtn("json", "JSON"),
        h("span", { class: "typos-spacer" }),
        expandAll,
        collapseAll,
        this.mode === "html" ? h("span", { class: "typos-field-label", text: "profil" }) : null,
        this.mode === "html" ? profileSelect : null,
        h("button", {
          class: "typos-btn",
          text: "Copier",
          on: { click: () => {
            void navigator.clipboard?.writeText(this.rawLines.join("\n")).catch(() => {
            });
          } }
        })
      ),
      this.codeWrap
    );
    this.renderCode();
  }
  /* ────────────────────────── rendu du code ─────────────────────── */
  renderCode() {
    const source = this.mode === "html" ? this.engine.getHtml({ profile: this.profile }) : this.engine.toJSON();
    this.rawLines = source.split("\n");
    this.folds = detectFolds(this.rawLines, this.mode);
    this.paintLines();
  }
  /** Peint gouttière + lignes, en respectant les folds. */
  paintLines() {
    this.gutterEl.textContent = "";
    this.linesEl.textContent = "";
    const hidden = /* @__PURE__ */ new Set();
    for (const f of this.folds) {
      if (f.collapsed) {
        for (let i = f.start + 1; i <= f.end; i++) hidden.add(i);
      }
    }
    const tokenize = this.mode === "html" ? tokenizeHtml : tokenizeJson;
    const selectedId = this.engine.selection[0];
    for (let i = 0; i < this.rawLines.length; i++) {
      if (hidden.has(i)) continue;
      const raw = this.rawLines[i];
      const lineNum = i + 1;
      const fold = this.folds.find((f) => f.start === i);
      const gutterRow = h("div", { class: "typos-gutter-row" });
      if (fold) {
        const toggle = h("span", {
          class: `typos-fold-toggle ${fold.collapsed ? "is-collapsed" : ""}`,
          text: fold.collapsed ? "▶" : "▼",
          title: fold.collapsed ? "Déplier" : "Plier",
          on: { click: () => {
            fold.collapsed = !fold.collapsed;
            this.paintLines();
          } }
        });
        gutterRow.append(toggle);
      }
      gutterRow.append(h("span", { class: "typos-line-num", text: String(lineNum) }));
      this.gutterEl.append(gutterRow);
      const isSelected = !!(selectedId && raw.includes(selectedId));
      const lineEl = h("div", {
        class: `typos-code-line ${isSelected ? "is-selected" : ""}`,
        attrs: { "data-line": String(lineNum) }
      });
      if (fold?.collapsed) {
        const tokens = tokenize(raw);
        for (const tok of tokens) lineEl.append(this.spanFor(tok));
        const hiddenCount = fold.end - fold.start - 1;
        lineEl.append(h("span", {
          class: "typos-fold-badge",
          text: ` ··· ${hiddenCount} ligne${hiddenCount > 1 ? "s" : ""}`,
          title: "Clic pour déplier",
          on: { click: () => {
            fold.collapsed = false;
            this.paintLines();
          } }
        }));
      } else {
        const tokens = tokenize(raw);
        for (const tok of tokens) lineEl.append(this.spanFor(tok));
        if (!tokens.length) lineEl.textContent = " ";
      }
      this.linesEl.append(lineEl);
    }
    this.highlightSelection();
  }
  spanFor(tok) {
    return h("span", { class: `typos-tok-${tok.kind}`, text: tok.text });
  }
  highlightSelection() {
    const id = this.engine.selection[0];
    let found = null;
    for (const row of Array.from(this.linesEl.children)) {
      const hit = !!(id && row.textContent?.includes(id));
      row.classList.toggle("is-selected", hit);
      if (hit && !found) found = row;
    }
    if (found) {
      const p = this.codeWrap.getBoundingClientRect();
      const r = found.getBoundingClientRect();
      if (r.top < p.top || r.bottom > p.bottom) {
        this.codeWrap.scrollTop += r.top - p.top - this.codeWrap.clientHeight / 3;
      }
    }
  }
  destroy() {
    this.disposer.flush();
    this.container.textContent = "";
  }
}
const SVG_NS = "http://www.w3.org/2000/svg";
const NODE_W = 150;
const NODE_H = 40;
const GAP_X = 70;
const GAP_Y = 18;
class TyposNodeGraph {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.svg = document.createElementNS(SVG_NS, "svg");
    this.svg.setAttribute("class", "typos-graph");
    this.applyViewBox();
    this.svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
      const next = Math.min(Math.max(this.vb.w * factor, 300), 6e3);
      const scale = next / this.vb.w;
      const rect = this.svg.getBoundingClientRect();
      const px = this.vb.x + (e.clientX - rect.left) / rect.width * this.vb.w;
      const py = this.vb.y + (e.clientY - rect.top) / rect.height * this.vb.h;
      this.vb = {
        x: px - (px - this.vb.x) * scale,
        y: py - (py - this.vb.y) * scale,
        w: this.vb.w * scale,
        h: this.vb.h * scale
      };
      this.applyViewBox();
    }, { passive: false });
    this.svg.addEventListener("mousedown", (e) => {
      if (e.target.closest("[data-node]")) return;
      this.panning = { x: e.clientX, y: e.clientY };
    });
    this.svg.addEventListener("mousemove", (e) => {
      if (!this.panning) return;
      const rect = this.svg.getBoundingClientRect();
      const dx = (e.clientX - this.panning.x) / rect.width * this.vb.w;
      const dy = (e.clientY - this.panning.y) / rect.height * this.vb.h;
      this.vb.x -= dx;
      this.vb.y -= dy;
      this.panning = { x: e.clientX, y: e.clientY };
      this.applyViewBox();
    });
    const stopPan = () => {
      this.panning = null;
    };
    this.svg.addEventListener("mouseup", stopPan);
    this.svg.addEventListener("mouseleave", stopPan);
    replaceChildren(this.container, this.svg);
    const onChange = () => {
      if (this.visible) this.render();
    };
    this.disposer.add(engine.on("document:changed", onChange));
    this.disposer.add(engine.on("document:loaded", onChange));
    this.disposer.add(engine.on("document:new", onChange));
    this.disposer.add(engine.on("template:activated", onChange));
    this.disposer.add(engine.on("selection:changed", onChange));
  }
  disposer = makeDisposer();
  svg;
  vb = { x: -20, y: -20, w: 900, h: 600 };
  panning = null;
  visible = false;
  setVisible(visible) {
    this.visible = visible;
    if (visible) this.render();
  }
  applyViewBox() {
    this.svg.setAttribute(
      "viewBox",
      `${this.vb.x} ${this.vb.y} ${this.vb.w} ${this.vb.h}`
    );
  }
  /** Layout : x = profondeur, y = compteur de feuilles, parents centrés. */
  layout(root) {
    const nodes = [];
    let leaf = 0;
    const place = (el, depth) => {
      let y;
      if (el.children.length === 0) {
        y = leaf * (NODE_H + GAP_Y);
        leaf += 1;
      } else {
        const ys = el.children.map((c) => place(c, depth + 1));
        y = ((ys[0] ?? 0) + (ys[ys.length - 1] ?? 0)) / 2;
      }
      nodes.push({ el, x: depth * (NODE_W + GAP_X), y });
      return y;
    };
    place(root, 0);
    return nodes;
  }
  render() {
    const nodes = this.layout(this.engine.tree);
    const byId = new Map(nodes.map((n) => [n.el.id, n]));
    const selection = new Set(this.engine.selection);
    this.svg.textContent = "";
    for (const node of nodes) {
      for (const child of node.el.children) {
        const to = byId.get(child.id);
        if (!to) continue;
        const path = document.createElementNS(SVG_NS, "path");
        const x1 = node.x + NODE_W;
        const y1 = node.y + NODE_H / 2;
        const x2 = to.x;
        const y2 = to.y + NODE_H / 2;
        const mid = (x1 + x2) / 2;
        path.setAttribute("d", `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`);
        path.setAttribute("class", "typos-graph-edge");
        this.svg.append(path);
      }
    }
    for (const node of nodes) {
      const kind = getDirective(node.el, "kind");
      const group = document.createElementNS(SVG_NS, "g");
      group.setAttribute("data-node", node.el.id);
      group.setAttribute("transform", `translate(${node.x}, ${node.y})`);
      group.setAttribute(
        "class",
        `typos-graph-node ${selection.has(node.el.id) ? "is-selected" : ""} ${kind === "component-root" ? "is-component" : ""}`
      );
      group.addEventListener("click", (e) => {
        e.stopPropagation();
        this.engine.select([node.el.id]);
      });
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("width", String(NODE_W));
      rect.setAttribute("height", String(NODE_H));
      rect.setAttribute("rx", "8");
      group.append(rect);
      const type = document.createElementNS(SVG_NS, "text");
      type.setAttribute("x", "10");
      type.setAttribute("y", "17");
      type.setAttribute("class", "typos-graph-type");
      type.textContent = `<${node.el.type}>`;
      group.append(type);
      const name = String(getDirective(node.el, "name") ?? "");
      if (name && name !== node.el.type) {
        const label = document.createElementNS(SVG_NS, "text");
        label.setAttribute("x", "10");
        label.setAttribute("y", "32");
        label.setAttribute("class", "typos-graph-name");
        label.textContent = name.length > 18 ? `${name.slice(0, 17)}…` : name;
        group.append(label);
      }
      this.svg.append(group);
    }
  }
  destroy() {
    this.disposer.flush();
    this.container.textContent = "";
  }
}
const BUILT_IN_THEMES = [
  { id: "dark", label: "Sombre", family: "base", builtIn: true },
  { id: "light", label: "Clair", family: "base", builtIn: true },
  { id: "ubuntu", label: "Ubuntu", family: "os", builtIn: true },
  { id: "mac", label: "macOS", family: "os", builtIn: true },
  { id: "chrome", label: "Chrome", family: "browser", builtIn: true }
];
const THEME_CLASS_PREFIX = "typos-theme-";
const STYLE_ATTR = "data-typos-theme-style";
class ThemeService {
  constructor(root, options = {}) {
    this.root = root;
    this.doc = options.doc ?? document;
    for (const theme of BUILT_IN_THEMES) this.themes.set(theme.id, { ...theme });
    const initial = options.initial && this.themes.has(options.initial) ? options.initial : "dark";
    this.currentId = initial;
    this.applyClass(initial);
  }
  themes = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  injected = /* @__PURE__ */ new Set();
  currentId;
  doc;
  /** Liste des thèmes disponibles (built-in + personnalisés enregistrés). */
  list() {
    return [...this.themes.values()];
  }
  /** Identifiant du thème actif. */
  get current() {
    return this.currentId;
  }
  has(id) {
    return this.themes.has(id);
  }
  get(id) {
    return this.themes.get(id) ?? null;
  }
  /** Applique un thème connu. Retourne false si l'id est inconnu. */
  apply(id) {
    if (!this.themes.has(id)) return false;
    if (id === this.currentId) {
      this.applyClass(id);
      return true;
    }
    this.applyClass(id);
    this.currentId = id;
    for (const cb of this.listeners) cb(id);
    return true;
  }
  /**
   * Enregistre un thème personnalisé. Si des jetons sont fournis, la
   * feuille scopée correspondante est injectée dans le document. Écrase
   * une définition de même id (sauf built-in, protégé).
   */
  register(theme) {
    if (this.themes.get(theme.id)?.builtIn) {
      throw new Error(`Le thème « ${theme.id} » est un built-in protégé.`);
    }
    const def = { ...theme, builtIn: false };
    this.themes.set(def.id, def);
    if (def.tokens) this.injectTokens(def.id, def.tokens);
  }
  /** Retire un thème personnalisé (les built-in sont protégés). */
  unregister(id) {
    const def = this.themes.get(id);
    if (!def || def.builtIn) return false;
    this.themes.delete(id);
    this.removeInjected(id);
    if (this.currentId === id) this.apply("dark");
    return true;
  }
  /** S'abonne aux changements de thème. Retourne la fonction de désabonnement. */
  onChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  /* -------------------------------------------------------- interne - */
  applyClass(id) {
    const toRemove = [];
    this.root.classList.forEach((c) => {
      if (c.startsWith(THEME_CLASS_PREFIX)) toRemove.push(c);
    });
    for (const c of toRemove) this.root.classList.remove(c);
    this.root.classList.add(`${THEME_CLASS_PREFIX}${id}`);
    this.root.setAttribute("data-typos-theme", id);
  }
  injectTokens(id, tokens) {
    this.removeInjected(id);
    const decls = Object.entries(tokens).map(([k, v]) => `--typos-${k}: ${v};`).join("");
    const style = this.doc.createElement("style");
    style.setAttribute(STYLE_ATTR, id);
    style.textContent = `.typos-root.${THEME_CLASS_PREFIX}${id}{${decls}}`;
    this.doc.head.append(style);
    this.injected.add(id);
  }
  removeInjected(id) {
    const existing = this.doc.querySelector(`style[${STYLE_ATTR}="${id}"]`);
    if (existing) existing.remove();
    this.injected.delete(id);
  }
  /** Nettoie classes de thème et styles injectés par cette instance. */
  destroy() {
    const toRemove = [];
    this.root.classList.forEach((c) => {
      if (c.startsWith(THEME_CLASS_PREFIX)) toRemove.push(c);
    });
    for (const c of toRemove) this.root.classList.remove(c);
    this.root.removeAttribute("data-typos-theme");
    for (const id of [...this.injected]) this.removeInjected(id);
    this.listeners.clear();
  }
}
class TyposEditor {
  constructor(container, options = {}) {
    this.container = container;
    this.engine = new TyposEngine(options);
    this.root = h("div", { class: "typos-root typos-editor" });
    container.append(this.root);
    this.themeService = new ThemeService(this.root, {
      initial: options.theme ?? "dark"
    });
    this.build();
    const refreshToolbar = () => this.renderToolbar();
    this.disposer.add(this.engine.on("document:changed", refreshToolbar));
    this.disposer.add(this.engine.on("document:loaded", refreshToolbar));
    this.disposer.add(this.engine.on("document:new", refreshToolbar));
    this.disposer.add(this.engine.on("template:activated", refreshToolbar));
    this.disposer.add(this.engine.on("dirty:changed", refreshToolbar));
    this.disposer.add(this.engine.on("history:push", refreshToolbar));
    this.disposer.add(this.engine.on("history:undo", refreshToolbar));
    this.disposer.add(this.engine.on("history:redo", refreshToolbar));
    this.canvas.onRectChange = (rect) => this.overlay.setRect(rect);
    this.disposer.add(
      this.engine.on("selection:changed", () => this.canvas.refreshRect())
    );
    this.disposer.add(
      this.engine.on("document:changed", () => this.canvas.refreshRect())
    );
    this.keydownHandler = (e) => this.onKeydown(e);
    document.addEventListener("keydown", this.keydownHandler);
  }
  engine;
  /** Service de thème — bascule les 5 thèmes built-in, injecte les customs. */
  themeService;
  disposer = makeDisposer();
  root;
  tab = "canvas";
  palette;
  treeView;
  canvas;
  /** Overlay flottant des icônes et poignées de resize — accessible publiquement. */
  overlay;
  stylePanel;
  htmlView;
  nodeGraph;
  toolbarEl;
  tabsEl;
  centerPanes;
  keydownHandler;
  /* ------------------------------------------------------ structure - */
  build() {
    this.toolbarEl = h("header", { class: "typos-toolbar" });
    const paletteHost = h("div", { class: "typos-pane typos-pane-palette" });
    const treeHost = h("div", { class: "typos-pane typos-pane-tree" });
    const styleHost = h("aside", { class: "typos-pane typos-pane-style" });
    this.centerPanes = {
      canvas: h("div", { class: "typos-center-pane is-active" }),
      graph: h("div", { class: "typos-center-pane" }),
      code: h("div", { class: "typos-center-pane" })
    };
    this.tabsEl = h("nav", { class: "typos-tabs" });
    const center = h(
      "main",
      { class: "typos-center" },
      this.tabsEl,
      this.centerPanes.canvas,
      this.centerPanes.graph,
      this.centerPanes.code
    );
    replaceChildren(
      this.root,
      this.toolbarEl,
      h(
        "div",
        { class: "typos-body" },
        h("aside", { class: "typos-left" }, paletteHost, treeHost),
        center,
        styleHost
      )
    );
    this.palette = new TyposPalette(paletteHost, this.engine);
    this.treeView = new TyposTreeView(treeHost, this.engine);
    this.canvas = new TyposCanvas(this.centerPanes.canvas, this.engine);
    this.overlay = new TyposSelectionOverlay(this.canvas.overlayLayer, this.engine, {
      onResizeEnd: () => this.canvas.refreshRect()
    });
    this.nodeGraph = new TyposNodeGraph(this.centerPanes.graph, this.engine);
    this.htmlView = new TyposHtmlView(this.centerPanes.code, this.engine);
    this.stylePanel = new TyposStylePanel(styleHost, this.engine);
    this.renderTabs();
    this.renderToolbar();
  }
  setTab(tab) {
    this.tab = tab;
    for (const [name, pane] of Object.entries(this.centerPanes)) {
      pane.classList.toggle("is-active", name === tab);
    }
    this.htmlView.setVisible(tab === "code");
    this.nodeGraph.setVisible(tab === "graph");
    if (tab === "canvas") this.canvas.refreshRect();
    else this.overlay.setRect(null);
    this.renderTabs();
  }
  renderTabs() {
    const tabBtn = (tab, label) => h("button", {
      class: `typos-tab ${this.tab === tab ? "is-active" : ""}`,
      text: label,
      on: { click: () => this.setTab(tab) }
    });
    replaceChildren(
      this.tabsEl,
      tabBtn("canvas", "Canvas"),
      tabBtn("graph", "Graphe"),
      tabBtn("code", "Code")
    );
  }
  /* -------------------------------------------------------- toolbar - */
  renderToolbar() {
    const doc = this.engine.document;
    const nameInput = h("input", {
      class: "typos-input typos-docname",
      attrs: { type: "text", value: doc.name, "aria-label": "Nom du document" },
      on: {
        change: (e) => this.engine.rename(e.target.value)
      }
    });
    const templateTabs = h("div", { class: "typos-template-tabs" });
    for (const t of doc.templates) {
      const isActive = t.id === doc.activeTemplateId;
      templateTabs.append(
        h(
          "span",
          {
            class: `typos-template-tab ${isActive ? "is-active" : ""}`,
            title: "Clic : activer · double-clic : renommer",
            on: {
              click: () => this.engine.setActiveTemplate(t.id),
              dblclick: () => {
                const name = window.prompt("Nom du template :", t.name);
                if (name) this.engine.renameTemplate(t.id, name);
              }
            }
          },
          h("span", { text: t.name + (t.isMain ? " ★" : "") }),
          doc.templates.length > 1 ? h("button", {
            class: "typos-template-close",
            text: "×",
            title: "Supprimer ce template",
            on: {
              click: (e) => {
                e.stopPropagation();
                this.engine.removeTemplate(t.id);
              }
            }
          }) : null
        )
      );
    }
    templateTabs.append(
      h("button", {
        class: "typos-btn typos-btn-icon",
        text: "+",
        title: "Ajouter un template (clone de l'actif)",
        on: {
          click: () => {
            const id = this.engine.addTemplate({
              cloneFromId: doc.activeTemplateId
            });
            this.engine.setActiveTemplate(id);
          }
        }
      })
    );
    const targetSelect = this.select(
      ["web", "tablet", "mobile"],
      this.engine.activeTemplate.target,
      (v) => this.engine.setTemplateTarget(doc.activeTemplateId, v),
      "Cible du template"
    );
    const profileSelect = this.select(
      ["none", "minimal", "runtime", "full"],
      doc.settings.emitProfile,
      (v) => this.engine.setEmitProfile(v),
      "Profil d'émission"
    );
    const undoBtn = h("button", {
      class: "typos-btn",
      text: "↶",
      title: "Annuler (Ctrl+Z)",
      on: { click: () => this.engine.undo() }
    });
    undoBtn.disabled = !this.engine.canUndo;
    const redoBtn = h("button", {
      class: "typos-btn",
      text: "↷",
      title: "Rétablir (Ctrl+Shift+Z)",
      on: { click: () => this.engine.redo() }
    });
    redoBtn.disabled = !this.engine.canRedo;
    const themeSelect = h("select", {
      class: "typos-select",
      attrs: { "aria-label": "Thème de l'éditeur", title: "Thème" },
      on: {
        change: (e) => this.themeService.apply(e.target.value)
      }
    });
    for (const theme of this.themeService.list()) {
      const opt = h("option", { attrs: { value: theme.id }, text: theme.label });
      if (theme.id === this.themeService.current) opt.selected = true;
      themeSelect.append(opt);
    }
    replaceChildren(
      this.toolbarEl,
      h("span", { class: "typos-logo", text: "τ", title: `Typos — ${doc.kind}` }),
      nameInput,
      h("span", {
        class: `typos-dirty ${this.engine.isDirty ? "is-dirty" : ""}`,
        title: this.engine.isDirty ? "Modifications non enregistrées" : "À jour"
      }),
      templateTabs,
      h("span", { class: "typos-spacer" }),
      h("span", { class: "typos-field-label", text: "thème" }),
      themeSelect,
      h("span", { class: "typos-field-label", text: "cible" }),
      targetSelect,
      h("span", { class: "typos-field-label", text: "profil" }),
      profileSelect,
      undoBtn,
      redoBtn,
      h("button", {
        class: "typos-btn",
        text: "Importer HTML",
        on: { click: () => this.openImportModal() }
      }),
      h("button", {
        class: "typos-btn",
        text: "Charger JSON",
        on: { click: () => this.loadJsonFile() }
      }),
      h("button", {
        class: "typos-btn typos-btn-accent",
        text: "Exporter JSON",
        title: "Télécharge le document canonique et marque comme enregistré",
        on: { click: () => this.exportJson() }
      })
    );
  }
  select(values, current, commit, label) {
    const select = h("select", {
      class: "typos-select",
      attrs: { "aria-label": label },
      on: { change: (e) => commit(e.target.value) }
    });
    for (const v of values) {
      const opt = h("option", { attrs: { value: v }, text: v });
      if (v === current) opt.selected = true;
      select.append(opt);
    }
    return select;
  }
  /* --------------------------------------------- import / export ---- */
  openImportModal() {
    const htmlTa = h("textarea", {
      class: "typos-input typos-textarea",
      attrs: { rows: "10", placeholder: "<section>…</section>", spellcheck: "false" }
    });
    const cssTa = h("textarea", {
      class: "typos-input typos-textarea",
      attrs: { rows: "4", placeholder: "CSS optionnel", spellcheck: "false" }
    });
    const overlay = h(
      "div",
      { class: "typos-modal-overlay", on: { click: (e) => {
        if (e.target === overlay) overlay.remove();
      } } },
      h(
        "div",
        { class: "typos-modal" },
        h("div", { class: "typos-panel-title", text: "Importer du HTML" }),
        h("div", { class: "typos-hint", text: "Remplace l'arbre du template actif." }),
        h("div", { class: "typos-field-label", text: "HTML" }),
        htmlTa,
        h("div", { class: "typos-field-label", text: "CSS" }),
        cssTa,
        h(
          "div",
          { class: "typos-actions" },
          h("button", { class: "typos-btn", text: "Annuler", on: { click: () => overlay.remove() } }),
          h("button", {
            class: "typos-btn typos-btn-accent",
            text: "Importer",
            on: {
              click: () => {
                const html = htmlTa.value.trim();
                if (html) this.engine.importHtml(html, cssTa.value.trim() || void 0);
                overlay.remove();
              }
            }
          })
        )
      )
    );
    this.root.append(overlay);
  }
  exportJson() {
    const json = this.engine.toJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = h("a", { attrs: { href: url, download: `${this.engine.document.name || "typos-document"}.typos.json` } });
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.engine.markSaved();
  }
  loadJsonFile() {
    const input = h("input", { attrs: { type: "file", accept: ".json,application/json" } });
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      void file.text().then((text) => {
        try {
          this.engine.loadDocument(text);
        } catch (err) {
          window.alert(String(err));
        }
      });
    });
    input.click();
  }
  /* ------------------------------------------------------ clavier --- */
  onKeydown(e) {
    if (!this.root.isConnected) return;
    const target = e.target;
    const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) this.engine.redo();
      else this.engine.undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      this.engine.redo();
      return;
    }
    if (!typing && (e.key === "Delete" || e.key === "Backspace")) {
      const id = this.engine.selection[0];
      if (id && id !== this.engine.tree.id) {
        e.preventDefault();
        this.engine.removeElement(id);
      }
    }
  }
  destroy() {
    document.removeEventListener("keydown", this.keydownHandler);
    this.disposer.flush();
    this.themeService.destroy();
    this.palette.destroy();
    this.treeView.destroy();
    this.canvas.destroy();
    this.overlay.destroy();
    this.nodeGraph.destroy();
    this.htmlView.destroy();
    this.stylePanel.destroy();
    this.root.remove();
  }
}
function mountTyposEditor(container, options = {}) {
  return new TyposEditor(container, options);
}
const TOKENS = {
  color: {
    /** Accent Typos (or clair du satellite). */
    accent: "#D4A373",
    accentSoft: "#d4a37333",
    accentText: "#1c1712",
    /** Surfaces, du fond de scène au premier plan. */
    bg0: "#141210",
    bg1: "#1c1916",
    bg2: "#252019",
    surface: "#252019",
    surfaceRaised: "#2e2820",
    border: "#3a332a",
    borderStrong: "#4d4436",
    text: "#eae4da",
    textMuted: "#a89c8c",
    textFaint: "#6f6559",
    /** États. */
    success: "#2DD4A0",
    warning: "#E8B44A",
    danger: "#E84A4A",
    info: "#3D8EE8",
    /** Sélection / survol dans le canvas et l'arbre. */
    selection: "#D4A373",
    hover: "#d4a3731f"
  },
  font: {
    ui: "'Inter', 'Segoe UI', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace"
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px"
  },
  space: (n) => `${n * 4}px`,
  z: {
    canvas: 1,
    overlay: 40,
    popup: 50,
    modal: 60,
    toast: 70
  }
};
export {
  BUILT_IN_THEMES,
  COLOR_PROPERTIES,
  DEFAULT_DIRECTIVE_PREFIX,
  DEFAULT_TEMPLATES,
  DERIVED_SHORTS,
  DIRECTIVES_BY_KEY,
  DIRECTIVES_BY_SHORT,
  DIRECTIVE_REGISTRY,
  Emitter,
  OVERLAY_ICONS,
  STYLE_ICONS,
  STYLE_PROPERTIES,
  STYLE_VALUES,
  TEMPLATES_BY_KEY,
  TOKENS,
  ThemeService,
  TyposCanvas,
  TyposEditor,
  TyposEngine,
  TyposHtmlView,
  TyposNodeGraph,
  TyposPalette,
  TyposSelectionOverlay,
  TyposStylePanel,
  TyposTreeView,
  VOID_TAGS,
  ancestorsOf,
  cloneSubtree,
  collectCustomCss,
  computeHashes,
  countElements,
  createComponentId,
  createDocument,
  createDocumentId,
  createElement,
  createElementId,
  createId,
  createTemplateId,
  cyrb53,
  directiveKey,
  documentHash,
  elementFromDefinition,
  elementKind,
  elementToHtml,
  emittedInProfile,
  escapeAttr,
  findById,
  findByPath,
  flatten,
  getDirective,
  getParent,
  insertAt,
  isAncestor,
  isTyposDirectiveKey,
  mountTyposEditor,
  moveTo,
  parseDocument,
  parseDocumentValue,
  parseHtmlToTree,
  recomputeDerivedDirectives,
  removeById,
  reorder,
  replaceById,
  serializeDocument,
  specForKey,
  stripDerived,
  toKebab,
  treeToHtml,
  unwrapElement,
  updateElement,
  validateDocument,
  validateElement,
  walk,
  withDirective,
  wrapElement
};
//# sourceMappingURL=typos.js.map
