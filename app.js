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

  function pad2(n) { return String(n).padStart(2, "0"); }
  function catClass(cat) { return "cat-" + String(cat).toLowerCase(); }
  function catLabel(cat) { return cat === "HC" ? "HC" : "Cat " + cat; }

  function diffTag(d) {
    const cls = d.toLowerCase();
    return `<span class="r-diff"><span class="diff-dot ${cls}"></span>${esc(d)}</span>`;
  }

  /* ---------- week chart ---------- */
  function weekChartSvg() {
    const W = 720, H = 260;
    const padL = 46, padR = 12, padT = 30, padB = 46;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const maxEle = 2400;
    const n = ridesChrono.length;
    const slot = plotW / n, barW = Math.min(52, slot * 0.46);

    const gridLines = [0, 800, 1600, 2400].map(v => {
      const y = padT + plotH - (v / maxEle) * plotH;
      return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(242,246,250,.14)" stroke-width="1"/>
        <text x="${padL - 8}" y="${y + 3.5}" text-anchor="end" font-size="10" fill="#8fa1b8">${unit === "km" ? fmt.format(v) : fmt.format(Math.round(v * M_TO_FT))}</text>`;
    }).join("");

    const bars = ridesChrono.map((r, i) => {
      const h = (r.ele / maxEle) * plotH;
      const x = padL + slot * i + (slot - barW) / 2;
      const y = padT + plotH - h;
      const e = elev(r.ele), d = dist(r.km);
      return `<g class="bar" tabindex="0" role="link"
        aria-label="${esc(r.name)}, ${r.shortDate}: ${d.v} ${d.u}, ${e.v} ${e.u} climbing. Open stage."
        data-ride="${r.id}">
        <rect x="${x - 8}" y="${padT - 4}" width="${barW + 16}" height="${plotH + 8}" fill="transparent"/>
        <rect class="bar-rect" x="${x}" y="${y}" width="${barW}" height="${Math.max(h, 3)}" fill="url(#barGrad)"/>
        <text x="${x + barW / 2}" y="${y - 8}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#f2f6fa">${e.v}</text>
        <text x="${x + barW / 2}" y="${padT + plotH + 17}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#c3cfdd">${esc(r.shortDate.split(" ")[0])} ${esc(r.shortDate.split(" ")[1])}</text>
        <text x="${x + barW / 2}" y="${padT + plotH + 31}" text-anchor="middle" font-size="9.5" fill="#8fa1b8">${d.v} ${d.u}</text>
      </g>`;
    }).join("");

    return `<svg class="week-chart" viewBox="0 0 ${W} ${H}" role="img"
      aria-label="Climbing per riding day, ${unit === "km" ? "metres" : "feet"}. Tallest day: Queen Stage.">
      <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f0a04a"/><stop offset="1" stop-color="#ef6b4e"/>
      </linearGradient></defs>
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
  function heroStat(val, small, lab) {
    return `<div class="stat"><div class="val">${val}${small ? `<small>${small}</small>` : ""}</div><div class="lab">${lab}</div></div>`;
  }

  function renderDashboard() {
    const t = CAMP.totals;
    const d = dist(t.km), e = elev(t.ele);

    const scheduleHtml = SCHEDULE.map(s => {
      const ride = s.rideId ? byId[s.rideId] : null;
      const inner = `
        <span class="d-date">${esc(s.date)}</span>
        <span class="d-label">${esc(s.label)}</span>
        <span class="d-detail">${esc(s.detail)}</span>`;
      return ride
        ? `<a class="sched-day" href="#/stage/${ride.id}">${inner}</a>`
        : `<div class="sched-day">${inner}</div>`;
    }).join("");

    const ridePanels = ridesChrono.map((r, i) => {
      const rd = dist(r.km), re = elev(r.ele);
      const tone = i % 2 === 0 ? "navy" : "coral";
      const climbsLine = r.sheetClimbs.length
        ? r.sheetClimbs.map(c => `${esc(c.name)} (${esc(String(c.cat)).toLowerCase() === "hc" ? "HC" : "cat " + c.cat})`).join(" · ")
        : `No climbs — coffee stop at ${esc(r.coffeeStop)}`;
      return `<a class="ride-panel ${tone}" href="#/stage/${r.id}" aria-label="Open ${esc(r.name)}">
        <span class="ghost">${pad2(r.id)}</span>
        <span class="r-date">Day ${r.campDay} — ${esc(r.shortDate)}</span>
        <span class="r-name">${esc(r.name)}</span>
        <span class="r-theme">${esc(r.theme)} · Stage ${r.id}</span>
        <span class="r-nums">
          <span class="r-num"><b>${rd.v} ${rd.u}</b><span>Distance</span></span>
          <span class="r-num"><b>${re.v} ${re.u}</b><span>Climbing</span></span>
          <span class="r-num"><b>${hoursLabel(r.hours)}</b><span>Est. time</span></span>
          <span class="r-num"><b>${r.tss}</b><span>Est. TSS</span></span>
        </span>
        <span class="r-climbs">${climbsLine}</span>
        <span class="r-foot">${diffTag(r.difficulty)}<span class="arrow-circle">→</span></span>
      </a>`;
    }).join("");

    app.innerHTML = `
      <section class="hero">
        <div class="kicker">${esc(CAMP.club)}</div>
        <h1><span class="l1">Mallorca</span><span class="l2">2026</span></h1>
        <p class="tagline">${esc(CAMP.dates)} · ${esc(CAMP.location)}. Eight days, six rides,
        seventeen categorised climbs — from the FTP test on Sa Batalla to the handicap race up Sa Calobra itself.</p>
        <div class="cta-row">
          <a class="btn-split" href="#rides">The rides</a>
          <a class="link-ghost" href="${esc(CAMP.officialUrl)}" target="_blank" rel="noopener">Official camp page ↗</a>
        </div>
        <div class="stat-row">
          ${heroStat(t.rides, "", "Rides")}
          ${heroStat(d.v, d.u, "Distance")}
          ${heroStat(e.v, e.u, "Climbing")}
          ${heroStat(hoursLabel(t.hours), "", "Ride time")}
          ${heroStat(t.climbs, "", "Cat. climbs")}
          ${heroStat(fmt.format(t.tss), "", "Est. TSS")}
        </div>
      </section>

      <section aria-labelledby="wk-h">
        <div class="sec-head">
          <span class="ghost">01</span>
          <h2 id="wk-h">Shape <b>of the week</b></h2>
          <span class="sub">Climbing per riding day (${unit === "km" ? "m" : "ft"}) — click a day to open its stage</span>
        </div>
        <div class="panel">
          <div class="chart-scroll">${weekChartSvg()}</div>
          <p class="chart-footnote">Queen Stage (Tue) and Sa Calobra (Thu) carry almost half of the week’s ${e.v} ${e.u} of climbing. Bars show elevation gain; distance is under each day.</p>
        </div>
      </section>

      <section aria-labelledby="sc-h">
        <div class="sec-head">
          <span class="ghost">02</span>
          <h2 id="sc-h">Day <b>by day</b></h2>
          <span class="sub">Saturday 17 → Saturday 24 October</span>
        </div>
        <div class="schedule">${scheduleHtml}</div>
      </section>

      <section id="rides" aria-labelledby="rd-h">
        <div class="sec-head">
          <span class="ghost">03</span>
          <h2 id="rd-h">The <b>rides</b></h2>
          <span class="sub">In riding order — stage numbers follow the official sacalobra.cc pages</span>
        </div>
        <div class="rides-grid">${ridePanels}</div>
      </section>

      <section aria-labelledby="cn-h">
        <div class="sec-head">
          <span class="ghost">04</span>
          <h2 id="cn-h">Good <b>to know</b></h2>
          <span class="sub">From the official camp page</span>
        </div>
        <div class="notes">
          ${CAMP.notes.map(nt => `<p>${esc(nt.text)}</p>`).join("")}
        </div>
      </section>`;

    bindChart();
  }

  /* ---------- stage detail ---------- */
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
        <div class="sec-head">
          <span class="ghost">03</span>
          <h2 id="seg-h">Climbs <b>&amp; segments</b></h2>
          <span class="sub">SCCC = Sa Calobra CC club records</span>
        </div>
        <div class="panel">
          <div class="table-wrap">
            <table class="climbs">
              <thead><tr><th>Climb</th><th>Cat.</th><th>Length</th><th>Avg grade</th><th>SCCC KOM</th><th>SCCC QOM</th><th>Strava</th></tr></thead>
              <tbody>${segRows}</tbody>
            </table>
          </div>
          ${r.segmentNote ? `<p class="table-note">${esc(r.segmentNote)}</p>` : ""}
        </div>
      </section>` : `
      <section aria-labelledby="seg-h">
        <div class="sec-head">
          <span class="ghost">03</span>
          <h2 id="seg-h">Climbs</h2>
        </div>
        <p class="table-note">No categorised climbs today — the reward is the coffee stop at ${esc(r.coffeeStop)} instead.</p>
      </section>`;

    app.innerHTML = `
      <div class="stage-hero">
        <span class="ghost-no">${pad2(r.id)}</span>
        <a class="backlink" href="#/"><span class="arrow-circle">←</span>Back to the week</a>
        <div class="stage-meta">Day ${r.campDay} · ${esc(r.date)} · ${esc(r.theme)}</div>
        <h1>${esc(r.name)}</h1>
        <p class="intro">${esc(r.intro)}</p>
        <div class="stage-actions">
          <a class="btn-split" href="${esc(r.url)}" target="_blank" rel="noopener">Official stage ↗</a>
          ${diffTag(r.difficulty)}
        </div>
        <div class="stat-panel">
          ${heroStat(rd.v, rd.u, "Distance")}
          ${heroStat(re.v, re.u, "Climbing")}
          ${heroStat(hoursLabel(r.hours), "", "Est. time")}
          ${heroStat(r.nClimbs, "", "Cat. climbs")}
          ${heroStat(r.feedZones, "", "Feed zones")}
          ${heroStat(r.tss, "", "Est. TSS")}
        </div>
      </div>

      <section aria-labelledby="pf-h">
        <div class="sec-head">
          <span class="ghost">01</span>
          <h2 id="pf-h">Stage <b>profile</b></h2>
          <span class="sub"><a href="${esc(r.profileImgOfficial)}" target="_blank" rel="noopener">full size ↗</a></span>
        </div>
        <figure class="media">
          <img src="${esc(r.profileImg)}" alt="Official elevation profile for ${esc(r.name)}" loading="lazy"
               onerror="this.onerror=null;this.src='${esc(r.profileImgOfficial)}'">
          <figcaption><span>Official stage profile — sacalobra.cc</span><span>${rd.v} ${rd.u} · ${re.v} ${re.u}</span></figcaption>
        </figure>
      </section>

      <section aria-labelledby="st-h">
        <div class="sec-head">
          <span class="ghost">02</span>
          <h2 id="st-h">The <b>stage</b></h2>
        </div>
        <div class="story">${r.description.map(p => `<p>${esc(p)}</p>`).join("")}</div>
      </section>

      ${segmentsSection}

      <section aria-labelledby="mp-h">
        <div class="sec-head">
          <span class="ghost">04</span>
          <h2 id="mp-h">Route <b>map</b></h2>
          <span class="sub"><a href="${esc(r.mapImgOfficial)}" target="_blank" rel="noopener">full size ↗</a></span>
        </div>
        <figure class="media">
          <img src="${esc(r.mapImg)}" alt="Official route map for ${esc(r.name)}" loading="lazy"
               onerror="this.onerror=null;this.src='${esc(r.mapImgOfficial)}'">
          <figcaption><span>Official route map — sacalobra.cc</span>
            <span><a href="${esc(r.url)}" target="_blank" rel="noopener">Stage ${r.id} on sacalobra.cc ↗</a></span></figcaption>
        </figure>
      </section>

      <nav class="stage-nav" aria-label="Stage navigation">
        ${prev ? `<a href="#/stage/${prev.id}"><span class="arrow-circle">←</span><span><span class="dir">Previous ride</span><span class="nm">${esc(prev.name)}</span></span></a>` : `<span></span>`}
        ${next ? `<a class="next" href="#/stage/${next.id}"><span class="arrow-circle">→</span><span><span class="dir">Next ride</span><span class="nm">${esc(next.name)}</span></span></a>` : ""}
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
