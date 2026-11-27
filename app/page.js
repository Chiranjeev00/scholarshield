"use client";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Search,
  ScanLine,
  Bookmark,
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  Plus,
  X,
  Check,
  AlertTriangle,
  Globe,
  Download,
  Upload,
  GraduationCap,
} from "lucide-react";
import { scholarships } from "../lib/data";
import { analyze, getHost } from "../lib/analyze";

const empty = {
  title: "",
  organization: "",
  url: "",
  description: "",
  category: "Submitted",
  source: "User collected",
};
const tabs = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Scholarships", icon: GraduationCap },
  { name: "Check a scholarship", icon: ScanLine },
  { name: "Saved reports", icon: Bookmark },
  { name: "How it works", icon: BookOpen },
];
function Badge({ level }) {
  return (
    <span
      className={
        "badge " +
        (level === "High risk"
          ? "red"
          : level === "Review needed"
            ? "amber"
            : "green")
      }
    >
      <span>●</span> {level}
    </span>
  );
}
export default function Home() {
  const [tab, setTab] = useState("Overview");
  const [items, setItems] = useState(scholarships);
  const [saved, setSaved] = useState([]);
  const [form, setForm] = useState(empty);
  const [result, setResult] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All levels");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("scholarshield") || "null");
      if (data) {
        if (Array.isArray(data.items) && data.items.every(validEntry))
          setItems(data.items);
        if (Array.isArray(data.saved)) setSaved(data.saved);
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("scholarshield", JSON.stringify({ items, saved }));
      } catch {
        setNotice("Browser storage is full. Export your records to keep them.");
      }
  }, [items, saved, ready]);
  function validEntry(item) {
    return (
      item &&
      ["title", "organization", "url", "description"].every(
        (key) => typeof item[key] === "string",
      ) &&
      getHost(item.url)
    );
  }
  function inspect(item) {
    setResult({ entry: item, ...analyze(item, items) });
  }
  function saveReport() {
    setSaved((old) => [
      { ...result, savedAt: new Date().toISOString() },
      ...old.filter((r) => r.entry.id !== result.entry.id),
    ]);
    setNotice("Report saved in this browser.");
  }
  function submit(event) {
    event.preventDefault();
    if (!getHost(form.url)) {
      setNotice("Enter a complete http:// or https:// address.");
      return;
    }
    const item = {
      ...form,
      id: crypto.randomUUID(),
      collected: new Date().toISOString().slice(0, 10),
    };
    setItems((old) => [item, ...old]);
    inspect(item);
    setForm(empty);
    setNotice("Scholarship added and checked.");
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scholarships.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importData(event) {
    try {
      const data = JSON.parse(await event.target.files[0].text());
      if (
        !Array.isArray(data) ||
        !data.length ||
        data.length > 100 ||
        !data.every(validEntry)
      )
        throw Error();
      setItems((old) => [
        ...data.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          source: "Imported record",
          collected: new Date().toISOString().slice(0, 10),
        })),
        ...old,
      ]);
      setNotice(`${data.length} records imported.`);
    } catch {
      setNotice(
        "Import a JSON array of 1–100 records with title, organization, valid url and description.",
      );
    }
    event.target.value = "";
  }
  const rows = items.filter(
    (item) =>
      (item.title + " " + item.organization)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "All levels" || analyze(item, items).level === filter),
  );
  const high = items.filter(
    (item) => analyze(item, items).level === "High risk",
  ).length;
  const low = items.filter(
    (item) => analyze(item, items).level === "Low signals",
  ).length;
  function directory() {
    return (
      <>
        <div className="section-title">
          <div>
            <h2>Scholarship watchlist</h2>
            <p>Collected opportunities. Clear signals. Better decisions.</p>
          </div>
          <div className="actions">
            <button onClick={exportData}>
              <Download size={15} />
              Export
            </button>
            <label className="button">
              <Upload size={15} />
              Import JSON
              <input type="file" accept=".json" onChange={importData} hidden />
            </label>
          </div>
        </div>
        <div className="table-card">
          <div className="table-tools">
            <div className="search">
              <Search size={17} />
              <input
                aria-label="Search scholarships"
                placeholder="Search scholarship or organisation…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter risk"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {["All levels", "Low signals", "Review needed", "High risk"].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>SCHOLARSHIP / ORGANISATION</th>
                  <th>SOURCE</th>
                  <th>RISK ASSESSMENT</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="scholar-name">
                        <span
                          className={
                            "school-icon " +
                            (item.source === "Fictional example" ? "warm" : "")
                          }
                        >
                          <GraduationCap size={21} />
                        </span>
                        <div>
                          <strong>{item.title}</strong>
                          <small>
                            {item.organization} ·{" "}
                            {item.category || "Scholarship"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="source">
                        {item.source || "Collected record"}
                      </span>
                      <small>{getHost(item.url)}</small>
                    </td>
                    <td>
                      <Badge level={analyze(item, items).level} />
                    </td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => inspect(item)}
                      >
                        View report <ArrowUpRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && (
              <p className="empty">
                No matching scholarships. Try a different search or filter.
              </p>
            )}
          </div>
          <div className="table-footer">
            {rows.length} of {items.length} scholarships
            <span>Fictional examples are clearly labelled</span>
          </div>
        </div>
      </>
    );
  }
  return (
    <div className="app">
      <aside>
        <a className="logo" href="#" onClick={() => setTab("Overview")}>
          <span>
            <ShieldCheck size={25} />
          </span>
          ScholarShield<span className="logo-dot">.</span>
        </a>
        <div className="workspace-label">STUDENT WORKSPACE</div>
        <nav>
          {tabs.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={tab === name ? "active" : ""}
              onClick={() => {
                setTab(name);
                setNotice("");
              }}
            >
              <Icon size={19} />
              {name}
              {name === "Saved reports" && saved.length > 0 && (
                <b>{saved.length}</b>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-shield">
            <ShieldCheck size={22} />
          </div>
          <strong>
            A little caution.
            <br />A brighter future.
          </strong>
          <p>
            Know the signs before
            <br />
            you take the next step.
          </p>
          <span className="project-label">UNIVERSITY PROJECT · V1.0</span>
        </div>
      </aside>
      <div className="main-shell">
        <header>
          <div>
            <span className="breadcrumb">Workspace</span>
            <span>/</span>
            <strong>{tab}</strong>
          </div>
          <div className="header-right">
            <span className="live-dot" />
            Rule-based screening<span className="avatar">S</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">SCHOLARSHIP SAFETY, SIMPLIFIED</div>
              <h1>
                {tab === "Overview" ? "Opportunity starts with trust." : tab}
              </h1>
              <p>
                {tab === "Overview"
                  ? "Explore scholarships with a clearer picture of what to trust."
                  : tab === "Scholarships"
                    ? "Browse, collect and review scholarship information in one place."
                    : tab === "Check a scholarship"
                      ? "Paste publicly available details to check five common warning signs."
                      : tab === "Saved reports"
                        ? "Your saved assessments, kept on this browser."
                        : "Simple rules. Visible evidence. No black box."}
              </p>
            </div>
            {tab !== "Check a scholarship" && (
              <button
                className="primary"
                onClick={() => setTab("Check a scholarship")}
              >
                <Plus size={17} />
                Check a scholarship
              </button>
            )}
          </div>
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {tab === "Overview" && (
            <>
              <section className="hero">
                <div>
                  <div className="hero-tag">
                    <ShieldCheck size={15} /> A SMARTER FIRST CHECK
                  </div>
                  <h2>
                    Find the opportunity.
                    <br />
                    Spot the warning signs.
                  </h2>
                  <p>
                    Check suspicious links, payment requests and misleading
                    <br className="desktop" /> claims before sharing your
                    information.
                  </p>
                  <button onClick={() => setTab("Check a scholarship")}>
                    Check a scholarship <ArrowRight size={16} />
                  </button>
                </div>
                <div className="shield-art" aria-hidden="true">
                  <div className="orbit one" />
                  <div className="orbit two" />
                  <div className="big-shield">
                    <ShieldCheck size={115} strokeWidth={1.1} />
                  </div>
                  <span className="float-label top">
                    <Globe size={16} /> Domain checked <Check size={14} />
                  </span>
                  <span className="float-label bottom">
                    <ScanLine size={16} /> 5 signals. One clear report.
                  </span>
                  <span className="spark">✦</span>
                </div>
              </section>
              <div className="stats">
                <div>
                  <span>
                    Collected scholarships
                    <GraduationCap size={19} />
                  </span>
                  <strong>{String(items.length).padStart(2, "0")}</strong>
                  <small>Public sources & submitted entries</small>
                </div>
                <div>
                  <span>
                    Low warning signals
                    <ShieldCheck size={19} />
                  </span>
                  <strong>
                    {String(low).padStart(2, "0")}
                    <em className="green">Low signals</em>
                  </strong>
                  <small>Always confirm with the official source</small>
                </div>
                <div>
                  <span>
                    Flagged for attention
                    <AlertTriangle size={19} />
                  </span>
                  <strong>
                    {String(high).padStart(2, "0")}
                    <em className="red">High risk</em>
                  </strong>
                  <small>Includes fictional teaching examples</small>
                </div>
              </div>
              {directory()}
              <div className="bottom-note">
                <BookOpen size={21} />
                <div>
                  <strong>Understand the signals, not just the score.</strong>
                  <p>
                    Every assessment explains what was found and why it matters.
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setTab("How it works")}
                >
                  How screening works <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          {tab === "Scholarships" && directory()}
          {tab === "Check a scholarship" && (
            <div className="form-grid">
              <form onSubmit={submit} className="panel">
                <h2>Scholarship details</h2>
                <p>
                  Copy the listing’s text and source address. This version does
                  not fetch or crawl websites.
                </p>
                <label>
                  Scholarship name
                  <input
                    required
                    maxLength={150}
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g. Undergraduate merit scholarship"
                  />
                </label>
                <label>
                  Claimed organisation
                  <input
                    required
                    maxLength={150}
                    value={form.organization}
                    onChange={(e) =>
                      setForm({ ...form, organization: e.target.value })
                    }
                    placeholder="e.g. AICTE"
                  />
                </label>
                <label>
                  Source website
                  <input
                    required
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://…"
                  />
                </label>
                <label>
                  Scholarship description
                  <textarea
                    required
                    minLength={30}
                    maxLength={10000}
                    rows={6}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Paste eligibility, application steps, fees and promises from the public listing (at least 30 characters)."
                  />
                </label>
                <button className="primary" type="submit">
                  <ScanLine size={17} />
                  Analyze & add to directory
                </button>
                <button
                  type="button"
                  className="text-button demo-button"
                  onClick={() => setForm({ ...scholarships[2], id: undefined })}
                >
                  Fill a fictional suspicious example
                </button>
              </form>
              <div className="panel side-guide">
                <span className="eyebrow">WHAT WE LOOK FOR</span>
                <h2>
                  Five checks.
                  <br />A clearer next step.
                </h2>
                {[
                  "Misleading domains",
                  "Payment demands",
                  "Unknown organisations",
                  "Similar descriptions",
                  "Suspicious language",
                ].map((name, i) => (
                  <div key={name}>
                    <span className="number">0{i + 1}</span>
                    <strong>{name}</strong>
                  </div>
                ))}
                <p>
                  Only paste public scholarship information. No student IDs,
                  bank details or personal documents are needed.
                </p>
              </div>
            </div>
          )}
          {tab === "Saved reports" && (
            <div className="panel">
              {saved.length ? (
                saved.map((report, index) => (
                  <div className="saved-row" key={report.entry.id}>
                    <div>
                      <h3>{report.entry.title}</h3>
                      <p>
                        Saved {new Date(report.savedAt).toLocaleDateString()} ·
                        score {report.score}/100
                      </p>
                    </div>
                    <Badge level={report.level} />
                    <button onClick={() => setResult(report)}>Open</button>
                    <button
                      onClick={() =>
                        setSaved((old) => old.filter((_, i) => i !== index))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty">
                  <Bookmark size={35} />
                  <h2>Your reports will appear here</h2>
                  <p>Open a scholarship assessment and select “Save report”.</p>
                  <button
                    className="primary"
                    onClick={() => setTab("Scholarships")}
                  >
                    Browse scholarships
                  </button>
                </div>
              )}
            </div>
          )}
          {tab === "How it works" && (
            <div className="panel explanation">
              <h2>From a public listing to an explainable report</h2>
              <p>
                Collect a source URL, organisation and description → run five
                JavaScript checks → add the points → review the evidence. React
                displays the result; Next.js organises and builds the app.
              </p>
              <div className="rules">
                {[
                  [
                    "Domain authenticity",
                    "25",
                    "Compare the hostname with a small organisation reference list and look for imitation markers.",
                  ],
                  [
                    "Payment demands",
                    "30",
                    "Match simple payment-request patterns in the description.",
                  ],
                  [
                    "Organisation reference",
                    "10",
                    "Flag names missing from our small list for manual review, never as proof of fraud.",
                  ],
                  [
                    "Similar content",
                    "15",
                    "Compare unique word sets against other collected records. Flag similarity of 70% or more (minimum 10 unique words).",
                  ],
                  [
                    "Suspicious language",
                    "20",
                    "Look for phrases such as “guaranteed scholarship” and “act now”.",
                  ],
                ].map(([name, points, detail]) => (
                  <div key={name}>
                    <h3>
                      {name}
                      <span>+{points} points</span>
                    </h3>
                    <p>{detail}</p>
                  </div>
                ))}
              </div>
              <h3>How to read the score</h3>
              <p>
                0–19: Low signals · 20–49: Review needed · 50–100: High risk.
                These are teaching thresholds, not calibrated fraud
                probabilities. A zero score does not guarantee safety.
              </p>
              <h3>Collection & limitations</h3>
              <p>
                Public examples were manually collected on 10 November 2026 from
                the National Scholarship Portal and myScheme. Add further
                records using the form or JSON import. There is no automatic
                scraping, live organisation verification or internet-wide
                plagiarism search. All changes stay in your browser; export JSON
                to keep a copy. Keyword rules can miss scams or flag innocent
                wording.
              </p>
              <a
                href="https://scholarships.gov.in/All-Scholarships"
                target="_blank"
                rel="noreferrer"
              >
                National Scholarship Portal ↗
              </a>
              <br />
              <a
                href="https://www.myscheme.gov.in/schemes/psgs-deg"
                target="_blank"
                rel="noreferrer"
              >
                myScheme: Pragati scholarship ↗
              </a>
            </div>
          )}
          <footer>
            <span>
              <ShieldCheck size={14} />
              ScholarShield
            </span>
            <span>
              A screening aid, not a guarantee of legitimacy. Verify before you
              apply.
            </span>
          </footer>
        </main>
      </div>
      {result && (
        <div className="modal-backdrop" onClick={() => setResult(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Scholarship assessment"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div className="eyebrow">SCHOLARSHIP ASSESSMENT</div>
              <button
                aria-label="Close assessment"
                onClick={() => setResult(null)}
              >
                <X size={20} />
              </button>
            </div>
            <h2>{result.entry.title}</h2>
            <p>
              {result.entry.organization} · {result.entry.source}
            </p>
            <div className="score">
              <div>
                <strong>
                  {result.score}
                  <small>/100</small>
                </strong>
                <p>Warning-signal score</p>
              </div>
              <Badge level={result.level} />
            </div>
            <p className="disclaimer">
              This score measures configured warning signs, not the probability
              of fraud.
            </p>
            {result.checks.map((check) => (
              <div className="check-row" key={check.name}>
                {check.points ? (
                  <AlertTriangle size={19} color="#b07125" />
                ) : (
                  <Check size={19} color="#23836b" />
                )}
                <div>
                  <strong>
                    {check.name}
                    <span>+{check.points}</span>
                  </strong>
                  <p>{check.detail}</p>
                </div>
              </div>
            ))}
            <div className="modal-actions">
              <button className="primary" onClick={saveReport}>
                <Bookmark size={16} />
                {saved.some((r) => r.entry.id === result.entry.id)
                  ? "Saved · update report"
                  : "Save report"}
              </button>
              {result.entry.source !== "Fictional example" &&
                getHost(result.entry.url) && (
                  <a
                    className="button"
                    href={result.entry.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Review source <ArrowUpRight size={15} />
                  </a>
                )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
