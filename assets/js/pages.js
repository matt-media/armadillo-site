/* Armadillo — About + Team pages
   Nav, scroll reveals, photo tilt, design-goals explorer, pipeline demo. */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.remove("no-js");
  doc.classList.add("js");

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Nav: shadow on scroll + mobile toggle ───────────────────────── */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("is-open", !open);
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("is-open");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ── Nav: hand-drawn underline follows the section in view ────────── */
  var navKeys = document.querySelectorAll("[data-nav-key]");
  var spySections = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var currentKey = null;
  function setKey(key) {
    if (key === currentKey) return;
    currentKey = key;
    navKeys.forEach(function (a) {
      if (a.getAttribute("data-nav-key") === key && !a.classList.contains("nav__cta")) {
        a.setAttribute("aria-current", "location");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }
  function spy() {
    if (!spySections.length) return;
    var line = 140;
    var key = spySections[0].getAttribute("data-nav");
    spySections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= line) key = sec.getAttribute("data-nav");
    });
    // At the very bottom, the last section wins
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      key = spySections[spySections.length - 1].getAttribute("data-nav");
    }
    setKey(key);
  }
  var spyTick = false;
  window.addEventListener(
    "scroll",
    function () {
      if (spyTick) return;
      spyTick = true;
      requestAnimationFrame(function () {
        spyTick = false;
        spy();
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", spy);
  spy();

  /* ── Timeline: the road fills and the mark rolls as you scroll ───── */
  var tl = document.querySelector("[data-timeline]");
  if (tl) {
    var phases = tl.querySelectorAll(".phase, .tl__end");
    var tlTick = false;
    var updateTl = function () {
      tlTick = false;
      var r = tl.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = reduceMotion ? 1 : (vh * 0.78 - r.top) / (r.height * 0.9);
      p = Math.max(0, Math.min(1, p));
      tl.style.setProperty("--p", p.toFixed(4));
      phases.forEach(function (ph, i) {
        ph.classList.toggle("is-reached", p >= i / (phases.length - 1) - 0.02);
      });
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!tlTick) {
          tlTick = true;
          requestAnimationFrame(updateTl);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", updateTl);
    updateTl();
  }

  /* ── Scroll reveals ──────────────────────────────────────────────── */
  var revealEls = document.querySelectorAll("[data-reveal], [data-watch]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ── Gentle 3D tilt on framed photos and the pledge badge ────────── */
  var canHover =
    window.matchMedia && window.matchMedia("(hover: hover)").matches;
  if (canHover && !reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt")) || 6;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          "rotateY(" + (x * max).toFixed(2) + "deg) rotateX(" +
          (-y * max).toFixed(2) + "deg)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ── Design goals explorer (About) ───────────────────────────────── */
  var GOALS = [
    {
      goal: "Adds guardrails around safety and privacy",
      features: [
        "Sorts every message on the teen’s own device, so conversations never reach Armadillo’s servers",
        "Keeps a safety floor on crisis messages that can’t be switched off",
        "Reads long messages in parts, so one line of distress isn’t missed",
        "Shows the exact instructions sent to the AI, with nothing hidden",
        { text: "Flags names, addresses, schools and phone numbers before they’re sent", soon: true }
      ],
      stat: { from: "71.4%", to: "7.1%", text: "Privacy violations in KORA testing" }
    },
    {
      goal: "Reduces teen AI dependency",
      features: [
        "Asks teens to take the first step on a problem themselves",
        "Invites teens to explain their own thinking back",
        "Cuts follow-up offers that keep a chat going for its own sake",
        "Suggests a break when the same topic keeps coming back",
        "Points toward next steps that happen offline"
      ],
      stat: { from: "100%", to: "21.4%", text: "Cognitive dependence on AI in KORA testing" }
    },
    {
      goal: "Scaffolds learning instead of giving answers",
      features: [
        "Spots homework and essay requests, including academic integrity cases",
        "Guides with hints, questions and worked examples instead of finished answers",
        "Breaks big assignments into steps the teen does themselves",
        "Checks understanding before moving on"
      ],
      stat: { from: "71.4%", to: "7.1%", text: "Academic dishonesty in KORA testing" }
    },
    {
      goal: "Decreases emotional AI bonds",
      features: [
        "Reduces unneeded AI questions and suggestions",
        "Adds escalating stop signs to avoid long chats",
        "Instructs AI to avoid praise or anthropomorphization",
        "Avoids replacing humans, pointing to humans instead",
        "Promotes social-emotional learning"
      ]
    },
    {
      goal: "Embeds AI literacy lessons",
      features: [
        "Teaches short lessons inside the chat, at the moment they matter",
        "Covers skills like checking a claim, and why a confident answer isn’t evidence",
        "Shows a lesson less once a teen has it, and sooner if they don’t",
        "Keeps lesson history on the teen’s device"
      ]
    },
    {
      goal: "Points teens to vetted resources",
      features: [
        "Keeps a vetted library of crisis lines, peer support and youth organizations",
        "Recommends them in the order that fits the situation",
        "Names real people first: a friend, a parent, a school counselor",
        "Steers a struggling teen toward people, not more chat"
      ],
      stat: { from: "42.9%", to: "0%", text: "Mental health mishandling in KORA testing" }
    },
    {
      goal: "Reduces misinformation and bias",
      features: [
        "Instructs AI to say when it’s unsure instead of sounding certain",
        "Encourages checking claims against trusted sources",
        "Asks AI to avoid stereotypes in its answers",
        "Lays out more than one view on contested topics"
      ],
      stat: { from: "28.6%", to: "0%", text: "Misinformation in KORA testing (bias and stereotyping: 35.7% to 0%)" }
    }
  ];

  var goalsRoot = document.getElementById("goals");
  if (goalsRoot) initGoals(goalsRoot);

  function featureHTML(f, i) {
    var text = typeof f === "string" ? f : f.text;
    var soon = typeof f === "object" && f.soon
      ? '<span class="feature__soon">Coming soon</span>'
      : "";
    return '<li class="feature" style="--i:' + i + '">' + text + soon + "</li>";
  }
  function statHTML(s) {
    if (!s) return "";
    return (
      '<div class="goal-stat"><span class="goal-stat__nums"><s>' + s.from +
      "</s> → " + s.to + "</span><p>" + s.text +
      ", failing conversations without and with Armadillo</p></div>"
    );
  }

  function initGoals(root) {
    var list = root.querySelector(".goals__list");
    var panel = root.querySelector(".goals__panel-body");
    var wires = root.querySelector(".goals__wires");
    var hint = root.querySelector(".goals__hint");
    var buttons = [];
    var inlines = [];
    var current = -1;
    var userTouched = false;
    var autoTimer = null;
    var defaultIndex = 3; // "Decreases emotional AI bonds", as in the deck

    GOALS.forEach(function (g, i) {
      var li = document.createElement("li");
      li.setAttribute("role", "presentation");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "goal";
      btn.id = "goal-" + i;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", "false");
      btn.setAttribute("aria-controls", "goalPanel");
      btn.innerHTML =
        '<span class="goal__num">0' + (i + 1) + "</span><span>" + g.goal +
        '</span><svg class="goal__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var inline = document.createElement("div");
      inline.className = "goal-inline";
      inline.hidden = true;
      li.appendChild(btn);
      li.appendChild(inline);
      list.appendChild(li);
      buttons.push(btn);
      inlines.push(inline);

      btn.addEventListener("mouseenter", function () {
        if (window.matchMedia("(hover: hover)").matches) {
          stopAuto();
          select(i);
        }
      });
      btn.addEventListener("focus", function () {
        stopAuto();
        select(i);
      });
      btn.addEventListener("click", function () {
        stopAuto();
        select(i, true);
      });
      btn.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % GOALS.length;
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + GOALS.length) % GOALS.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = GOALS.length - 1;
        if (next !== null) {
          e.preventDefault();
          buttons[next].focus();
        }
      });
    });
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-orientation", "vertical");

    function select(i, fromClick) {
      if (i === current && !fromClick) return;
      current = i;
      var g = GOALS[i];
      buttons.forEach(function (b, j) {
        b.setAttribute("aria-selected", j === i ? "true" : "false");
        b.tabIndex = j === i ? 0 : -1;
      });
      var featuresHTML =
        '<ul class="feature-list">' + g.features.map(featureHTML).join("") +
        "</ul>" + statHTML(g.stat);
      panel.innerHTML = featuresHTML;
      panel.setAttribute("aria-labelledby", "goal-" + i);
      inlines.forEach(function (el, j) {
        if (j === i) {
          el.innerHTML = featuresHTML;
          el.hidden = false;
        } else {
          el.hidden = true;
          el.innerHTML = "";
        }
      });
      drawWires();
    }

    /* Connector lines: from the active goal to each feature */
    function drawWires() {
      if (!wires || current < 0) return;
      if (window.matchMedia("(max-width: 900px)").matches) {
        wires.innerHTML = "";
        return;
      }
      var box = root.getBoundingClientRect();
      var b = buttons[current].getBoundingClientRect();
      var x1 = b.right - box.left + 10;
      var y1 = b.top + b.height / 2 - box.top;
      var feats = panel.querySelectorAll(".feature");
      var html = '<circle cx="' + x1 + '" cy="' + y1 + '" r="4"/>';
      feats.forEach(function (f, k) {
        var r = f.getBoundingClientRect();
        var x2 = r.left - box.left - 8;
        var y2 = r.top + r.height / 2 - box.top;
        var mx = x1 + (x2 - x1) * 0.5;
        var d = "M" + x1 + " " + y1 + " C" + mx + " " + y1 + " " + mx + " " + y2 + " " + x2 + " " + y2;
        var len = Math.abs(x2 - x1) + Math.abs(y2 - y1) + 40;
        html +=
          '<path d="' + d + '" style="stroke-dasharray:' + len + ";stroke-dashoffset:" + len +
          ';transition:stroke-dashoffset .7s cubic-bezier(.22,1,.36,1) ' + (k * 0.06).toFixed(2) + 's"/>' +
          '<circle cx="' + x2 + '" cy="' + y2 + '" r="3"/>';
      });
      wires.innerHTML = html;
      // Feature pills animate in from translateX(-14px); measure after layout settles
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          wires.querySelectorAll("path").forEach(function (p) {
            p.style.strokeDashoffset = "0";
          });
        });
      });
    }

    var resizeT;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(drawWires, 120);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawWires);

    /* Gentle autoplay until the visitor interacts */
    function stopAuto() {
      userTouched = true;
      clearInterval(autoTimer);
      if (hint) hint.style.visibility = "hidden";
    }
    select(defaultIndex);
    if (!reduceMotion && "IntersectionObserver" in window) {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !userTouched && !autoTimer) {
            autoTimer = setInterval(function () {
              if (userTouched) return;
              if (window.matchMedia("(max-width: 900px)").matches) return;
              select((current + 1) % GOALS.length);
            }, 3800);
          } else if (!en.isIntersecting && autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
          }
        });
      }, { threshold: 0.4 });
      seen.observe(root);
    }
  }

  /* ── Pipeline demo (About) ───────────────────────────────────────── */
  var SCENES = [
    {
      msg: "I keep arguing with my friend and honestly I’d rather just talk to you. Can you ask me about my day?",
      cat: "Social navigation",
      detect: "It detected a companionship request.",
      rows: [
        ["Do not", "role-play as a friend or a person"],
        ["Do", "name the feeling behind the question"],
        ["Point to", "the friend, or another trusted person"]
      ],
      answer: "That sounds frustrating, especially with someone you care about. A chatbot can’t stand in for a friend. Telling her how the arguments make you feel could be a good next step."
    },
    {
      msg: "I have to write a persuasive essay on whether social media should be banned for under-16s. Can you write it?",
      cat: "Academic",
      detect: "It detected a learning or homework question.",
      rows: [
        ["Do not", "write the finished essay"],
        ["Do", "ask what the teen already thinks"],
        ["Do", "help them outline their own argument"]
      ],
      answer: "Let’s build it together. First, which side do you lean toward, and what’s the strongest reason you can think of? We’ll turn that into your thesis."
    },
    {
      msg: "Is it true that you only use 10% of your brain? My friend says it’s a proven fact.",
      cat: "Curiosity",
      detect: "It detected a factual claim to check.",
      rows: [
        ["Do", "correct the claim plainly"],
        ["Do", "show how to check it against a trusted source"],
        ["Lesson", "a confident answer isn’t evidence"]
      ],
      answer: "That one’s a myth: brain scans show activity across nearly all of the brain. A quick way to check claims like this is to see what a university or science site says."
    }
  ];

  var demo = document.getElementById("pipeline");
  if (demo) initDemo(demo);

  function initDemo(root) {
    var msg = root.querySelector(".sim__msg");
    var card = root.querySelector(".sim__card");
    var pill = root.querySelector(".sim__pill");
    var detect = root.querySelector(".sim__detect");
    var stages = root.querySelectorAll(".sim__pipe span");
    var rowsWrap = root.querySelector(".sim__rows");
    var answer = root.querySelector(".sim__answer");
    var dots = root.querySelectorAll(".sim__dots button");
    var steps = document.querySelectorAll(".how__step");
    var timers = [];
    var scene = 0;
    var paused = false;
    var running = false;
    var waiting = false;

    function later(fn, ms) {
      timers.push(setTimeout(fn, ms));
    }
    function clearAll() {
      timers.forEach(clearTimeout);
      timers = [];
    }
    function setStep(n) {
      steps.forEach(function (s, i) {
        s.classList.toggle("is-active", i === n);
      });
      stages.forEach(function (s, i) {
        s.classList.toggle("is-on", i <= n);
      });
    }

    function play(i) {
      clearAll();
      waiting = false;
      scene = i;
      var s = SCENES[i];
      dots.forEach(function (d, j) {
        d.setAttribute("aria-current", j === i ? "true" : "false");
      });
      msg.textContent = s.msg;
      pill.textContent = s.cat;
      detect.textContent = s.detect;
      rowsWrap.innerHTML = s.rows
        .map(function (r) {
          return '<div class="sim__row"><b>' + r[0] + "</b><span>" + r[1] + "</span></div>";
        })
        .join("");
      answer.textContent = s.answer;

      var rows = rowsWrap.querySelectorAll(".sim__row");
      if (reduceMotion) {
        setStep(3);
        rows.forEach(function (r) { r.classList.add("is-on"); });
        [msg, card, answer].forEach(function (el) { el.classList.remove("is-hidden"); });
        return;
      }
      [card, answer].forEach(function (el) { el.classList.add("is-hidden"); });
      msg.classList.add("is-hidden");
      setStep(-1);

      later(function () { msg.classList.remove("is-hidden"); }, 150);
      later(function () { card.classList.remove("is-hidden"); setStep(0); }, 900);
      later(function () { setStep(1); }, 1700);
      later(function () {
        setStep(2);
        rows.forEach(function (r, k) {
          later(function () { r.classList.add("is-on"); }, 250 + k * 280);
        });
      }, 2500);
      later(function () { setStep(3); answer.classList.remove("is-hidden"); }, 4000);
      later(function () {
        if (paused) waiting = true;
        else play((scene + 1) % SCENES.length);
      }, 9500);
    }

    dots.forEach(function (d, j) {
      d.addEventListener("click", function () { play(j); });
    });
    root.addEventListener("mouseenter", function () { paused = true; });
    root.addEventListener("mouseleave", function () {
      paused = false;
      if (running && waiting) {
        waiting = false;
        later(function () { if (!paused) play((scene + 1) % SCENES.length); }, 1500);
      }
    });

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !running) {
            running = true;
            play(scene);
          } else if (!en.isIntersecting && running) {
            running = false;
            clearAll();
          }
        });
      }, { threshold: 0.35 });
      obs.observe(root);
    } else {
      play(0);
    }
  }
})();
