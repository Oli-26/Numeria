/**
 * TopicGraph — force-directed knowledge graph renderer
 * Uses HTML5 Canvas for 60fps rendering with touch/mouse support.
 * Exposed as window.TopicGraph for Blazor JSInterop.
 */
(function () {
  'use strict';

  class TopicGraph {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.nodes = [];
      this.edges = [];
      this.dotNetRef = null;
      this.animFrameId = null;
      this.running = false;

      // Layout
      this.w = 0;
      this.h = 0;

      // Camera
      this.camX = 0;
      this.camY = 0;
      this.scale = 1;

      // Interaction
      this.dragging = false;
      this.dragNode = null;
      this.lastPointer = { x: 0, y: 0 };
      this.pinchDist = 0;
      this.hoveredNode = null;

      // Simulation
      this.simSteps = 0;
      this.maxSimSteps = 300;

      // Layout mode: force | circular | grid | hierarchical | radial
      this.layout = 'force';

      // Bind handlers
      this._onMouseDown = this._onMouseDown.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseUp = this._onMouseUp.bind(this);
      this._onWheel = this._onWheel.bind(this);
      this._onTouchStart = this._onTouchStart.bind(this);
      this._onTouchMove = this._onTouchMove.bind(this);
      this._onTouchEnd = this._onTouchEnd.bind(this);
      this._onResize = this._onResize.bind(this);
      this._loop = this._loop.bind(this);
    }

    // ─── Public API (called from Blazor) ───────────────────────────────────────

    init(canvasId, graphData, completedIds, dotNetRef) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.dotNetRef = dotNetRef;
      this._resize();
      this._loadGraph(graphData, completedIds || []);
      this._attachEvents();
      this.running = true;
      this._loop();
    }

    updateCompleted(completedIds) {
      for (var n of this.nodes) {
        n.completed = completedIds.includes(n.id);
      }
    }

    filterDomain(domain) {
      // domain === 'all' means show everything
      for (var n of this.nodes) {
        n.hidden = domain !== 'all' && n.domain !== domain;
      }
    }

    setLayout(mode) {
      this.layout = mode || 'force';
      this._applyLayout();
    }

    _applyLayout() {
      var visible = this.nodes.filter(function (n) { return !n.hidden; });
      if (visible.length === 0) return;

      switch (this.layout) {
        case 'circular': this._layoutCircular(visible); break;
        case 'grid': this._layoutGrid(visible); break;
        case 'hierarchical': this._layoutHierarchical(visible); break;
        case 'radial': this._layoutRadial(visible); break;
        case 'force':
        default: this._layoutForce(visible); break;
      }
      this._fit();
    }

    _layoutForce(visible) {
      // Reseed in domain clusters and let the simulation re-run.
      var domainOrder = this._domainOrder(visible);
      var cx = this.w / 2, cy = this.h / 2;
      var clusterR = Math.min(this.w, this.h) * 0.32;
      var counts = {}, idxMap = {};
      for (var n of visible) counts[n.domain] = (counts[n.domain] || 0) + 1;
      for (var n of visible) {
        var di = domainOrder.indexOf(n.domain);
        if (di < 0) di = 0;
        var angle = (di / domainOrder.length) * Math.PI * 2;
        var idx = idxMap[n.domain] = (idxMap[n.domain] || 0) + 1;
        var count = counts[n.domain];
        var spread = (Math.PI * 2) / domainOrder.length * 0.65;
        var localAngle = angle + spread * ((idx - 1) / Math.max(count - 1, 1) - 0.5);
        var r = clusterR * (0.85 + Math.random() * 0.3);
        n.x = cx + Math.cos(localAngle) * r + (Math.random() - 0.5) * 30;
        n.y = cy + Math.sin(localAngle) * r + (Math.random() - 0.5) * 30;
        n.vx = 0; n.vy = 0;
      }
      this.simSteps = 0; // re-run simulation
    }

    _layoutCircular(visible) {
      // Sort by domain so same-domain nodes are adjacent on the ring
      visible.sort(function (a, b) { return a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name); });
      var cx = this.w / 2, cy = this.h / 2;
      var R = Math.min(this.w, this.h) * 0.42;
      for (var i = 0; i < visible.length; i++) {
        var t = (i / visible.length) * Math.PI * 2 - Math.PI / 2;
        var n = visible[i];
        n.x = cx + Math.cos(t) * R;
        n.y = cy + Math.sin(t) * R;
        n.vx = 0; n.vy = 0;
      }
      this.simSteps = this.maxSimSteps; // freeze
    }

    _layoutGrid(visible) {
      // Group by domain, lay out each domain as a row
      var groups = {};
      for (var n of visible) (groups[n.domain] = groups[n.domain] || []).push(n);
      var domainKeys = Object.keys(groups).sort();
      var marginX = 60, marginY = 60;
      var rowH = (this.h - marginY * 2) / Math.max(domainKeys.length, 1);
      for (var r = 0; r < domainKeys.length; r++) {
        var arr = groups[domainKeys[r]];
        var colW = (this.w - marginX * 2) / Math.max(arr.length, 1);
        for (var c = 0; c < arr.length; c++) {
          var nd = arr[c];
          nd.x = marginX + colW * (c + 0.5);
          nd.y = marginY + rowH * (r + 0.5);
          nd.vx = 0; nd.vy = 0;
        }
      }
      this.simSteps = this.maxSimSteps;
    }

    _layoutHierarchical(visible) {
      // BFS depth from prereq edges. Roots = nodes with no incoming prereq.
      var idx = {};
      for (var n of visible) idx[n.id] = n;
      var incoming = {};
      for (var e of this.edges) {
        if (e.type !== 'prereq') continue;
        if (!idx[e.from] || !idx[e.to]) continue;
        incoming[e.to] = (incoming[e.to] || 0) + 1;
      }
      var depth = {};
      var queue = [];
      for (var n of visible) {
        if (!incoming[n.id]) { depth[n.id] = 0; queue.push(n.id); }
      }
      // If no roots (cycles or no prereq edges), seed all at 0
      if (queue.length === 0) for (var n of visible) { depth[n.id] = 0; queue.push(n.id); }
      while (queue.length) {
        var cur = queue.shift();
        var d = depth[cur];
        for (var e of this.edges) {
          if (e.type !== 'prereq' || e.from !== cur) continue;
          var nd = depth[e.to];
          if (nd === undefined || nd < d + 1) {
            depth[e.to] = d + 1;
            queue.push(e.to);
          }
        }
      }
      // Layers
      var maxDepth = 0;
      for (var n of visible) {
        if (depth[n.id] === undefined) depth[n.id] = 0;
        if (depth[n.id] > maxDepth) maxDepth = depth[n.id];
      }
      var layers = [];
      for (var i = 0; i <= maxDepth; i++) layers.push([]);
      for (var n of visible) layers[depth[n.id]].push(n);
      var marginX = 60, marginY = 60;
      var layerH = (this.h - marginY * 2) / Math.max(maxDepth + 1, 1);
      for (var l = 0; l < layers.length; l++) {
        var arr = layers[l];
        arr.sort(function (a, b) { return a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name); });
        var colW = (this.w - marginX * 2) / Math.max(arr.length, 1);
        for (var c = 0; c < arr.length; c++) {
          arr[c].x = marginX + colW * (c + 0.5);
          arr[c].y = marginY + layerH * (l + 0.5);
          arr[c].vx = 0; arr[c].vy = 0;
        }
      }
      this.simSteps = this.maxSimSteps;
    }

    _layoutRadial(visible) {
      // Center hub per domain, nodes on concentric petals
      var groups = {};
      for (var n of visible) (groups[n.domain] = groups[n.domain] || []).push(n);
      var domainKeys = Object.keys(groups).sort();
      var cx = this.w / 2, cy = this.h / 2;
      var hubR = Math.min(this.w, this.h) * 0.18;
      var petalR = Math.min(this.w, this.h) * 0.16;
      for (var di = 0; di < domainKeys.length; di++) {
        var angle = (di / domainKeys.length) * Math.PI * 2 - Math.PI / 2;
        var hubX = cx + Math.cos(angle) * hubR * 1.2;
        var hubY = cy + Math.sin(angle) * hubR * 1.2;
        var arr = groups[domainKeys[di]];
        for (var i = 0; i < arr.length; i++) {
          var t = (i / Math.max(arr.length, 1)) * Math.PI * 2;
          var nd = arr[i];
          nd.x = hubX + Math.cos(t) * petalR;
          nd.y = hubY + Math.sin(t) * petalR;
          nd.vx = 0; nd.vy = 0;
        }
      }
      this.simSteps = this.maxSimSteps;
    }

    _domainOrder(visible) {
      var seen = {};
      var order = [];
      for (var n of visible) if (!seen[n.domain]) { seen[n.domain] = true; order.push(n.domain); }
      return order.length ? order : ['math','physics','chemistry','biology','geology','history','linguistics','philosophy'];
    }

    _fit() {
      // Reset camera so the new layout is visible
      this.camX = 0; this.camY = 0; this.scale = 1;
    }

    destroy() {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = 0;

        var removeListeners = ['mousedown', 'mouseup', 'mousemove', 'mouseleave', 'touchstart', 'touchmove', 'touchend', 'wheel'];
        for (var i = 0; i < removeListeners.length; i++) {
            this.canvas && this.canvas.removeEventListener(removeListeners[i], this.eventProxy);
        }
        window.removeEventListener('resize', this.resizeProxy);
        this.eventProxy = null;
        this.resizeProxy = null;

        this.canvas = null;
        this.ctx = null;
        this.nodes = null;
        this.edges = null;
        this.dotNetRef = null;
    }

    // ─── Graph loading ──────────────────────────────────────────────────────────

    _loadGraph(graphData, completedIds) {
      var data = typeof graphData === 'string' ? JSON.parse(graphData) : graphData;
      var nodeCount = data.nodes.length;

      // Place nodes in a rough domain cluster layout on a circle
      var domainOrder = ['math','physics','chemistry','biology','geology','history','linguistics','philosophy'];
      var domainAngles = {};
      domainOrder.forEach(function (d, i) {
        domainAngles[d] = (i / domainOrder.length) * Math.PI * 2;
      });

      var W = this.w, H = this.h;
      var centerX = W / 2, centerY = H / 2;
      var clusterR = Math.min(W, H) * 0.32;

      // Count per domain
      var domainCounts = {};
      for (var nd of data.nodes) {
        domainCounts[nd.domain] = (domainCounts[nd.domain] || 0) + 1;
      }
      var domainIdx = {};

      this.nodes = data.nodes.map(function (n) {
        var angle = domainAngles[n.domain] || 0;
        var idx = domainIdx[n.domain] = (domainIdx[n.domain] || 0) + 1;
        var count = domainCounts[n.domain];
        // Spread within cluster: stagger in a smaller arc around the cluster angle
        var spread = (Math.PI * 2) / domainOrder.length * 0.65;
        var localAngle = angle + spread * ((idx - 1) / Math.max(count - 1, 1) - 0.5);
        var r = clusterR * (0.85 + Math.random() * 0.3);
        return {
          id: n.id,
          name: n.name,
          domain: n.domain,
          color: '#888',
          x: centerX + Math.cos(localAngle) * r + (Math.random() - 0.5) * 30,
          y: centerY + Math.sin(localAngle) * r + (Math.random() - 0.5) * 30,
          vx: 0,
          vy: 0,
          completed: completedIds.includes(n.id),
          hidden: false,
          r: 14
        };
      });

      this.edges = data.edges.map(function (e) {
        return { from: e.from, to: e.to, type: e.type, strength: e.strength };
      });

      // Build index
      this._nodeIndex = {};
      for (var node of this.nodes) {
        this._nodeIndex[node.id] = node;
      }

      this.simSteps = 0;
    }

    setColors(colorMap) {
      // colorMap: { topicId -> color }
      var map = typeof colorMap === 'string' ? JSON.parse(colorMap) : colorMap;
      for (var n of this.nodes) {
        if (map[n.id]) n.color = map[n.id];
      }
    }

    // ─── Physics simulation ─────────────────────────────────────────────────────

    _simulate() {
      if (this.layout !== 'force') return;
      if (this.simSteps >= this.maxSimSteps && !this.dragging) return;
      this.simSteps++;

      var nodes = this.nodes;
      var edges = this.edges;
      var idx = this._nodeIndex;
      var W = this.w, H = this.h;
      var cx = W / 2, cy = H / 2;

      var REPULSE = 2200;
      var SPRING_LEN = 90;
      var SPRING_K = 0.012;
      var DOMAIN_K = 0.004;
      var DAMPEN = 0.78;
      var CENTER_K = 0.0015;

      // Domain cluster centres (same as initial placement)
      var domainOrder = ['math','physics','chemistry','biology','geology','history','linguistics','philosophy'];
      var clusterR = Math.min(W, H) * 0.32;
      var domainCenters = {};
      domainOrder.forEach(function (d, i) {
        var angle = (i / domainOrder.length) * Math.PI * 2;
        domainCenters[d] = { x: cx + Math.cos(angle) * clusterR, y: cy + Math.sin(angle) * clusterR };
      });

      // Repulsion between all nodes
      for (var i = 0; i < nodes.length; i++) {
        var ni = nodes[i];
        if (ni.hidden || ni === this.dragNode) continue;
        for (var j = i + 1; j < nodes.length; j++) {
          var nj = nodes[j];
          if (nj.hidden || nj === this.dragNode) continue;
          var dx = ni.x - nj.x;
          var dy = ni.y - nj.y;
          var dist2 = dx * dx + dy * dy;
          if (dist2 < 1) { dx = 1; dy = 1; dist2 = 2; }
          var dist = Math.sqrt(dist2);
          var force = REPULSE / dist2;
          var fx = (dx / dist) * force;
          var fy = (dy / dist) * force;
          ni.vx += fx; ni.vy += fy;
          nj.vx -= fx; nj.vy -= fy;
        }
      }

      // Spring forces along edges
      for (var e of edges) {
        var a = idx[e.from], b = idx[e.to];
        if (!a || !b || a.hidden || b.hidden) continue;
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var targetLen = e.type === 'prereq' ? SPRING_LEN * 0.8 : SPRING_LEN * 1.2;
        var stretch = (dist - targetLen) * SPRING_K * e.strength;
        var fx = (dx / dist) * stretch;
        var fy = (dy / dist) * stretch;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }

      // Domain cluster attraction + global center
      for (var n of nodes) {
        if (n.hidden || n === this.dragNode) continue;
        var dc = domainCenters[n.domain];
        if (dc) {
          n.vx += (dc.x - n.x) * DOMAIN_K;
          n.vy += (dc.y - n.y) * DOMAIN_K;
        }
        n.vx += (cx - n.x) * CENTER_K;
        n.vy += (cy - n.y) * CENTER_K;

        // Integrate
        n.vx *= DAMPEN;
        n.vy *= DAMPEN;
        n.x += n.vx;
        n.y += n.vy;
      }
    }

    // ─── Rendering ──────────────────────────────────────────────────────────────

    _render() {
      var ctx = this.ctx;
      var W = this.w, H = this.h;
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.translate(this.camX, this.camY);
      ctx.scale(this.scale, this.scale);

      // Edges
      for (var e of this.edges) {
        var a = this._nodeIndex[e.from];
        var b = this._nodeIndex[e.to];
        if (!a || !b || a.hidden || b.hidden) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = e.type === 'prereq'
          ? 'rgba(100,150,255,0.35)'
          : 'rgba(180,180,180,0.2)';
        ctx.lineWidth = e.type === 'prereq' ? 1.5 * e.strength + 0.5 : 1;
        ctx.stroke();
      }

      // Nodes
      for (var n of this.nodes) {
        if (n.hidden) continue;
        var r = n.r;
        var isHovered = n === this.hoveredNode;

        // Glow for hovered / completed
        if (isHovered || n.completed) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 5, 0, Math.PI * 2);
          var glowColor = n.color + '44';
          ctx.fillStyle = glowColor;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        if (n.completed) {
          ctx.fillStyle = n.color;
        } else {
          ctx.fillStyle = n.color + '33';
        }
        ctx.fill();
        ctx.strokeStyle = n.color;
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        // Checkmark for completed
        if (n.completed) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(n.x - 5, n.y);
          ctx.lineTo(n.x - 1, n.y + 4);
          ctx.lineTo(n.x + 5, n.y - 4);
          ctx.stroke();
        }

        // Label
        var fontSize = Math.max(8, Math.min(11, 11 * this.scale)) / this.scale;
        ctx.font = 'bold ' + fontSize + 'px system-ui, sans-serif';
        ctx.fillStyle = isHovered ? '#fff' : 'rgba(255,255,255,0.75)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Label below node
        ctx.fillText(
          n.name.length > 16 ? n.name.slice(0, 15) + '…' : n.name,
          n.x,
          n.y + r + fontSize * 0.8
        );
      }

      ctx.restore();
    }

    // ─── Main loop ──────────────────────────────────────────────────────────────

    _loop() {
      if (!this.running) return;
      this._simulate();
      this._render();
      this.animFrameId = requestAnimationFrame(this._loop);
    }

    // ─── Events ─────────────────────────────────────────────────────────────────

    _attachEvents() {
      var c = this.canvas;
      c.addEventListener('mousedown', this._onMouseDown);
      c.addEventListener('mousemove', this._onMouseMove);
      c.addEventListener('mouseup', this._onMouseUp);
      c.addEventListener('mouseleave', this._onMouseUp);
      c.addEventListener('wheel', this._onWheel, { passive: false });
      c.addEventListener('touchstart', this._onTouchStart, { passive: false });
      c.addEventListener('touchmove', this._onTouchMove, { passive: false });
      c.addEventListener('touchend', this._onTouchEnd);
      c.addEventListener('touchcancel', this._onTouchEnd);
      window.addEventListener('resize', this._onResize);
    }

    _detachEvents() {
      if (!this.canvas) return;
      var c = this.canvas;
      c.removeEventListener('mousedown', this._onMouseDown);
      c.removeEventListener('mousemove', this._onMouseMove);
      c.removeEventListener('mouseup', this._onMouseUp);
      c.removeEventListener('mouseleave', this._onMouseUp);
      c.removeEventListener('wheel', this._onWheel);
      c.removeEventListener('touchstart', this._onTouchStart);
      c.removeEventListener('touchmove', this._onTouchMove);
      c.removeEventListener('touchend', this._onTouchEnd);
      c.removeEventListener('touchcancel', this._onTouchEnd);
      window.removeEventListener('resize', this._onResize);
    }

    _worldPos(clientX, clientY) {
      var rect = this.canvas.getBoundingClientRect();
      var px = clientX - rect.left;
      var py = clientY - rect.top;
      return {
        x: (px - this.camX) / this.scale,
        y: (py - this.camY) / this.scale
      };
    }

    _nodeAt(wx, wy) {
      for (var i = this.nodes.length - 1; i >= 0; i--) {
        var n = this.nodes[i];
        if (n.hidden) continue;
        var dx = n.x - wx, dy = n.y - wy;
        var hitR = Math.max(n.r, 16 / this.scale); // min 16px hit target → 32px diameter
        if (dx * dx + dy * dy <= hitR * hitR) return n;
      }
      return null;
    }

    _onMouseDown(e) {
      var wp = this._worldPos(e.clientX, e.clientY);
      var hit = this._nodeAt(wp.x, wp.y);
      if (hit) {
        this.dragNode = hit;
        this.simSteps = 0; // re-energise sim
      }
      this.dragging = true;
      this.lastPointer = { x: e.clientX, y: e.clientY };
    }

    _onMouseMove(e) {
      var wp = this._worldPos(e.clientX, e.clientY);
      this.hoveredNode = this._nodeAt(wp.x, wp.y);
      this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'grab';

      if (!this.dragging) return;
      var dx = e.clientX - this.lastPointer.x;
      var dy = e.clientY - this.lastPointer.y;
      if (this.dragNode) {
        this.dragNode.x += dx / this.scale;
        this.dragNode.y += dy / this.scale;
        this.dragNode.vx = 0; this.dragNode.vy = 0;
      } else {
        this.camX += dx;
        this.camY += dy;
      }
      this.lastPointer = { x: e.clientX, y: e.clientY };
    }

    _onMouseUp(e) {
      if (this.dragNode) {
        // Click: check if pointer barely moved
        var wp = this._worldPos(e.clientX, e.clientY);
        var dn = this.dragNode;
        var moved = Math.abs(e.clientX - this.lastPointer.x) + Math.abs(e.clientY - this.lastPointer.y);
        if (moved < 6 && this.dotNetRef) {
          this.dotNetRef.invokeMethodAsync('OnNodeTapped', dn.id);
        }
      }
      this.dragging = false;
      this.dragNode = null;
    }

    _onWheel(e) {
      e.preventDefault();
      var factor = e.deltaY > 0 ? 0.9 : 1.1;
      var rect = this.canvas.getBoundingClientRect();
      var px = e.clientX - rect.left;
      var py = e.clientY - rect.top;
      // Zoom around cursor
      this.camX = px - factor * (px - this.camX);
      this.camY = py - factor * (py - this.camY);
      this.scale = Math.max(0.3, Math.min(4, this.scale * factor));
    }

    _onTouchStart(e) {
      e.preventDefault();
      if (e.touches.length === 1) {
        var t = e.touches[0];
        var wp = this._worldPos(t.clientX, t.clientY);
        var hit = this._nodeAt(wp.x, wp.y);
        this.dragNode = hit || null;
        this.dragging = true;
        this.lastPointer = { x: t.clientX, y: t.clientY };
        this._touchStartPos = { x: t.clientX, y: t.clientY };
        this._touchStartTime = Date.now();
        if (hit) this.simSteps = 0;
      } else if (e.touches.length === 2) {
        this.dragging = false;
        this.dragNode = null;
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        this.pinchDist = Math.sqrt(dx * dx + dy * dy);
        this._pinchMid = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2
        };
      }
    }

    _onTouchMove(e) {
      e.preventDefault();
      if (e.touches.length === 1 && this.dragging) {
        var t = e.touches[0];
        var dx = t.clientX - this.lastPointer.x;
        var dy = t.clientY - this.lastPointer.y;
        if (this.dragNode) {
          this.dragNode.x += dx / this.scale;
          this.dragNode.y += dy / this.scale;
          this.dragNode.vx = 0; this.dragNode.vy = 0;
        } else {
          this.camX += dx;
          this.camY += dy;
        }
        this.lastPointer = { x: t.clientX, y: t.clientY };
      } else if (e.touches.length === 2) {
        var dx2 = e.touches[0].clientX - e.touches[1].clientX;
        var dy2 = e.touches[0].clientY - e.touches[1].clientY;
        var newDist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        var factor = newDist / (this.pinchDist || newDist);
        var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        var rect = this.canvas.getBoundingClientRect();
        var px = midX - rect.left, py = midY - rect.top;
        this.camX = px - factor * (px - this.camX);
        this.camY = py - factor * (py - this.camY);
        this.scale = Math.max(0.3, Math.min(4, this.scale * factor));
        this.pinchDist = newDist;
      }
    }

    _onTouchEnd(e) {
      if (e.touches.length === 0) {
        // Check for tap (short duration, tiny movement)
        var moved = this._touchStartPos
          ? Math.abs(this.lastPointer.x - this._touchStartPos.x) + Math.abs(this.lastPointer.y - this._touchStartPos.y)
          : 99;
        var dt = Date.now() - (this._touchStartTime || 0);
        if (moved < 10 && dt < 300 && this.dragNode && this.dotNetRef) {
          this.dotNetRef.invokeMethodAsync('OnNodeTapped', this.dragNode.id);
        }
        this.dragging = false;
        this.dragNode = null;
      }
    }

    _onResize() {
      this._resize();
      this.simSteps = 0;
    }

    _resize() {
      if (!this.canvas) return;
      var parent = this.canvas.parentElement || document.body;
      var dpr = window.devicePixelRatio || 1;
      var w = parent.clientWidth;
      var h = parent.clientHeight || window.innerHeight * 0.75;
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.scale(dpr, dpr);
      this.w = w;
      this.h = h;
    }
  }

  // Singleton instance
  var _instance = null;

  window.TopicGraph = {
    init: function (canvasId, graphData, completedIds, dotNetRef) {
      if (_instance) _instance.destroy();
      _instance = new TopicGraph();
      _instance.init(canvasId, graphData, completedIds, dotNetRef);
    },
    setColors: function (colorMap) {
      if (_instance) _instance.setColors(colorMap);
    },
    updateCompleted: function (completedIds) {
      if (_instance) _instance.updateCompleted(completedIds);
    },
    filterDomain: function (domain) {
      if (_instance) _instance.filterDomain(domain);
    },
    setLayout: function (mode) {
      if (_instance) _instance.setLayout(mode);
    },
    destroy: function () {
      if (_instance) { _instance.destroy(); _instance = null; }
    }
  };
})();
