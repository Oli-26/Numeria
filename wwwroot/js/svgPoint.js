// ES module, loaded on demand with JS.InvokeAsync<IJSObjectReference>("import", "./js/svgPoint.js").
// Captures the pointer so a drag keeps reporting outside the SVG, and returns the inverse screen
// matrix [a, b, c, d, e, f] so .NET can map clientX/clientY into viewBox units without a round trip per move.
export function beginDrag(svg, pointerId) {
    try { svg.setPointerCapture(pointerId); } catch (e) { }
    var m = svg.getScreenCTM();
    if (!m) return null;
    var inv = m.inverse();
    return [inv.a, inv.b, inv.c, inv.d, inv.e, inv.f];
}
