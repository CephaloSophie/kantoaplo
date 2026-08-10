const wt = /* @__PURE__ */ new Map();
function U(o, e) {
  wt.set(o, e);
}
function $t(o) {
  return wt.get(o);
}
const Z = (o) => o.addEventListener("mousedown", (e) => e.stopPropagation());
U("slider", ({ field: o, value: e, onChange: t, h: n }) => {
  const i = n("span", "k-fslider-wrap"), s = n("input", "k-fslider");
  s.type = "range", s.min = String(o.min ?? 0), s.max = String(o.max ?? 100), s.step = String(o.step ?? 1), s.value = String(e ?? o.min ?? 0);
  const l = n("span", "k-fslider-val", s.value);
  return Z(s), s.addEventListener("input", () => {
    l.textContent = s.value;
  }), s.addEventListener("change", () => t(Number(s.value))), i.append(s, l), i;
});
U("color", ({ value: o, onChange: e, h: t }) => {
  const n = t("input", "k-fcolor");
  return n.type = "color", n.value = String(o ?? "#22d3ee"), Z(n), n.addEventListener("change", () => e(n.value)), n;
});
U("textarea", ({ field: o, value: e, onChange: t, h: n }) => {
  const i = n("textarea", "k-ftextarea");
  return i.rows = o.rows ?? 3, i.value = String(e ?? ""), o.placeholder && (i.placeholder = o.placeholder), Z(i), i.addEventListener("change", () => t(i.value)), i;
});
U("date", ({ value: o, onChange: e, h: t }) => {
  const n = t("input", "k-finput");
  return n.type = "date", n.value = String(o ?? ""), Z(n), n.addEventListener("change", () => e(n.value)), n;
});
const K = /* @__PURE__ */ new Map();
function le(o) {
  K.set(o.type, o);
}
function Pt(o) {
  for (const e of o) K.set(e.type, e);
}
function z(o) {
  return K.get(o);
}
function ce() {
  return [...K.values()];
}
function de() {
  K.clear();
}
function xt(o) {
  var i, s, l;
  const e = [], t = o.flow ?? {};
  t.previous !== !1 && e.push({ id: "prev", side: "top", order: 0, kind: "prev" }), t.next !== !1 && e.push({ id: "next", side: "bottom", order: 0, kind: "next" }), (i = o.hooks) != null && i.left && e.push({ id: "hookLeft", side: "left", order: 0, kind: "hook", label: o.hooks.left.label }), (s = o.hooks) != null && s.right && e.push({ id: "hookRight", side: "right", order: 0, kind: "hook", label: o.hooks.right.label });
  let n = (l = o.hooks) != null && l.right ? 1 : 0;
  for (const a of o.statements ?? [])
    e.push({ id: `stmt:${a.id}`, side: "right", order: n++, kind: "stmt", label: a.label });
  for (const a of o.fields ?? [])
    a.type === "value_input" && e.push({ id: `val:${a.id}`, side: "left", order: e.filter((r) => r.side === "left").length, kind: "val", label: a.label });
  for (const a of o.extraPorts ?? [])
    e.push({ id: `extra:${a.id}`, side: a.side, order: e.filter((r) => r.side === a.side).length, kind: "extra", label: a.label });
  return e;
}
function dt(o, e) {
  return xt(o).find((t) => t.id === e);
}
function et(o, e, t = !0) {
  return o === void 0 ? t : typeof o == "boolean" ? o : !(o.allow && !o.allow.includes(e) || o.deny && o.deny.includes(e));
}
function ht() {
  return { blocks: {}, connections: [], positions: {}, nodePositions: {}, viewport: { panX: 0, panY: 0, zoom: 1 } };
}
let _t = 0;
function it() {
  return `blk_${Date.now().toString(36)}_${(_t++).toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}
function Dt(o) {
  const e = z(o);
  if (!e) return null;
  const t = {};
  for (const n of e.fields ?? [])
    n.defaultValue !== void 0 && (t[n.id] = n.defaultValue);
  return { id: it(), type: o, fieldValues: t, collapsed: !1 };
}
function pt(o, e, t) {
  return {
    ...o,
    blocks: { ...o.blocks, [e.id]: e },
    positions: t ? { ...o.positions, [e.id]: t } : o.positions
  };
}
function ut(o, e) {
  const t = /* @__PURE__ */ new Set([e]);
  for (const a of Object.values(o.blocks)) a.aliasOf === e && t.add(a.id);
  const n = { ...o.blocks }, i = { ...o.positions }, s = { ...o.nodePositions };
  for (const a of t)
    delete n[a], delete i[a], delete s[a];
  const l = o.connections.filter((a) => !t.has(a.from.blockId) && !t.has(a.to.blockId));
  return { ...o, blocks: n, connections: l, positions: i, nodePositions: s };
}
function ft(o, e, t) {
  return { ...o, positions: { ...o.positions, [e]: t } };
}
function Ot(o, e, t, n) {
  const i = o.blocks[e];
  return i ? { ...o, blocks: { ...o.blocks, [e]: { ...i, fieldValues: { ...i.fieldValues, [t]: n } } } } : o;
}
function J(o, e, t) {
  const n = o.blocks[e];
  return n ? { ...o, blocks: { ...o.blocks, [e]: { ...n, ...t } } } : o;
}
function Y(o, e) {
  var r, c, d;
  const { from: t, to: n } = e;
  if (t.blockId === n.blockId) return { valid: !1, reason: "self-connection" };
  const i = o.blocks[t.blockId], s = o.blocks[n.blockId];
  if (!i || !s) return { valid: !1, reason: "block not found" };
  const l = z(i.type), a = z(s.type);
  if (!l || !a) return { valid: !1, reason: "def not found" };
  if (!dt(l, String(t.portId))) return { valid: !1, reason: `no port ${t.portId} on source` };
  if (!dt(a, String(n.portId))) return { valid: !1, reason: `no port ${n.portId} on target` };
  if (t.portId === "next" && n.portId === "prev") {
    if (!et((r = l.flow) == null ? void 0 : r.next, s.type))
      return { valid: !1, reason: `${l.type} n'accepte pas « ${s.type} » après lui` };
    if (!et((c = a.flow) == null ? void 0 : c.previous, i.type))
      return { valid: !1, reason: `${a.type} n'accepte pas « ${i.type} » avant lui` };
  }
  if (String(t.portId).startsWith("stmt:") && n.portId === "prev") {
    const h = String(t.portId).slice(5), p = (l.statements ?? []).find((g) => g.id === h);
    if (p != null && p.allow && !p.allow.includes(s.type))
      return { valid: !1, reason: `slot « ${h} » n'accepte pas ${s.type}` };
    if (p != null && p.deny && p.deny.includes(s.type))
      return { valid: !1, reason: `slot « ${h} » refuse ${s.type}` };
    if (!et((d = a.flow) == null ? void 0 : d.previous, i.type))
      return { valid: !1, reason: `${a.type} refuse ce parent` };
  }
  if (o.connections.some((h) => h.to.blockId === n.blockId && h.to.portId === n.portId))
    return { valid: !1, reason: "target port already connected" };
  if ((t.portId === "next" || String(t.portId).startsWith("stmt:")) && o.connections.some((h) => h.from.blockId === t.blockId && h.from.portId === t.portId))
    return { valid: !1, reason: "source port already connected" };
  if (t.portId === "next" && n.portId === "prev") {
    let h = n.blockId;
    const p = /* @__PURE__ */ new Set();
    for (; h && !p.has(h); ) {
      if (h === t.blockId) return { valid: !1, reason: "flow cycle" };
      p.add(h);
      const g = o.connections.find((m) => m.from.blockId === h && m.from.portId === "next");
      h = g == null ? void 0 : g.to.blockId;
    }
  }
  return { valid: !0 };
}
function q(o, e) {
  return { ...o, connections: [...o.connections, e] };
}
function Q(o, e) {
  return {
    ...o,
    connections: o.connections.filter((t) => !(t.from.blockId === e.from.blockId && t.from.portId === e.from.portId && t.to.blockId === e.to.blockId && t.to.portId === e.to.portId))
  };
}
function tt(o, e, t) {
  return o.connections.find((n) => n.from.blockId === e && n.from.portId === t);
}
function Ct(o, e, t) {
  return o.connections.find((n) => n.to.blockId === e && n.to.portId === t);
}
function H(o, e) {
  var t;
  return ((t = tt(o, e, "next")) == null ? void 0 : t.to.blockId) ?? null;
}
function Mt(o, e) {
  var t;
  return ((t = Ct(o, e, "prev")) == null ? void 0 : t.from.blockId) ?? null;
}
function At(o, e) {
  const t = o.connections.find((n) => n.to.blockId === e && n.to.portId === "prev" && String(n.from.portId).startsWith("stmt:"));
  return t ? { parentBlockId: t.from.blockId, statementId: String(t.from.portId).slice(5) } : null;
}
function st(o, e) {
  let t = o;
  const n = t.connections.find((i) => i.to.blockId === e && i.to.portId === "prev");
  return n && (t = Q(t, n)), t;
}
function Nt(o, e, t) {
  let n = st(o, t);
  const i = tt(n, e, "next");
  if (i) {
    n = Q(n, i);
    let a = t, r = H(n, a);
    for (; r; )
      a = r, r = H(n, a);
    Y(n, { from: { blockId: a, portId: "next" }, to: i.to }).valid && (n = q(n, { from: { blockId: a, portId: "next" }, to: i.to }));
  }
  const s = { from: { blockId: e, portId: "next" }, to: { blockId: t, portId: "prev" } };
  return Y(n, s).valid ? q(n, s) : o;
}
function Rt(o, e, t, n) {
  let i = st(o, n);
  const s = `stmt:${t}`, l = tt(i, e, s);
  if (l) {
    i = Q(i, l);
    let r = n, c = H(i, r);
    for (; c; )
      r = c, c = H(i, r);
    const d = { from: { blockId: r, portId: "next" }, to: l.to };
    Y(i, d).valid && (i = q(i, d));
  }
  const a = { from: { blockId: e, portId: s }, to: { blockId: n, portId: "prev" } };
  return Y(i, a).valid ? q(i, a) : o;
}
function ot(o, e) {
  const t = /* @__PURE__ */ new Set(), n = (i) => {
    if (!t.has(i)) {
      t.add(i);
      for (const s of o.connections)
        s.from.blockId === i && (s.from.portId === "next" || String(s.from.portId).startsWith("stmt:")) && n(s.to.blockId);
    }
  };
  return n(e), t;
}
function Wt(o, e, t) {
  return { ...o, nodePositions: { ...o.nodePositions, [e]: t } };
}
function nt(o) {
  return {
    blocks: o.blocks ?? {},
    connections: o.connections ?? [],
    positions: o.positions ?? {},
    nodePositions: o.nodePositions ?? {},
    viewport: o.viewport ?? { panX: 0, panY: 0, zoom: 1 }
  };
}
function Tt(o, e, t = { x: 34, y: 34 }) {
  const n = ot(o, e), i = /* @__PURE__ */ new Map(), s = { ...o.blocks }, l = { ...o.positions }, a = { ...o.nodePositions };
  for (const c of n) {
    const d = o.blocks[c];
    if (!d) continue;
    const h = { ...d, id: it(), fieldValues: { ...d.fieldValues } };
    i.set(c, h.id), s[h.id] = h;
    const p = o.positions[c];
    p && (l[h.id] = { x: p.x + t.x, y: p.y + t.y });
    const g = o.nodePositions[c];
    g && (a[h.id] = { x: g.x + t.x, y: g.y + t.y });
  }
  for (const [c, d] of i) {
    const h = o.blocks[c];
    h != null && h.aliasOf && i.has(h.aliasOf) && (s[d] = { ...s[d], aliasOf: i.get(h.aliasOf) });
  }
  const r = o.connections.filter((c) => n.has(c.from.blockId) && n.has(c.to.blockId)).map((c) => ({
    from: { blockId: i.get(c.from.blockId), portId: c.from.portId },
    to: { blockId: i.get(c.to.blockId), portId: c.to.portId }
  }));
  return {
    state: { ...o, blocks: s, positions: l, nodePositions: a, connections: [...o.connections, ...r] },
    newRootId: i.get(e),
    idMap: i
  };
}
class zt {
  constructor() {
    this.handlers = /* @__PURE__ */ new Map();
  }
  on(e, t) {
    return this.handlers.has(e) || this.handlers.set(e, /* @__PURE__ */ new Set()), this.handlers.get(e).add(t), () => this.off(e, t);
  }
  off(e, t) {
    var n;
    (n = this.handlers.get(e)) == null || n.delete(t);
  }
  emit(e, t) {
    var n;
    (n = this.handlers.get(e)) == null || n.forEach((i) => i(t));
  }
  removeAll() {
    this.handlers.clear();
  }
}
const St = /* @__PURE__ */ new Map();
function he(o, e) {
  St.set(o, e);
}
function Yt(o) {
  return St.get(o);
}
function qt(o, e) {
  const t = /* @__PURE__ */ new Set();
  for (const i of e) for (const s of ot(o, i)) t.add(s);
  const n = { blocks: {}, connections: [], positions: {}, nodePositions: {}, roots: [...e] };
  for (const i of t) {
    const s = o.blocks[i];
    s && (n.blocks[i] = JSON.parse(JSON.stringify(s)), o.positions[i] && (n.positions[i] = { ...o.positions[i] }), o.nodePositions[i] && (n.nodePositions[i] = { ...o.nodePositions[i] }));
  }
  return n.connections = o.connections.filter((i) => t.has(i.from.blockId) && t.has(i.to.blockId)).map((i) => JSON.parse(JSON.stringify(i))), n;
}
function Ht(o, e, t = { x: 40, y: 40 }) {
  const n = /* @__PURE__ */ new Map(), i = { ...o.blocks }, s = { ...o.positions }, l = { ...o.nodePositions };
  for (const [r, c] of Object.entries(e.blocks)) {
    const d = { ...JSON.parse(JSON.stringify(c)), id: it() };
    n.set(r, d.id), i[d.id] = d;
  }
  for (const [r, c] of n) {
    const d = e.blocks[r];
    d.aliasOf && (i[c] = { ...i[c], aliasOf: n.get(d.aliasOf) ?? (o.blocks[d.aliasOf] ? d.aliasOf : void 0) });
  }
  for (const [r, c] of Object.entries(e.positions)) {
    const d = n.get(r);
    d && (s[d] = { x: c.x + t.x, y: c.y + t.y });
  }
  for (const [r, c] of Object.entries(e.nodePositions)) {
    const d = n.get(r);
    d && (l[d] = { x: c.x + t.x, y: c.y + t.y });
  }
  const a = [
    ...o.connections,
    ...e.connections.map((r) => ({
      from: { blockId: n.get(r.from.blockId), portId: r.from.portId },
      to: { blockId: n.get(r.to.blockId), portId: r.to.portId }
    }))
  ];
  return {
    state: { ...o, blocks: i, connections: a, positions: s, nodePositions: l },
    newRootIds: e.roots.map((r) => n.get(r)).filter(Boolean)
  };
}
class Xt extends zt {
  constructor(e = [], t) {
    super(), this._selection = /* @__PURE__ */ new Set(), this._history = [], this._future = [], this._historyCap = 100, this._logCounter = 0, this.logs = [], this._clipboard = null, Pt(e), this._state = t ? nt(t) : ht();
  }
  // ---------- State access ----------
  get state() {
    return this._state;
  }
  getBlockDef(e) {
    return z(e);
  }
  getBlock(e) {
    return this._state.blocks[e];
  }
  /** Replace state, push history, emit 'change'. */
  commit(e, t = !0) {
    e !== this._state && (t && (this._history.push(this._state), this._history.length > this._historyCap && this._history.shift(), this._future = []), this._state = e, this.emit("change", e));
  }
  setState(e) {
    this.commit(e);
  }
  reset() {
    this.commit(ht());
  }
  // ---------- Undo / redo ----------
  get canUndo() {
    return this._history.length > 0;
  }
  get canRedo() {
    return this._future.length > 0;
  }
  undo() {
    const e = this._history.pop();
    e && (this._future.push(this._state), this._state = e, this.emit("change", e));
  }
  redo() {
    const e = this._future.pop();
    e && (this._history.push(this._state), this._state = e, this.emit("change", e));
  }
  // ---------- Selection ----------
  get selection() {
    return this._selection;
  }
  select(e, t = !1) {
    if (!t) this._selection = new Set(e ? [e] : []);
    else if (e) {
      const n = new Set(this._selection);
      n.has(e) ? n.delete(e) : n.add(e), this._selection = n;
    }
    this.emit("select", this._selection);
  }
  selectMany(e) {
    this._selection = new Set(e), this.emit("select", this._selection);
  }
  /** Fire per-type lifecycle hooks (never throws into the engine). */
  fire(e, t, n = {}) {
    var l, a, r, c;
    if (!e) return;
    const i = Yt(e.type);
    if (!i) return;
    const s = { kind: t, ...n };
    try {
      t === "create" ? (l = i.onCreate) == null || l.call(i, e, this) : t === "delete" ? (a = i.onDelete) == null || a.call(i, e, this) : t === "update" && ((r = i.onUpdate) == null || r.call(i, e, this, s)), (c = i.onChange) == null || c.call(i, e, this, s);
    } catch (d) {
      this.log("error", "events", `Hook ${t} on ${e.type} threw`, d);
    }
  }
  // ---------- Block ops ----------
  createBlock(e, t) {
    const n = Dt(e);
    return n ? (this.commit(pt(this._state, n, t)), this.log("info", "engine", `Block created: ${e}`, { id: n.id }), this.fire(n, "create"), n) : (this.log("warn", "engine", `Unknown block type: ${e}`), null);
  }
  deleteBlock(e) {
    const t = this._state.blocks[e];
    this.commit(ut(this._state, e)), this._selection.delete(e), this.fire(t, "delete");
  }
  deleteBlocks(e) {
    let t = this._state;
    for (const n of e) t = ut(t, n);
    this.commit(t), this._selection = new Set([...this._selection].filter((n) => !e.includes(n)));
  }
  moveBlock(e, t, n, i = !0) {
    this.commit(ft(this._state, e, { x: t, y: n }), i);
  }
  /** Node-view geometry (independent from block-view roots). */
  moveNode(e, t, n, i = !0) {
    this.commit(Wt(this._state, e, { x: t, y: n }), i);
  }
  /** Persist a batch of node positions in ONE commit (derived layout). */
  setNodePositions(e, t = !1) {
    this.commit({ ...this._state, nodePositions: { ...this._state.nodePositions, ...e } }, t);
  }
  updateField(e, t, n) {
    var s;
    const i = (s = this._state.blocks[e]) == null ? void 0 : s.fieldValues[t];
    this.commit(Ot(this._state, e, t, n)), this.fire(this._state.blocks[e], "update", { fieldId: t, value: n, previous: i });
  }
  toggleCollapse(e) {
    const t = this._state.blocks[e];
    t && this.commit(J(this._state, e, { collapsed: !t.collapsed }));
  }
  setDisplayName(e, t) {
    this.commit(J(this._state, e, { displayName: t }));
  }
  setComment(e, t) {
    this.commit(J(this._state, e, { comment: t }));
  }
  /** Runtime status chip (workflow/QA execution feedback). Non-undoable. */
  setBadge(e, t) {
    this.commit(J(this._state, e, { badge: t }), !1);
  }
  /** DEEP duplicate: clones the block AND its whole structure
   *  (next chain + statement subtrees + internal connections). */
  duplicateBlock(e, t = { x: 34, y: 34 }) {
    if (!this._state.blocks[e]) return null;
    const { state: n, newRootId: i } = Tt(this._state, e, t);
    let s = n;
    if (!s.positions[i]) {
      const l = this._state.positions[e] ?? { x: 60, y: 60 };
      s = ft(s, i, { x: l.x + t.x, y: l.y + t.y });
    }
    return this.commit(s), this.log("info", "engine", "Deep duplicate", { source: e, copy: i }), s.blocks[i] ?? null;
  }
  createAlias(e, t) {
    const n = this._state.blocks[e];
    if (!n) return null;
    const i = n.aliasOf ? this._state.blocks[n.aliasOf] : n;
    if (!i) return null;
    const s = {
      id: `alias_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      type: i.type,
      fieldValues: {},
      collapsed: !1,
      aliasOf: i.id
    };
    return this.commit(pt(this._state, s, t)), s;
  }
  getAliasesOf(e) {
    return Object.values(this._state.blocks).filter((t) => t.aliasOf === e);
  }
  // ---------- Connections ----------
  connect(e) {
    const t = Y(this._state, e);
    return t.valid ? (this.commit(q(this._state, e)), !0) : (this.log("warn", "connect", `Refused: ${t.reason}`, e), !1);
  }
  disconnect(e) {
    this.commit(Q(this._state, e));
  }
  // ---------- Stacking ----------
  stack(e, t) {
    const n = Nt(this._state, e, t);
    return n === this._state ? !1 : (this.commit(n), !0);
  }
  insertInStatement(e, t, n) {
    const i = Rt(this._state, e, t, n);
    return i === this._state ? !1 : (this.commit(i), !0);
  }
  unstack(e) {
    this.commit(st(this._state, e));
  }
  // ---------- Inspection ----------
  blockAbove(e) {
    return Mt(this._state, e);
  }
  blockBelow(e) {
    return H(this._state, e);
  }
  statementParent(e) {
    return At(this._state, e);
  }
  descendants(e) {
    return ot(this._state, e);
  }
  connectionFrom(e, t) {
    return tt(this._state, e, t);
  }
  connectionTo(e, t) {
    return Ct(this._state, e, t);
  }
  /** Copy the selected structures (distinct roots, full subtrees). */
  copySelection() {
    var t, n;
    if (!this._selection.size) return 0;
    const e = /* @__PURE__ */ new Set();
    for (const i of this._selection) {
      let s = i, l = this.blockAbove(s) ?? ((t = this.statementParent(s)) == null ? void 0 : t.parentBlockId) ?? null;
      for (; l; )
        s = l, l = this.blockAbove(s) ?? ((n = this.statementParent(s)) == null ? void 0 : n.parentBlockId) ?? null;
      e.add(s);
    }
    return this._clipboard = qt(this._state, [...e]), this.log("info", "clipboard", `${e.size} structure(s) copiée(s)`), e.size;
  }
  /** Paste the clipboard at an offset; selects the new roots. */
  paste(e = { x: 46, y: 46 }) {
    if (!this._clipboard) return [];
    const { state: t, newRootIds: n } = Ht(this._state, this._clipboard, e);
    return this.commit(t), this.selectMany(n), this.log("info", "clipboard", `${n.length} structure(s) collée(s)`), n;
  }
  get hasClipboard() {
    return !!this._clipboard;
  }
  /** Ask views to pan/center on a block. */
  reveal(e) {
    this.emit("reveal", e);
  }
  // ---------- Serialization ----------
  serialize() {
    return JSON.stringify(this._state, null, 2);
  }
  load(e) {
    try {
      return this.commit(nt(JSON.parse(e))), !0;
    } catch (t) {
      return this.log("error", "engine", "load failed", t), !1;
    }
  }
  // ---------- Logging ----------
  log(e, t, n, i) {
    const s = { id: `log_${Date.now()}_${this._logCounter++}`, ts: Date.now(), level: e, channel: t, message: n, data: i };
    this.logs.push(s), this.logs.length > 500 && this.logs.shift(), this.emit("log", s);
  }
  clearLogs() {
    this.logs.length = 0, this.emit("log", { id: "__clear__", ts: Date.now(), level: "info", channel: "sys", message: "__clear__" });
  }
}
const j = /* @__PURE__ */ new Map();
function pe(o, e) {
  j.set(o, e);
}
function ue(o) {
  for (const [e, t] of Object.entries(o)) j.set(e, t);
}
function fe(o) {
  return j.get(o);
}
function ge() {
  j.clear();
}
function Vt(o, e, t = {}) {
  const n = {}, i = (u) => {
    const f = o.connections.find((b) => b.to.blockId === u && b.to.portId === "prev");
    return f ? f.from.portId === "next" ? { kind: "stack", id: f.from.blockId } : String(f.from.portId).startsWith("stmt:") ? { kind: "stmt", id: f.from.blockId, statementId: String(f.from.portId).slice(5) } : null : null;
  }, s = (u) => {
    var f;
    return ((f = o.connections.find((b) => b.from.blockId === u && b.from.portId === "next")) == null ? void 0 : f.to.blockId) ?? null;
  }, l = (u) => {
    const f = o.blocks[u], b = f && e(f.type);
    return (f == null ? void 0 : f.displayName) || (b == null ? void 0 : b.label) || u;
  };
  function a(u, f) {
    var b;
    return {
      state: o,
      getDef: e,
      getBlock: (y) => o.blocks[y],
      parentOf: i,
      nextOf: s,
      nameOf: l,
      meta: f && ((b = e(f)) == null ? void 0 : b.meta) || {},
      stmt: (y, x) => d(r(y, x), u + 1),
      value: (y, x) => {
        const $ = o.connections.find((P) => P.to.blockId === y && P.to.portId === `val:${x}`);
        return $ ? c($.from.blockId, u) : "";
      },
      indent: u,
      pad: () => "  ".repeat(u),
      scope: n
    };
  }
  function r(u, f) {
    const b = o.connections.find((y) => y.from.blockId === u && y.from.portId === `stmt:${f}`);
    return (b == null ? void 0 : b.to.blockId) ?? null;
  }
  function c(u, f) {
    const b = o.blocks[u];
    if (!b) return "";
    const y = b.aliasOf ? o.blocks[b.aliasOf] : b;
    if (!y) return "";
    const x = j.get(y.type), $ = a(f, y.type);
    if (x) return x(y, y.fieldValues, $);
    const P = Object.entries(y.fieldValues).map(([_, M]) => `${_}=${JSON.stringify(M)}`).join(" ");
    return `${$.pad()}/* <${y.type} ${P}> — no generator registered */`;
  }
  function d(u, f) {
    const b = [], y = /* @__PURE__ */ new Set();
    let x = u;
    for (; x && !y.has(x); ) {
      y.add(x), b.push(c(x, f));
      const $ = o.connections.find((P) => P.from.blockId === x && P.from.portId === "next" && P.to.portId === "prev");
      x = ($ == null ? void 0 : $.to.blockId) ?? null;
    }
    return b.filter(Boolean).join(`
`);
  }
  const h = new Set(o.connections.filter((u) => u.to.portId === "prev").map((u) => u.to.blockId)), p = Object.keys(o.blocks).filter((u) => !h.has(u) && !o.blocks[u].aliasOf);
  p.sort((u, f) => {
    const b = o.positions[u] ?? { x: 0, y: 0 }, y = o.positions[f] ?? { x: 0, y: 0 };
    return b.y - y.y || b.x - y.x;
  });
  const g = t.indentBase ?? 0, m = p.map((u) => d(u, g)).filter(Boolean).join(`

`);
  return [t.header, m, t.footer].filter((u) => u !== void 0 && u !== "").join(`
`);
}
class O {
  constructor(e = "div", t = "") {
    this.subs = [], this.el = document.createElement(e), t && (this.el.className = t);
  }
  mount(e) {
    return e.appendChild(this.el), this.onMount(), this.render(), this;
  }
  destroy() {
    this.subs.forEach((e) => e()), this.subs = [], this.onDestroy(), this.el.remove();
  }
  onMount() {
  }
  onDestroy() {
  }
  /** Helper: create an element with class + optional text. */
  h(e, t = "", n = "") {
    const i = document.createElement(e);
    return t && (i.className = t), n && (i.textContent = n), i;
  }
}
const X = {
  fr: {
    "tabs.blocks": "▣ Blocs",
    "tabs.nodes": "⌬ Nœuds",
    "tabs.tree": "🌲 Arbre",
    "tabs.code": "{} Code",
    "action.undo": "Annuler (Ctrl+Z)",
    "action.redo": "Rétablir",
    "action.export": "Exporter JSON",
    "action.import": "Importer JSON",
    "action.fit": "Recadrer la vue",
    "page.new": "Nouvelle page",
    "page.rename": "Renommer la page",
    "page.clone": "Cloner la page",
    "page.newAfter": "Nouvelle page après",
    "page.delete": "Supprimer",
    "page.deleteTitle": "Supprimer la page ?",
    "menu.info": "Informations",
    "menu.rename": "Renommer",
    "menu.detach": "Détacher du parent",
    "menu.duplicate": "Dupliquer",
    "menu.duplicateDeep": "Dupliquer (structure)",
    "menu.alias": "Créer un raccourci",
    "menu.collapse": "Replier",
    "menu.expand": "Déplier",
    "menu.disconnect": "Tout déconnecter",
    "menu.delete": "Supprimer",
    "modal.cancel": "Annuler",
    "modal.ok": "Valider",
    "modal.confirm": "Confirmer",
    "console.title": "console",
    "console.all": "Tout",
    "console.info": "Infos",
    "console.warn": "Avertissements",
    "console.error": "Erreurs",
    "console.clear": "Vider la console",
    "console.empty": "Aucune entrée",
    "toolbox.search": "Chercher un bloc…",
    "ws.empty": "Glisse ton premier bloc depuis la boîte à blocs ✨",
    "rename.block": "Renommer le bloc",
    "delete.node": "Supprimer ce nœud ?",
    "delete.nodeMsg": "Sa structure imbriquée sera aussi supprimée."
  },
  en: {
    "tabs.blocks": "▣ Blocks",
    "tabs.nodes": "⌬ Nodes",
    "tabs.tree": "🌲 Tree",
    "tabs.code": "{} Code",
    "action.undo": "Undo (Ctrl+Z)",
    "action.redo": "Redo",
    "action.export": "Export JSON",
    "action.import": "Import JSON",
    "action.fit": "Fit view",
    "page.new": "New page",
    "page.rename": "Rename page",
    "page.clone": "Clone page",
    "page.newAfter": "New page after",
    "page.delete": "Delete",
    "page.deleteTitle": "Delete this page?",
    "menu.info": "Details",
    "menu.rename": "Rename",
    "menu.detach": "Detach from parent",
    "menu.duplicate": "Duplicate",
    "menu.duplicateDeep": "Duplicate (structure)",
    "menu.alias": "Create shortcut",
    "menu.collapse": "Collapse",
    "menu.expand": "Expand",
    "menu.disconnect": "Disconnect all",
    "menu.delete": "Delete",
    "modal.cancel": "Cancel",
    "modal.ok": "OK",
    "modal.confirm": "Confirm",
    "console.title": "console",
    "console.all": "All",
    "console.info": "Info",
    "console.warn": "Warnings",
    "console.error": "Errors",
    "console.clear": "Clear console",
    "console.empty": "No entries",
    "toolbox.search": "Search blocks…",
    "ws.empty": "Drag your first block from the toolbox ✨",
    "rename.block": "Rename block",
    "delete.node": "Delete this node?",
    "delete.nodeMsg": "Its nested structure will be deleted too."
  }
};
let rt = "fr";
function me(o) {
  X[o] && (rt = o);
}
function ke() {
  return rt;
}
function be(o, e) {
  X[o] = { ...X[o] ?? {}, ...e };
}
function v(o) {
  var e;
  return ((e = X[rt]) == null ? void 0 : e[o]) ?? X.fr[o] ?? o;
}
const Kt = {
  flow: "#3b82f6",
  logique: "#8b5cf6",
  logic: "#8b5cf6",
  donnees: "#10b981",
  data: "#10b981",
  io: "#f59e0b",
  fonctions: "#a855f7",
  functions: "#a855f7",
  reponse: "#f472b6"
};
function W(o) {
  return o.color || Kt[o.category] || "#64748b";
}
function R(o, e) {
  const t = o.replace("#", ""), n = t.length === 3 ? t.split("").map((a) => a + a).join("") : t, i = parseInt(n.slice(0, 2), 16), s = parseInt(n.slice(2, 4), 16), l = parseInt(n.slice(4, 6), 16);
  return `rgba(${i}, ${s}, ${l}, ${e})`;
}
class at extends O {
  constructor(e, t, n) {
    super("div", "k-ctxmenu"), this.closeHandler = (i) => {
      this.el.contains(i.target) || this.destroy();
    }, this.items = e, this.el.style.left = t + "px", this.el.style.top = n + "px";
  }
  onMount() {
    setTimeout(() => document.addEventListener("mousedown", this.closeHandler), 0), requestAnimationFrame(() => {
      const e = this.el.getBoundingClientRect();
      e.right > innerWidth && (this.el.style.left = innerWidth - e.width - 8 + "px"), e.bottom > innerHeight && (this.el.style.top = innerHeight - e.height - 8 + "px");
    });
  }
  onDestroy() {
    document.removeEventListener("mousedown", this.closeHandler);
  }
  render() {
    this.el.innerHTML = "";
    for (const e of this.items) {
      if (e.separator) {
        this.el.appendChild(this.h("div", "k-ctx-sep"));
        continue;
      }
      if (e.heading) {
        this.el.appendChild(this.h("div", "k-ctx-head", e.label));
        continue;
      }
      const t = this.h("button", `k-ctx-item${e.danger ? " k-danger" : ""}`);
      e.icon && t.appendChild(this.h("span", "k-ctx-icon", e.icon)), t.appendChild(this.h("span", "k-ctx-label", e.label)), e.shortcut && t.appendChild(this.h("span", "k-ctx-short", e.shortcut)), t.addEventListener("click", () => {
        var n;
        (n = e.onClick) == null || n.call(e), this.destroy();
      }), this.el.appendChild(t);
    }
  }
}
class lt extends O {
  constructor(e) {
    super("div", "k-modal-overlay"), this.activeTab = 0, this.keyHandler = (t) => {
      t.key === "Escape" && this.close();
    }, this.opts = e, this.el.addEventListener("mousedown", (t) => {
      t.target === this.el && this.close();
    });
  }
  onMount() {
    document.addEventListener("keydown", this.keyHandler);
  }
  onDestroy() {
    document.removeEventListener("keydown", this.keyHandler);
  }
  close() {
    var e, t;
    (t = (e = this.opts).onClose) == null || t.call(e), this.destroy();
  }
  render() {
    var i, s;
    this.el.innerHTML = "";
    const e = this.h("div", "k-modal");
    this.opts.width && (e.style.width = this.opts.width + "px");
    const t = this.h("div", "k-modal-head");
    this.opts.icon && t.appendChild(this.h("span", "k-modal-icon", this.opts.icon)), t.appendChild(this.h("span", "k-modal-title", this.opts.title));
    const n = this.h("button", "k-modal-x", "×");
    if (n.addEventListener("click", () => this.close()), t.appendChild(n), e.appendChild(t), (i = this.opts.tabs) != null && i.length) {
      const l = this.h("div", "k-modal-tabs");
      this.opts.tabs.forEach((r, c) => {
        const d = this.h("button", `k-modal-tab${c === this.activeTab ? " active" : ""}`, r.label);
        d.addEventListener("click", () => {
          this.activeTab = c, this.render();
        }), l.appendChild(d);
      }), e.appendChild(l);
      const a = this.h("div", "k-modal-body");
      a.appendChild(this.opts.tabs[this.activeTab].content), e.appendChild(a);
    } else if (this.opts.body) {
      const l = this.h("div", "k-modal-body");
      l.appendChild(this.opts.body), e.appendChild(l);
    }
    if ((s = this.opts.actions) != null && s.length) {
      const l = this.h("div", "k-modal-actions");
      for (const a of this.opts.actions) {
        const r = this.h("button", `k-modal-btn${a.primary ? " primary" : ""}${a.danger ? " danger" : ""}`, a.label);
        r.addEventListener("click", a.onClick), l.appendChild(r);
      }
      e.appendChild(l);
    }
    this.el.appendChild(e);
  }
}
function ct(o) {
  return new Promise((e) => {
    const t = document.createElement("input");
    t.className = "k-modal-input", t.value = o.defaultValue ?? "", o.placeholder && (t.placeholder = o.placeholder);
    const n = document.createElement("div");
    n.appendChild(t);
    let i = !1;
    const s = (a) => {
      i || (i = !0, e(a), l.destroy());
    }, l = new lt({
      title: o.title,
      icon: o.icon ?? "✎",
      body: n,
      width: 380,
      actions: [
        { label: v("modal.cancel"), onClick: () => s(null) },
        { label: v("modal.ok"), primary: !0, onClick: () => s(t.value) }
      ],
      onClose: () => s(null)
    });
    l.mount(document.body), t.addEventListener("keydown", (a) => {
      a.key === "Enter" && s(t.value), a.stopPropagation();
    }), setTimeout(() => {
      t.focus(), t.select();
    }, 30);
  });
}
function Et(o) {
  return new Promise((e) => {
    const t = document.createElement("div");
    t.className = "k-modal-msg", t.textContent = o.message ?? "";
    let n = !1;
    const i = (l) => {
      n || (n = !0, e(l), s.destroy());
    }, s = new lt({
      title: o.title,
      icon: o.icon ?? (o.danger ? "⚠" : "?"),
      body: t,
      width: 380,
      actions: [
        { label: v("modal.cancel"), onClick: () => i(!1) },
        { label: o.confirmLabel ?? v("modal.confirm"), primary: !o.danger, danger: o.danger, onClick: () => i(!0) }
      ],
      onClose: () => i(!1)
    });
    s.mount(document.body);
  });
}
const w = (o, e = "", t = "") => {
  const n = document.createElement(o);
  return e && (n.className = e), t && (n.textContent = t), n;
};
function V(o, e) {
  var L, S, B, D;
  const t = o.getBlock(e);
  if (!t) return;
  const n = t.aliasOf ? o.getBlock(t.aliasOf) : t, i = o.getBlockDef((n ?? t).type);
  let s;
  const l = (k) => {
    var E;
    const C = o.getBlock(k), I = C && o.getBlockDef(C.aliasOf ? ((E = o.getBlock(C.aliasOf)) == null ? void 0 : E.type) ?? C.type : C.type);
    return (C == null ? void 0 : C.displayName) || (I == null ? void 0 : I.label) || k;
  }, a = (k) => {
    const C = o.getBlock(k), I = C && o.getBlockDef(C.type), E = w("button", "k-info-link");
    return E.append(w("span", "k-info-link-icn", (I == null ? void 0 : I.icon) ?? "▫"), w("span", "", l(k))), E.title = k, E.addEventListener("click", () => {
      o.select(k), o.reveal(k), s.destroy();
    }), E;
  }, r = (k, C) => {
    const I = w("div", "k-info-row");
    I.appendChild(w("span", "k-info-k", k));
    const E = w("span", "k-info-v");
    return typeof C == "string" ? E.textContent = C || "—" : Array.isArray(C) ? C.forEach((F, Bt) => {
      Bt && E.appendChild(w("span", "k-info-sep", " → ")), E.appendChild(F);
    }) : E.appendChild(C), I.appendChild(E), I;
  }, c = (k) => {
    const C = w("span", "k-info-chips");
    for (const I of k) {
      const E = o.getBlockDef(I);
      C.appendChild(w("span", "k-info-chip", `${(E == null ? void 0 : E.icon) ?? ""} ${(E == null ? void 0 : E.label) ?? I}`.trim()));
    }
    return C;
  }, d = w("div");
  d.append(
    r("Nom", t.displayName || (i == null ? void 0 : i.label) || ""),
    r("Type", t.type),
    r("ID", t.id),
    r("Catégorie", (i == null ? void 0 : i.category) ?? ""),
    r("Sous-titre", (i == null ? void 0 : i.subtitle) ?? "")
  ), t.aliasOf && d.append(r("Raccourci de", a(t.aliasOf)));
  const h = o.getAliasesOf(t.id);
  h.length && d.append(r("Raccourcis", h.map((k) => a(k.id)))), t.comment && d.append(r("Commentaire", t.comment));
  const p = w("div"), g = (i == null ? void 0 : i.fields) ?? [];
  g.length || p.appendChild(w("div", "k-info-empty", "Aucun champ"));
  for (const k of g) {
    const C = (n ?? t).fieldValues[k.id] ?? k.defaultValue;
    p.appendChild(r(`${k.label || k.id} · ${k.type}`, String(C ?? "")));
  }
  const m = w("div"), u = o.state.connections.filter((k) => k.to.blockId === e), f = o.state.connections.filter((k) => k.from.blockId === e);
  m.appendChild(w("div", "k-info-sub", `Entrantes (${u.length})`)), u.length || m.appendChild(w("div", "k-info-empty", "—"));
  for (const k of u) m.appendChild(r(`⟵ ${k.to.portId}`, [a(k.from.blockId), w("span", "k-info-port", String(k.from.portId))]));
  m.appendChild(w("div", "k-info-sub", `Sortantes (${f.length})`)), f.length || m.appendChild(w("div", "k-info-empty", "—"));
  for (const k of f) m.appendChild(r(`${k.from.portId} ⟶`, [a(k.to.blockId), w("span", "k-info-port", String(k.to.portId))]));
  const b = w("div"), y = o.blockAbove(e), x = o.statementParent(e);
  b.appendChild(w("div", "k-info-sub", "Parent")), y ? b.appendChild(r("Empilé sous", a(y))) : x ? b.appendChild(r(`Dans « ${x.statementId} » de`, a(x.parentBlockId))) : b.appendChild(w("div", "k-info-empty", "Racine (aucun parent)")), b.appendChild(w("div", "k-info-sub", "Enfants"));
  const $ = o.blockBelow(e);
  let P = !1;
  $ && (b.appendChild(r("Bloc suivant", a($))), P = !0);
  for (const k of (i == null ? void 0 : i.statements) ?? []) {
    const C = o.connectionFrom(e, `stmt:${k.id}`);
    if (C) {
      const I = [];
      let E = C.to.blockId;
      const F = /* @__PURE__ */ new Set();
      for (; E && !F.has(E); )
        F.add(E), I.push(a(E)), E = o.blockBelow(E);
      b.appendChild(r(`Ventre « ${k.label ?? k.id} »`, I)), P = !0;
    }
  }
  P || b.appendChild(w("div", "k-info-empty", "Aucun enfant"));
  const _ = w("div"), M = (k, C) => {
    const I = w("div");
    return k === !1 ? I.appendChild(w("span", "k-info-forbid", C === "prev" ? "⛔ Aucun bloc au-dessus (racine)" : "⛔ Aucun bloc en dessous (terminal)")) : k === void 0 || k === !0 ? I.appendChild(w("span", "k-info-free", "✓ Libre — tout type accepté")) : (k.allow && (I.appendChild(w("div", "k-info-free", "Autorise uniquement :")), I.appendChild(c(k.allow))), k.deny && (I.appendChild(w("div", "k-info-forbid", "Refuse :")), I.appendChild(c(k.deny)))), I;
  };
  _.appendChild(w("div", "k-info-sub", "Au-dessus (previous)")), _.appendChild(M((L = i == null ? void 0 : i.flow) == null ? void 0 : L.previous, "prev")), _.appendChild(w("div", "k-info-sub", "En dessous (next)")), _.appendChild(M((S = i == null ? void 0 : i.flow) == null ? void 0 : S.next, "next"));
  for (const k of (i == null ? void 0 : i.statements) ?? [])
    _.appendChild(w("div", "k-info-sub", `Slot « ${k.label ?? k.id} »`)), !k.allow && !k.deny && _.appendChild(w("span", "k-info-free", "✓ Libre")), k.allow && (_.appendChild(w("div", "k-info-free", "Autorise uniquement :")), _.appendChild(c(k.allow))), k.deny && (_.appendChild(w("div", "k-info-forbid", "Refuse :")), _.appendChild(c(k.deny)));
  !((i == null ? void 0 : i.statements) ?? []).length && ((B = i == null ? void 0 : i.flow) == null ? void 0 : B.previous) === void 0 && ((D = i == null ? void 0 : i.flow) == null || D.next), s = new lt({
    title: t.displayName || (i == null ? void 0 : i.label) || t.type,
    icon: (i == null ? void 0 : i.icon) ?? "ℹ",
    width: 480,
    tabs: [
      { id: "gen", label: "Général", content: d },
      { id: "fields", label: `Champs (${g.length})`, content: p },
      { id: "conns", label: `Connexions (${u.length + f.length})`, content: m },
      { id: "hier", label: "Hiérarchie", content: b },
      { id: "rules", label: "Règles", content: _ }
    ]
  }), s.mount(document.body);
}
const jt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  openBlockInfo: V
}, Symbol.toStringTag, { value: "Module" })), gt = (o, e = "", t = "") => {
  const n = document.createElement(o);
  return e && (n.className = e), t && (n.textContent = t), n;
}, A = /* @__PURE__ */ new Map();
let Lt = "aurora";
function It(o) {
  A.set(o.id, o);
}
function ye(o) {
  return A.get(o);
}
function Ft() {
  return [...A.values()];
}
function N() {
  return A.get(Lt) ?? A.values().next().value;
}
function mt(o) {
  A.has(o) && (Lt = o, Jt(A.get(o)));
}
function Jt(o) {
  if (document.querySelectorAll("style[data-kanto-tpl]").forEach((e) => e.remove()), o.css) {
    const e = document.createElement("style");
    e.setAttribute("data-kanto-tpl", o.id), e.textContent = o.css, document.head.appendChild(e);
  }
}
It({
  id: "aurora",
  label: "Aurora",
  className: "k-tpl-aurora",
  consoleTabs: [
    { id: "all", label: "Tout", level: "all" },
    { id: "warn", label: "Avertissements", level: "warn" },
    { id: "err", label: "Erreurs", level: "error" }
  ],
  css: `
.k-tpl-aurora .k-bhead { background: linear-gradient(160deg, var(--bc-h), color-mix(in srgb, var(--bc-h) 72%, transparent)); }
.k-tpl-aurora .k-block.k-selected, .k-tpl-aurora .k-node.k-selected { box-shadow: 0 0 0 2px var(--k-accent), 0 0 22px color-mix(in srgb, var(--k-accent) 45%, transparent); }
.k-tpl-aurora .k-wire-flow { filter: drop-shadow(0 0 5px currentColor); }
`
});
It({
  id: "carbon",
  label: "Carbon",
  className: "k-tpl-carbon",
  consoleTabs: [
    { id: "all", label: "Console", level: "all" },
    { id: "engine", label: "Moteur", channels: ["engine", "connect"] },
    { id: "err", label: "Erreurs", level: "error" }
  ],
  block: {
    header: (o, e, { h: t }) => {
      const n = t("div", "k-bhead k-carbon-head");
      n.appendChild(t("span", "k-carbon-rail")), o.icon && n.appendChild(t("span", "k-bicon", o.icon));
      const i = t("div", "k-btext");
      return i.appendChild(t("div", "k-btitle", e.displayName || o.label)), n.appendChild(i), n;
    }
  },
  css: `
.k-tpl-carbon { --k-bg0:#f4f6f9; --k-bg1:#ffffff; --k-bg2:#eef1f5; --k-bg3:#e3e8ef;
  --k-line:#d5dce6; --k-line2:#c0c9d6; --k-t0:#17202c; --k-t1:#3d4a5c; --k-t2:#7b8794;
  --k-accent:#2563eb; --k-snap-stack:#2563eb; --k-snap-stmt:#d97706; }
.k-tpl-carbon .k-grid { background-image: radial-gradient(circle, rgba(0,0,0,.09) 1px, transparent 1px); }
.k-tpl-carbon .k-block, .k-tpl-carbon .k-node { box-shadow: 0 1px 3px rgba(15,23,42,.14); border-radius:5px; }
.k-tpl-carbon .k-bhead { background: var(--k-bg1); border-bottom: 1px solid var(--k-line); border-radius:5px 5px 0 0; }
.k-tpl-carbon .k-btitle { color: var(--k-t0); }
.k-tpl-carbon .k-bsub { color: var(--k-t2); }
.k-tpl-carbon .k-carbon-rail { width:5px; align-self:stretch; background:var(--bc); border-radius:3px; margin-right:2px; }
.k-tpl-carbon .k-fields { background: var(--k-bg2); }
.k-tpl-carbon .k-finput, .k-tpl-carbon .k-fselect { background:#fff; color:var(--k-t0); }
.k-tpl-carbon .k-stmt-leg { background: var(--bc); opacity:.85; }
.k-tpl-carbon .k-bfoot { background: var(--k-bg1); border:1px solid var(--k-line); border-top:none; }
.k-tpl-carbon .k-chain i { background:#fff; }
.k-tpl-carbon .k-nhead { background: var(--k-bg1); border-bottom:1px solid var(--k-line); }
.k-tpl-carbon .k-ntitle { color: var(--k-t0); }
.k-tpl-carbon .k-nbody { background: var(--k-bg2); }
.k-tpl-carbon .k-nrow .k-nval { color: var(--k-t0); }
.k-tpl-carbon .k-node { background:#fff; }
.k-tpl-carbon .k-cv-pre { color:#166534; }
.k-tpl-carbon .k-block[data-prev]::before { background: var(--k-bg0); border-color: var(--k-line2); }
`
});
const kt = 80, bt = 40;
class Gt extends O {
  constructor(e) {
    super("div", "k-workspace"), this.pan = { x: 60, y: 50 }, this.zoom = 1, this.menu = null, this.engine = e.engine, this.readOnly = !!e.readOnly, this.buildDom();
  }
  buildDom() {
    this.el.innerHTML = "";
    const e = this.h("div", "k-grid");
    this.layer = this.h("div", "k-layer"), this.wires = document.createElementNS("http://www.w3.org/2000/svg", "svg"), this.wires.setAttribute("class", "k-wires"), this.layer.appendChild(this.wires), this.el.append(e, this.layer), this.el.tabIndex = 0, this.el.addEventListener("mousedown", (t) => {
      if (!t.target.closest(".k-block")) {
        if (t.button === 0 && (t.ctrlKey || t.metaKey)) {
          this.startRubberBand(t);
          return;
        }
        if (t.button === 0 || t.button === 1) {
          this.engine.select(null), this.startPan(t);
          return;
        }
      }
    }), this.el.addEventListener("wheel", (t) => {
      t.preventDefault();
      const n = t.deltaY > 0 ? 1 / 1.1 : 1.1, i = this.el.getBoundingClientRect(), s = t.clientX - i.left, l = t.clientY - i.top, a = (s - this.pan.x) / this.zoom, r = (l - this.pan.y) / this.zoom;
      this.zoom = Math.min(2.5, Math.max(0.25, this.zoom * n)), this.pan = { x: s - a * this.zoom, y: l - r * this.zoom }, this.applyTransform();
    }, { passive: !1 }), this.el.addEventListener("keydown", (t) => {
      if (!this.readOnly) {
        if (t.key === "Delete" || t.key === "Backspace") {
          const n = [...this.engine.selection];
          n.length && !t.target.matches("input,textarea,select") && (t.preventDefault(), this.engine.deleteBlocks(n));
        }
        (t.ctrlKey || t.metaKey) && t.key === "z" && (t.preventDefault(), t.shiftKey ? this.engine.redo() : this.engine.undo()), (t.ctrlKey || t.metaKey) && t.key === "c" && !t.target.matches("input,textarea,select") && (t.preventDefault(), this.engine.copySelection()), (t.ctrlKey || t.metaKey) && t.key === "v" && !t.target.matches("input,textarea,select") && (t.preventDefault(), this.engine.paste());
      }
    });
  }
  /** Center the view on a block (reveal navigation). */
  centerOn(e) {
    const t = this.layer.querySelector(`.k-block[data-block-id="${e}"]`);
    if (!t) return;
    const n = t.getBoundingClientRect(), i = this.el.getBoundingClientRect();
    this.pan.x += i.left + i.width / 2 - (n.left + n.width / 2), this.pan.y += i.top + i.height / 2 - (n.top + n.height / 2), this.applyTransform(), this.drawWires();
  }
  /** Fit all structures in view with a margin. */
  fit() {
    const e = [...this.layer.querySelectorAll(".k-stackroot")];
    if (!e.length) return;
    let t = 1 / 0, n = 1 / 0, i = -1 / 0, s = -1 / 0;
    for (const c of e) {
      const d = parseFloat(c.style.left) || 0, h = parseFloat(c.style.top) || 0, p = c.getBoundingClientRect();
      t = Math.min(t, d), n = Math.min(n, h), i = Math.max(i, d + p.width / this.zoom), s = Math.max(s, h + p.height / this.zoom);
    }
    const l = this.el.getBoundingClientRect(), a = 60, r = Math.min(2.5, Math.max(0.25, Math.min((l.width - a * 2) / (i - t), (l.height - a * 2) / (s - n))));
    this.zoom = Math.min(r, 1.4), this.pan.x = a + (l.width - a * 2 - (i - t) * this.zoom) / 2 - t * this.zoom, this.pan.y = a + (l.height - a * 2 - (s - n) * this.zoom) / 2 - n * this.zoom, this.applyTransform(), this.drawWires();
  }
  startPan(e) {
    const t = { x: e.clientX - this.pan.x, y: e.clientY - this.pan.y }, n = (s) => {
      this.pan = { x: s.clientX - t.x, y: s.clientY - t.y }, this.applyTransform(), this.drawWires();
    }, i = () => {
      window.removeEventListener("mousemove", n), window.removeEventListener("mouseup", i);
    };
    window.addEventListener("mousemove", n), window.addEventListener("mouseup", i);
  }
  /** Rectangle multi-select on background drag. */
  startRubberBand(e) {
    const t = this.el.getBoundingClientRect(), n = { x: e.clientX, y: e.clientY }, i = this.h("div", "k-rubber");
    this.el.appendChild(i);
    let s = !1;
    const l = (r) => {
      s = !0;
      const c = Math.min(n.x, r.clientX) - t.left, d = Math.min(n.y, r.clientY) - t.top, h = Math.abs(r.clientX - n.x), p = Math.abs(r.clientY - n.y);
      Object.assign(i.style, { left: c + "px", top: d + "px", width: h + "px", height: p + "px" });
    }, a = (r) => {
      if (window.removeEventListener("mousemove", l), window.removeEventListener("mouseup", a), i.remove(), !s) {
        this.engine.select(null);
        return;
      }
      const c = {
        left: Math.min(n.x, r.clientX),
        right: Math.max(n.x, r.clientX),
        top: Math.min(n.y, r.clientY),
        bottom: Math.max(n.y, r.clientY)
      }, d = [];
      this.layer.querySelectorAll(".k-block").forEach((h) => {
        const p = h.getBoundingClientRect();
        p.right > c.left && p.left < c.right && p.bottom > c.top && p.top < c.bottom && d.push(h.dataset.blockId);
      }), d.length ? this.engine.selectMany(d) : this.engine.select(null);
    };
    window.addEventListener("mousemove", l), window.addEventListener("mouseup", a);
  }
  onMount() {
    this.subs.push(this.engine.on("change", () => this.render())), this.subs.push(this.engine.on("select", () => this.paintSelection())), this.subs.push(this.engine.on("reveal", (e) => this.centerOn(e))), this.applyTransform();
  }
  applyTransform() {
    this.layer.style.transform = `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
    const e = this.el.querySelector(".k-grid");
    e && (e.style.backgroundPosition = `${this.pan.x}px ${this.pan.y}px`, e.style.backgroundSize = `${22 * this.zoom}px ${22 * this.zoom}px`);
  }
  /** Workspace coords from a screen point. */
  toWorkspace(e, t) {
    const n = this.el.getBoundingClientRect();
    return { x: (e - n.left - this.pan.x) / this.zoom, y: (t - n.top - this.pan.y) / this.zoom };
  }
  /** Drop a new block from toolbox at screen coords. */
  dropNewBlock(e, t, n) {
    const i = this.toWorkspace(t, n), s = this.engine.createBlock(e, i);
    if (s) {
      const l = this.findSnapAt(s.id, i.x, i.y);
      this.applySnap(s.id, l), this.engine.select(s.id);
    }
  }
  // ---------- Rendering ----------
  render() {
    var i;
    this.layer.querySelectorAll(".k-stackroot").forEach((s) => s.remove());
    const e = this.engine.state, t = new Set(e.connections.filter((s) => s.to.portId === "prev").map((s) => s.to.blockId)), n = Object.values(e.blocks).filter((s) => !t.has(s.id));
    if ((i = this.el.querySelector(".k-empty")) == null || i.remove(), !n.length) {
      const s = this.h("div", "k-empty");
      s.appendChild(this.h("div", "k-empty-icn", "◇")), s.appendChild(this.h("div", "k-empty-txt", v("ws.empty"))), this.el.appendChild(s);
    }
    for (const s of n) {
      const l = e.positions[s.id] ?? { x: 40, y: 40 }, a = this.h("div", "k-stackroot");
      a.style.left = l.x + "px", a.style.top = l.y + "px", this.renderChain(s.id, a), this.layer.appendChild(a);
    }
    this.paintSelection(), requestAnimationFrame(() => this.drawWires());
  }
  /** Render a next-chain vertically inside container. */
  renderChain(e, t) {
    let n = e;
    const i = /* @__PURE__ */ new Set();
    let s = !0;
    for (; n && !i.has(n); ) {
      i.add(n);
      const l = this.engine.getBlock(n);
      if (!l) break;
      const a = this.engine.getBlockDef(l.type);
      if (a) {
        if (!s) {
          const r = this.h("div", "k-chain");
          r.append(this.h("i", "k-chain-l"));
          const c = W(a);
          r.style.setProperty("--bc", c), t.appendChild(r);
        }
        t.appendChild(this.renderBlock(a, l)), s = !1;
      }
      n = this.engine.blockBelow(n);
    }
  }
  renderBlock(e, t) {
    var c, d, h, p;
    const n = !!t.aliasOf, i = n ? this.engine.getBlock(t.aliasOf) : t, s = i ? this.engine.getBlockDef(i.type) ?? e : e, l = i ?? t, a = W(s), r = this.h("div", `k-block${n ? " k-alias" : ""}${t.collapsed ? " k-collapsed" : ""}`);
    if (r.dataset.blockId = t.id, r.style.setProperty("--bc", a), r.style.setProperty("--bc-h", R(a, s.headerOpacity ?? 0.88)), r.style.setProperty("--bc-b", R(a, s.bodyOpacity ?? 0.16)), r.style.setProperty("--bc-br", R(a, s.borderOpacity ?? 0.65)), ((c = s.flow) == null ? void 0 : c.previous) !== !1 && (r.dataset.prev = "1"), ((d = s.flow) == null ? void 0 : d.next) !== !1 && (r.dataset.next = "1"), (s.statements ?? []).length && !t.collapsed && r.classList.add("k-cshape"), r.appendChild(this.renderBlockHeader(s, t, n)), !t.collapsed) {
      const g = (s.fields ?? []).filter((m) => m.visible !== !1);
      if (g.length) {
        const m = this.h("div", "k-fields");
        for (const u of g) m.appendChild(this.renderField(s, u, l));
        r.appendChild(m);
      }
      for (const m of s.statements ?? []) {
        const u = this.h("div", "k-stmt");
        u.dataset.stmtId = m.id, u.dataset.parentId = t.id, u.appendChild(this.h("div", "k-stmt-label", m.label ?? m.id));
        const f = this.h("div", "k-stmt-row");
        f.appendChild(this.h("div", "k-stmt-leg"));
        const b = this.h("div", "k-stmt-slot"), y = this.engine.state.connections.find(
          (x) => x.from.blockId === t.id && x.from.portId === `stmt:${m.id}`
        );
        y ? this.renderChain(y.to.blockId, b) : b.appendChild(this.h("div", "k-stmt-empty", m.placeholder ?? "glisser un bloc ici")), f.appendChild(b), u.appendChild(f), r.appendChild(u);
      }
      (s.statements ?? []).length && r.appendChild(this.h("div", "k-bfoot"));
    }
    return (h = s.hooks) != null && h.left && r.appendChild(this.portDot(t.id, "hookLeft", "left")), (p = s.hooks) != null && p.right && r.appendChild(this.portDot(t.id, "hookRight", "right")), this.readOnly || this.wireBlockEvents(r, t), r;
  }
  /** OVERRIDE POINT — the block title bar. Template hook wins if set. */
  renderBlockHeader(e, t, n) {
    var a;
    const i = (a = N().block) == null ? void 0 : a.header;
    if (i) {
      const r = i(e, t, { h: gt });
      if (e.collapsible !== !1 && !r.querySelector(".k-chev")) {
        const c = this.h("button", "k-chev", t.collapsed ? "▸" : "▾");
        c.addEventListener("mousedown", (d) => d.stopPropagation()), c.addEventListener("click", (d) => {
          d.stopPropagation(), this.engine.toggleCollapse(t.id);
        }), r.appendChild(c);
      }
      return r;
    }
    const s = this.h("div", "k-bhead");
    e.icon && s.appendChild(this.h("span", "k-bicon", e.icon));
    const l = this.h("div", "k-btext");
    if (l.appendChild(this.h("div", "k-btitle", (n ? "⇲ " : "") + (t.displayName || e.label))), e.subtitle && l.appendChild(this.h("div", "k-bsub", e.subtitle)), s.appendChild(l), t.badge) {
      const r = this.h("span", "k-badge", t.badge.text);
      t.badge.color && (r.style.background = t.badge.color), s.appendChild(r);
    }
    if (e.collapsible !== !1) {
      const r = this.h("button", "k-chev", t.collapsed ? "▸" : "▾");
      r.addEventListener("mousedown", (c) => c.stopPropagation()), r.addEventListener("click", (c) => {
        c.stopPropagation(), this.engine.toggleCollapse(t.id);
      }), s.appendChild(r);
    }
    return s;
  }
  /** OVERRIDE POINT — one field row. */
  renderField(e, t, n) {
    const i = this.h("div", "k-frow");
    t.label && i.appendChild(this.h("span", "k-flabel", t.label));
    const s = n.fieldValues[t.id] ?? t.defaultValue, l = $t(t.type);
    if (l)
      return i.appendChild(l({
        def: e,
        field: t,
        block: n,
        value: s,
        onChange: (r) => this.engine.updateField(n.id, t.id, r),
        h: gt
      })), i;
    if (t.type === "label" || t.type === "badge" || t.type === "tag")
      return i.appendChild(this.h("span", `k-f${t.type}`, String(s ?? ""))), i;
    if (t.type === "dropdown" && t.options) {
      const r = this.h("select", "k-fselect");
      for (const [c, d] of t.options) {
        const h = document.createElement("option");
        h.textContent = c, h.value = String(d), d === s && (h.selected = !0), r.appendChild(h);
      }
      return r.addEventListener("mousedown", (c) => c.stopPropagation()), r.addEventListener("change", () => {
        const c = t.options.find(([, d]) => String(d) === r.value);
        this.engine.updateField(n.id, t.id, c ? c[1] : r.value);
      }), i.appendChild(r), i;
    }
    if (t.type === "checkbox" || t.type === "toggle") {
      const r = this.h("input", "k-fcheck");
      return r.type = "checkbox", r.checked = !!s, r.addEventListener("mousedown", (c) => c.stopPropagation()), r.addEventListener("change", () => this.engine.updateField(n.id, t.id, r.checked)), i.appendChild(r), i;
    }
    const a = this.h("input", "k-finput");
    return a.type = t.type === "number" ? "number" : "text", a.value = String(s ?? ""), t.placeholder && (a.placeholder = t.placeholder), a.addEventListener("mousedown", (r) => r.stopPropagation()), a.addEventListener("change", () => this.engine.updateField(n.id, t.id, t.type === "number" ? Number(a.value) : a.value)), i.appendChild(a), i;
  }
  portDot(e, t, n) {
    const i = this.h("span", `k-port k-port-${n}`);
    return i.dataset.portBlock = e, i.dataset.portId = t, i.title = t, this.readOnly || i.addEventListener("mousedown", (s) => {
      s.stopPropagation(), s.preventDefault(), this.startHookDrag(e, t, s);
    }), i;
  }
  /** Drag from a hook port to another hook port (block view). */
  startHookDrag(e, t, n) {
    const i = document.createElementNS("http://www.w3.org/2000/svg", "path");
    i.setAttribute("class", "k-wire-hook k-wire-hookdrag"), this.wires.appendChild(i);
    const s = this.el.getBoundingClientRect(), l = (d, h) => ({
      x: (d - s.left - this.pan.x) / this.zoom,
      y: (h - s.top - this.pan.y) / this.zoom
    }), a = l(n.clientX, n.clientY), r = (d) => {
      const h = l(d.clientX, d.clientY);
      i.setAttribute("d", `M ${a.x} ${a.y} L ${h.x} ${h.y}`), this.el.querySelectorAll(".k-port-hot").forEach((g) => g.classList.remove("k-port-hot"));
      const p = this.nearestHookPort(d.clientX, d.clientY, e);
      p == null || p.classList.add("k-port-hot");
    }, c = (d) => {
      window.removeEventListener("mousemove", r), window.removeEventListener("mouseup", c), i.remove(), this.el.querySelectorAll(".k-port-hot").forEach((p) => p.classList.remove("k-port-hot"));
      const h = this.nearestHookPort(d.clientX, d.clientY, e);
      h && (this.engine.connect({ from: { blockId: e, portId: t }, to: { blockId: h.dataset.portBlock, portId: h.dataset.portId } }) || this.engine.connect({ from: { blockId: h.dataset.portBlock, portId: h.dataset.portId }, to: { blockId: e, portId: t } }));
    };
    window.addEventListener("mousemove", r), window.addEventListener("mouseup", c);
  }
  nearestHookPort(e, t, n) {
    let i = null;
    return this.el.querySelectorAll(".k-port").forEach((s) => {
      const l = s;
      if (l.dataset.portBlock === n) return;
      const a = l.getBoundingClientRect(), r = Math.hypot(e - (a.left + a.width / 2), t - (a.top + a.height / 2));
      r < 30 && (!i || r < i.d) && (i = { el: l, d: r });
    }), i ? i.el : null;
  }
  // ---------- Interactions ----------
  wireBlockEvents(e, t) {
    e.addEventListener("mousedown", (n) => {
      if (n.button !== 0 || n.target.matches("input,select,button") || n.target.closest(".k-block") !== e) return;
      n.stopPropagation();
      const i = this.engine.selection.has(t.id);
      if (n.ctrlKey || n.metaKey) {
        this.engine.select(t.id, !0);
        return;
      }
      if (i || this.engine.select(t.id), this.engine.selection.size > 1 && this.engine.selection.has(t.id)) {
        this.startGroupDrag(t.id, n);
        return;
      }
      const s = !!n.target.closest(".k-bhead"), l = this.rootOf(t.id);
      s || l === t.id ? this.startBlockDrag(t.id, n) : this.startStructureDrag(l, n);
    }), e.addEventListener("dblclick", (n) => {
      n.target.matches("input,select,button") || n.target.closest(".k-block") === e && (n.stopPropagation(), V(this.engine, t.id));
    }), e.addEventListener("contextmenu", (n) => {
      n.target.closest(".k-block") === e && (n.preventDefault(), n.stopPropagation(), this.openBlockMenu(t.id, n.clientX, n.clientY));
    });
  }
  /** Climb stack/statement parents up to the structure ROOT. */
  rootOf(e) {
    var i, s;
    let t = e, n = this.engine.blockAbove(t) ?? ((i = this.engine.statementParent(t)) == null ? void 0 : i.parentBlockId) ?? null;
    for (; n; )
      t = n, n = this.engine.blockAbove(t) ?? ((s = this.engine.statementParent(t)) == null ? void 0 : s.parentBlockId) ?? null;
    return t;
  }
  /** Move every SELECTED STACK ROOT by the same delta (no snapping). */
  startGroupDrag(e, t) {
    var r, c;
    const n = this.toWorkspace(t.clientX, t.clientY), i = /* @__PURE__ */ new Set();
    for (const d of this.engine.selection) {
      let h = d, p = this.engine.blockAbove(h) ?? ((r = this.engine.statementParent(h)) == null ? void 0 : r.parentBlockId) ?? null;
      for (; p; )
        h = p, p = this.engine.blockAbove(h) ?? ((c = this.engine.statementParent(h)) == null ? void 0 : c.parentBlockId) ?? null;
      i.add(h);
    }
    const s = /* @__PURE__ */ new Map();
    for (const d of i) s.set(d, this.engine.state.positions[d] ?? { x: 40, y: 40 });
    const l = (d) => {
      const h = this.toWorkspace(d.clientX, d.clientY), p = h.x - n.x, g = h.y - n.y;
      for (const [m, u] of s) {
        this.engine.moveBlock(m, u.x + p, u.y + g, !1);
        const f = this.rootElOf(m);
        f && (f.style.left = u.x + p + "px", f.style.top = u.y + g + "px");
      }
      this.drawWires();
    }, a = (d) => {
      window.removeEventListener("mousemove", l), window.removeEventListener("mouseup", a);
      const h = this.toWorkspace(d.clientX, d.clientY), p = h.x - n.x, g = h.y - n.y;
      for (const [m, u] of s) this.engine.moveBlock(m, u.x + p, u.y + g, !0);
      this.render();
    };
    window.addEventListener("mousemove", l), window.addEventListener("mouseup", a);
  }
  /** Drag the WHOLE structure by its root — never detaches anything. */
  startStructureDrag(e, t) {
    const n = this.toWorkspace(t.clientX, t.clientY), i = this.engine.state.positions[e] ?? this.absolutePositionOf(e);
    let s = !1;
    const l = (r) => {
      const c = this.toWorkspace(r.clientX, r.clientY), d = c.x - n.x, h = c.y - n.y;
      if (!s && Math.hypot(d, h) < 4) return;
      s = !0, this.engine.moveBlock(e, i.x + d, i.y + h, !1);
      const p = this.rootElOf(e);
      p && (p.style.left = i.x + d + "px", p.style.top = i.y + h + "px"), this.clearSnapHighlight();
      const g = this.findSnapAt(e, i.x + d, i.y + h);
      g && this.highlightSnap(g), this.drawWires();
    }, a = (r) => {
      if (window.removeEventListener("mousemove", l), window.removeEventListener("mouseup", a), this.clearSnapHighlight(), !s) return;
      const c = this.toWorkspace(r.clientX, r.clientY), d = this.findSnapAt(e, i.x + (c.x - n.x), i.y + (c.y - n.y));
      this.applySnap(e, d);
      const h = this.engine.state.positions[e];
      h && this.engine.moveBlock(e, h.x, h.y, !0), this.render();
    };
    window.addEventListener("mousemove", l), window.addEventListener("mouseup", a);
  }
  startBlockDrag(e, t) {
    const n = this.toWorkspace(t.clientX, t.clientY);
    let i = this.engine.state.positions[e] ?? this.rootPositionOf(e) ?? { x: n.x, y: n.y }, s = !1;
    const l = (r) => {
      const c = this.toWorkspace(r.clientX, r.clientY), d = c.x - n.x, h = c.y - n.y;
      if (!s && Math.hypot(d, h) < 4) return;
      if (!s) {
        s = !0;
        const m = this.absolutePositionOf(e);
        i = { x: m.x - d, y: m.y - h }, this.engine.unstack(e), this.engine.moveBlock(e, m.x, m.y, !1), this.render();
      }
      this.engine.moveBlock(e, i.x + d, i.y + h, !1);
      const p = this.rootElOf(e);
      p && (p.style.left = i.x + d + "px", p.style.top = i.y + h + "px"), this.clearSnapHighlight();
      const g = this.findSnapAt(e, i.x + d, i.y + h);
      g && this.highlightSnap(g);
    }, a = (r) => {
      if (window.removeEventListener("mousemove", l), window.removeEventListener("mouseup", a), this.clearSnapHighlight(), !s) return;
      const c = this.toWorkspace(r.clientX, r.clientY), d = this.findSnapAt(e, i.x + (c.x - n.x), i.y + (c.y - n.y));
      this.applySnap(e, d), this.render();
    };
    window.addEventListener("mousemove", l), window.addEventListener("mouseup", a);
  }
  applySnap(e, t) {
    t && (t.kind === "stack" ? this.engine.stack(t.targetId, e) : this.engine.insertInStatement(t.targetId, t.stmtId, e));
  }
  /** Find the nearest snap target for a dragged block at (x, y) workspace coords. */
  findSnapAt(e, t, n) {
    const i = this.layer.querySelector(`.k-block[data-block-id="${e}"]`);
    if (!i) return null;
    const s = i.getBoundingClientRect(), l = this.engine.descendants(e);
    let a = null;
    return this.layer.querySelectorAll(".k-block").forEach((r) => {
      var u;
      const c = r.dataset.blockId;
      if (l.has(c)) return;
      const d = this.engine.getBlock(c), h = d && this.engine.getBlockDef(d.type);
      if (!h || ((u = h.flow) == null ? void 0 : u.next) === !1 || this.engine.connectionFrom(c, "next")) return;
      const p = r.getBoundingClientRect(), g = Math.abs(s.left - p.left), m = Math.abs(s.top - p.bottom);
      if (g < kt * this.zoom && m < bt * this.zoom) {
        const f = m + g * 0.3;
        (!a || f < a.d) && (a = { d: f, snap: { kind: "stack", targetId: c } });
      }
    }), this.layer.querySelectorAll(".k-stmt").forEach((r) => {
      const c = r.dataset.parentId, d = r.dataset.stmtId;
      if (l.has(c) || this.engine.connectionFrom(c, `stmt:${d}`)) return;
      const h = r.querySelector(".k-stmt-slot");
      if (!h) return;
      const p = h.getBoundingClientRect(), g = Math.abs(s.left - p.left), m = Math.abs(s.top - p.top);
      if (g < kt * this.zoom && m < bt * this.zoom) {
        const u = m + g * 0.3 - 4;
        (!a || u < a.d) && (a = { d: u, snap: { kind: "stmt", targetId: c, stmtId: d } });
      }
    }), a ? a.snap : null;
  }
  highlightSnap(e) {
    if (e.kind === "stack") {
      const t = this.layer.querySelector(`.k-block[data-block-id="${e.targetId}"]`);
      t == null || t.classList.add("k-snap-stack");
    } else {
      const t = this.layer.querySelector(`.k-stmt[data-parent-id="${e.targetId}"][data-stmt-id="${e.stmtId}"]`);
      t == null || t.classList.add("k-snap-stmt");
    }
  }
  clearSnapHighlight() {
    this.layer.querySelectorAll(".k-snap-stack, .k-snap-stmt").forEach((e) => e.classList.remove("k-snap-stack", "k-snap-stmt"));
  }
  rootElOf(e) {
    const t = this.layer.querySelector(`.k-block[data-block-id="${e}"]`);
    return (t == null ? void 0 : t.closest(".k-stackroot")) ?? null;
  }
  rootPositionOf(e) {
    const t = this.rootElOf(e);
    return t ? { x: parseFloat(t.style.left) || 0, y: parseFloat(t.style.top) || 0 } : null;
  }
  absolutePositionOf(e) {
    const t = this.layer.querySelector(`.k-block[data-block-id="${e}"]`);
    if (!t) return { x: 40, y: 40 };
    const n = t.getBoundingClientRect();
    return this.toWorkspace(n.left, n.top);
  }
  paintSelection() {
    const e = this.engine.selection;
    this.layer.querySelectorAll(".k-block").forEach((t) => {
      const n = t.dataset.blockId;
      t.classList.toggle("k-selected", e.has(n));
    });
  }
  // ---------- Wires (hooks between blocks) ----------
  drawWires() {
    for (; this.wires.firstChild; ) this.wires.removeChild(this.wires.firstChild);
    const e = this.el.getBoundingClientRect();
    for (const t of this.engine.state.connections) {
      if (!(String(t.from.portId).startsWith("hook") || String(t.to.portId).startsWith("hook"))) continue;
      const i = this.el.querySelector(`[data-port-block="${t.from.blockId}"][data-port-id="${t.from.portId}"]`), s = this.el.querySelector(`[data-port-block="${t.to.blockId}"][data-port-id="${t.to.portId}"]`);
      if (!i || !s) continue;
      const l = i.getBoundingClientRect(), a = s.getBoundingClientRect(), r = (l.left + l.width / 2 - e.left - this.pan.x) / this.zoom, c = (l.top + l.height / 2 - e.top - this.pan.y) / this.zoom, d = (a.left + a.width / 2 - e.left - this.pan.x) / this.zoom, h = (a.top + a.height / 2 - e.top - this.pan.y) / this.zoom, p = document.createElementNS("http://www.w3.org/2000/svg", "path"), g = Math.max(40, Math.abs(d - r) / 2);
      p.setAttribute("d", `M ${r} ${c} C ${r + g} ${c}, ${d - g} ${h}, ${d} ${h}`), p.setAttribute("class", "k-wire-hook"), this.wires.appendChild(p);
    }
  }
  // ---------- Context menu ----------
  openBlockMenu(e, t, n) {
    var a;
    const i = this.engine.getBlock(e);
    if (!i) return;
    const s = this.engine.getBlockDef(i.type), l = [
      { heading: !0, label: (s == null ? void 0 : s.label) ?? i.type },
      { icon: "ℹ", label: v("menu.info"), onClick: () => V(this.engine, e) },
      { icon: "✎", label: v("menu.rename"), onClick: async () => {
        const r = await ct({ title: v("rename.block"), defaultValue: i.displayName || (s == null ? void 0 : s.label) || "" });
        r !== null && this.engine.setDisplayName(e, r);
      } },
      ...this.engine.blockAbove(e) || this.engine.statementParent(e) ? [{
        icon: "⇱",
        label: v("menu.detach"),
        onClick: () => {
          const r = this.absolutePositionOf(e);
          this.engine.unstack(e), this.engine.moveBlock(e, r.x + 24, r.y + 12, !0);
        }
      }] : [],
      { icon: "⎘", label: v("menu.duplicateDeep"), onClick: () => {
        const r = this.engine.duplicateBlock(e);
        r && this.engine.select(r.id);
      } },
      { icon: "⇲", label: v("menu.alias"), onClick: () => {
        const r = this.engine.state.positions[e] ?? { x: 40, y: 40 };
        this.engine.createAlias(e, { x: r.x + 260, y: r.y + 30 });
      } },
      { icon: i.collapsed ? "▸" : "▾", label: i.collapsed ? v("menu.expand") : v("menu.collapse"), onClick: () => this.engine.toggleCollapse(e) },
      { separator: !0, label: "" },
      { icon: "×", label: v("menu.delete"), danger: !0, onClick: () => this.engine.deleteBlock(e) }
    ];
    (a = this.menu) == null || a.destroy(), this.menu = new at(l, t, n), this.menu.mount(document.body);
  }
}
const Ut = 70, G = 60, Zt = 220, T = 96;
function Qt(o, e) {
  const t = { ...o.nodePositions }, n = (p) => {
    var g;
    return ((g = o.connections.find((m) => m.from.blockId === p && m.from.portId === "next" && m.to.portId === "prev")) == null ? void 0 : g.to.blockId) ?? null;
  }, i = (p) => o.connections.filter((g) => g.from.blockId === p && String(g.from.portId).startsWith("stmt:")).map((g) => ({ stmt: String(g.from.portId).slice(5), child: g.to.blockId })), s = (p) => {
    var u, f;
    const g = o.blocks[p], m = g && e(g.type);
    return ((u = m == null ? void 0 : m.nodeStyle) == null ? void 0 : u.width) ?? (((f = m == null ? void 0 : m.nodeStyle) == null ? void 0 : f.shape) === "circle" ? 96 : Zt);
  }, l = new Set(Object.keys(t)), a = /* @__PURE__ */ new Set();
  function r(p, g, m) {
    let u = p, f = g, b = m;
    for (; u && !a.has(u); ) {
      a.add(u), l.has(u) || (t[u] = { x: f, y: m }, l.add(u));
      const y = t[u];
      let x = y.y + T + G;
      for (const { child: $ } of i(u))
        l.has($) || (x = r($, y.x + 40, x) + T + G), b = Math.max(b, x - T - G);
      f = y.x + s(u) + Ut, u = n(u);
    }
    return b;
  }
  const c = new Set(o.connections.filter((p) => p.to.portId === "prev").map((p) => p.to.blockId)), d = Object.keys(o.blocks).filter((p) => !c.has(p));
  d.sort((p, g) => {
    const m = o.positions[p] ?? o.nodePositions[p] ?? { x: 0, y: 0 }, u = o.positions[g] ?? o.nodePositions[g] ?? { x: 0, y: 0 };
    return m.y - u.y || m.x - u.x;
  });
  let h = 60;
  for (const p of d) {
    const g = t[p] ?? o.positions[p] ?? { x: 60, y: h };
    l.has(p) || (t[p] = g, l.add(p));
    const m = r(p, t[p].x, t[p].y);
    h = Math.max(h, m + T + G * 1.5);
  }
  for (const p of Object.keys(o.blocks))
    l.has(p) || (t[p] = { x: 60, y: h }, h += T + 30);
  return t;
}
const te = 220, yt = 52, ee = 22;
class ne extends O {
  constructor(e) {
    super("div", "k-nodews"), this.pan = { x: 60, y: 50 }, this.zoom = 1, this.dragWire = null, this.menu = null, this.engine = e, this.buildDom();
  }
  buildDom() {
    const e = this.h("div", "k-grid");
    this.layer = this.h("div", "k-layer"), this.wires = document.createElementNS("http://www.w3.org/2000/svg", "svg"), this.wires.setAttribute("class", "k-wires"), this.layer.appendChild(this.wires), this.el.append(e, this.layer), this.el.addEventListener("mousedown", (t) => {
      if (t.target.closest(".k-node")) return;
      if (t.button === 0 && (t.ctrlKey || t.metaKey)) {
        this.startRubberBand(t);
        return;
      }
      if (t.button !== 0 && t.button !== 1) return;
      this.engine.select(null);
      const n = { x: t.clientX - this.pan.x, y: t.clientY - this.pan.y }, i = (l) => {
        this.pan = { x: l.clientX - n.x, y: l.clientY - n.y }, this.applyTransform(), this.drawWires();
      }, s = () => {
        window.removeEventListener("mousemove", i), window.removeEventListener("mouseup", s);
      };
      window.addEventListener("mousemove", i), window.addEventListener("mouseup", s);
    }), this.el.tabIndex = 0, this.el.addEventListener("keydown", (t) => {
      (t.key === "Delete" || t.key === "Backspace") && this.engine.selection.size && (t.preventDefault(), this.engine.deleteBlocks([...this.engine.selection])), (t.ctrlKey || t.metaKey) && t.key === "z" && (t.preventDefault(), t.shiftKey ? this.engine.redo() : this.engine.undo()), (t.ctrlKey || t.metaKey) && t.key === "c" && (t.preventDefault(), this.engine.copySelection()), (t.ctrlKey || t.metaKey) && t.key === "v" && (t.preventDefault(), this.engine.paste());
    }), this.el.addEventListener("wheel", (t) => {
      t.preventDefault();
      const n = t.deltaY > 0 ? 1 / 1.1 : 1.1;
      this.zoom = Math.min(2.5, Math.max(0.25, this.zoom * n)), this.applyTransform(), this.drawWires();
    }, { passive: !1 });
  }
  startRubberBand(e) {
    const t = this.el.getBoundingClientRect(), n = { x: e.clientX, y: e.clientY }, i = this.h("div", "k-rubber");
    this.el.appendChild(i);
    let s = !1;
    const l = (r) => {
      s = !0, Object.assign(i.style, {
        left: Math.min(n.x, r.clientX) - t.left + "px",
        top: Math.min(n.y, r.clientY) - t.top + "px",
        width: Math.abs(r.clientX - n.x) + "px",
        height: Math.abs(r.clientY - n.y) + "px"
      });
    }, a = (r) => {
      if (window.removeEventListener("mousemove", l), window.removeEventListener("mouseup", a), i.remove(), !s) {
        this.engine.select(null);
        return;
      }
      const c = {
        left: Math.min(n.x, r.clientX),
        right: Math.max(n.x, r.clientX),
        top: Math.min(n.y, r.clientY),
        bottom: Math.max(n.y, r.clientY)
      }, d = [];
      this.layer.querySelectorAll(".k-node").forEach((h) => {
        const p = h.getBoundingClientRect();
        p.right > c.left && p.left < c.right && p.bottom > c.top && p.top < c.bottom && d.push(h.dataset.blockId);
      }), d.length ? this.engine.selectMany(d) : this.engine.select(null);
    };
    window.addEventListener("mousemove", l), window.addEventListener("mouseup", a);
  }
  onMount() {
    this.subs.push(this.engine.on("change", () => this.render())), this.subs.push(this.engine.on("select", () => this.paintSelection())), this.subs.push(this.engine.on("reveal", (e) => this.centerOn(e))), this.applyTransform();
  }
  /** Center the view on a node card. */
  centerOn(e) {
    const t = this.engine.state.nodePositions[e];
    if (!t) return;
    const n = this.el.getBoundingClientRect();
    this.pan.x = n.width / 2 - (t.x + 110) * this.zoom, this.pan.y = n.height / 2 - (t.y + 50) * this.zoom, this.applyTransform(), this.drawWires();
  }
  /** Fit all cards. */
  fit() {
    const e = Object.keys(this.engine.state.blocks);
    if (!e.length) return;
    let t = 1 / 0, n = 1 / 0, i = -1 / 0, s = -1 / 0;
    for (const c of e) {
      const d = this.engine.state.nodePositions[c];
      d && (t = Math.min(t, d.x), n = Math.min(n, d.y), i = Math.max(i, d.x + 260), s = Math.max(s, d.y + 140));
    }
    const l = this.el.getBoundingClientRect(), a = 60, r = Math.min(1.4, Math.max(0.25, Math.min((l.width - a * 2) / (i - t), (l.height - a * 2) / (s - n))));
    this.zoom = r, this.pan.x = a + (l.width - a * 2 - (i - t) * r) / 2 - t * r, this.pan.y = a + (l.height - a * 2 - (s - n) * r) / 2 - n * r, this.applyTransform(), this.drawWires();
  }
  applyTransform() {
    this.layer.style.transform = `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
  }
  toWs(e, t) {
    const n = this.el.getBoundingClientRect();
    return { x: (e - n.left - this.pan.x) / this.zoom, y: (t - n.top - this.pan.y) / this.zoom };
  }
  render() {
    this.layer.querySelectorAll(".k-node").forEach((n) => n.remove());
    const e = Qt(this.engine.state, (n) => this.engine.getBlockDef(n)), t = {};
    for (const n of Object.keys(this.engine.state.blocks))
      this.engine.state.nodePositions[n] || (t[n] = e[n]);
    if (Object.keys(t).length) {
      this.engine.setNodePositions(t, !1);
      return;
    }
    for (const n of Object.values(this.engine.state.blocks)) {
      const i = this.engine.getBlockDef(n.type);
      i && this.layer.appendChild(this.renderNode(i, n, e[n.id]));
    }
    this.paintSelection(), requestAnimationFrame(() => this.drawWires());
  }
  renderNode(e, t, n) {
    const i = !!t.aliasOf, s = i ? this.engine.getBlock(t.aliasOf) : t, l = s ? this.engine.getBlockDef(s.type) ?? e : e, a = s ?? t, r = l.nodeStyle ?? {}, c = W(l), d = r.shape === "circle" ? r.width ?? 96 : r.width ?? te, h = this.h("div", `k-node k-shape-${r.shape ?? "rounded"}${r.centeredHeader ? " k-centered" : ""} k-isz-${r.iconSize ?? "sm"}${i ? " k-alias" : ""}`);
    h.dataset.blockId = t.id;
    const p = n ?? this.engine.state.nodePositions[t.id] ?? { x: 40, y: 40 };
    h.style.left = p.x + "px", h.style.top = p.y + "px", h.style.width = d + "px", r.shape === "circle" && (h.style.height = d + "px"), h.style.setProperty("--bc", c), h.style.setProperty("--bc-h", R(c, l.headerOpacity ?? 0.85)), h.style.setProperty("--bc-b", R(c, l.bodyOpacity ?? 0.16)), h.style.setProperty("--bc-br", R(c, l.borderOpacity ?? 0.65));
    const g = this.h("div", "k-nhead");
    l.icon && g.appendChild(this.h("span", "k-nicon", l.icon));
    const m = this.h("div", "k-ntext");
    if (m.appendChild(this.h("div", "k-ntitle", (i ? "⇲ " : "") + (t.displayName || l.label))), l.subtitle && m.appendChild(this.h("div", "k-nsub", l.subtitle)), g.appendChild(m), h.appendChild(g), t.badge) {
      const f = this.h("span", "k-nbadge", t.badge.text);
      t.badge.color && (f.style.background = t.badge.color), h.appendChild(f);
    }
    if (!t.collapsed && r.showBody !== !1 && r.shape !== "circle" && r.shape !== "diamond") {
      const f = (l.fields ?? []).filter((b) => b.visible !== !1);
      if (f.length) {
        const b = this.h("div", "k-nbody");
        for (const y of f) {
          const x = this.h("div", "k-nrow");
          x.append(
            this.h("span", "k-nkey", y.label ?? y.id),
            this.h("span", "k-nval", this.fieldDisplay(y, a.fieldValues[y.id] ?? y.defaultValue))
          ), b.appendChild(x);
        }
        h.appendChild(b);
      }
    }
    const u = this.estimateHeight(l, t, r);
    for (const f of xt(l)) {
      const b = this.portGeo(f.id, f.kind, d, u, l);
      if (!b) continue;
      const y = this.h("span", `k-nport k-nport-${b.dir}`);
      y.dataset.portBlock = t.id, y.dataset.portId = String(f.id), y.dataset.portDir = b.dir, y.style.left = b.x + "px", y.style.top = b.y + "px", y.title = String(f.label ?? f.id), y.addEventListener("mousedown", (x) => {
        x.stopPropagation(), this.startPortDrag(t.id, String(f.id), x);
      }), h.appendChild(y);
    }
    return h.addEventListener("mousedown", (f) => {
      if (f.button === 0 && !f.target.classList.contains("k-nport")) {
        if (f.stopPropagation(), f.ctrlKey || f.metaKey) {
          this.engine.select(t.id, !0);
          return;
        }
        this.engine.selection.has(t.id) || this.engine.select(t.id), this.engine.selection.size > 1 ? this.startGroupDrag(f) : this.startNodeDrag(t.id, f);
      }
    }), h.addEventListener("dblclick", (f) => {
      f.stopPropagation(), V(this.engine, t.id);
    }), h.addEventListener("contextmenu", (f) => {
      f.preventDefault(), f.stopPropagation(), this.openNodeMenu(t.id, f.clientX, f.clientY);
    }), h;
  }
  fieldDisplay(e, t) {
    if (e.type === "dropdown" && e.options) {
      const n = e.options.find(([, i]) => i === t);
      return n ? n[0] : String(t ?? "");
    }
    return e.type === "checkbox" || e.type === "toggle" ? t ? "✓" : "—" : String(t ?? "");
  }
  estimateHeight(e, t, n) {
    if (n.shape === "circle") return n.width ?? 96;
    if (n.height) return n.height;
    if (t.collapsed || n.showBody === !1) return yt;
    const i = (e.fields ?? []).filter((s) => s.visible !== !1).length;
    return yt + (i ? i * ee + 12 : 0);
  }
  /** Port position on the card in node-view orientation. */
  portGeo(e, t, n, i, s) {
    if (e === "prev") return { x: 0, y: i / 2, dir: "left" };
    if (e === "next") return { x: n, y: i / 2, dir: "right" };
    if (e === "hookLeft") return { x: n * 0.32, y: 0, dir: "top" };
    if (e === "hookRight") return { x: n * 0.68, y: i, dir: "bottom" };
    if (t === "stmt") {
      const l = s.statements ?? [], a = l.findIndex((c) => `stmt:${c.id}` === e), r = l.length;
      return { x: n * ((a + 1) / (r + 1)), y: i, dir: "bottom" };
    }
    return t === "val" ? { x: 0, y: i * 0.75, dir: "left" } : t === "extra" ? { x: n / 2, y: i, dir: "bottom" } : null;
  }
  /** Move every selected card by the same delta; one undoable commit. */
  startGroupDrag(e) {
    const t = this.toWs(e.clientX, e.clientY), n = /* @__PURE__ */ new Map();
    for (const r of this.engine.selection)
      n.set(r, this.engine.state.nodePositions[r] ?? { x: 40, y: 40 });
    let i = 0, s = 0;
    const l = (r) => {
      const c = this.toWs(r.clientX, r.clientY);
      i = c.x - t.x, s = c.y - t.y;
      for (const [d, h] of n) {
        const p = this.layer.querySelector(`.k-node[data-block-id="${d}"]`);
        p && (p.style.left = h.x + i + "px", p.style.top = h.y + s + "px");
      }
      this.drawWires();
    }, a = () => {
      window.removeEventListener("mousemove", l), window.removeEventListener("mouseup", a);
      const r = {};
      for (const [c, d] of n) r[c] = { x: d.x + i, y: d.y + s };
      this.engine.setNodePositions(r, !0);
    };
    window.addEventListener("mousemove", l), window.addEventListener("mouseup", a);
  }
  openNodeMenu(e, t, n) {
    var a;
    const i = this.engine.getBlock(e);
    if (!i) return;
    const s = this.engine.getBlockDef(i.type), l = [
      { heading: !0, label: i.displayName || (s == null ? void 0 : s.label) || i.type },
      { icon: "ℹ", label: v("menu.info"), onClick: () => V(this.engine, e) },
      { icon: "✎", label: v("menu.rename"), onClick: async () => {
        const r = await ct({ title: v("menu.rename"), defaultValue: i.displayName || (s == null ? void 0 : s.label) || "" });
        r !== null && this.engine.setDisplayName(e, r);
      } },
      { icon: "⎘", label: v("menu.duplicateDeep"), onClick: () => {
        const r = this.engine.duplicateBlock(e);
        r && this.engine.select(r.id);
      } },
      { icon: "⇲", label: v("menu.alias"), onClick: () => {
        const r = this.engine.state.nodePositions[e] ?? { x: 60, y: 60 };
        this.engine.createAlias(e, { x: r.x + 260, y: r.y + 40 });
      } },
      { icon: "✂", label: v("menu.disconnect"), onClick: () => {
        const r = this.engine.state.connections.filter((c) => c.from.blockId === e || c.to.blockId === e);
        for (const c of r) this.engine.disconnect(c);
      } },
      { separator: !0, label: "" },
      { icon: "×", label: v("menu.delete"), danger: !0, onClick: async () => {
        await Et({ title: v("delete.node"), message: v("delete.nodeMsg"), danger: !0, confirmLabel: "Supprimer" }) && this.engine.deleteBlock(e);
      } }
    ];
    (a = this.menu) == null || a.destroy(), this.menu = new at(l, t, n), this.menu.mount(document.body);
  }
  startNodeDrag(e, t) {
    const n = this.toWs(t.clientX, t.clientY), i = this.engine.state.nodePositions[e] ?? { x: 40, y: 40 }, s = this.layer.querySelector(`.k-node[data-block-id="${e}"]`);
    let l = i.x, a = i.y;
    const r = (d) => {
      const h = this.toWs(d.clientX, d.clientY);
      l = i.x + h.x - n.x, a = i.y + h.y - n.y, s && (s.style.left = l + "px", s.style.top = a + "px"), this.drawWires();
    }, c = () => {
      window.removeEventListener("mousemove", r), window.removeEventListener("mouseup", c), this.engine.moveNode(e, l, a, !0);
    };
    window.addEventListener("mousemove", r), window.addEventListener("mouseup", c);
  }
  startPortDrag(e, t, n) {
    const i = this.toWs(n.clientX, n.clientY);
    this.dragWire = { fromBlock: e, fromPort: t, x1: i.x, y1: i.y, x2: i.x, y2: i.y };
    const s = (a) => {
      const r = this.toWs(a.clientX, a.clientY);
      this.dragWire && (this.dragWire.x2 = r.x, this.dragWire.y2 = r.y, this.drawWires());
    }, l = (a) => {
      window.removeEventListener("mousemove", s), window.removeEventListener("mouseup", l);
      let r = null;
      if (this.layer.querySelectorAll(".k-nport").forEach((c) => {
        const d = c;
        if (d.dataset.portBlock === e) return;
        const h = d.getBoundingClientRect(), p = Math.hypot(a.clientX - (h.left + h.width / 2), a.clientY - (h.top + h.height / 2));
        p < 28 && (!r || p < r.d) && (r = { el: d, d: p });
      }), r) {
        const c = r.el;
        this.engine.connect({ from: { blockId: e, portId: t }, to: { blockId: c.dataset.portBlock, portId: c.dataset.portId } }) || this.engine.connect({ from: { blockId: c.dataset.portBlock, portId: c.dataset.portId }, to: { blockId: e, portId: t } });
      }
      this.dragWire = null, this.drawWires();
    };
    window.addEventListener("mousemove", s), window.addEventListener("mouseup", l);
  }
  paintSelection() {
    const e = this.engine.selection;
    this.layer.querySelectorAll(".k-node").forEach((t) => t.classList.toggle("k-selected", e.has(t.dataset.blockId)));
  }
  // ---------- Wires ----------
  drawWires() {
    for (; this.wires.firstChild; ) this.wires.removeChild(this.wires.firstChild);
    const e = this.el.getBoundingClientRect(), t = (i, s) => {
      const l = this.layer.querySelector(`[data-port-block="${i}"][data-port-id="${s}"]`);
      if (!l) return null;
      const a = l.getBoundingClientRect();
      return {
        x: (a.left + a.width / 2 - e.left - this.pan.x) / this.zoom,
        y: (a.top + a.height / 2 - e.top - this.pan.y) / this.zoom,
        dir: l.dataset.portDir ?? "right"
      };
    }, n = (i, s) => i === "left" ? { x: -s, y: 0 } : i === "right" ? { x: s, y: 0 } : i === "top" ? { x: 0, y: -s } : { x: 0, y: s };
    for (const i of this.engine.state.connections) {
      const s = t(i.from.blockId, String(i.from.portId)), l = t(i.to.blockId, String(i.to.portId));
      if (!s || !l) continue;
      const a = this.wireKind(String(i.from.portId), String(i.to.portId)), r = Math.max(40, Math.hypot(l.x - s.x, l.y - s.y) / 3), c = n(s.dir, r), d = n(l.dir, r), h = document.createElementNS("http://www.w3.org/2000/svg", "path");
      h.setAttribute("d", `M ${s.x} ${s.y} C ${s.x + c.x} ${s.y + c.y}, ${l.x + d.x} ${l.y + d.y}, ${l.x} ${l.y}`);
      const p = this.engine.getBlock(i.from.blockId), g = p && this.engine.getBlockDef(p.type);
      if (h.setAttribute("class", `k-wire k-wire-${a}`), h.style.stroke = g ? W(g) : "#64748b", this.wires.appendChild(h), a === "flow") {
        const m = document.createElementNS("http://www.w3.org/2000/svg", "path"), u = Math.atan2(l.y - (l.y + d.y), l.x - (l.x + d.x)), f = 7;
        m.setAttribute("d", `M ${l.x} ${l.y} L ${l.x - f * Math.cos(u - 0.4)} ${l.y - f * Math.sin(u - 0.4)} L ${l.x - f * Math.cos(u + 0.4)} ${l.y - f * Math.sin(u + 0.4)} Z`), m.style.fill = h.style.stroke, this.wires.appendChild(m);
      }
    }
    if (this.dragWire) {
      const i = this.dragWire, s = document.createElementNS("http://www.w3.org/2000/svg", "path");
      s.setAttribute("d", `M ${i.x1} ${i.y1} L ${i.x2} ${i.y2}`), s.setAttribute("class", "k-wire k-wire-drag"), this.wires.appendChild(s);
    }
  }
  wireKind(e, t) {
    return e === "next" && t === "prev" ? "flow" : e.startsWith("hook") || t.startsWith("hook") ? "hook" : e.startsWith("stmt:") ? "stmt" : t.startsWith("val:") ? "val" : "extra";
  }
}
class ie extends O {
  constructor(e) {
    super("div", "k-toolbox"), this.query = "", this.expanded = /* @__PURE__ */ new Map(), this.opts = e;
    for (const t of e.config.toolbox.categories) this.expanded.set(t.id, t.expanded !== !1);
  }
  render() {
    this.el.innerHTML = "";
    const e = this.h("input", "k-tb-search");
    e.placeholder = v("toolbox.search"), e.value = this.query, e.addEventListener("input", () => {
      this.query = e.value.toLowerCase(), this.renderList();
    }), this.el.appendChild(e);
    const t = this.opts.config.toolbox.title;
    t && this.el.appendChild(this.h("div", "k-tb-title", t));
    const n = this.h("div", "k-tb-list");
    n.dataset.role = "list", this.el.appendChild(n), this.renderList();
  }
  renderList() {
    const e = this.el.querySelector('[data-role="list"]');
    e.innerHTML = "";
    for (const t of this.opts.config.toolbox.categories) {
      const n = t.blockTypes.map((a) => z(a)).filter(Boolean), i = this.query ? n.filter((a) => (a.label + " " + (a.subtitle ?? "")).toLowerCase().includes(this.query)) : n;
      if (this.query && i.length === 0) continue;
      const s = this.h("button", "k-tb-cat"), l = this.h("span", "k-tb-dot");
      if (l.style.background = t.color ?? "#64748b", s.append(
        l,
        this.h("span", "k-tb-catlabel", t.label),
        this.h("span", "k-tb-count", String(i.length)),
        this.h("span", "k-tb-chev", this.expanded.get(t.id) ? "▾" : "▸")
      ), s.addEventListener("click", () => {
        this.expanded.set(t.id, !this.expanded.get(t.id)), this.renderList();
      }), e.appendChild(s), !(!this.expanded.get(t.id) && !this.query))
        for (const a of i) {
          const r = this.h("div", "k-tb-item");
          r.style.setProperty("--bc", W(a)), a.icon && r.appendChild(this.h("span", "k-tb-icon", a.icon));
          const c = this.h("div", "k-tb-itext");
          c.appendChild(this.h("div", "k-tb-ilabel", a.label)), a.subtitle && c.appendChild(this.h("div", "k-tb-isub", a.subtitle)), r.appendChild(c), this.wireDrag(r, a.type), e.appendChild(r);
        }
    }
  }
  wireDrag(e, t) {
    e.addEventListener("mousedown", (n) => {
      if (n.button !== 0) return;
      n.preventDefault();
      const i = e.cloneNode(!0);
      i.className = "k-tb-item k-tb-ghost", i.style.position = "fixed", i.style.pointerEvents = "none", i.style.zIndex = "99999", i.style.width = e.offsetWidth + "px", document.body.appendChild(i);
      const s = (r) => {
        i.style.left = r.clientX + 8 + "px", i.style.top = r.clientY + 8 + "px";
      };
      s(n);
      const l = (r) => s(r), a = (r) => {
        window.removeEventListener("mousemove", l), window.removeEventListener("mouseup", a), i.remove(), this.opts.onDrop(t, r.clientX, r.clientY);
      };
      window.addEventListener("mousemove", l), window.addEventListener("mouseup", a);
    });
  }
}
const se = [
  { id: "all", label: v("console.all"), level: "all" },
  { id: "info", label: v("console.info"), level: "info" },
  { id: "warn", label: v("console.warn"), level: "warn" },
  { id: "err", label: v("console.error"), level: "error" }
], vt = { debug: "·", info: "ⓘ", warn: "⚠", error: "⛔" };
class oe extends O {
  constructor(e, t = {}) {
    var n;
    super("div", "k-console"), this.engine = e, this.tabs = (n = t.tabs) != null && n.length ? t.tabs : se, this.height = t.defaultHeight ?? 180, this.open = t.startOpen ?? !1, this.active = this.tabs[0].id;
  }
  onMount() {
    this.subs.push(this.engine.on("log", () => {
      this.renderCounts(), this.open && this.renderLogs();
    }));
  }
  render() {
    if (this.el.innerHTML = "", this.open) {
      const s = this.h("div", "k-con-grip");
      s.title = "Glisser pour redimensionner", s.addEventListener("mousedown", (l) => {
        l.preventDefault();
        const a = l.clientY, r = this.height, c = (h) => {
          this.height = Math.max(90, Math.min(innerHeight * 0.7, r + (a - h.clientY)));
          const p = this.el.querySelector(".k-con-body");
          p && (p.style.height = this.height + "px");
        }, d = () => {
          window.removeEventListener("mousemove", c), window.removeEventListener("mouseup", d);
        };
        window.addEventListener("mousemove", c), window.addEventListener("mouseup", d);
      }), this.el.appendChild(s);
    }
    const e = this.h("div", "k-con-bar2"), t = this.h("button", "k-con-toggle", this.open ? "▾ " + v("console.title") : "▴ " + v("console.title"));
    t.addEventListener("click", () => {
      this.open = !this.open, this.render();
    }), e.appendChild(t);
    for (const s of this.tabs) {
      const l = this.h("button", `k-con-tab${this.active === s.id ? " active" : ""}`, s.label);
      l.addEventListener("click", () => {
        this.active = s.id, this.open || (this.open = !0), this.render();
      }), e.appendChild(l);
    }
    const n = this.h("div", "k-con-counts");
    n.dataset.role = "counts", e.appendChild(n);
    const i = this.h("button", "k-con-clear", "⌫");
    if (i.title = v("console.clear"), i.addEventListener("click", () => {
      this.engine.clearLogs(), this.renderLogs(), this.renderCounts();
    }), e.appendChild(i), this.el.appendChild(e), this.open) {
      const s = this.h("div", "k-con-body");
      s.dataset.role = "logs", s.style.height = this.height + "px", this.el.appendChild(s), this.renderLogs();
    }
    this.renderCounts();
  }
  match(e, t) {
    return !(t.level && t.level !== "all" && e.level !== t.level || t.channels && !t.channels.includes(e.channel));
  }
  renderCounts() {
    const e = this.el.querySelector('[data-role="counts"]');
    if (!e) return;
    const t = { info: 0, warn: 0, error: 0 };
    for (const n of this.engine.logs) t[n.level] !== void 0 && t[n.level]++;
    e.innerHTML = "", ["info", "warn", "error"].forEach((n) => {
      t[n] && e.appendChild(this.h("span", `k-con-count k-lv-${n}`, `${vt[n]} ${t[n]}`));
    });
  }
  renderLogs() {
    const e = this.el.querySelector('[data-role="logs"]');
    if (!e) return;
    const t = this.tabs.find((i) => i.id === this.active) ?? this.tabs[0];
    e.innerHTML = "";
    const n = this.engine.logs.filter((i) => this.match(i, t)).slice(-300);
    n.length || e.appendChild(this.h("div", "k-con-empty", v("console.empty")));
    for (const i of n) {
      const s = this.h("div", `k-con-row k-lv-${i.level}`);
      s.append(
        this.h("span", "k-con-glyph", vt[i.level]),
        this.h("span", "k-con-ts", new Date(i.ts).toLocaleTimeString()),
        this.h("span", "k-con-ch", i.channel),
        this.h("span", "k-con-msg", i.message)
      ), i.data !== void 0 && s.appendChild(this.h(
        "span",
        "k-con-data",
        typeof i.data == "string" ? i.data : JSON.stringify(i.data)
      )), e.appendChild(s);
    }
    e.scrollTop = e.scrollHeight;
  }
}
class re extends O {
  constructor(e) {
    super("div", "k-codeview"), this.opts = e;
  }
  onMount() {
    this.subs.push(this.opts.engine.on("change", () => this.render()));
  }
  render() {
    this.el.innerHTML = "";
    const e = this.h("div", "k-cv-bar"), t = this.h("button", "k-cv-copy", "⎘ copier");
    t.addEventListener("click", () => {
      var i;
      return (i = navigator.clipboard) == null ? void 0 : i.writeText(this.code());
    }), e.appendChild(t);
    const n = this.h("pre", "k-cv-pre");
    n.textContent = this.code(), this.el.append(e, n);
  }
  code() {
    return Vt(this.opts.engine.state, (e) => this.opts.engine.getBlockDef(e), {
      header: this.opts.header,
      footer: this.opts.footer
    });
  }
}
class ae extends O {
  constructor(e) {
    super("div", "k-treeview"), this.folded = /* @__PURE__ */ new Set(), this.engine = e;
  }
  onMount() {
    this.subs.push(this.engine.on("change", () => this.render())), this.subs.push(this.engine.on("select", () => this.paint()));
  }
  render() {
    this.el.innerHTML = "";
    const e = this.engine.state, t = new Set(e.connections.filter((i) => i.to.portId === "prev").map((i) => i.to.blockId)), n = Object.keys(e.blocks).filter((i) => !t.has(i));
    if (n.sort((i, s) => {
      const l = e.positions[i] ?? { x: 0, y: 0 }, a = e.positions[s] ?? { x: 0, y: 0 };
      return l.y - a.y || l.x - a.x;
    }), !n.length) {
      this.el.appendChild(this.h("div", "k-tree-empty", "Aucun bloc — glisse depuis la boîte à blocs"));
      return;
    }
    for (const i of n) this.renderChain(i, this.el, 0);
    this.paint();
  }
  renderChain(e, t, n) {
    let i = e;
    const s = /* @__PURE__ */ new Set();
    for (; i && !s.has(i); )
      s.add(i), this.renderRow(i, t, n), i = this.engine.blockBelow(i);
  }
  renderRow(e, t, n) {
    const i = this.engine.getBlock(e);
    if (!i) return;
    const s = i.aliasOf ? this.engine.getBlock(i.aliasOf) : i, l = s && this.engine.getBlockDef(s.type), a = l ? W(l) : "#64748b", r = ((l == null ? void 0 : l.statements) ?? []).filter((p) => this.engine.connectionFrom(e, `stmt:${p.id}`)), c = r.length > 0, d = this.h("button", "k-tree-row");
    if (d.dataset.blockId = e, d.style.paddingLeft = 8 + n * 18 + "px", c) {
      const p = this.h("span", "k-tree-chev", this.folded.has(e) ? "▸" : "▾");
      p.addEventListener("click", (g) => {
        g.stopPropagation(), this.folded.has(e) ? this.folded.delete(e) : this.folded.add(e), this.render();
      }), d.appendChild(p);
    } else d.appendChild(this.h("span", "k-tree-chev k-tree-nochev", "·"));
    const h = this.h("span", "k-tree-dot");
    if (h.style.background = a, d.append(
      h,
      this.h("span", "k-tree-icn", (l == null ? void 0 : l.icon) ?? "▫"),
      this.h("span", "k-tree-name", (i.aliasOf ? "⇲ " : "") + (i.displayName || (l == null ? void 0 : l.label) || e))
    ), c && d.appendChild(this.h("span", "k-tree-badge", String(r.length))), d.addEventListener("click", () => {
      this.engine.select(e), this.engine.reveal(e);
    }), d.addEventListener("dblclick", () => Promise.resolve().then(() => jt).then((p) => p.openBlockInfo(this.engine, e))), t.appendChild(d), c && !this.folded.has(e)) {
      const p = this.h("div", "k-tree-kids");
      p.style.marginLeft = 16 + n * 18 + "px", p.style.borderLeft = `1.5px solid ${a}44`;
      for (const g of r) {
        p.appendChild(this.h("div", "k-tree-stmt", (g.label ?? g.id).toUpperCase()));
        const m = this.engine.connectionFrom(e, `stmt:${g.id}`);
        this.renderChain(m.to.blockId, p, 0);
      }
      t.appendChild(p);
    }
  }
  paint() {
    const e = this.engine.selection;
    this.el.querySelectorAll(".k-tree-row").forEach((t) => t.classList.toggle("k-selected", e.has(t.dataset.blockId)));
  }
}
class ve extends O {
  constructor(e) {
    var i;
    super("div", `k-editor k-theme-${e.theme ?? "dark"}`), this.toolbox = null, this.consolePanel = null, this.codeView = null, this.treeView = null, this.primary = "blocks", this.secondary = null, this.pages = [], this.activePage = 0, mt(e.template ?? "aurora"), this.el.classList.add(N().className), this.opts = e;
    const t = this.loadAutosave();
    t ? (this.pages = t.pages, this.activePage = t.active) : this.pages = [{ id: "p1", label: "page 1", state: void 0 }];
    const n = e.initialState ?? ((i = this.pages[this.activePage]) == null ? void 0 : i.state) ?? void 0;
    this.engine = new Xt(e.config.blockDefinitions, n), this.pages[this.activePage].state = this.engine.state, e.storageKey !== null ? this.engine.on("change", (s) => {
      this.pages[this.activePage].state = s, this.autosave();
    }) : this.engine.on("change", (s) => {
      this.pages[this.activePage].state = s;
    });
  }
  /** Convenience: mounts into opts.target. */
  start() {
    return this.mount(this.opts.target);
  }
  render() {
    var y, x, $, P, _, M;
    this.el.innerHTML = "";
    const e = this.h("header", "k-header"), t = this.h("div", "k-brand");
    t.append(
      this.h("span", "k-brand-mark", this.opts.brandIcon ?? "◆"),
      this.h("span", "k-brand-name", this.opts.brandName ?? "KANTO")
    ), e.appendChild(t);
    const n = this.h("div", "k-tabs"), i = (L, S, B) => {
      const D = this.h("button", `k-tab${S ? " active" : ""}`, L);
      return D.addEventListener("click", B), D;
    };
    n.append(
      i(v("tabs.blocks"), this.primary === "blocks", () => {
        this.primary = "blocks", this.render();
      }),
      i(v("tabs.nodes"), this.primary === "nodes", () => {
        this.primary = "nodes", this.render();
      })
    );
    const s = this.h("span", "k-tabsep");
    n.appendChild(s), n.append(
      i(v("tabs.tree"), this.secondary === "tree", () => {
        this.secondary = this.secondary === "tree" ? null : "tree", this.render();
      }),
      i(v("tabs.code"), this.secondary === "code", () => {
        this.secondary = this.secondary === "code" ? null : "code", this.render();
      })
    ), e.appendChild(n);
    const l = this.h("div", "k-actions"), a = this.h("select", "k-tpl-select");
    for (const L of Ft()) {
      const S = document.createElement("option");
      S.value = L.id, S.textContent = L.label, L.id === N().id && (S.selected = !0), a.appendChild(S);
    }
    a.title = "Template visuel", a.addEventListener("change", () => {
      const L = N().className;
      mt(a.value), this.el.classList.remove(L), this.el.classList.add(N().className), this.render();
    }), l.appendChild(a);
    const r = this.h("button", "k-iconbtn", "↶");
    r.title = v("action.undo"), r.addEventListener("click", () => this.engine.undo());
    const c = this.h("button", "k-iconbtn", "↷");
    c.title = v("action.redo"), c.addEventListener("click", () => this.engine.redo());
    const d = this.h("button", "k-iconbtn", "💾");
    d.title = v("action.export"), d.addEventListener("click", () => this.exportJson());
    const h = this.h("button", "k-iconbtn", "📂");
    h.title = v("action.import"), h.addEventListener("click", () => this.importJson());
    const p = this.h("button", "k-iconbtn", "⊹");
    p.title = v("action.fit"), p.addEventListener("click", () => {
      var L, S;
      this.primary === "blocks" ? (L = this.blockView) == null || L.fit() : (S = this.nodeView) == null || S.fit();
    }), l.append(p, r, c, d, h), e.appendChild(l), this.el.appendChild(e);
    const g = this.h("div", "k-pages");
    this.pages.forEach((L, S) => {
      const B = this.h("button", `k-page${S === this.activePage ? " active" : ""}`);
      if (B.appendChild(this.h("span", "", L.label)), this.pages.length > 1) {
        const k = this.h("span", "k-page-x", "×");
        k.addEventListener("click", (C) => {
          C.stopPropagation(), this.deletePage(S);
        }), B.appendChild(k);
      }
      B.addEventListener("click", () => this.switchPage(S));
      const D = async () => {
        const k = await ct({ title: v("page.rename"), defaultValue: L.label, icon: "⌗" });
        k && (L.label = k, this.autosave(), this.render());
      };
      B.addEventListener("dblclick", D), B.addEventListener("contextmenu", (k) => {
        k.preventDefault();
        const C = [
          { heading: !0, label: L.label },
          { icon: "✎", label: v("menu.rename"), onClick: D },
          { icon: "⎘", label: v("page.clone"), onClick: () => this.clonePage(S) },
          { icon: "＋", label: v("page.newAfter"), onClick: () => this.addPage(void 0, S + 1) },
          { separator: !0, label: "" },
          { icon: "×", label: v("page.delete"), danger: !0, onClick: () => this.deletePage(S) }
        ];
        new at(C, k.clientX, k.clientY).mount(document.body);
      }), g.appendChild(B);
    });
    const m = this.h("button", "k-page k-page-add", "+");
    m.title = v("page.new"), m.addEventListener("click", () => this.addPage()), g.appendChild(m), this.el.appendChild(g);
    const u = this.h("div", "k-body");
    this.opts.hideToolbox || ((y = this.toolbox) == null || y.destroy(), this.toolbox = new ie({
      config: this.opts.config,
      onDrop: (L, S, B) => {
        var D;
        if (this.primary === "blocks") this.blockView.dropNewBlock(L, S, B);
        else {
          const k = (D = this.el.querySelector(".k-nodews")) == null ? void 0 : D.getBoundingClientRect();
          k && S > k.left && S < k.right && B > k.top && B < k.bottom && this.engine.createBlock(L, { x: S - k.left, y: B - k.top });
        }
      }
    }), this.toolbox.mount(u));
    const f = this.h("div", "k-main"), b = this.h("div", "k-primary");
    if ((x = this.blockView) == null || x.destroy(), ($ = this.nodeView) == null || $.destroy(), this.primary === "blocks" ? (this.blockView = new Gt({ engine: this.engine, readOnly: this.opts.readOnly }), this.blockView.mount(b)) : (this.nodeView = new ne(this.engine), this.nodeView.mount(b)), f.appendChild(b), this.secondary) {
      const L = this.h("div", "k-secondary"), S = this.h("div", "k-sec-head");
      S.appendChild(this.h("span", "", this.secondary === "tree" ? "Arbre" : "Code généré"));
      const B = this.h("button", "k-sec-close", "×");
      B.addEventListener("click", () => {
        this.secondary = null, this.render();
      }), S.appendChild(B), L.appendChild(S), this.secondary === "tree" ? ((P = this.treeView) == null || P.destroy(), this.treeView = new ae(this.engine), this.treeView.mount(L)) : ((_ = this.codeView) == null || _.destroy(), this.codeView = new re({ engine: this.engine, ...this.opts.generation }), this.codeView.mount(L)), f.appendChild(L);
    }
    u.appendChild(f), this.el.appendChild(u), this.opts.hideConsole || ((M = this.consolePanel) == null || M.destroy(), this.consolePanel = new oe(this.engine, {
      tabs: this.opts.consoleTabs ?? N().consoleTabs
    }), this.consolePanel.mount(this.el));
  }
  // ---------- Pages ----------
  switchPage(e) {
    e === this.activePage || !this.pages[e] || (this.pages[this.activePage].state = this.engine.state, this.activePage = e, this.engine.setState(this.pages[e].state ?? void 0), this.engine.select(null), this.render());
  }
  addPage(e, t) {
    this.pages[this.activePage].state = this.engine.state;
    const n = `p${Date.now().toString(36)}`, i = t ?? this.pages.length;
    this.pages.splice(i, 0, { id: n, label: e ?? `page ${this.pages.length + 1}`, state: void 0 }), this.activePage = i, this.engine.reset(), this.pages[this.activePage].state = this.engine.state, this.autosave(), this.render();
  }
  /** Deep clone of a page: full GraphState copied, inserted right after. */
  clonePage(e) {
    this.pages[this.activePage].state = this.engine.state;
    const t = this.pages[e], n = {
      id: `p${Date.now().toString(36)}`,
      label: `${t.label} (copie)`,
      state: nt(JSON.parse(JSON.stringify(t.state ?? this.engine.state)))
    };
    this.pages.splice(e + 1, 0, n), this.activePage = e + 1, this.engine.setState(n.state), this.engine.select(null), this.autosave(), this.render();
  }
  async deletePage(e) {
    this.pages.length <= 1 || !await Et({ title: v("page.deleteTitle"), message: `« ${this.pages[e].label} » et tout son contenu.`, danger: !0, confirmLabel: "Supprimer" }) || (this.pages.splice(e, 1), this.activePage >= this.pages.length && (this.activePage = this.pages.length - 1), this.engine.setState(this.pages[this.activePage].state), this.autosave(), this.render());
  }
  // ---------- Persistence (multi-page aware) ----------
  storageKey() {
    return this.opts.storageKey === null ? null : `kanto:${this.opts.storageKey ?? "default"}`;
  }
  autosave() {
    const e = this.storageKey();
    if (e)
      try {
        localStorage.setItem(e, JSON.stringify({
          v: 2,
          active: this.activePage,
          pages: this.pages.map((t) => ({ id: t.id, label: t.label, state: t.state ?? this.engine.state }))
        }));
      } catch {
      }
  }
  loadAutosave() {
    const e = this.storageKey();
    if (!e) return null;
    try {
      const t = localStorage.getItem(e);
      if (!t) return null;
      const n = JSON.parse(t);
      return (n == null ? void 0 : n.v) === 2 && Array.isArray(n.pages) ? { pages: n.pages, active: n.active ?? 0 } : n != null && n.blocks ? { pages: [{ id: "p1", label: "page 1", state: n }], active: 0 } : null;
    } catch {
      return null;
    }
  }
  exportJson() {
    const e = new Blob([this.engine.serialize()], { type: "application/json" }), t = document.createElement("a");
    t.href = URL.createObjectURL(e), t.download = "kanto-project.json", t.click(), URL.revokeObjectURL(t.href);
  }
  importJson() {
    const e = document.createElement("input");
    e.type = "file", e.accept = "application/json,.json", e.onchange = () => {
      var i;
      const t = (i = e.files) == null ? void 0 : i[0];
      if (!t) return;
      const n = new FileReader();
      n.onload = () => this.engine.load(String(n.result)), n.readAsText(t);
    }, e.click();
  }
}
export {
  Gt as BlockWorkspace,
  re as CodeView,
  oe as Console,
  at as ContextMenu,
  zt as Emitter,
  O as KComponent,
  ve as KantoEditor,
  Xt as KantoEngine,
  lt as KantoModal,
  ne as NodeWorkspace,
  ie as Toolbox,
  ae as TreeView,
  pt as addBlock,
  q as addConnection,
  Mt as blockAbove,
  H as blockBelow,
  de as clearBlockDefs,
  ge as clearGenerators,
  Tt as cloneSubtree,
  ot as collectDescendants,
  tt as connectionFrom,
  Ct as connectionTo,
  ht as createEmptyState,
  Qt as deriveNodeLayout,
  st as detach,
  qt as extractSubtrees,
  it as genBlockId,
  Vt as generate,
  N as getActiveTemplate,
  ce as getAllBlockDefs,
  Ft as getAllTemplates,
  W as getBlockColor,
  z as getBlockDef,
  Yt as getBlockEvents,
  $t as getFieldRenderer,
  fe as getGenerator,
  ke as getLocale,
  dt as getPort,
  ye as getTemplate,
  Dt as instantiateBlock,
  Et as kantoConfirm,
  ct as kantoPrompt,
  nt as normalizeState,
  V as openBlockInfo,
  Ht as pasteSnapshot,
  J as patchBlock,
  Rt as placeInStatement,
  le as registerBlockDef,
  Pt as registerBlockDefs,
  he as registerBlockEvents,
  U as registerFieldRenderer,
  pe as registerGenerator,
  ue as registerGenerators,
  It as registerTemplate,
  be as registerTranslations,
  ut as removeBlock,
  Q as removeConnection,
  xt as resolveAllPorts,
  R as rgba,
  mt as setActiveTemplate,
  Ot as setFieldValue,
  me as setLocale,
  Wt as setNodePosition,
  ft as setPosition,
  Nt as stackUnder,
  At as statementParent,
  v as t,
  Y as validateConnection
};
