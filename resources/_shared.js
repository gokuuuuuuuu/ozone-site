/**
 * Ozone Resources — Shared Shell (zero-flicker)
 *
 * Uses document.write at <body> start to output nav + sidebar + <div class="res-content">,
 * then page content fills naturally, then __closeShell() at body end closes tags + adds footer.
 *
 * Usage:
 *   <body data-page="incidents" data-crumb="Download Incidents">
 *     <script src="_shared.js"></script>
 *     ... page content ...
 *     <script>__closeShell()</script>
 *   </body>
 */

/* ── embed mode ── */
if (new URLSearchParams(location.search).get("embed") === "1") {
  document.documentElement.classList.add("embed-mode");
}

(function () {
  var body = document.body;
  var page = body.getAttribute("data-page") || "";
  var crumb = body.getAttribute("data-crumb") || "";
  var isRoot = body.getAttribute("data-root") === "1";
  var P = isRoot ? "resources/" : "";
  var R = isRoot ? "" : "../";

  var ICO = {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    traj: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    incidents:
      '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    paper:
      '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    tutorials:
      '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
    community:
      '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
  };

  function s(d) {
    return (
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      d +
      "</svg>"
    );
  }
  function li(href, ico, label, key, ext) {
    return (
      "<li><a" +
      (key === page ? ' class="active"' : "") +
      ' href="' +
      href +
      '"' +
      (ext ? ' target="_blank"' : "") +
      ">" +
      s(ico) +
      label +
      "</a></li>"
    );
  }

  var sidebar =
    '<nav class="res-sidebar">' +
    '<div class="res-sidebar-section"><div class="res-sidebar-title">Downloads</div><ul class="res-sidebar-links">' +
    li(
      R + "index.html#resources",
      ICO.grid,
      "Browse All Resources",
      "resources",
    ) +
    li(P + "map.html", ICO.map, "Download Map", "map") +
    li(
      P + "trajectories_v2.html",
      ICO.traj,
      "Download Trajectory",
      "trajectory",
    ) +
    li(P + "incidents.html", ICO.incidents, "Download Incidents", "incidents") +
    li(
      "https://github.com/ZhilingResearch/Ozone",
      ICO.code,
      "Download Code",
      "code",
      true,
    ) +
    "</ul></div>" +
    '<div class="res-sidebar-section"><div class="res-sidebar-title">Learn</div><ul class="res-sidebar-links">' +
    li(R + "tutorials.html", ICO.tutorials, "Tutorials", "tutorials") +
    '<ul class="res-sidebar-sub">' +
    '<li><a href="' +
    R +
    'tutorial-viewer.html?doc=CARLA%E7%9A%84%E5%9F%BA%E6%9C%AC%E4%BB%8B%E7%BB%8D%E5%8F%8A%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B%20-%200417_Ze%20-%20yue.docx&amp;title=CARLA%20basics%20and%20installation" target="_blank">CARLA Basics &amp; Installation</a></li>' +
    '<li><a href="' +
    R +
    'tutorial-viewer.html?doc=%E5%9F%BA%E4%BA%8ERoadrunner%20%E7%9A%84Carla%E5%AD%AA%E7%94%9F%E5%9C%B0%E5%9B%BE%E7%BC%96%E8%BE%91%E5%88%B6%E4%BD%9C%E6%95%99%E7%A8%8B.docx&amp;title=Digital-twin%20map%20editing%20in%20RoadRunner" target="_blank">Map Editing in RoadRunner</a></li>' +
    '<li><a href="' +
    R +
    'tutorial-viewer.html?doc=Carla%20%E5%9F%BA%E6%9C%AC%E5%9C%BA%E6%99%AF%E5%88%9B%E5%BB%BA%E6%95%99%E7%A8%8B.docx&amp;title=Authoring%20CARLA%20scenarios%20end-to-end" target="_blank">CARLA Scenarios End-to-End</a></li>' +
    "</ul>" +
    li(P + "community.html", ICO.community, "Join Community", "community") +
    "</ul></div>" +
    "</nav>";

  var nav =
    '<header class="rp-nav"><div class="rp-nav-inner">' +
    '<a class="rp-logo" href="' +
    R +
    '"><svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span>Ozone</span></a>' +
    '<div class="rp-crumb"><a href="' +
    R +
    '">Home</a><span>›</span><span>Resources</span><span>›</span><b>' +
    crumb +
    "</b></div>" +
    '<a class="rp-nav-cta" href="' +
    R +
    '#apply"><span class="dot"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></span>Get Access</a>' +
    "</div></header>";

  // Write opening shell — content follows naturally in HTML
  document.write(
    nav +
      '<main class="rp-main"><div class="res-flex">' +
      sidebar +
      '<div class="res-content">',
  );

  // Expose close function for body end
  window.__closeShell = function () {
    document.write(
      "</div></div></main>" +
        '<footer class="rp-footer"><div class="rp-footer-inner">' +
        "<div>© 2026 Ozone · A Unified Platform for Transportation Research</div>" +
        '<div><a href="' +
        R +
        '">← Back to site</a></div>' +
        "</div></footer>",
    );
  };
})();
