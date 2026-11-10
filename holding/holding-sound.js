/*
 * Small sound effects for the holding page, synthesised with the Web Audio API (no audio files, nothing downloaded).
 * Sounds play only in response to something the visitor does (picking up a note, snapping it in, finishing, resetting),
 * so the browser's autoplay rules are met. The visitor can mute them with the Sound button. Plain script (not a module).
 *
 *   HoldingSound.play("pick" | "put" | "snap" | "win" | "mess")
 *   HoldingSound.setMuted(true | false)
 */
(function () {
  var Ctx = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, noiseBuf = null, muted = false;

  function ensure() {
    if (!Ctx) return false;
    if (!ctx) {
      try {
        ctx = new Ctx();
        master = ctx.createGain();
        master.gain.value = 0.5;
        master.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
        var d = noiseBuf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; return false; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return true;
  }

  // One enveloped tone; the pitch can glide from freq to slideTo.
  function tone(freq, dur, type, gain, delay, slideTo) {
    var t = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  // A short filtered burst of noise: paper, shuffling.
  function rustle(centre, dur, gain, delay, sweepTo) {
    var t = ctx.currentTime + (delay || 0);
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.9;
    f.frequency.setValueAtTime(centre, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t, Math.random() * 0.2); s.stop(t + dur + 0.02);
  }

  var SOUNDS = {
    pick: function () { rustle(2200, 0.07, 0.07); },                              // paper lifted
    put:  function () { rustle(900, 0.06, 0.06); tone(150, 0.07, "sine", 0.1, 0, 90); },   // set down, not in a slot
    snap: function () { tone(190, 0.11, "sine", 0.28, 0, 85); rustle(3200, 0.03, 0.07); }, // into an outline
    mess: function () { rustle(1600, 0.28, 0.12, 0, 600); rustle(2400, 0.2, 0.08, 0.1, 900); },
    win:  function () {                                                           // rising chime
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        tone(f, 0.55, "triangle", 0.13, i * 0.1);
        tone(f * 2, 0.35, "sine", 0.04, i * 0.1);
      });
    }
  };

  window.HoldingSound = {
    play: function (name) {
      if (muted || !SOUNDS[name] || !ensure()) return;
      try { SOUNDS[name](); } catch (e) { /* sound is optional */ }
    },
    setMuted: function (m) { muted = !!m; },
    isMuted: function () { return muted; },
    supported: !!Ctx
  };
})();
