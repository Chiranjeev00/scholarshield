import { organizations } from "./data.js";

export function getHost(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      ? url.hostname.toLowerCase()
      : "";
  } catch {
    return "";
  }
}

// Jaccard similarity: shared unique words / all unique words.
export function similarity(first, second) {
  const words = (text) => new Set(text.toLowerCase().match(/[a-z0-9]+/g) || []);
  const a = words(first),
    b = words(second);
  if (a.size < 10 || b.size < 10) return 0;
  return (
    [...a].filter((word) => b.has(word)).length / new Set([...a, ...b]).size
  );
}

export function analyze(entry, collection = []) {
  const host = getHost(entry.url);
  const text = entry.description.toLowerCase();
  const organization = organizations.find(
    (item) =>
      item.name.toLowerCase() === entry.organization.trim().toLowerCase(),
  );
  const domainMatches = organization?.domains.some(
    (domain) => host === domain || host.endsWith("." + domain),
  );
  const knownDomain = organizations.some((item) =>
    item.domains.some(
      (domain) => host === domain || host.endsWith("." + domain),
    ),
  );
  const payment =
    /(?:pay|send|transfer).{0,40}(?:fee|money|deposit|payment)|(?:processing|registration|application) fee(?: of|:| is required)|(?:upi|crypto) payment/i.test(
      text,
    );
  const phrases = [
    "guaranteed scholarship",
    "act now",
    "limited time",
    "no verification required",
    "100% approval",
  ];
  const found = phrases.filter((phrase) => text.includes(phrase));
  const duplicate = collection.find(
    (item) => item.id !== entry.id && similarity(text, item.description) >= 0.7,
  );
  const domainFlag =
    !host ||
    (organization && !domainMatches) ||
    (/(?:gov|edu|official)[-.]/.test(host) && !knownDomain) ||
    host.includes("xn--");
  const checks = [
    {
      name: "Domain authenticity",
      points: domainFlag ? 25 : 0,
      detail: !host
        ? "A valid HTTP(S) website address is missing."
        : domainFlag
          ? `Review ${host}: it has an imitation signal or does not match the claimed organisation in our small reference list.`
          : `No configured domain warning for ${host}. This does not verify ownership.`,
    },
    {
      name: "Payment demands",
      points: payment ? 30 : 0,
      detail: payment
        ? "The description contains a possible fee or payment request. Review the exact wording before paying."
        : "No configured payment phrase found in the supplied text.",
    },
    {
      name: "Organisation reference",
      points: !organization ? 10 : 0,
      detail: organization
        ? `${organization.name} is in our manually maintained reference list. This does not authenticate this particular offer.`
        : "Organisation not in our small reference list. Unknown does not mean fake.",
    },
    {
      name: "Similar content",
      points: duplicate ? 15 : 0,
      detail: duplicate
        ? `At least 70% word-set similarity with “${duplicate.title}”. Shared wording can be legitimate; inspect the sources.`
        : "No close match in this local collection. The wider internet was not searched.",
    },
    {
      name: "Suspicious language",
      points: found.length ? 20 : 0,
      detail: found.length
        ? `Matched wording: ${found.join(", ")}.`
        : "No configured urgency or guaranteed-award phrase found.",
    },
  ];
  const score = checks.reduce((total, check) => total + check.points, 0);
  return {
    score,
    level:
      score >= 50 ? "High risk" : score >= 20 ? "Review needed" : "Low signals",
    checks,
  };
}
