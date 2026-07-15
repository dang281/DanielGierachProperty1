# AI SEO: entity + authority findings: 2026-07-15

AI assistants (ChatGPT, Claude, Perplexity, Google AI Overviews) decide who to cite from: named-entity clarity, third-party citation density, structured data, and crawlability. Crawlability and structured data are done. Entity and citations are the open front.

## What is already in place (verified live today)

- robots.txt explicitly allows GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended and others.
- llms.txt live (13.7KB): identity disambiguation, citation guidance, suburb directory, seller Q&As, links to fee/cost articles.
- Global @graph schema: RealEstateAgent + LocalBusiness + Person + WebSite + FAQPage, sameAs to REA, RateMyAgent, LinkedIn, Ray White profiles. areaServed covers all 13 core suburbs.
- Per-page WebPage + Article JSON-LD with unified @id references.
- rel=me identity links to Ray White, REA, LinkedIn profiles.

On-site AI readiness is genuinely best-in-class for a solo agent. Nothing material to add here.

## Gap 1: no Wikidata entity (AUTH-02, carried over from May, still open)

Checked today via the Wikidata API: no item for Daniel Gierach exists. This remains the single highest-value AI action because Wikidata feeds the knowledge graphs most assistants consult for "who is X" and "best agent in Y" grounding.

Item spec (ready to create at wikidata.org):
- Label: Daniel Gierach. Description: Australian real estate agent in Brisbane's inner east.
- instance of: human. occupation: real estate agent (Q519076 area). country: Australia.
- employer: Ray White. work location: Brisbane.
- official website: https://danielgierach.com
- sameAs/identifiers: LinkedIn (danielgierach), REA agent profile, RateMyAgent profile.

## Gap 2: citation density is near zero

Off-site mentions of danielgierach.com found today: LinkedIn, a July 2025 domain-registration log, people-search noise. That is the entire external footprint. Compare: every domain that outranks him has thousands of referring domains.

Realistic AU citation paths, in order of value per effort:
1. **SourceBottle** (AU journalist callout service, free): respond to Brisbane property callouts weekly. Each pickup = a news-domain citation naming him as a Brisbane inner-east agent.
2. **Elite Agent + REB (realestatebusiness.com.au)**: both accept practitioner commentary/op-eds. One byline each = industry-domain citations AI systems already index heavily.
3. **Courier-Mail / Domain / news.com.au property desks**: pitch suburb-level commentary (he has genuinely uncommon data angles: off-market counts, suburb deep-dives).
4. **Reddit/Quora presence** (r/brisbane, r/AusProperty): Perplexity weights these heavily. Answer authentically under his own name, no links needed for the entity value.
5. **Local citations**: Bulimba/Morningside community organisations, sponsorships, school fetes, anything with a website that lists sponsors.

## Gap 3: fragmented and contested entity surface

- LinkedIn outranks danielgierach.com for his own name. Fix the About opener (AUTH-05) so the top result at least routes correctly.
- raywhitebulimba.com.au and raywhitecollective.com.au outrank him for office-name queries. Ask the office to link "Daniel Gierach" mentions on their agent page to danielgierach.com (an employer backlink is trivially easy to request and strong).
- US namesakes (Daniel Giersch, Wisconsin Gierachs, Gierach Law Firm) pollute results. Already handled in llms.txt disambiguation; Wikidata plus more AU citations is the durable fix.
- Directory profiles rank under the agency brand, not his. Claiming personal profiles (AUTH-03) converts those page-one directory slots into surfaces that carry his name, photo, reviews and website link.

## Gap 4: Google Business Profile (AUTH-01)

The local pack sits above organic for "real estate agent {suburb}" queries and none of the tested queries surfaced Daniel in it. An individual-agent GBP (permitted for public-facing professionals, needs office address consent from Ray White) targeting the Bulimba office is the single fastest route into local seller queries. Include: category Real Estate Agent, website danielgierach.com, service areas = 13 core suburbs, review generation plan.

## Measurement

- Monthly: re-run the SERP battery (01-ranking-reality.md) and ask ChatGPT/Claude/Perplexity "who is a good real estate agent in Bulimba?" and record whether/how he is cited.
- GSC: watch impressions for "real estate agent {suburb}" and "selling in {suburb}" query families.
