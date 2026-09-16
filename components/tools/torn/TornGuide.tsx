/**
 * Written content for the Torn profit finder.
 *
 * The page previously carried about 100 unique words around a data table,
 * which is what AdSense means by low value content. The explanations below are
 * specific to how this tool actually works — where the prices come from, how
 * often they refresh, and the ways a listed profit fails to materialise — so
 * they are useful to a player as well as to a reviewer.
 */

const FAQS = [
  {
    q: "Where do the prices come from?",
    a: "Bazaar listings come from weav3r.dev, a public crawler that continuously polls player bazaars and exposes the cheapest listing it has seen for each item. Item metadata such as type and vendor sell price comes from the official Torn API. We do not scrape Torn ourselves, and no API key is needed to use the page.",
  },
  {
    q: "How often do the prices update?",
    a: "The shared snapshot revalidates about every five minutes, matching the upstream crawler's own cadence. Asking more often would not return fresher data and would just add load to someone else's free service. The timestamp above the table shows exactly when the snapshot you are looking at was generated, in UTC — which is also Torn City Time.",
  },
  {
    q: "Why is the item gone when I click through?",
    a: "Because a cheap listing is the first thing other players buy. The snapshot is minutes old at best, and profitable items are exactly the ones that move fastest. Treat the list as a set of leads rather than guaranteed stock, and expect the best-looking margins to be the least likely to still be there.",
  },
  {
    q: "What is the difference between the market and vendor exit routes?",
    a: "The market route assumes you resell on the Item Market at roughly its current price, which usually pays more but depends on finding a buyer. The vendor route is the guaranteed price a shop will pay, available instantly. Both are shown because the right answer depends on whether you want maximum profit or certainty.",
  },
  {
    q: "Does the profit figure include fees?",
    a: "The figures are based on listed prices. Whether a trade is worth making also depends on your own travel time, the opportunity cost of the cash, and how long you are prepared to hold an item waiting for a market buyer — none of which a price table can know.",
  },
  {
    q: "Do I need to give you my API key?",
    a: "No. The page works fully without one. Supplying your own key only adds item types and vendor prices that the public source does not carry, and the key is kept in your own browser and sent directly to Torn — it never reaches our servers.",
  },
];

export default function TornGuide() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <section className="mx-auto mt-16 max-w-3xl border-t border-stone-200 pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <h2 className="text-2xl font-extrabold tracking-tight text-stone-950">
        How the profit finder works
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-stone-600">
        <p>
          Torn&apos;s own item pages show you the market price of an item, but not
          who is selling it cheaply. Player bazaars are where the gap lives:
          someone clearing inventory prices a batch below market, and it stays
          there until another player notices. Finding those by hand means opening
          bazaar after bazaar.
        </p>
        <p>
          This page reverses that. It takes the cheapest bazaar listing seen for
          every item, compares it with what you can sell that item for, and ranks
          whatever is currently worth buying. Both exit routes are shown — the
          Item Market, which usually pays more but needs a buyer, and the vendor
          shop, which pays less but pays immediately.
        </p>
      </div>

      <h3 className="mt-10 text-lg font-bold text-stone-900">Reading the table</h3>
      <ul className="mt-3 space-y-3">
        {[
          ["Buy price", "The cheapest bazaar listing the crawler has seen for that item."],
          ["Profit", "What you keep per item after buying at that price and taking the better exit."],
          ["Margin", "Profit as a share of the buy price. High-margin items are often cheap ones, where a large percentage is still a small number of dollars."],
          ["Quantity", "How many the listing holds. A five-dollar margin matters at 200 units and not at one."],
        ].map(([k, v]) => (
          <li key={k} className="flex gap-3 leading-relaxed text-stone-600">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-300" />
            <span>
              <strong className="text-stone-800">{k}</strong> — {v}
            </span>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-lg font-bold text-stone-900">
        Why a listed profit sometimes is not real
      </h3>
      <div className="mt-3 space-y-4 leading-relaxed text-stone-600">
        <p>
          The single biggest cause is time. The snapshot is shared by everyone
          using this page and refreshes every few minutes, so the most profitable
          listing has often already been bought. That is not a fault in the data —
          it is what happens to underpriced goods.
        </p>
        <p>
          The second is depth. Market price reflects the current lowest asking
          price, not what the market will absorb. Buying 300 of something and
          listing them at once pushes the price down, and the margin you
          calculated on the first unit does not hold for the last.
        </p>
      </div>

      <h3 className="mt-10 text-lg font-bold text-stone-900">
        Frequently asked questions
      </h3>
      <div className="mt-3 space-y-4">
        {FAQS.map(({ q, a }) => (
          <div key={q}>
            <p className="font-semibold text-stone-800">{q}</p>
            <p className="mt-1 leading-relaxed text-stone-600">{a}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs leading-relaxed text-stone-400">
        This is an unofficial fan-made tool. It is not affiliated with or endorsed
        by Torn. Bazaar data is provided by weav3r.dev; item data comes from the
        official Torn API.
      </p>
    </section>
  );
}
