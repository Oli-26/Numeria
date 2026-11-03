// A finished lane sweeps up its now-sorted values as a rising run of notes, then rings.
window.AlgoRaceLab = {
    finish: function (laneId, values, won) {
        if (!window.SimFx) return;
        var n = values.length, picks = Math.min(n, 24), span = 0.7;
        for (var k = 0; k < picks; k++) {
            var v = values[Math.round(k * (n - 1) / Math.max(1, picks - 1))];
            SimFx.play('tone', { freq: 200 + 1000 * v, type: 'triangle', gain: 0.08, dur: 0.06, delay: k * span / picks, key: laneId + '-sweep-' + k });
        }
        SimFx.play('chime', { freq: won ? 784 : 587, gain: won ? 0.08 : 0.05, delay: span + 0.05, key: laneId + '-chime' });
        setTimeout(function () { SimFx.haptic(won ? 'success' : 'light'); }, (span + 0.05) * 1000);
    }
};
