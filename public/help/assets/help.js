/*
 * Veeto help: a small static viewer. It loads content/nav.json, shows it as a menu, and loads each
 * page (a plain HTML fragment under content/) when its address, #/<book>/<page>, is opened.
 * Adding a page means adding a file and one entry in nav.json: see "Adding to the help".
 * No build step and no libraries. Paths are relative, so the folder can be moved.
 */
(function () {
  "use strict";

  var NAV_URL = "content/nav.json";
  var HOME_URL = "content/home.html";
  var SITE_TITLE = "Veeto Help";

  var nav = null;
  var pages = []; // every page in menu order
  var byRoute = {};
  var searchIndex = null; // built the first time someone searches
  var firstRender = true;

  var el = {
    nav: document.getElementById("nav"),
    article: document.getElementById("article"),
    pager: document.getElementById("pager"),
    toc: document.getElementById("toc"),
    sidebar: document.getElementById("sidebar"),
    menuButton: document.getElementById("menu-button"),
    search: document.getElementById("search-box"),
    results: document.getElementById("results"),
    main: document.getElementById("main"),
  };

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function slugify(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function fetchText(url) {
    return fetch(url, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error(url + " " + response.status);
      return response.text();
    });
  }

  // ------------------------------------------------------------------ menu

  function buildPages() {
    nav.books.forEach(function (book) {
      book.sections.forEach(function (section) {
        section.pages.forEach(function (page) {
          page.book = book;
          page.section = section;
          page.route = "/" + book.id + "/" + page.slug;
          pages.push(page);
          byRoute[page.route] = page;
        });
      });
    });
  }

  function renderMenu() {
    var html = "";
    nav.books.forEach(function (book) {
      var planned = book.status === "planned";
      html += '<details data-book="' + escapeHtml(book.id) + '" open>';
      html += "<summary>" + escapeHtml(book.title);
      if (planned) html += '<span class="pill">to be written</span>';
      html += "</summary>";
      book.sections.forEach(function (section) {
        if (section.title) html += "<h3>" + escapeHtml(section.title) + "</h3>";
        html += "<ul>";
        section.pages.forEach(function (page) {
          html += '<li><a href="#' + page.route + '" data-route="' + page.route + '">' + escapeHtml(page.title) + "</a></li>";
        });
        html += "</ul>";
      });
      html += "</details>";
    });
    el.nav.innerHTML = html;
  }

  function markCurrent(route) {
    var links = el.nav.querySelectorAll("a[data-route]");
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("data-route") === route) {
        links[i].setAttribute("aria-current", "page");
      } else {
        links[i].removeAttribute("aria-current");
      }
    }
  }

  // ------------------------------------------------------------------ pages

  function currentRoute() {
    var hash = window.location.hash || "";
    var route = hash.replace(/^#/, "");
    return route === "" ? "/" : route;
  }

  function showMissing(route) {
    el.article.innerHTML =
      "<h1 tabindex='-1'>Page not found</h1><p>There is no help page at <code>" +
      escapeHtml(route) +
      '</code>.</p><p><a href="#/">Go to the help home page</a>.</p>';
    el.pager.innerHTML = "";
    el.toc.hidden = true;
    document.title = "Page not found | " + SITE_TITLE;
  }

  function route() {
    var path = currentRoute();
    var page = byRoute[path];
    var url;
    if (path === "/") {
      url = HOME_URL;
    } else if (page) {
      url = page.file;
    } else {
      showMissing(path);
      return;
    }

    fetchText(url)
      .then(function (html) {
        // Pages are static files that ship with the application, so they are trusted markup.
        el.article.innerHTML = html;
        var heading = el.article.querySelector("h1");
        var title = heading ? heading.textContent : page ? page.title : SITE_TITLE;
        document.title = (path === "/" ? SITE_TITLE : title + " | " + SITE_TITLE);
        markCurrent(path === "/" ? "" : path);
        if (page) {
          var book = el.nav.querySelector('details[data-book="' + page.book.id + '"]');
          if (book) book.open = true;
        }
        renderToc();
        renderPager(page);
        el.sidebar.classList.remove("open");
        el.menuButton.setAttribute("aria-expanded", "false");
        window.scrollTo(0, 0);
        if (!firstRender && heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
        firstRender = false;
      })
      .catch(function () {
        el.article.innerHTML =
          "<h1>This page could not be loaded</h1><p>Check your connection and try again, or <a href='#/'>return to the help home page</a>.</p>";
        el.pager.innerHTML = "";
        el.toc.hidden = true;
      });
  }

  function renderToc() {
    var headings = el.article.querySelectorAll("h2");
    if (headings.length < 2) {
      el.toc.hidden = true;
      el.toc.innerHTML = "";
      return;
    }
    var used = {};
    var html = "<strong>On this page</strong>";
    for (var i = 0; i < headings.length; i++) {
      var id = slugify(headings[i].textContent) || "section-" + i;
      while (used[id]) id += "-x";
      used[id] = true;
      headings[i].id = id;
      html += '<a href="#' + id + '" data-jump="' + id + '">' + escapeHtml(headings[i].textContent) + "</a>";
    }
    el.toc.innerHTML = html;
    el.toc.hidden = false;
  }

  function renderPager(page) {
    if (!page) {
      el.pager.innerHTML = "";
      return;
    }
    var index = pages.indexOf(page);
    var html = "";
    var prev = pages[index - 1];
    var next = pages[index + 1];
    html += prev ? '<a class="prev" href="#' + prev.route + '"><small>Previous</small>' + escapeHtml(prev.title) + "</a>" : "<span></span>";
    html += next ? '<a class="next" href="#' + next.route + '"><small>Next</small>' + escapeHtml(next.title) + "</a>" : "<span></span>";
    el.pager.innerHTML = html;
  }

  // ------------------------------------------------------------------ search

  function plainText(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  }

  function buildIndex() {
    if (searchIndex) return searchIndex;
    searchIndex = Promise.all(
      pages.map(function (page) {
        return fetchText(page.file)
          .then(function (html) {
            return { page: page, text: plainText(html) };
          })
          .catch(function () {
            return { page: page, text: "" };
          });
      })
    );
    return searchIndex;
  }

  function snippet(text, term) {
    var at = text.toLowerCase().indexOf(term);
    if (at < 0) return escapeHtml(text.slice(0, 120));
    var start = Math.max(0, at - 50);
    var piece = text.slice(start, start + 140);
    var safe = escapeHtml(piece);
    var re = new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return (start > 0 ? "…" : "") + safe.replace(re, "<mark>$1</mark>") + "…";
  }

  function runSearch() {
    var query = el.search.value.trim().toLowerCase();
    if (query.length < 2) {
      el.results.hidden = true;
      el.results.innerHTML = "";
      return;
    }
    var terms = query.split(/\s+/);
    buildIndex().then(function (index) {
      if (el.search.value.trim().toLowerCase() !== query) return; // the box moved on
      var hits = [];
      index.forEach(function (entry) {
        var title = entry.page.title.toLowerCase();
        var haystack = (title + " " + entry.text).toLowerCase();
        var score = 0;
        for (var i = 0; i < terms.length; i++) {
          if (haystack.indexOf(terms[i]) < 0) return; // every word has to appear
          if (title.indexOf(terms[i]) >= 0) score += 10;
          score += Math.min(5, haystack.split(terms[i]).length - 1);
        }
        hits.push({ page: entry.page, text: entry.text, score: score });
      });
      hits.sort(function (a, b) {
        return b.score - a.score;
      });
      var html = "<strong>" + hits.length + " result" + (hits.length === 1 ? "" : "s") + "</strong>";
      hits.slice(0, 12).forEach(function (hit) {
        html +=
          '<a href="#' + hit.page.route + '"><span>' + escapeHtml(hit.page.title) + "</span><small>" +
          snippet(hit.text, terms[0]) + "</small></a>";
      });
      if (hits.length === 0) html += "<p>Nothing found. Try fewer or different words.</p>";
      el.results.innerHTML = html;
      el.results.hidden = false;
    });
  }

  // ------------------------------------------------------------------ wiring

  function init() {
    fetchText(NAV_URL)
      .then(function (text) {
        nav = JSON.parse(text);
        buildPages();
        renderMenu();
        route();
      })
      .catch(function () {
        el.article.innerHTML = "<h1>The help could not be loaded</h1><p>Its contents list is missing. Try again later.</p>";
      });

    window.addEventListener("hashchange", route);

    el.menuButton.addEventListener("click", function () {
      var open = el.sidebar.classList.toggle("open");
      el.menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });

    el.toc.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-jump]");
      if (!link) return;
      event.preventDefault();
      var target = document.getElementById(link.getAttribute("data-jump"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    var timer = null;
    el.search.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(runSearch, 150);
    });
    el.search.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        el.search.value = "";
        runSearch();
      }
    });
    el.results.addEventListener("click", function () {
      el.search.value = "";
      el.results.hidden = true;
    });
  }

  init();
})();
