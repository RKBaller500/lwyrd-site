(function () {
  "use strict";

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setupReveals(root) {
    var revealEls = Array.prototype.slice.call(root.querySelectorAll(".rv, .rv-seq"));
    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add("in");
    });

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      if (el.dataset.revealReady === "true" || el.classList.contains("in")) return;
      el.dataset.revealReady = "true";
      io.observe(el);
    });
  }

  function setupSegments(root) {
    var segments = Array.prototype.slice.call(root.querySelectorAll("[data-seg]"));
    if (!segments.length) return;

    function openSegment(segment) {
      segments.forEach(function (item) {
        var open = item === segment;
        item.classList.toggle("is-open", open);
        item.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    segments.forEach(function (segment) {
      if (segment.dataset.segmentReady === "true") return;
      segment.dataset.segmentReady = "true";
      segment.addEventListener("pointerenter", function () {
        openSegment(segment);
      });
      segment.addEventListener("focus", function () {
        openSegment(segment);
      });
      segment.addEventListener("click", function () {
        openSegment(segment);
      });
      segment.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openSegment(segment);
      });
    });
  }

  function setupFaq(root) {
    Array.prototype.slice.call(root.querySelectorAll(".qa button")).forEach(function (button) {
      if (button.dataset.qaReady === "true") return;
      button.dataset.qaReady = "true";
      button.addEventListener("click", function () {
        var qa = button.closest(".qa");
        if (!qa) return;
        var shouldOpen = !qa.classList.contains("open");
        Array.prototype.slice.call(root.querySelectorAll(".qa")).forEach(function (item) {
          item.classList.remove("open");
          var itemButton = item.querySelector("button");
          if (itemButton) itemButton.setAttribute("aria-expanded", "false");
        });
        if (shouldOpen) {
          qa.classList.add("open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function setupHeroMaze(root) {
    var maze = root.querySelector("#heroMaze");
    if (!maze || maze.querySelector("svg")) return;

    var ns = "http://www.w3.org/2000/svg";
    var width = 1400;
    var height = 760;
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");

    var walls = document.createElementNS(ns, "path");
    walls.setAttribute("class", "mz-walls");
    var wallSegments = [];
    for (var x = 40; x < width; x += 82) wallSegments.push("M" + x + " 0v" + height);
    for (var y = 34; y < height; y += 72) wallSegments.push("M0 " + y + "h" + width);
    for (var z = 82; z < width - 120; z += 164) {
      wallSegments.push("M" + z + " " + (120 + (z % 360)) + "h96");
    }
    walls.setAttribute("d", wallSegments.join(""));

    var solution = document.createElementNS(ns, "path");
    solution.setAttribute("class", "mz-sol");
    solution.setAttribute(
      "d",
      "M-80 438 C130 438 148 250 330 250 S560 468 718 372 S875 150 1015 252 S1160 472 1480 300"
    );

    var dot = document.createElementNS(ns, "circle");
    dot.setAttribute("r", "5");
    dot.setAttribute("fill", "#002B55");
    dot.style.opacity = "0";

    svg.appendChild(walls);
    svg.appendChild(solution);
    svg.appendChild(dot);
    maze.appendChild(svg);

    var len = solution.getTotalLength();
    solution.style.strokeDasharray = String(len);
    solution.style.strokeDashoffset = String(len);

    var arrow = root.querySelector("#scrollArrow");
    var stub = root.querySelector("#exitStub");
    var stubBeam = root.querySelector("#exitStubBeam");

    function showEndState() {
      var point = solution.getPointAtLength(len);
      dot.setAttribute("cx", String(point.x));
      dot.setAttribute("cy", String(point.y));
      dot.style.opacity = "0";
      solution.style.strokeDashoffset = "0";
      if (arrow) arrow.classList.add("show");
      if (stub) stub.classList.add("show");
      if (stubBeam) stubBeam.style.height = "100%";
    }

    if (reducedMotion()) {
      showEndState();
      return;
    }

    var start = performance.now();
    var duration = 2800;
    function animate(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var point = solution.getPointAtLength(len * eased);
      dot.setAttribute("cx", String(point.x));
      dot.setAttribute("cy", String(point.y));
      dot.style.opacity = progress < 0.98 ? "1" : "0";
      solution.style.strokeDashoffset = String(len * (1 - eased));
      if (progress < 1) window.requestAnimationFrame(animate);
      else showEndState();
    }
    window.requestAnimationFrame(animate);
  }

  function setupSpine(root) {
    var spine = root.querySelector("#spine");
    var track = root.querySelector("#spineTrack");
    var beam = root.querySelector("#spineBeam");
    if (!spine || !track || !beam || spine.dataset.spineReady === "true") return;
    spine.dataset.spineReady = "true";

    var nodes = Array.prototype.slice.call(spine.querySelectorAll("[data-node]"));
    var stub = root.querySelector("#exitStub");
    var stubBeam = root.querySelector("#exitStubBeam");

    function update() {
      var anchor = window.innerHeight * 0.62;
      if (stub && stubBeam) {
        var stubRect = stub.getBoundingClientRect();
        stubBeam.style.height = Math.max(0, Math.min(stubRect.height, anchor - stubRect.top)) + "px";
      }

      var trackRect = track.getBoundingClientRect();
      var litHeight = Math.max(0, Math.min(trackRect.height, anchor - trackRect.top));
      beam.style.height = litHeight + "px";

      nodes.forEach(function (node) {
        var dot = node.querySelector(".node-dot");
        if (!dot) return;
        var dotRect = dot.getBoundingClientRect();
        if (dotRect.top + dotRect.height / 2 - trackRect.top <= litHeight) node.classList.add("lit");
      });
      if (litHeight >= trackRect.height - 2) spine.classList.add("arr-lit");
    }

    if (reducedMotion()) {
      beam.style.height = track.getBoundingClientRect().height + "px";
      nodes.forEach(function (node) {
        node.classList.add("lit");
      });
      spine.classList.add("arr-lit");
      return;
    }

    var ticking = false;
    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
  }

  function setupCountUp(root) {
    var stats = root.querySelector(".node-stats");
    if (!stats || stats.dataset.countReady === "true" || reducedMotion()) return;
    stats.dataset.countReady = "true";

    var nums = Array.prototype.slice.call(stats.querySelectorAll(".n"));
    var parsed = nums
      .map(function (el) {
        var text = (el.textContent || "").trim();
        var match = text.match(/^(\D*)([\d.]+)(.*)$/);
        return match ? { el: el, pre: match[1], target: Number(match[2]), suf: match[3] } : null;
      })
      .filter(Boolean);
    if (!parsed.length) return;

    var done = false;
    function run() {
      if (done) return;
      done = true;
      parsed.forEach(function (item) {
        item.el.textContent = item.pre + "0" + item.suf;
      });
      var start = performance.now();
      var duration = 1600;
      function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        parsed.forEach(function (item) {
          item.el.textContent = item.pre + Math.round(item.target * eased) + item.suf;
        });
        if (progress < 1) window.requestAnimationFrame(tick);
      }
      window.requestAnimationFrame(tick);
    }

    if (!("IntersectionObserver" in window)) {
      run();
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(stats);
  }

  function initRoot(root) {
    if (!root) return;
    if (!root.querySelector(".rv, .rv-seq, #heroMaze, [data-seg], .qa")) return;
    root.dataset.marketingAnimationsReady = "true";
    setupReveals(root);
    setupSegments(root);
    setupFaq(root);
    setupHeroMaze(root);
    setupSpine(root);
    setupCountUp(root);
  }

  function initAll() {
    Array.prototype.slice.call(document.querySelectorAll("[data-marketing-page-root]")).forEach(initRoot);
  }

  window.__LWYRD_INIT_MARKETING_ANIMATIONS__ = initAll;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll, { once: true });
  } else {
    initAll();
  }

  window.addEventListener("load", initAll, { once: true });
  window.requestAnimationFrame(initAll);
  window.setTimeout(initAll, 50);
  window.setTimeout(initAll, 250);

  if ("MutationObserver" in window) {
    var pending = false;
    var observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        initAll();
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
