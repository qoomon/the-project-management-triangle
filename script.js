/* ================================================================
   The Project Management Triangle – Interactive Logic
   ================================================================ */

(function () {
  'use strict';

  /* ── Constants ── */
  var PICK_LIMIT = 2;

  var LABELS = {
    fast:  'FAST',
    cheap: 'CHEAP',
    good:  'GOOD',
  };

  var TAG_CLASSES = {
    fast:  'fast',
    cheap: 'cheap',
    good:  'good',
  };

  /** Default outcome when no or only one constraint is selected. */
  var DEFAULT_OUTCOME = {
    title: 'PICK TWO!',
    desc:  'Click on the corners to choose your constraints and discover the trade-off!',
    badge: 'CHOOSE!',
  };

  /** Trade-off outcomes keyed by the sorted pair of picks. */
  var OUTCOMES = {
    'cheap+fast': {
      title: 'CHEAP & QUICK = LOW QUALITY!',
      desc:  "You'll get it fast and cheap, but don't expect perfection! Bugs, shortcuts, and technical debt await...",
      badge: 'POW!',
    },
    'fast+good': {
      title: 'FAST & GOOD = EXPENSIVE!',
      desc:  "Premium quality at lightning speed? That'll cost ya! Get ready to open that wallet wide...",
      badge: 'KA-CHING!',
    },
    'cheap+good': {
      title: 'CHEAP & GOOD = SLOW!',
      desc:  'Quality work on a budget is possible... if you\'ve got time to spare. Patience is a virtue!',
      badge: 'TICK-TOCK!',
    },
  };

  /* ── State ── */
  var selected = new Set();

  /* ── DOM references ── */
  var btns         = document.querySelectorAll('.pick-btn');
  var corners      = document.querySelectorAll('.corner-box');
  var resultBubble = document.getElementById('resultBubble');
  var resultTitle  = document.getElementById('resultTitle');
  var resultDesc   = document.getElementById('resultDesc');
  var powBadge     = document.getElementById('powBadge');
  var youPicked    = document.getElementById('youPicked');

  /* ── Helpers ── */

  /** Return the canonical outcome key for the current selection. */
  function outcomeKey() {
    return Array.from(selected).sort().join('+');
  }

  /** Build the "YOU PICKED" HTML. */
  function pickedHTML() {
    if (selected.size === 0) {
      return '<span>Select two options above!</span>';
    }
    var html = '<span>YOU PICKED:</span> ';
    selected.forEach(function (s) {
      html += '<span class="picked-tag ' + TAG_CLASSES[s] + '">' + LABELS[s] + '</span> ';
    });
    return html;
  }

  /* ── Core UI update ── */

  function updateUI() {
    /* Buttons */
    btns.forEach(function (btn) {
      var isActive = selected.has(btn.dataset.pick);
      btn.classList.toggle('active',   isActive);
      btn.classList.toggle('inactive', selected.size === PICK_LIMIT && !isActive);
    });

    /* Triangle corners */
    corners.forEach(function (c) {
      var isActive = selected.has(c.dataset.pick);
      c.classList.toggle('active',   isActive);
      c.classList.toggle('inactive', selected.size === PICK_LIMIT && !isActive);
    });

    /* "You picked" indicator */
    youPicked.innerHTML = pickedHTML();

    /* Result bubble */
    var outcome;
    if (selected.size === PICK_LIMIT) {
      outcome = OUTCOMES[outcomeKey()];
    } else {
      outcome = DEFAULT_OUTCOME;
    }

    if (outcome) {
      resultTitle.textContent = outcome.title;
      resultDesc.textContent  = outcome.desc;
      powBadge.textContent    = outcome.badge;
      resultBubble.style.display = 'block';

      /* Apply combo colour class */
      resultBubble.className = 'result-bubble';
      if (selected.size === PICK_LIMIT) {
        resultBubble.classList.add('combo-' + Array.from(selected).sort().join('-'));
      }

      /* Re-trigger pop-in animation */
      resultBubble.style.animation = 'none';
      void resultBubble.offsetWidth;            // force reflow
      resultBubble.style.animation = '';
    }
  }

  /* ── Toggle a pick on / off ── */

  function togglePick(pick) {
    if (selected.has(pick)) {
      selected.delete(pick);
    } else {
      if (selected.size >= PICK_LIMIT) {
        /* Evict the oldest pick */
        var first = selected.values().next().value;
        selected.delete(first);
      }
      selected.add(pick);
    }
    updateUI();
  }

  /* ── Event listeners ── */

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () { togglePick(btn.dataset.pick); });
  });

  corners.forEach(function (c) {
    c.addEventListener('click', function () { togglePick(c.dataset.pick); });
  });

  /* ── Intersection Observer for fade-in sections ── */

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in').forEach(function (el) { observer.observe(el); });

  /* ── Initial state: randomly pre-select two constraints ── */

  var allPicks    = ['fast', 'cheap', 'good'];
  var excludeIdx  = Math.floor(Math.random() * allPicks.length);
  allPicks.forEach(function (pick, i) {
    if (i !== excludeIdx) { selected.add(pick); }
  });
  updateUI();
})();
