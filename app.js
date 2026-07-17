/* ============================================================
   Mallorca 2026 camp guide — rendering & routing
   ============================================================ */

(function () {
  "use strict";

  const app = document.getElementById("app");
  const tooltip = document.getElementById("tooltip");
  const unitBtn = document.getElementById("unitToggle");

  /* ---------- units ---------- */
  let unit = localStorage.getItem("mcg-unit") || "km";
  const KM_TO_MI = 0.621371;
  const M_TO_FT = 3.28084;

  const fmt = new Intl.NumberFormat("en-US");
  function dist(km) {
    return unit === "km"
      ? { v: fmt.format(Math.round(km)), u: "km" }
      : { v: fmt.format(Math.round(km * KM_TO_MI)), u: "mi" };
  }
  function elev(m) {
    return unit === "km"
      ? { v: fmt.format(Math.round(m)), u: "m" }
      : { v: fmt.format(Math.round(m * M_TO_FT)), u: "ft" };
  }
  function hoursLabel(h) {
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    return mins ? `${whole}h${String(mins).padStart(2, "0")}` : `${whole}h`;
  }

  function syncUnitBtn() { unitBtn.textContent = unit; }
  unitBtn.addEventListener("click", () => {
    unit = unit === "km" ? "mi" : "km";
    localStorage.setItem("mcg-unit", unit);
    syncUnitBtn();
    render(true);
  });

  /* ---------- helpers ---------- */
  const byId = Object.fromEntries(RIDES.map(r => [r.id, r]));
  const ridesChrono = RIDE_ORDER.map(id => byId[id]);

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function catClass(cat) { return "cat-" + String(cat).toLowerCase(); }
  function catDotClass(cat) { return "dot-" + String(cat).toLowerCase(); }
  function catLabel(cat) { return cat === "HC" ? "HC" : "Cat " + cat; }

  function diffBadge(d) {
    const cls = d.toLowerCase();
    return `<span class="diff ${cls}" title="Difficulty: ${esc(d)}">
      <span class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>
      ${esc(d)}</span>`;
  }

  /* Stylized (decorative) profile ribbon for cards — peak heights
     scale with climb category; not real route geometry. */
  const CAT_H = { HC: 1.0, "1": 0.86, "2": 0.72, "3": 0.56, "4": 0.42 };
  function ribbonSvg(ride) {
    const W = 360, H = 86, base = H - 6;
    let pts;
    if (!ride.sheetClimbs.length) {
      pts = [[0, base], [60, base - 8], [120, base - 3], [180, base - 10], [240, base - 4], [300, base - 9], [W, base]];
    } else {
      pts = [[0, base]];
      const n = ride.sheetClimbs.length;
      ride.sheetClimbs.forEach((c, i) => {
        const x = ((i + 1) / (n + 1)) * W;
        const h = (CAT_H[c.cat] || 0.5) * (H - 22);
        pts.push([x - 26, base - h * 0.25]);
        pts.push([x, base - h]);
        pts.push([x + 22, base - h * 0.3]);
      });
      pts.push([W, base]);
    }
    const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="rg${ride.id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgba(232,121,78,.55)"/>
        <stop offset="1" stop-color="rgba(232,121,78,.04)"/>
      </linearGradient></defs>
      <path d="${path} L${W} ${H} L0 ${H} Z" fill="url(#rg${ride.id})"/>
      <path d="${path}" fill="none" stroke="rgba(247,146,104,.9)" stroke-width="1.6"/>
    </svg>`;
  }

  /* ---------- week chart ---------- */
  function weekChartSvg() {
    const W = 720, H = 250;
    const padL = 46, padR = 12, padT = 26, padB = 44;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const maxEle = 2400; // headroom above 2349
    const n = ridesChrono.length;
    const slot = plotW / n, barW = Math.min(58, slot * 0.52);

    const gridLines = [0, 800, 1600, 2400].map(v => {
      const y = padT + plotH - (v / maxEle) * plotH;
      return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#223245" stroke-width="1"/>
        <text x="${padL - 8}" y="${y + 3.5}" text-anchor="end" font-size="10" fill="#6b8095">${unit === "km" ? fmt.format(v) : fmt.format(Math.round(v * M_TO_FT))}</text>`;
    }).join("");

    const bars = ridesChrono.map((r, i) => {
      const h = (r.ele / maxEle) * plotH;
      const x = padL + slot * i + (slot - barW) / 2;
      const y = padT + plotH - h;
      const e = elev(r.ele), d = dist(r.km);
      return `<g class="bar" tabindex="0" role="link"
        aria-label="${esc(r.name)}, ${r.shortDate}: ${d.v} ${d.u}, ${e.v} ${e.u} climbing. Open stage."
        data-ride="${r.id}">
        <rect x="${x - 6}" y="${padT - 4}" width="${barW + 12}" height="${plotH + 8}" fill="transparent"/>
        <rect class="bar-rect" x="${x}" y="${y}" width="${barW}" height="${Math.max(h, 3)}" rx="4"/>
        <text x="${x + barW / 2}" y="${y - 7}" text-anchor="middle" font-size="11" font-weight="700" fill="#e9eef5">${e.v}</text>
        <text x="${x + barW / 2}" y="${padT + plotH + 16}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#9db0c3">${esc(r.shortDate.split(" ")[0])} ${esc(r.shortDate.split(" ")[1])}</text>
        <text x="${x + barW / 2}" y="${padT + plotH + 30}" text-anchor="middle" font-size="9.5" fill="#6b8095">${d.v} ${d.u}</text>
      </g>`;
    }).join("");

    return `<svg class="week-chart" viewBox="0 0 ${W} ${H}" role="img"
      aria-label="Climbing per riding day, ${unit === "km" ? "metres" : "feet"}. Tallest day: Queen Stage.">
      ${gridLines}${bars}
    </svg>`;
  }

  function bindChart() {
    document.querySelectorAll(".week-chart .bar").forEach(g => {
      const r = byId[+g.dataset.ride];
      const open = () => { location.hash = "#/stage/" + r.id; };
      g.addEventListener("click", open);
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      g.addEventListener("mousemove", e => {
        const d = dist(r.km), el = elev(r.ele);
        tooltip.innerHTML = `<div class="tt-title">${esc(r.name)} · ${esc(r.shortDate)}</div>
          <div class="tt-row">${d.v} ${d.u} · ${el.v} ${el.u} · ${hoursLabel(r.hours)}</div>
          <div class="tt-row">${esc(r.difficulty)} · ${r.nClimbs} climb${r.nClimbs === 1 ? "" : "s"} · ${r.tss} TSS</div>`;
        tooltip.classList.add("show");
        tooltip.setAttribute("aria-hidden", "false");
        const pad = 14;
        let tx = e.clientX + pad, ty = e.clientY + pad;
        const rect = tooltip.getBoundingClientRect();
        if (tx + rect.width > window.innerWidth - 8) tx = e.clientX - rect.width - pad;
        if (ty + rect.height > window.innerHeight - 8) ty = e.clientY - rect.height - pad;
        tooltip.style.left = tx + "px";
        tooltip.style.top = ty + "px";
      });
      g.addEventListener("mouseleave", () => {
        tooltip.classList.remove("show");
        tooltip.setAttribute("aria-hidden", "true");
      });
    });
  }

  /* ---------- dashboard ---------- */
  function totalTile(val, small, lab) {
    return `<div class="total-tile"><div class="val">${val}${small ? `<small>${small}</small>` : ""}</div><div class="lab">${lab}</div></div>`;
  }

  function renderDashboard() {
    const t = CAMP.totals;
    const d = dist(t.km), e = elev(t.ele);

    const scheduleHtml = SCHEDULE.map(s => {
      const ride = s.rideId ? byId[s.rideId] : null;
      if (ride) {
        return `<a class="sched-day is-ride" href="#/stage/${ride.id}">
          <span class="d-num">Day ${s.day}</span>
          <span class="d-date">${esc(s.date)}</span>
          <span class="d-label">${esc(s.label)}</span>
          <span class="d-detail">${esc(s.detail)}</span>
        </a>`;
      }
      return `<div class="sched-day is-rest">
        <span class="d-num">Day ${s.day}</span>
        <span class="d-date">${esc(s.date)}</span>
        <span class="d-label">${esc(s.label)}</span>
        <span class="d-detail">${esc(s.detail)}</span>
      </div>`;
    }).join("");

    const cardsHtml = ridesChrono.map(r => {
      const rd = dist(r.km), re = elev(r.ele);
      const chips = r.sheetClimbs.length
        ? r.sheetClimbs.map(c =>
            `<span class="chip"><span class="cat-dot ${catDotClass(c.cat)}"></span>${esc(c.name)} · ${esc(catLabel(c.cat))}</span>`
          ).join("")
        : `<span class="chip coffee">☕ Coffee stop — ${esc(r.coffeeStop)}</span>`;
      return `<a class="card" href="#/stage/${r.id}" aria-label="Open ${esc(r.name)}">
        <div class="card-ribbon">${ribbonSvg(r)}
          <span class="day-chip">Day ${r.campDay} · ${esc(r.shortDate)}</span>
          <span class="theme-chip">${esc(r.theme)}</span>
        </div>
        <div class="card-body">
          <div class="card-title-row">
            <span class="card-title">${esc(r.name)}</span>
            <span class="card-stage-no">Stage ${r.id}</span>
          </div>
          <div class="card-stats">
            <span class="card-stat"><span class="v">${rd.v} <small>${rd.u}</small></span><span class="k">Distance</span></span>
            <span class="card-stat"><span class="v">${re.v} <small>${re.u}</small></span><span class="k">Climbing</span></span>
            <span class="card-stat"><span class="v">${hoursLabel(r.hours)}</span><span class="k">Est. time</span></span>
            <span class="card-stat"><span class="v">${r.tss}</span><span class="k">Est. TSS</span></span>
          </div>
          <div class="chips">${chips}</div>
          <div class="card-foot">${diffBadge(r.difficulty)}<span class="card-cta">View stage →</span></div>
        </div>
      </a>`;
    }).join("");

    app.innerHTML = `
      <section class="hero">
        <span class="eyebrow">${esc(CAMP.club)} · Cycling Camp</span>
        <h1>Mallorca <span class="thin">2026</span></h1>
        <p class="tagline">${esc(CAMP.dates)} · ${esc(CAMP.location)}. Eight days, six rides, seventeen categorised climbs —
        from the FTP test on Sa Batalla to the handicap race up Sa Calobra itself.</p>
        <div class="hero-links">
          <a class="btn primary" href="#rides">The rides ↓</a>
          <a class="btn" href="${esc(CAMP.officialUrl)}" target="_blank" rel="noopener">Official camp page ↗</a>
        </div>
        <div class="totals">
          ${totalTile(t.rides, "", "Rides")}
          ${totalTile(d.v, d.u, "Distance")}
          ${totalTile(e.v, e.u, "Climbing")}
          ${totalTile(hoursLabel(t.hours), "", "Ride time")}
          ${totalTile(t.climbs, "", "Cat. climbs")}
          ${totalTile(fmt.format(t.tss), "", "Est. TSS")}
        </div>
      </section>

      <section aria-labelledby="wk-h">
        <div class="section-head">
          <h2 id="wk-h">Shape of the week</h2>
          <span class="sub">Climbing per riding day (${unit === "km" ? "m" : "ft"}) — click a day to open the stage</span>
        </div>
        <div class="chart-card">
          <div class="chart-scroll">${weekChartSvg()}</div>
          <p class="chart-footnote">Queen Stage (Tue) and Sa Calobra (Thu) carry almost half of the week’s ${e.v} ${e.u} of climbing. Bars show elevation gain; distance is under each day.</p>
        </div>
      </section>

      <section aria-labelledby="sc-h">
        <div class="section-head">
          <h2 id="sc-h">Day by day</h2>
          <span class="sub">Sat 17 → Sat 24 October</span>
        </div>
        <div class="schedule">${scheduleHtml}</div>
      </section>

      <section id="rides" aria-labelledby="rd-h">
        <div class="section-head">
          <h2 id="rd-h">The rides</h2>
          <span class="sub">In riding order — stage numbers follow the official sacalobra.cc pages</span>
        </div>
        <div class="cards">${cardsHtml}</div>
      </section>

      <section aria-labelledby="cn-h">
        <div class="section-head">
          <h2 id="cn-h">Camp notes</h2>
          <span class="sub">From the official camp page</span>
        </div>
        <div class="notes-grid">
          ${CAMP.notes.map(nt => `<div class="note"><span class="ico">${nt.icon}</span><span>${esc(nt.text)}</span></div>`).join("")}
        </div>
      </section>`;

    bindChart();
  }

  /* ---------- stage detail ---------- */
  function statTile(val, small, lab, textual) {
    return `<div class="stat-tile"><div class="val${textual ? " textual" : ""}">${val}${small ? `<small>${small}</small>` : ""}</div><div class="lab">${lab}</div></div>`;
  }

  function renderStage(id) {
    const r = byId[id];
    if (!r) { location.hash = "#/"; return; }
    const rd = dist(r.km), re = elev(r.ele);
    const chronoIdx = RIDE_ORDER.indexOf(r.id);
    const prev = chronoIdx > 0 ? byId[RIDE_ORDER[chronoIdx - 1]] : null;
    const next = chronoIdx < RIDE_ORDER.length - 1 ? byId[RIDE_ORDER[chronoIdx + 1]] : null;

    const segRows = r.segments.map(s => `<tr>
      <td class="cname">${esc(s.name)}</td>
      <td><span class="cat-badge ${catClass(s.cat)}">${esc(catLabel(s.cat))}</span></td>
      <td class="num">${esc(s.length)}</td>
      <td class="num">${esc(s.grade)}</td>
      <td class="num">${esc(s.kom)}</td>
      <td class="num">${esc(s.qom)}</td>
      <td><a class="seg" href="${esc(s.strava)}" target="_blank" rel="noopener">Segment ↗</a></td>
    </tr>`).join("");

    const segmentsSection = r.segments.length ? `
      <section aria-labelledby="seg-h">
        <div class="section-head">
          <h2 id="seg-h">Climbs &amp; Strava segments</h2>
          <span class="sub">SCCC = Sa Calobra CC club records</span>
        </div>
        <div class="table-wrap">
          <table class="climbs">
            <thead><tr><th>Climb</th><th>Cat.</th><th>Length</th><th>Avg grade</th><th>SCCC KOM</th><th>SCCC QOM</th><th>Strava</th></tr></thead>
            <tbody>${segRows}</tbody>
          </table>
        </div>
        ${r.segmentNote ? `<p class="table-note">${esc(r.segmentNote)}</p>` : ""}
      </section>` : `
      <section aria-labelledby="seg-h">
        <div class="section-head"><h2 id="seg-h">Climbs</h2></div>
        <p class="table-note">No categorised climbs today — the reward is the coffee stop at ${esc(r.coffeeStop)} instead.</p>
      </section>`;

    app.innerHTML = `
      <div class="stage-hero">
        <a class="backlink" href="#/">← Back to the week</a>
        <div class="stage-eyebrow">
          <span class="no">Stage ${r.id} · Day ${r.campDay}</span>
          <span class="theme-chip" style="position:static">${esc(r.theme)}</span>
          <span class="date">${esc(r.date)} 2026</span>
        </div>
        <h1>${esc(r.name)}</h1>
        <p class="intro">${esc(r.intro)}</p>
        <div class="stage-actions">
          <a class="btn primary" href="${esc(r.url)}" target="_blank" rel="noopener">Official stage page ↗</a>
          ${diffBadge(r.difficulty)}
        </div>
        <div class="stat-tiles">
          ${statTile(rd.v, rd.u, "Distance")}
          ${statTile(re.v, re.u, "Climbing")}
          ${statTile(hoursLabel(r.hours), "", "Est. time")}
          ${statTile(esc(r.difficulty), "", "Difficulty", true)}
          ${statTile(r.nClimbs, "", "Cat. climbs")}
          ${statTile(r.feedZones, "", "Feed zones")}
          ${statTile(r.tss, "", "Est. TSS")}
        </div>
      </div>

      <section aria-labelledby="pf-h">
        <div class="section-head">
          <h2 id="pf-h">Stage profile</h2>
          <span class="sub"><a href="${esc(r.profileImgOfficial)}" target="_blank" rel="noopener">full size ↗</a></span>
        </div>
        <div class="media-card">
          <img src="${esc(r.profileImg)}" alt="Official elevation profile for ${esc(r.name)}" loading="lazy"
               onerror="this.onerror=null;this.src='${esc(r.profileImgOfficial)}'">
          <div class="media-caption"><span>Official stage profile — sacalobra.cc</span><span>${rd.v} ${rd.u} · ${re.v} ${re.u}</span></div>
        </div>
      </section>

      <section aria-labelledby="st-h">
        <div class="section-head"><h2 id="st-h">The stage</h2></div>
        <div class="story">${r.description.map(p => `<p>${esc(p)}</p>`).join("")}</div>
      </section>

      ${segmentsSection}

      <section aria-labelledby="mp-h">
        <div class="section-head">
          <h2 id="mp-h">Route map</h2>
          <span class="sub"><a href="${esc(r.mapImgOfficial)}" target="_blank" rel="noopener">full size ↗</a></span>
        </div>
        <div class="media-card">
          <img src="${esc(r.mapImg)}" alt="Official route map for ${esc(r.name)}" loading="lazy"
               onerror="this.onerror=null;this.src='${esc(r.mapImgOfficial)}'">
          <div class="media-caption"><span>Official route map — sacalobra.cc</span>
            <span><a href="${esc(r.url)}" target="_blank" rel="noopener">Stage ${r.id} on sacalobra.cc ↗</a></span></div>
        </div>
      </section>

      <nav class="stage-nav" aria-label="Stage navigation">
        ${prev ? `<a href="#/stage/${prev.id}"><span class="dir">← Previous ride</span><div class="nm">${esc(prev.name)}</div></a>` : `<span class="spacer"></span>`}
        ${next ? `<a class="next" href="#/stage/${next.id}"><span class="dir">Next ride →</span><div class="nm">${esc(next.name)}</div></a>` : ""}
      </nav>`;
  }

  /* ---------- router ---------- */
  function render(force) {
    tooltip.classList.remove("show");
    tooltip.setAttribute("aria-hidden", "true");
    const m = location.hash.match(/^#\/stage\/(\d+)/);
    if (m) {
      renderStage(+m[1]);
      app.dataset.view = "stage";
      window.scrollTo({ top: 0 });
      app.focus({ preventScroll: true });
      return;
    }
    // Dashboard (also handles the #rides in-page anchor)
    const wasDash = app.dataset.view === "dash";
    if (!wasDash || force) {
      renderDashboard();
      app.dataset.view = "dash";
    }
    if (location.hash === "#rides") {
      const el = document.getElementById("rides");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (!wasDash) {
      window.scrollTo({ top: 0 });
      app.focus({ preventScroll: true });
    }
  }

  window.addEventListener("hashchange", () => render(false));
  syncUnitBtn();
  render(true);
})();
