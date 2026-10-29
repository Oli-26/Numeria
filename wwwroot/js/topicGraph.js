/**
 * TopicGraph: knowledge graph renderer on HTML5 Canvas.
 * Layouts are computed once per view and cached; view changes, focus and camera moves animate.
 * Exposed as window.TopicGraph for Blazor JSInterop.
 */
(function () {
  'use strict';

  var TAU = Math.PI * 2;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function seededRandom(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function parseColor(c, fallback) {
    c = (c || '').trim();
    var m = /^#([0-9a-f]{3})$/i.exec(c);
    if (m) c = '#' + m[1][0] + m[1][0] + m[1][1] + m[1][1] + m[1][2] + m[1][2];
    m = /^#([0-9a-f]{6})/i.exec(c);
    if (m) { var n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
    m = /^rgba?\(([^)]+)\)/i.exec(c);
    if (m) { var p = m[1].split(/[ ,/]+/).map(parseFloat); return [p[0], p[1], p[2]]; }
    return fallback || [136, 136, 136];
  }

  function rgba(rgb, a) {
    return 'rgba(' + Math.round(rgb[0]) + ',' + Math.round(rgb[1]) + ',' + Math.round(rgb[2]) + ',' + a + ')';
  }

  function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  function luma(rgb) { return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255; }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function truncate(s, max) { return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s; }

  class TopicGraph {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.dotNetRef = null;
      this.nodes = [];
      this.edges = [];
      this._index = {};
      this.maxDeg = 1;

      this.w = 0;
      this.h = 0;
      this.dpr = 1;

      // Camera: screen = world * scale + cam
      this.camX = 0;
      this.camY = 0;
      this.scale = 1;
      this.fitScale = 1;
      this._camAnim = null;
      this._posAnim = null;

      this.layout = 'web';
      this.mine = false;
      this.focusId = null;
      this._layoutCache = {};
      this._hasView = false;

      this._pointer = null;
      this._pinch = null;
      this._hovered = null;
      this._textWidths = new Map();
      this._themeKey = '';

      this.running = false;
      this.animFrameId = 0;
      this._lastFrame = 0;
      this._dirty = true;

      this._onMouseDown = this._onMouseDown.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseUp = this._onMouseUp.bind(this);
      this._onMouseLeave = this._onMouseLeave.bind(this);
      this._onWheel = this._onWheel.bind(this);
      this._onTouchStart = this._onTouchStart.bind(this);
      this._onTouchMove = this._onTouchMove.bind(this);
      this._onTouchEnd = this._onTouchEnd.bind(this);
      this._onResize = this._onResize.bind(this);
      this._loop = this._loop.bind(this);
    }

    // ─── Public API (called from Blazor) ───────────────────────────────────────

    init(canvasId, graphData, options, dotNetRef) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.dotNetRef = dotNetRef;
      this._resize();
      this._loadGraph(graphData, options || {});
      this._attachEvents();
      this.running = true;
      this.animFrameId = requestAnimationFrame(this._loop);
    }

    // ids: visible topics; nextIds: faint "next up" neighbours (My topics view)
    setView(key, ids, nextIds, layout) {
      this.layout = layout === 'layers' ? 'layers' : 'web';
      var visible = new Set(ids || []);
      var next = new Set(nextIds || []);
      this.mine = next.size > 0 || /\|mine$/.test(key || '');
      this.focusId = null;
      this._preFocusCam = null;

      var list = this.nodes.filter(function (n) { return visible.has(n.id); });
      var pos = this._layoutFor(key, list);
      var animate = this._hasView;

      for (var n of this.nodes) {
        n.next = next.has(n.id);
        var p = pos[n.id];
        if (p) {
          if (!animate || n.vis < 0.05) { n.x = p.x; n.y = p.y; }
          n.fx = n.x; n.fy = n.y;
          n.tx = n.bx = p.x; n.ty = n.by = p.y;
          n.visT = 1;
        } else {
          n.fx = n.tx = n.x;
          n.fy = n.ty = n.y;
          n.visT = 0;
        }
      }
      this._posAnim = animate ? { t0: performance.now(), dur: 650 } : null;
      this._applyFocus();
      this._fitView(animate);
      this._hasView = true;
      this._dirty = true;
    }

    focus(id) {
      var n = id ? this._index[id] : null;
      if (n && n.visT === 0) return false;
      this._setFocus(n);
      return true;
    }

    fit() {
      if (this.focusId) this._fitFocus(true);
      else this._fitView(true);
    }

    screenPos(id) {
      var n = this._index[id];
      if (!n) return null;
      return { x: n.x * this.scale + this.camX, y: n.y * this.scale + this.camY };
    }

    destroy() {
      this.running = false;
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
      this._detachEvents();
      this.canvas = null;
      this.ctx = null;
      this.nodes = [];
      this.edges = [];
      this._index = {};
      this.dotNetRef = null;
    }

    // ─── Graph loading ──────────────────────────────────────────────────────────

    _loadGraph(graphData, options) {
      var data = typeof graphData === 'string' ? JSON.parse(graphData) : graphData;
      var hues = options.hues || {};
      var progress = options.progress || {};
      this.domainNames = options.names || {};

      this.nodes = (data.nodes || []).map(function (n) {
        return {
          id: n.id, name: n.name, domain: n.domain,
          hue: parseColor(hues[n.domain], [120, 120, 140]),
          p: progress[n.id] || 0,
          deg: 0, links: [],
          x: 0, y: 0, fx: 0, fy: 0, tx: 0, ty: 0, bx: 0, by: 0,
          vis: 0, visT: 0, hl: 1, hlT: 1,
          next: false, sx: 0, sy: 0, r: 0
        };
      });
      this._index = {};
      for (var node of this.nodes) this._index[node.id] = node;

      // Some pairs carry both a prereq and a related edge; keep the prereq.
      var byPair = {};
      for (var e of data.edges || []) {
        var a = this._index[e.from], b = this._index[e.to];
        if (!a || !b || a === b) continue;
        var key = a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id;
        var prev = byPair[key];
        if (prev && (prev.type === 'prereq' || e.type !== 'prereq')) continue;
        byPair[key] = { a: a, b: b, type: e.type === 'prereq' ? 'prereq' : 'related', strength: e.strength || 0.5 };
      }
      this.edges = Object.keys(byPair).map(function (k) { return byPair[k]; });
      for (var ed of this.edges) {
        ed.a.deg++; ed.b.deg++;
        ed.a.links.push(ed); ed.b.links.push(ed);
      }
      this.maxDeg = Math.max(1, ...this.nodes.map(function (n) { return n.deg; }));
      this._layoutCache = {};
    }

    // ─── Layouts ────────────────────────────────────────────────────────────────

    _layoutFor(key, list) {
      var portrait = this.h >= this.w;
      var cacheKey = this.layout + '|' + (portrait ? 'p' : 'l') + '|' + key;
      if (this._layoutCache[cacheKey]) return this._layoutCache[cacheKey];
      var pos;
      if (this.layout === 'layers') pos = this._layersLayout(list);
      else if (list.length === this.nodes.length) pos = this._orient(this._forceLayout(list, 'all', null), portrait);
      else pos = this._orient(this._forceLayout(list, key, this._layoutFor('all', this.nodes)), portrait);
      this._layoutCache[cacheKey] = pos;
      return pos;
    }

    // Turn a layout so its long axis runs along the screen's long axis, then stretch it a little
    // toward the screen's aspect so a round cluster still fills a tall phone.
    _orient(pos, portrait) {
      var ids = Object.keys(pos), n = ids.length;
      if (n < 3) return pos;
      var mx = 0, my = 0;
      for (var id of ids) { mx += pos[id].x; my += pos[id].y; }
      mx /= n; my /= n;
      var sxx = 0, syy = 0, sxy = 0;
      for (var id of ids) {
        var dx = pos[id].x - mx, dy = pos[id].y - my;
        sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
      }
      var major = 0.5 * Math.atan2(2 * sxy, sxx - syy);
      var rot = (portrait ? Math.PI / 2 : 0) - major;
      var c = Math.cos(rot), s = Math.sin(rot), out = {};
      var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (var id of ids) {
        var dx = pos[id].x - mx, dy = pos[id].y - my;
        var p = out[id] = { x: dx * c - dy * s, y: dx * s + dy * c };
        x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
      }
      var target = Math.max(this.h - 80, 1) / Math.max(this.w - 60, 1);
      var ratio = (y1 - y0) / Math.max(x1 - x0, 1);
      var k = portrait ? clamp(target / ratio, 1, 1.5) : 1;
      var kx = portrait ? 1 : clamp(ratio / target, 1, 1.5);
      for (var id of ids) { out[id].x *= kx; out[id].y *= k; }
      return out;
    }

    // Domains whose topics link most sit next to each other on the seed ellipse.
    _domainOrder(list) {
      var weight = {}, domains = [];
      for (var n of list) if (!(n.domain in weight)) { weight[n.domain] = {}; domains.push(n.domain); }
      for (var e of this.edges) {
        var da = e.a.domain, db = e.b.domain;
        if (da === db || !(da in weight) || !(db in weight)) continue;
        weight[da][db] = (weight[da][db] || 0) + 1;
        weight[db][da] = (weight[db][da] || 0) + 1;
      }
      var total = function (d) { var s = 0; for (var k in weight[d]) s += weight[d][k]; return s; };
      domains.sort(function (x, y) { return total(y) - total(x) || (x < y ? -1 : 1); });
      var order = domains.length ? [domains.shift()] : [];
      while (domains.length) {
        var last = order[order.length - 1], best = 0;
        for (var i = 1; i < domains.length; i++) {
          if ((weight[last][domains[i]] || 0) > (weight[last][domains[best]] || 0)) best = i;
        }
        order.push(domains.splice(best, 1)[0]);
      }
      return order;
    }

    _forceLayout(list, key, seedPos) {
      var n = list.length, out = {};
      if (n === 0) return out;
      if (n === 1) { out[list[0].id] = { x: 0, y: 0 }; return out; }

      var rand = seededRandom(hashString(key || 'graph'));
      var X = new Float64Array(n), Y = new Float64Array(n);
      var VX = new Float64Array(n), VY = new Float64Array(n);
      var ix = {};
      for (var i = 0; i < n; i++) ix[list[i].id] = i;

      var order = this._domainOrder(list);
      var dIdx = new Int32Array(n), D = order.length;
      for (var i = 0; i < n; i++) dIdx[i] = order.indexOf(list[i].domain);

      if (seedPos) {
        var mx = 0, my = 0;
        for (var i = 0; i < n; i++) { var s = seedPos[list[i].id]; mx += s.x; my += s.y; }
        mx /= n; my /= n;
        for (var i = 0; i < n; i++) {
          var s = seedPos[list[i].id];
          X[i] = (s.x - mx) * 0.6 + (rand() - 0.5) * 4;
          Y[i] = (s.y - my) * 0.6 + (rand() - 0.5) * 4;
        }
      } else {
        var R = 42 * Math.sqrt(n);
        for (var i = 0; i < n; i++) {
          var ang = (dIdx[i] / D) * TAU - Math.PI / 2;
          var spread = 20 + rand() * 14 * Math.sqrt(n / D);
          var a2 = rand() * TAU;
          X[i] = Math.cos(ang) * R * 0.6 + Math.cos(a2) * spread;
          Y[i] = Math.sin(ang) * R * 1.4 + Math.sin(a2) * spread;
        }
      }

      var links = [], count = new Float64Array(n);
      for (var e of this.edges) {
        var ia = ix[e.a.id], ib = ix[e.b.id];
        if (ia === undefined || ib === undefined) continue;
        var same = e.a.domain === e.b.domain;
        links.push({
          a: ia, b: ib,
          len: (e.type === 'prereq' ? 64 : 84) * (same ? 1 : 1.5),
          k: (0.35 + 0.65 * e.strength) * (same ? 0.9 : 0.08) * (e.type === 'prereq' ? 1 : 0.7)
        });
        count[ia]++; count[ib]++;
      }

      var ITER = n > 120 ? 300 : 260;
      var CHARGE = -320, MIN_D = 36;
      var GX = 0.05, GY = 0.02, COHESION = D > 1 ? 0.2 : 0;
      var alpha = 1, decay = 1 - Math.pow(0.002, 1 / ITER);
      var cx = new Float64Array(D), cy = new Float64Array(D), cn = new Float64Array(D);

      for (var it = 0; it < ITER; it++) {
        for (var i = 0; i < n; i++) {
          for (var j = i + 1; j < n; j++) {
            var dx = X[j] - X[i], dy = Y[j] - Y[i];
            var d2 = dx * dx + dy * dy;
            if (d2 < 0.01) { dx = rand() - 0.5; dy = rand() - 0.5; d2 = dx * dx + dy * dy; }
            var w = CHARGE * alpha / d2;
            if (d2 < MIN_D * MIN_D) {
              var d = Math.sqrt(d2);
              w -= (MIN_D - d) / d * 0.35;
            }
            VX[i] += dx * w; VY[i] += dy * w;
            VX[j] -= dx * w; VY[j] -= dy * w;
          }
        }
        for (var L of links) {
          var dx = X[L.b] + VX[L.b] - X[L.a] - VX[L.a];
          var dy = Y[L.b] + VY[L.b] - Y[L.a] - VY[L.a];
          var l = Math.sqrt(dx * dx + dy * dy) || 1;
          l = (l - L.len) / l * alpha * L.k;
          dx *= l; dy *= l;
          var bias = count[L.a] / (count[L.a] + count[L.b]);
          VX[L.b] -= dx * bias; VY[L.b] -= dy * bias;
          VX[L.a] += dx * (1 - bias); VY[L.a] += dy * (1 - bias);
        }
        if (COHESION) {
          cx.fill(0); cy.fill(0); cn.fill(0);
          for (var i = 0; i < n; i++) { cx[dIdx[i]] += X[i]; cy[dIdx[i]] += Y[i]; cn[dIdx[i]]++; }
          for (var i = 0; i < n; i++) {
            var di = dIdx[i];
            VX[i] += (cx[di] / cn[di] - X[i]) * COHESION * alpha;
            VY[i] += (cy[di] / cn[di] - Y[i]) * COHESION * alpha;
          }
        }
        for (var i = 0; i < n; i++) {
          VX[i] -= X[i] * GX * alpha;
          VY[i] -= Y[i] * GY * alpha;
          VX[i] *= 0.6; VY[i] *= 0.6;
          X[i] += VX[i]; Y[i] += VY[i];
        }
        alpha -= alpha * decay;
      }

      for (var i = 0; i < n; i++) out[list[i].id] = { x: X[i], y: Y[i] };
      return out;
    }

    // One block per subject, packed in rows; prerequisite links mostly stay inside a subject.
    _layersLayout(list) {
      var order = this._domainOrder(list);
      if (order.length <= 1) return this._layersBlock(list);
      var GAPX = 120, GAPY = 150;
      var blocks = order.map(function (d) {
        var pos = this._layersBlock(list.filter(function (n) { return n.domain === d; }));
        var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (var id in pos) {
          x0 = Math.min(x0, pos[id].x); x1 = Math.max(x1, pos[id].x);
          y0 = Math.min(y0, pos[id].y); y1 = Math.max(y1, pos[id].y);
        }
        return { pos: pos, x0: x0, y0: y0, w: x1 - x0, h: y1 - y0 };
      }, this);

      // Shelf-pack the blocks, trying several row widths and keeping the one that fits the screen largest.
      var pack = function (maxW) {
        var rows = [[]], rowW = 0;
        for (var b of blocks) {
          if (rows[rows.length - 1].length && rowW + b.w > maxW) { rows.push([]); rowW = 0; }
          rows[rows.length - 1].push(b);
          rowW += b.w + GAPX;
        }
        var width = 0, height = 0;
        for (var row of rows) {
          width = Math.max(width, row.reduce(function (sum, b) { return sum + b.w; }, 0) + GAPX * (row.length - 1));
          height += Math.max.apply(null, row.map(function (b) { return b.h; })) + GAPY;
        }
        return { rows: rows, width: width, height: height - GAPY };
      };
      var widest = Math.max.apply(null, blocks.map(function (b) { return b.w; }));
      var sumW = blocks.reduce(function (sum, b) { return sum + b.w + GAPX; }, 0);
      var vw = Math.max(this.w - 60, 1), vh = Math.max(this.h - 80, 1);
      var best = null, bestScale = -1;
      for (var t = 0; t <= 16; t++) {
        var p = pack(widest + (sumW - widest) * t / 16);
        var sc = Math.min(vw / Math.max(p.width, 1), vh / Math.max(p.height, 1));
        if (sc > bestScale) { bestScale = sc; best = p; }
      }

      var out = {}, y = 0;
      for (var row of best.rows) {
        var total = row.reduce(function (sum, b) { return sum + b.w; }, 0) + GAPX * (row.length - 1);
        var x = -total / 2, rowH = 0;
        for (var b of row) {
          for (var id in b.pos) out[id] = { x: b.pos[id].x - b.x0 + x, y: b.pos[id].y - b.y0 + y };
          x += b.w + GAPX;
          rowH = Math.max(rowH, b.h);
        }
        y += rowH + GAPY;
      }
      return out;
    }

    // Rows by prerequisite depth: foundations at the top, what they unlock below.
    _layersBlock(list) {
      var n = list.length, out = {};
      if (n === 0) return out;
      var ix = {};
      for (var i = 0; i < n; i++) ix[list[i].id] = i;
      var parents = list.map(function () { return []; });
      var children = list.map(function () { return []; });
      var related = list.map(function () { return []; });
      for (var e of this.edges) {
        var ia = ix[e.a.id], ib = ix[e.b.id];
        if (ia === undefined || ib === undefined) continue;
        if (e.type === 'prereq') { parents[ib].push(ia); children[ia].push(ib); }
        else { related[ia].push(ib); related[ib].push(ia); }
      }

      // Kahn order; nodes left over sit on cycles and take depth from whatever parents resolved.
      var depth = new Int32Array(n), indeg = new Int32Array(n), done = new Uint8Array(n);
      for (var i = 0; i < n; i++) indeg[i] = parents[i].length;
      var queue = [];
      for (var i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);
      while (queue.length) {
        var cur = queue.shift();
        done[cur] = 1;
        for (var c of children[cur]) {
          if (depth[c] < depth[cur] + 1) depth[c] = depth[cur] + 1;
          if (--indeg[c] === 0) queue.push(c);
        }
      }
      for (var i = 0; i < n; i++) {
        if (done[i]) continue;
        var d = 0;
        for (var p of parents[i]) if (done[p]) d = Math.max(d, depth[p] + 1);
        depth[i] = d;
      }
      // Topics with no prerequisite links join the row of the topics they relate to.
      for (var i = 0; i < n; i++) {
        if (parents[i].length || children[i].length) continue;
        var sum = 0, cnt = 0;
        for (var r of related[i]) if (parents[r].length || children[r].length) { sum += depth[r]; cnt++; }
        depth[i] = cnt ? Math.round(sum / cnt) : 0;
      }

      var maxDepth = 0;
      for (var i = 0; i < n; i++) maxDepth = Math.max(maxDepth, depth[i]);
      var layers = [];
      for (var d = 0; d <= maxDepth; d++) layers.push([]);
      for (var i = 0; i < n; i++) layers[depth[i]].push(i);
      layers = layers.filter(function (l) { return l.length; });

      var COL = 100, ROW = 64, GAP = 40;
      var perRow = Math.max(4, Math.round(Math.sqrt(n) * 0.85));
      var order = new Float64Array(n);
      var y = 0;
      for (var l = 0; l < layers.length; l++) {
        var layer = layers[l];
        layer.sort(function (a, b) {
          var ba = 0, bb = 0;
          if (l > 0) {
            for (var p of parents[a]) ba += order[p];
            for (var p of parents[b]) bb += order[p];
            ba = parents[a].length ? ba / parents[a].length : 0.5;
            bb = parents[b].length ? bb / parents[b].length : 0.5;
          }
          return ba - bb || (list[a].name < list[b].name ? -1 : 1);
        });
        var rows = Math.ceil(layer.length / perRow);
        var cols = Math.ceil(layer.length / rows);
        for (var k = 0; k < layer.length; k++) {
          var row = Math.floor(k / cols), col = k % cols;
          var inRow = Math.min(cols, layer.length - row * cols);
          var stagger = rows > 1 && row % 2 ? COL / 2 : 0;
          out[list[layer[k]].id] = { x: (col - (inRow - 1) / 2) * COL + stagger, y: y + row * ROW };
          order[layer[k]] = layer.length > 1 ? k / (layer.length - 1) : 0.5;
        }
        y += rows * ROW + GAP;
      }
      return out;
    }

    // ─── Camera ─────────────────────────────────────────────────────────────────

    // Screen region nodes should fit into; the focus panel covers the bottom (phone) or right (wide).
    _viewport(focused) {
      var v = { x0: 0, y0: 0, x1: this.w, y1: this.h };
      if (focused) {
        if (this.w >= 720) v.x1 = this.w - 372;
        else v.y1 = this.h - Math.min(this.h * 0.5, 400) - 8;
      }
      return v;
    }

    _fitCamera(list, v, minS, maxS) {
      return this._fitPoints(list.map(function (n) { return { x: n.tx, y: n.ty }; }), v, minS, maxS);
    }

    _fitPoints(points, v, minS, maxS) {
      var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (var p of points) {
        if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x;
        if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y;
      }
      if (!isFinite(x0)) return { x: this.camX, y: this.camY, s: this.scale };
      var padX = 30, padTop = 50, padBottom = 30;
      var vw = Math.max(40, v.x1 - v.x0 - padX * 2), vh = Math.max(40, v.y1 - v.y0 - padTop - padBottom);
      var s = clamp(Math.min(vw / Math.max(x1 - x0, 1), vh / Math.max(y1 - y0, 1)), minS, maxS);
      var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      return {
        x: (v.x0 + v.x1) / 2 - cx * s,
        y: v.y0 + padTop + vh / 2 - cy * s,
        s: s
      };
    }

    _fitView(animate) {
      var list = this.nodes.filter(function (n) { return n.visT === 1; });
      var cam = this._fitCamera(list, this._viewport(false), 0.05, 1.6);
      this.fitScale = cam.s;
      this._moveCamera(cam, animate);
    }

    _fitFocus(animate) {
      var f = this._index[this.focusId];
      if (!f) return;
      var list = [f];
      for (var e of f.links) {
        var o = e.a === f ? e.b : e.a;
        if (o.visT === 1) list.push(o);
      }
      var v = this._viewport(true);
      var cam;
      if (list.length === 1) {
        var s = Math.max(this.scale, 1.1);
        cam = { x: (v.x0 + v.x1) / 2 - f.tx * s, y: (v.y0 + v.y1) / 2 - f.ty * s, s: s };
      } else {
        cam = this._fitCamera(list, v, Math.min(this.fitScale, 1), 1.5);
      }
      this._moveCamera(cam, animate);
    }

    _moveCamera(cam, animate) {
      if (!animate) {
        this._camAnim = null;
        this.camX = cam.x; this.camY = cam.y; this.scale = cam.s;
        return;
      }
      this._camAnim = { from: { x: this.camX, y: this.camY, s: this.scale }, to: cam, t0: performance.now(), dur: 600 };
    }

    _stepCamera(now) {
      var a = this._camAnim;
      var t = clamp((now - a.t0) / a.dur, 0, 1), e = easeInOut(t);
      // Interpolate the world point under the screen centre and the log of the scale so zooms feel even.
      var s = Math.exp(Math.log(a.from.s) + (Math.log(a.to.s) - Math.log(a.from.s)) * e);
      var hw = this.w / 2, hh = this.h / 2;
      var fcx = (hw - a.from.x) / a.from.s, fcy = (hh - a.from.y) / a.from.s;
      var tcx = (hw - a.to.x) / a.to.s, tcy = (hh - a.to.y) / a.to.s;
      this.scale = s;
      this.camX = hw - (fcx + (tcx - fcx) * e) * s;
      this.camY = hh - (fcy + (tcy - fcy) * e) * s;
      if (t >= 1) this._camAnim = null;
    }

    _zoomAt(px, py, factor) {
      var s = clamp(this.scale * factor, Math.min(this.fitScale * 0.5, 0.5), 4);
      factor = s / this.scale;
      this.camX = px - factor * (px - this.camX);
      this.camY = py - factor * (py - this.camY);
      this.scale = s;
      this._camAnim = null;
      this._dirty = true;
    }

    // ─── Focus ──────────────────────────────────────────────────────────────────

    // Clearing focus returns the camera to where it was before the first topic was focused.
    _setFocus(n) {
      if (n && !this.focusId) {
        var c = this._camAnim ? this._camAnim.to : { x: this.camX, y: this.camY, s: this.scale };
        this._preFocusCam = { x: c.x, y: c.y, s: c.s };
      }
      var had = !!this.focusId;
      this.focusId = n ? n.id : null;
      this._applyFocus();
      if (n) this._fitFocus(true);
      else if (had && this._preFocusCam) this._moveCamera(this._preFocusCam, true);
      if (!n) this._preFocusCam = null;
      this._dirty = true;
    }

    _applyFocus() {
      var f = this.focusId ? this._index[this.focusId] : null;
      var near = new Set();
      if (f) {
        near.add(f);
        for (var e of f.links) near.add(e.a === f ? e.b : e.a);
      }
      for (var n of this.nodes) n.hlT = !f || near.has(n) ? 1 : 0.1;

      var ego = f ? this._egoPositions(f) : null;
      var moved = false;
      for (var n of this.nodes) {
        if (n.visT !== 1) continue;
        var p = ego && ego[n.id];
        var tx = p ? p.x : n.bx, ty = p ? p.y : n.by;
        if (tx !== n.tx || ty !== n.ty) { n.tx = tx; n.ty = ty; moved = true; }
      }
      if (moved) {
        for (var n of this.nodes) { n.fx = n.x; n.fy = n.y; }
        this._posAnim = { t0: performance.now(), dur: 550 };
      }
    }

    // Fan a focused topic's neighbours out round it: what it needs above, what it leads to below,
    // related topics at the sides. Web positions carry no meaning so this always applies there;
    // Layers rows encode depth, so they only fan out when neighbours would overlap.
    _egoPositions(f) {
      var needs = [], leads = [], related = [];
      for (var e of f.links) {
        var o = e.a === f ? e.b : e.a;
        if (o.visT !== 1) continue;
        if (e.type !== 'prereq') related.push(o);
        else if (e.b === f) needs.push(o);
        else leads.push(o);
      }
      var all = needs.concat(leads, related);
      if (all.length === 0) return null;

      var v = this._viewport(true);
      if (this.layout === 'layers') {
        var pts = [{ x: f.bx, y: f.by }].concat(all.map(function (n) { return { x: n.bx, y: n.by }; }));
        var fit = this._fitPoints(pts, v, Math.min(this.fitScale, 1), 1.5);
        var minD = Infinity;
        for (var i = 0; i < pts.length; i++)
          for (var j = i + 1; j < pts.length; j++)
            minD = Math.min(minD, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
        if (minD * fit.s >= 34) return null;
      }

      var byX = function (a, b) { return a.bx - b.bx; };
      needs.sort(byX); leads.sort(byX).reverse(); related.sort(function (a, b) { return a.by - b.by; });
      var half = Math.ceil(related.length / 2);
      var ring = needs.concat(related.slice(0, half), leads, related.slice(half).reverse());
      var N = ring.length, step = TAU / N;
      var start;
      if (needs.length) start = -Math.PI / 2 - (needs.length - 1) * step / 2;
      else if (leads.length) start = Math.PI / 2 - (half + (leads.length - 1) / 2) * step;
      else start = -Math.PI / 2;

      var s = clamp(this.scale, 0.9, 1.2);
      var rx = Math.min((v.x1 - v.x0) / 2 - 60, 170) / s;
      var ry = Math.min((v.y1 - v.y0 - 90) / 2, 170) / s;
      var out = {};
      for (var i = 0; i < N; i++) {
        var a = start + i * step, k = N > 12 && i % 2 ? 0.6 : 1;
        out[ring[i].id] = { x: f.bx + Math.cos(a) * rx * k, y: f.by + Math.sin(a) * ry * k };
      }
      return out;
    }

    _notifyFocus() {
      if (this.dotNetRef) this.dotNetRef.invokeMethodAsync('OnNodeFocused', this.focusId);
    }

    // ─── Rendering ──────────────────────────────────────────────────────────────

    _readTheme() {
      var css = getComputedStyle(this.canvas);
      var get = function (name, fb) { return css.getPropertyValue(name).trim() || fb; };
      var key = get('--bg-main', '#F5F3EF') + get('--text-primary', '#2C2A26') + get('--bg-card', '#fff');
      if (key === this._themeKey) return this.theme;
      this._themeKey = key;
      var bg = parseColor(get('--bg-main', '#F5F3EF'));
      var dark = luma(bg) < 0.45;
      this.theme = {
        bg: bg,
        card: parseColor(get('--bg-card', '#FFFFFF')),
        text: parseColor(get('--text-primary', '#2C2A26')),
        text2: parseColor(get('--text-secondary', '#5C5850')),
        muted: parseColor(get('--text-muted', '#6B6458')),
        dark: dark,
        font: getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif'
      };
      // Subject hues lose contrast on dark backgrounds; lift them toward white.
      for (var n of this.nodes) n.rgb = dark ? mix(n.hue, [255, 255, 255], 0.22) : n.hue;
      this._textWidths.clear();
      return this.theme;
    }

    _radius(n, s) {
      var base = 6.5 + 6 * Math.sqrt(n.deg / this.maxDeg);
      var r = base * clamp(s, 0.5, 1.3);
      if (n.p > 0) r += 2.5;
      else if (n.next) r *= 0.8;
      if (n.id === this.focusId) r *= 1.2;
      return r;
    }

    _render() {
      var ctx = this.ctx, th = this._readTheme();
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.w, this.h);
      var s = this.scale;
      for (var n of this.nodes) {
        n.sx = n.x * s + this.camX;
        n.sy = n.y * s + this.camY;
        n.r = this._radius(n, s);
        n.on = n.vis > 0.01 && n.sx > -60 && n.sx < this.w + 60 && n.sy > -60 && n.sy < this.h + 60;
      }
      var focus = this.focusId ? this._index[this.focusId] : null;
      this._drawEdges(ctx, th, focus, false);
      if (focus) this._drawEdges(ctx, th, focus, true);

      var dim = [], lit = [];
      for (var n of this.nodes) if (n.on) (n.hl < 0.6 ? dim : lit).push(n);
      for (var n of dim) this._drawNode(ctx, th, n);
      for (var n of lit) if (n !== focus) this._drawNode(ctx, th, n);
      if (focus && focus.on) this._drawNode(ctx, th, focus);

      this._drawLabels(ctx, th, focus);
      ctx.globalAlpha = 1;
    }

    _drawEdges(ctx, th, focus, focusPass) {
      var s = this.scale;
      for (var e of this.edges) {
        var a = e.a, b = e.b;
        var vis = Math.min(a.vis, b.vis);
        if (vis < 0.01 || (!a.on && !b.on)) continue;
        if (a.next && b.next) continue;
        var touches = focus && (a === focus || b === focus);
        if (focusPass !== !!touches) continue;
        var prereq = e.type === 'prereq';
        if (!prereq && !touches && this.layout === 'layers') continue;

        var alpha, width, color;
        if (touches) {
          alpha = prereq ? 0.9 : 0.75;
          width = prereq ? 2.2 : 1.6;
          color = prereq ? focus.rgb : th.text2;
        } else {
          alpha = (prereq ? 0.34 * clamp(s * 1.6, 0.6, 1) : 0.15 * clamp(s * 1.6, 0.45, 1)) * Math.min(a.hl, b.hl) * (focus ? 0.4 : 1);
          if (a.next || b.next) alpha *= 0.7;
          if (th.dark) alpha *= 1.35;
          width = prereq ? 1.3 : 1;
          color = th.muted;
        }
        alpha *= vis;
        if (alpha < 0.01) continue;

        var dx = b.sx - a.sx, dy = b.sy - a.sy;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < a.r + b.r + 2) continue;
        var ux = dx / len, uy = dy / len;
        var x0 = a.sx + ux * (a.r + 1.5), y0 = a.sy + uy * (a.r + 1.5);
        var x1 = b.sx - ux * (b.r + 1.5), y1 = b.sy - uy * (b.r + 1.5);

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = rgba(color, 1);
        ctx.lineWidth = width;
        ctx.beginPath();
        if (prereq) {
          var arrow = touches || (len > 40 && s >= 0.45);
          var head = touches ? 7 : 5;
          ctx.setLineDash([]);
          ctx.moveTo(x0, y0);
          ctx.lineTo(arrow ? x1 - ux * head * 0.8 : x1, arrow ? y1 - uy * head * 0.8 : y1);
          ctx.stroke();
          if (arrow) {
            ctx.fillStyle = rgba(color, 1);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 - ux * head * 1.6 - uy * head * 0.75, y1 - uy * head * 1.6 + ux * head * 0.75);
            ctx.lineTo(x1 - ux * head * 1.6 + uy * head * 0.75, y1 - uy * head * 1.6 - ux * head * 0.75);
            ctx.closePath();
            ctx.fill();
          }
        } else {
          // Related links bow slightly so they read apart from straight prerequisite arrows.
          var bend = len * 0.12;
          ctx.setLineDash(touches ? [5, 4] : [3, 4]);
          ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo((x0 + x1) / 2 - uy * bend, (y0 + y1) / 2 + ux * bend, x1, y1);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    _drawNode(ctx, th, n) {
      var a = n.vis * n.hl;
      if (a < 0.01) return;
      var x = n.sx, y = n.sy, r = n.r, hue = n.rgb;
      var isFocus = n.id === this.focusId;
      ctx.globalAlpha = a;

      if (isFocus) {
        ctx.fillStyle = rgba(hue, 0.2);
        ctx.beginPath();
        ctx.arc(x, y, r + 9, 0, TAU);
        ctx.fill();
      }

      if (n.p >= 100) {
        ctx.fillStyle = rgba(hue, 0.18);
        ctx.beginPath();
        ctx.arc(x, y, r + 3.5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = rgba(hue, 1);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        if (r >= 6) {
          var k = r / 10;
          ctx.strokeStyle = 'rgba(255,255,255,0.95)';
          ctx.lineWidth = Math.max(1.5, 2 * k);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(x - 4.2 * k, y + 0.2 * k);
          ctx.lineTo(x - 1.2 * k, y + 3.2 * k);
          ctx.lineTo(x + 4.4 * k, y - 3.2 * k);
          ctx.stroke();
          ctx.lineCap = 'butt';
        }
      } else if (n.p > 0) {
        var ring = Math.max(2, r * 0.3);
        ctx.fillStyle = rgba(mix(th.card, hue, 0.14), 1);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        ctx.lineWidth = ring;
        ctx.strokeStyle = rgba(hue, 0.25);
        ctx.beginPath();
        ctx.arc(x, y, r - ring / 2, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = rgba(hue, 1);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x, y, r - ring / 2, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0.06, n.p / 100));
        ctx.stroke();
        ctx.lineCap = 'butt';
      } else if (n.next) {
        ctx.fillStyle = rgba(th.bg, 1);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        ctx.setLineDash([2.5, 2.5]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = rgba(hue, 0.85);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = rgba(mix(th.bg, hue, th.dark ? 0.5 : 0.38), 1);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(hue, th.dark ? 0.55 : 0.5);
        ctx.stroke();
      }

      if (n === this._hovered && !isFocus) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = rgba(hue, 0.6);
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, TAU);
        ctx.stroke();
      }
    }

    _textWidth(ctx, font, text) {
      var key = font + '|' + text;
      var w = this._textWidths.get(key);
      if (w === undefined) { ctx.font = font; w = ctx.measureText(text).width; this._textWidths.set(key, w); }
      return w;
    }

    // Labels go to the focused node, its neighbours and learned topics first, then subject names over
    // their clusters; other topics only once zoomed in. A label that would overlap a placed label (or,
    // for minor labels, a node) is tried on another side, then dropped.
    _drawLabels(ctx, th, focus) {
      var zoomed = this.scale >= 0.8;
      var cands = [];
      for (var n of this.nodes) {
        if (!n.on || n.vis < 0.6) continue;
        var pri;
        if (focus) {
          if (n === focus) pri = 0;
          else if (n.hl > 0.5) pri = 1;
          else continue;
        } else if (n.p > 0) pri = 2;
        else if (n.next && (zoomed || this.mine)) pri = 3;
        else if (zoomed) pri = 4;
        else continue;
        cands.push({ n: n, pri: pri });
      }
      if (!focus && !zoomed) {
        var groups = {};
        for (var n of this.nodes) {
          if (n.visT !== 1 || n.vis < 0.6) continue;
          var g = groups[n.domain] || (groups[n.domain] = { x: 0, y: 0, k: 0, top: Infinity, bottom: -Infinity, rgb: n.rgb });
          g.x += n.sx; g.y += n.sy; g.k++;
          g.top = Math.min(g.top, n.sy - n.r); g.bottom = Math.max(g.bottom, n.sy + n.r);
        }
        var keys = Object.keys(groups);
        if (keys.length > 1) {
          for (var d of keys) {
            var gr = groups[d];
            if (gr.k < 3) continue;
            cands.push({ group: gr, pri: 2.5, k: gr.k, text: this.domainNames[d] || d, x: gr.x / gr.k, y: gr.y / gr.k });
          }
        }
      }
      cands.sort(function (a, b) {
        return a.pri - b.pri || (a.n && b.n ? b.n.p - a.n.p || b.n.deg - a.n.deg : (b.k || 0) - (a.k || 0));
      });

      var obstacles = [];
      for (var n of this.nodes) if (n.on && n.vis > 0.5 && n.hl > 0.5) obstacles.push(n);
      var placed = [];
      var hits = function (x, y, w, h, self, avoidNodes) {
        for (var p of placed) if (x < p.x + p.w && x + w > p.x && y < p.y + p.h && y + h > p.y) return true;
        if (!avoidNodes) return false;
        for (var o of obstacles) {
          if (o === self) continue;
          var nx = clamp(o.sx, x, x + w), ny = clamp(o.sy, y, y + h);
          var ddx = o.sx - nx, ddy = o.sy - ny;
          if (ddx * ddx + ddy * ddy < o.r * o.r) return true;
        }
        return false;
      };
      // A label must sit nearer its own node than any other, or it reads as the neighbour's.
      var owns = function (x, y, w, h, self) {
        var cx = x + w / 2, cy = y + h / 2;
        var own = Math.hypot(self.sx - cx, self.sy - cy) - self.r;
        for (var o of obstacles) {
          if (o !== self && Math.hypot(o.sx - cx, o.sy - cy) - o.r < own - 2) return false;
        }
        return true;
      };

      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.lineJoin = 'round';
      for (var c of cands) {
        var nd = c.n, spots, font, text, color, alpha, size;
        if (c.group) {
          size = 12.5;
          font = '700 ' + size + 'px ' + th.font;
          text = c.text;
          color = mix(th.text, c.group.rgb, th.dark ? 0.55 : 0.6);
          alpha = 1;
        } else {
          var big = c.pri === 0;
          size = big ? 14 : 11.5;
          font = (big ? '700 ' : '600 ') + size + 'px ' + th.font;
          text = big ? nd.name : truncate(nd.name, 24);
          color = c.pri >= 3 ? th.text2 : th.text;
          alpha = Math.min(1, (nd.vis - 0.5) * 2) * Math.min(1, nd.hl) * (c.pri >= 3 ? 0.85 : 1);
        }
        var w = this._textWidth(ctx, font, text) + 4, h = size + 4;
        if (c.group) {
          var mid = [c.x - w / 2, c.y - h / 2], above = [c.x - w / 2, c.group.top - h - 2];
          spots = this.layout === 'layers' ? [above, mid] : [mid, above, [c.x - w / 2, c.group.bottom + 2]];
        } else {
          var gap = nd.r + 3, diag = nd.r * 0.7;
          spots = [
            [nd.sx - w / 2, nd.sy + gap],
            [nd.sx - w / 2, nd.sy - gap - h],
            [nd.sx + gap + 1, nd.sy - h / 2],
            [nd.sx - gap - 1 - w, nd.sy - h / 2],
            [nd.sx + diag, nd.sy + diag],
            [nd.sx - diag - w, nd.sy + diag],
            [nd.sx + diag, nd.sy - diag - h],
            [nd.sx - diag - w, nd.sy - diag - h]
          ];
        }
        var spot = null;
        // Learned topics get a second pass on the four sides that ignores nodes, so they keep a label in dense clusters.
        for (var pass = 0; pass < 2 && !spot; pass++) {
          var strict = pass === 0 && !c.group;
          if (pass === 1 && (c.group || c.pri === 1 || c.pri >= 3)) break;
          for (var i = 0; i < (pass === 0 ? spots.length : 4); i++) {
            var sp = spots[i];
            if (sp[0] < 2 || sp[0] + w > this.w - 2 || sp[1] < 36 || sp[1] + h > this.h - 2) continue;
            if (!hits(sp[0], sp[1], w, h, nd, strict) && (!strict || owns(sp[0], sp[1], w, h, nd))) { spot = sp; break; }
          }
        }
        if (!spot && c.pri === 0) spot = [clamp(spots[0][0], 2, this.w - w - 2), spots[0][1]];
        if (!spot) continue;
        placed.push({ x: spot[0], y: spot[1], w: w, h: h });

        ctx.font = font;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = c.pri === 0 ? 4 : 3.5;
        ctx.strokeStyle = rgba(th.bg, 0.92);
        var tx = Math.round(spot[0] + 2), ty = Math.round(spot[1] + h / 2);
        ctx.strokeText(text, tx, ty);
        ctx.fillStyle = rgba(color, 1);
        ctx.fillText(text, tx, ty);
      }
    }

    // ─── Main loop ──────────────────────────────────────────────────────────────

    _step(now) {
      var active = false;
      var dt = Math.min(64, now - (this._lastFrame || now));
      this._lastFrame = now;

      if (this._posAnim) {
        var t = clamp((now - this._posAnim.t0) / this._posAnim.dur, 0, 1), e = easeInOut(t);
        for (var n of this.nodes) {
          n.x = n.fx + (n.tx - n.fx) * e;
          n.y = n.fy + (n.ty - n.fy) * e;
        }
        if (t >= 1) this._posAnim = null;
        active = true;
      }
      if (this._camAnim) { this._stepCamera(now); active = true; }

      var k = 1 - Math.exp(-dt / 110);
      for (var n of this.nodes) {
        if (n.vis !== n.visT) {
          n.vis += (n.visT - n.vis) * k;
          if (Math.abs(n.vis - n.visT) < 0.004) n.vis = n.visT;
          active = true;
        }
        if (n.hl !== n.hlT) {
          n.hl += (n.hlT - n.hl) * k;
          if (Math.abs(n.hl - n.hlT) < 0.004) n.hl = n.hlT;
          active = true;
        }
      }
      return active;
    }

    _loop(now) {
      if (!this.running) return;
      var active = this._step(now || performance.now());
      // Idle frames skip drawing; input and API calls set _dirty.
      if (active || this._dirty) {
        this._render();
        this._dirty = false;
      }
      this.animFrameId = requestAnimationFrame(this._loop);
    }

    // ─── Events ─────────────────────────────────────────────────────────────────

    _attachEvents() {
      var c = this.canvas;
      c.addEventListener('mousedown', this._onMouseDown);
      c.addEventListener('mousemove', this._onMouseMove);
      c.addEventListener('mouseleave', this._onMouseLeave);
      window.addEventListener('mouseup', this._onMouseUp);
      c.addEventListener('wheel', this._onWheel, { passive: false });
      c.addEventListener('touchstart', this._onTouchStart, { passive: false });
      c.addEventListener('touchmove', this._onTouchMove, { passive: false });
      c.addEventListener('touchend', this._onTouchEnd);
      c.addEventListener('touchcancel', this._onTouchEnd);
      if (window.ResizeObserver) {
        this._resizeObserver = new ResizeObserver(this._onResize);
        this._resizeObserver.observe(c.parentElement || c);
      } else {
        window.addEventListener('resize', this._onResize);
      }
    }

    _detachEvents() {
      var c = this.canvas;
      if (c) {
        c.removeEventListener('mousedown', this._onMouseDown);
        c.removeEventListener('mousemove', this._onMouseMove);
        c.removeEventListener('mouseleave', this._onMouseLeave);
        c.removeEventListener('wheel', this._onWheel);
        c.removeEventListener('touchstart', this._onTouchStart);
        c.removeEventListener('touchmove', this._onTouchMove);
        c.removeEventListener('touchend', this._onTouchEnd);
        c.removeEventListener('touchcancel', this._onTouchEnd);
      }
      window.removeEventListener('mouseup', this._onMouseUp);
      window.removeEventListener('resize', this._onResize);
      if (this._resizeObserver) { this._resizeObserver.disconnect(); this._resizeObserver = null; }
    }

    _local(clientX, clientY) {
      var rect = this.canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    _nodeAt(px, py) {
      var best = null, bestD = Infinity;
      for (var n of this.nodes) {
        if (n.visT !== 1 || !n.on) continue;
        var dx = n.sx - px, dy = n.sy - py;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > Math.max(n.r + 6, 20)) continue;
        if (n.hl > 0.5) d -= 6;
        if (d < bestD) { bestD = d; best = n; }
      }
      return best;
    }

    _tap(px, py) {
      var hit = this._nodeAt(px, py);
      if (hit) {
        this._setFocus(hit);
        this._notifyFocus();
      } else if (this.focusId) {
        this._setFocus(null);
        this._notifyFocus();
      }
    }

    _pan(dx, dy) {
      this.camX += dx;
      this.camY += dy;
      this._camAnim = null;
      this._dirty = true;
    }

    _onMouseDown(e) {
      if (e.button !== 0) return;
      this._pointer = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false };
    }

    _onMouseMove(e) {
      var p = this._pointer;
      if (p) {
        if (Math.abs(e.clientX - p.sx) + Math.abs(e.clientY - p.sy) > 5) p.moved = true;
        if (p.moved) {
          this._pan(e.clientX - p.x, e.clientY - p.y);
          this.canvas.style.cursor = 'grabbing';
        }
        p.x = e.clientX; p.y = e.clientY;
        return;
      }
      var l = this._local(e.clientX, e.clientY);
      var hover = this._nodeAt(l.x, l.y);
      if (hover !== this._hovered) {
        this._hovered = hover;
        this.canvas.style.cursor = hover ? 'pointer' : 'grab';
        this._dirty = true;
      }
    }

    _onMouseUp(e) {
      var p = this._pointer;
      this._pointer = null;
      if (!p || !this.canvas) return;
      this.canvas.style.cursor = this._hovered ? 'pointer' : 'grab';
      if (!p.moved) {
        var l = this._local(e.clientX, e.clientY);
        this._tap(l.x, l.y);
      }
    }

    _onMouseLeave() {
      if (this._hovered) { this._hovered = null; this._dirty = true; }
    }

    _onWheel(e) {
      e.preventDefault();
      var l = this._local(e.clientX, e.clientY);
      this._zoomAt(l.x, l.y, Math.exp(-e.deltaY * 0.0015));
    }

    _onTouchStart(e) {
      e.preventDefault();
      if (e.touches.length === 1) {
        var t = e.touches[0];
        this._pointer = { x: t.clientX, y: t.clientY, sx: t.clientX, sy: t.clientY, moved: false, t0: Date.now() };
        this._pinch = null;
      } else if (e.touches.length === 2) {
        this._pointer = null;
        var a = e.touches[0], b = e.touches[1];
        this._pinch = { dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1 };
      }
    }

    _onTouchMove(e) {
      e.preventDefault();
      if (e.touches.length === 1 && this._pointer) {
        var t = e.touches[0], p = this._pointer;
        if (Math.abs(t.clientX - p.sx) + Math.abs(t.clientY - p.sy) > 8) p.moved = true;
        if (p.moved) this._pan(t.clientX - p.x, t.clientY - p.y);
        p.x = t.clientX; p.y = t.clientY;
      } else if (e.touches.length === 2 && this._pinch) {
        var a = e.touches[0], b = e.touches[1];
        var dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1;
        var mid = this._local((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
        if (this._pinch.mid) this._pan(mid.x - this._pinch.mid.x, mid.y - this._pinch.mid.y);
        this._zoomAt(mid.x, mid.y, dist / this._pinch.dist);
        this._pinch.dist = dist;
        this._pinch.mid = mid;
      }
    }

    _onTouchEnd(e) {
      if (e.touches.length === 0) {
        var p = this._pointer;
        this._pointer = null;
        this._pinch = null;
        if (p && !p.moved && Date.now() - p.t0 < 500 && this.canvas) {
          var l = this._local(p.x, p.y);
          this._tap(l.x, l.y);
        }
      } else if (e.touches.length === 1) {
        // Lifting one finger of a pinch continues as a pan, never a tap.
        var t = e.touches[0];
        this._pinch = null;
        this._pointer = { x: t.clientX, y: t.clientY, sx: t.clientX, sy: t.clientY, moved: true, t0: 0 };
      }
    }

    _onResize() {
      var w = this.w, h = this.h;
      this._resize();
      if (!this._hasView || (w === this.w && h === this.h)) return;
      if (this.focusId) this._fitFocus(false);
      else this._fitView(false);
    }

    _resize() {
      if (!this.canvas) return;
      var parent = this.canvas.parentElement || document.body;
      var dpr = window.devicePixelRatio || 1;
      var w = parent.clientWidth;
      var h = parent.clientHeight || window.innerHeight * 0.75;
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.dpr = dpr;
      this.w = w;
      this.h = h;
      this._dirty = true;
    }
  }

  var _instance = null;

  function touch() { if (_instance) _instance._dirty = true; }

  window.TopicGraph = {
    init: function (canvasId, graphData, options, dotNetRef) {
      if (_instance) _instance.destroy();
      _instance = new TopicGraph();
      _instance.init(canvasId, graphData, options, dotNetRef);
    },
    setView: function (key, ids, nextIds, layout) {
      if (_instance) _instance.setView(key, ids, nextIds, layout);
      touch();
    },
    focus: function (id) {
      var ok = _instance ? _instance.focus(id) : false;
      touch();
      return ok;
    },
    fit: function () {
      if (_instance) _instance.fit();
      touch();
    },
    screenPos: function (id) {
      return _instance ? _instance.screenPos(id) : null;
    },
    destroy: function () {
      if (_instance) { _instance.destroy(); _instance = null; }
    }
  };
})();
