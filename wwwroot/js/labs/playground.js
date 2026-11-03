// Detents for the pi experiment: p = 2 (ordinary pi) rings a little higher than the two square cases.
window.PiLab = {
    detent: function (v) {
        if (!window.SimFx) return;
        SimFx.haptic('select');
        SimFx.play('tick', { freq: v === 25 ? 1320 : 990, gain: 0.08, decay: 0.06, key: 'pi-detent' });
    },
    pin: function (id, v) { var el = document.getElementById(id); if (el) el.value = v; }
};
