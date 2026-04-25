#!/usr/bin/env node
/**
 * Generates suburb landing pages from a data spec, using the same structure
 * as src/pages/suburbs/paddington.astro. Re-runnable.
 *
 *   node scripts/build-suburb-pages.mjs
 *
 * After running, manually verify the suburb data and tone, then commit.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Data for each new suburb. Median/DOM are conservative estimates based on
// 2025 market context; verify against PriceFinder before promoting widely.
const SUBURBS = [
  {
    slug: 'toowong',
    name: 'Toowong',
    postcode: '4066',
    region: 'Inner West Brisbane',
    nearby: ['auchenflower', 'milton', 'bardon', 'indooroopilly'],
    headline: 'Inner-west family hub anchored by the river and the university.',
    intro:
      "Toowong is one of Brisbane's most established inner-west suburbs. Its mix of substantial family homes on traditional blocks, riverside streets, and proximity to UQ, Wesley Hospital and the CBD via train and ferry makes it one of the city's most consistent buyer markets. Just over 5 kilometres from the GPO, it offers the rare combination of established neighbourhood feel and genuine convenience.",
    body:
      "Buyers here are typically established families, hospital and university professionals, and downsizers from larger acreage suburbs further west. The market splits clearly between detached homes on flat or undulating streets, and the riverside apartment market along Sylvan Road. Detached homes on quiet, leafy streets with character integrity remain the most contested segment. Renovation activity is strong, and well-presented homes in the right pocket consistently attract competitive bidding. Toowong State School and Toowong College both anchor the family appeal, and the Toowong Village retail precinct is a daily-life amenity buyers genuinely use.",
    cards: [
      { title: 'Toowong Specialist', sub: 'Inner West Brisbane' },
      { title: 'Family + Professional Market', sub: 'Strong owner-occupier demand' },
    ],
    schools: ['Toowong State School', 'Toowong State High School / Indooroopilly State High School'],
    faqs: [
      {
        q: 'What is the median house price in Toowong Brisbane?',
        a: "Toowong's median house price reflects its position as one of Brisbane's most established inner-west suburbs. Pricing varies considerably between flat family streets and elevated streets with views, and between renovated character homes and original-condition properties on larger blocks. An appraisal will give you a precise read on where your home sits relative to current sales.",
      },
      {
        q: 'How long does it take to sell a home in Toowong?',
        a: 'Well-presented Toowong homes typically sell within 25 to 35 days. Buyer demand is consistent thanks to the suburb\'s position close to UQ, Wesley Hospital and the CBD, and the Toowong State School catchment supports steady family interest year-round.',
      },
      {
        q: 'What is the lifestyle like in Toowong Brisbane?',
        a: 'Toowong combines established neighbourhood feel with genuine inner-city access. Residents have ferry, train and bus connections to the CBD, the riverside walk and bike paths, and the Toowong Village retail precinct on their doorstep. Streets vary from quiet leafy family pockets to busier arterial corridors, and pricing reflects that.',
      },
      {
        q: 'What types of homes are in Toowong?',
        a: "Toowong has a broad mix: traditional Queenslanders and post-war family homes on flat blocks, character homes on elevated streets with city or river outlooks, and a strong apartment market along the river and around the village. The detached family home market remains the most contested for sellers and the most consistent in price growth.",
      },
    ],
  },
  {
    slug: 'auchenflower',
    name: 'Auchenflower',
    postcode: '4066',
    region: 'Inner West Brisbane',
    nearby: ['toowong', 'milton', 'paddington', 'bardon'],
    headline: 'Hospital-precinct family suburb with strong school catchments.',
    intro:
      "Auchenflower sits between Toowong and Milton, anchored by the Wesley Hospital precinct and Lang Park. Its mix of original Queenslanders, renovated character homes and a smaller pocket of contemporary builds attracts buyers who want inner-city convenience without apartment density. At under 4 kilometres from the CBD, it offers genuine walkability to Suncorp Stadium, Park Road and the riverside path.",
    body:
      "Buyers in Auchenflower are typically established professionals, doctors and nurses connected to Wesley Hospital, and families chasing the Milton State School and Brisbane State High catchments. The character home market is the heart of the suburb and the main driver of price growth. Steeper streets carry city outlooks; flatter streets near the railway line offer more accessible price points but trade in volume. The ferry terminal at the bottom of Coronation Drive and the Auchenflower train station both add to the suburb's permanent demand profile.",
    cards: [
      { title: 'Auchenflower Specialist', sub: 'Inner West Brisbane' },
      { title: 'Wesley Hospital Precinct', sub: 'Strong professional and family demand' },
    ],
    schools: ['Milton State School', 'Brisbane State High School'],
    faqs: [
      {
        q: 'What is the median house price in Auchenflower Brisbane?',
        a: 'Auchenflower\'s median house price reflects its inner-west position and access to the Brisbane State High catchment, which is a significant value driver. Pricing varies meaningfully between renovated character homes on elevated streets and unrenovated cottages closer to the rail corridor. An appraisal will give you a precise read on where your property sits.',
      },
      {
        q: 'How long does it take to sell a home in Auchenflower?',
        a: 'Well-presented Auchenflower homes typically sell within 25 to 35 days. The Brisbane State High School catchment is a year-round demand anchor, and buyers connected to Wesley Hospital create consistent interest in the suburb regardless of broader market conditions.',
      },
      {
        q: 'Is Auchenflower in the Brisbane State High catchment?',
        a: 'Yes, parts of Auchenflower are in the Brisbane State High School catchment, which is one of the strongest demand drivers in the inner west. Catchment boundaries can be street-by-street so it pays to verify your specific address with the Department of Education before you buy or list.',
      },
      {
        q: 'What types of homes are in Auchenflower?',
        a: 'Auchenflower is predominantly character housing: traditional Queenslanders, post-war cottages and inter-war homes. Many have been renovated to a high standard while retaining original facades. There is also a smaller apartment market closer to the river and the railway corridor that is popular with hospital staff and CBD professionals.',
      },
    ],
  },
  {
    slug: 'milton',
    name: 'Milton',
    postcode: '4064',
    region: 'Inner West Brisbane',
    nearby: ['auchenflower', 'toowong', 'paddington', 'red-hill'],
    headline: 'Riverside professional precinct with Park Road at its centre.',
    intro:
      "Milton sits 3 kilometres from the CBD on the western edge of Brisbane's inner ring. Its character is defined by Park Road's restaurants and cafés, the Brisbane River along Coronation Drive, and a mix of small-block cottages, terrace housing and well-located apartments. It attracts buyers who value commute, lifestyle and a tight, walkable footprint.",
    body:
      "The Milton buyer profile skews professional and dual-income: CBD-bound commuters, hospital staff (Wesley and Royal Brisbane), and downsizers who want apartment living with character context. The detached cottage market is small and competitive when stock comes up, and renovation is the dominant value-add play. Apartments range from established Queenslander conversions through to contemporary mid-rise along Coronation Drive. The Milton State School catchment is a meaningful demand driver, and Brisbane State High catchment access (street-dependent) lifts pricing on qualifying properties.",
    cards: [
      { title: 'Milton Specialist', sub: 'Inner West Brisbane' },
      { title: 'Professional Riverside Market', sub: 'Park Road and CBD on your doorstep' },
    ],
    schools: ['Milton State School', 'Brisbane State High School'],
    faqs: [
      {
        q: 'What is the median house price in Milton Brisbane?',
        a: 'Milton\'s median house price reflects its scarcity: the suburb is small and detached homes are tightly held. Pricing varies significantly with block size, position relative to Park Road, and catchment access. An appraisal will give you a precise read on where your home sits relative to current sales.',
      },
      {
        q: 'How long does it take to sell a home in Milton?',
        a: 'Well-presented Milton homes typically sell within 25 to 35 days, and apartments tend to track 30 to 45 days depending on building and view. Demand is consistent thanks to the suburb\'s commute, lifestyle and catchment combination.',
      },
      {
        q: 'What is the lifestyle like in Milton Brisbane?',
        a: 'Milton is one of Brisbane\'s most genuinely walkable suburbs. The Park Road precinct, the riverside bike path along Coronation Drive, and rapid CBD access via train, bus or ferry all sit within a tight footprint. It attracts buyers who want city-edge living with established character.',
      },
      {
        q: 'What types of homes are in Milton?',
        a: 'Milton has a mix of small-block character cottages, terrace and townhouse stock, and an active apartment market. The detached home segment is small and contested whenever quality stock comes up, particularly in the Brisbane State High catchment.',
      },
    ],
  },
  {
    slug: 'bardon',
    name: 'Bardon',
    postcode: '4065',
    region: 'Inner West Brisbane',
    nearby: ['paddington', 'red-hill', 'toowong', 'auchenflower'],
    headline: 'Leafy family suburb on the western ridge with large blocks.',
    intro:
      "Bardon is one of Brisbane's most family-oriented inner-west suburbs. Its elevated, leafy position, larger-than-average blocks and strong school catchments draw established families and upgraders looking for space without leaving the inner ring. At around 5 kilometres from the CBD, it offers a noticeably different feel to neighbouring Paddington and Red Hill while sharing their character home heritage.",
    body:
      "Buyers here are predominantly families upgrading from inner-city apartments and townhouses, or relocating from interstate. The detached family home market on flat-to-undulating streets is the strongest segment, and the Rainworth State School and Ithaca Creek State School catchments are meaningful demand drivers. Bardon's housing stock is dominated by Queenslanders and post-war family homes; renovated examples on large blocks consistently lead pricing. The suburb's tree cover, parks (including the Bardon Conservation Reserve and Brisbane Forest Park edge) and quiet streets are central to its appeal.",
    cards: [
      { title: 'Bardon Specialist', sub: 'Inner West Brisbane' },
      { title: 'Established Family Market', sub: 'Large blocks, leafy streets, strong schools' },
    ],
    schools: ['Rainworth State School', 'Indooroopilly State High School / Kelvin Grove State College'],
    faqs: [
      {
        q: 'What is the median house price in Bardon Brisbane?',
        a: 'Bardon\'s median house price reflects its position as one of Brisbane\'s most desirable inner-west family suburbs. Pricing varies with block size, elevation, renovation status and school catchment. An appraisal will give you a precise read on where your home sits relative to recent sales.',
      },
      {
        q: 'How long does it take to sell a home in Bardon?',
        a: 'Well-presented Bardon homes typically sell within 30 to 45 days. Family buyers do their due diligence carefully, and the right preparation, pricing and campaign timing make a measurable difference to outcome.',
      },
      {
        q: 'What is the lifestyle like in Bardon Brisbane?',
        a: 'Bardon is leafy, quiet and family-focused. Its elevated streets, large blocks and proximity to bushland reserves give it a noticeably different feel to denser inner suburbs. Residents have easy access to Paddington\'s Latrobe Terrace café strip, and CBD commute is straightforward by car or bus.',
      },
      {
        q: 'What types of homes are in Bardon?',
        a: 'Bardon is dominated by Queenslanders, post-war family homes, and architect-designed contemporary builds. Larger blocks support significant renovation and extension activity, and full rebuilds are also common in the suburb\'s top streets.',
      },
    ],
  },
  {
    slug: 'spring-hill',
    name: 'Spring Hill',
    postcode: '4000',
    region: 'Inner Brisbane',
    nearby: ['fortitude-valley', 'bowen-hills', 'paddington', 'red-hill'],
    headline: 'CBD-edge character precinct with workers cottages and apartments.',
    intro:
      "Spring Hill is one of Brisbane's most distinctive inner-city pockets. Sitting directly north of the CBD, the suburb is a tight grid of workers cottages, terrace houses, and a growing layer of apartments built around the Royal Brisbane Hospital and the city's professional core. It attracts buyers who want genuine walkability to the CBD without the apartment-block density of larger high-rise precincts.",
    body:
      "Buyers in Spring Hill are typically professionals, healthcare workers connected to RBWH and St Andrew's Hospital, and downsizers from inner-east family suburbs who want city-edge living. The character cottage market is the suburb's most distinctive segment and consistently outperforms when well-presented. Apartment stock varies widely in age and quality; stock built in the last 10 years generally trades at clear premiums. The Wickham Park, Centenary Place and St Stephen's Cathedral precincts give Spring Hill a sense of city heritage that newer apartment suburbs cannot replicate.",
    cards: [
      { title: 'Spring Hill Specialist', sub: 'Inner Brisbane' },
      { title: 'CBD-Edge Character Market', sub: 'Workers cottages, professional buyers' },
    ],
    schools: ['Brisbane Central State School', 'Brisbane State High School / Kelvin Grove State College'],
    faqs: [
      {
        q: 'What is the median house price in Spring Hill Brisbane?',
        a: 'Spring Hill\'s median house price reflects the scarcity of detached character homes in a CBD-edge location. Pricing varies meaningfully with block size, street, and renovation status. An appraisal will give you a precise read on where your home sits relative to recent sales.',
      },
      {
        q: 'How long does it take to sell a home in Spring Hill?',
        a: 'Well-presented Spring Hill cottages typically sell within 25 to 40 days. Apartments track 30 to 50 days depending on building age, view and amenity. The professional buyer profile rewards preparation and clear positioning.',
      },
      {
        q: 'What is the lifestyle like in Spring Hill Brisbane?',
        a: 'Spring Hill is one of Brisbane\'s few suburbs where you can genuinely walk to the CBD, the Valley\'s dining precinct, and the riverside in different directions in under fifteen minutes. The streetscape is character-rich without being precious, and the suburb has a distinct day-and-night rhythm thanks to the hospital precinct.',
      },
      {
        q: 'What types of homes are in Spring Hill?',
        a: 'Spring Hill\'s housing stock is one of the most varied in inner Brisbane: workers cottages, terrace houses, restored Queenslanders, post-war townhouses, and a growing layer of apartments from the 1990s onwards. The character cottage market is the suburb\'s most contested segment.',
      },
    ],
  },
  {
    slug: 'bowen-hills',
    name: 'Bowen Hills',
    postcode: '4006',
    region: 'Inner Brisbane',
    nearby: ['fortitude-valley', 'newstead', 'spring-hill', 'teneriffe'],
    headline: 'Apartment-led growth precinct anchored by the showgrounds and the train.',
    intro:
      "Bowen Hills is the apartment-led growth corridor at the inner-north edge of the CBD. Its position around the RNA Showgrounds, the Bowen Hills train station, and the King Street precinct has made it one of Brisbane's most active development zones over the past decade. It attracts buyers who want inner-city access at a different price point to the CBD or Newstead.",
    body:
      "The Bowen Hills market is dominated by apartments — mid-rise, high-rise, and a smaller layer of mixed-use stock around King Street. Older detached cottages still exist on a few elevated streets but are tightly held. Buyer profiles split between owner-occupier professionals, downsizers from Brisbane's outer suburbs, and investors targeting yield. Building selection matters enormously here: older 1990s and 2000s stock trades very differently to newer well-managed buildings, and the King Street precinct's ground-floor amenity gives certain buildings a permanent edge.",
    body2:
      "Proximity to the Royal Brisbane and Women's Hospital, the Inner City Bypass, and the upcoming Cross River Rail Bowen Hills station all support medium-term capital growth. The suburb's reputation has evolved meaningfully over the past five years from a transitional precinct to an established inner-city address, and that repositioning continues to play out in pricing.",
    cards: [
      { title: 'Bowen Hills Specialist', sub: 'Inner Brisbane' },
      { title: 'Apartment Growth Corridor', sub: 'King Street precinct + Cross River Rail' },
    ],
    schools: ['Fortitude Valley State Secondary College', 'Brisbane Central State School'],
    faqs: [
      {
        q: 'What is the median apartment price in Bowen Hills Brisbane?',
        a: 'Bowen Hills apartment pricing varies dramatically with building age, amenity and position. Newer well-managed buildings around the King Street precinct trade at clear premiums to older 1990s and 2000s stock. An appraisal will give you a precise read on where your apartment sits.',
      },
      {
        q: 'How long does it take to sell an apartment in Bowen Hills?',
        a: 'Well-presented Bowen Hills apartments typically sell within 35 to 60 days. Buyer due diligence is significant in apartment markets, and accurate disclosure of body corporate fees, sinking fund balance and any pending special levies makes a meaningful difference to negotiation outcomes.',
      },
      {
        q: 'Is Bowen Hills a good investment suburb?',
        a: 'Bowen Hills has been one of inner Brisbane\'s most active growth precincts over the past decade. Cross River Rail, ongoing King Street development and proximity to RBWH all support medium-term fundamentals. Building selection matters enormously, and not all stock benefits equally.',
      },
      {
        q: 'What types of homes are in Bowen Hills?',
        a: 'Bowen Hills is predominantly apartments and townhouses, with a smaller layer of detached cottages on a few elevated streets. The apartment market is the suburb\'s defining segment and where most transactions occur.',
      },
    ],
  },
  {
    slug: 'highgate-hill',
    name: 'Highgate Hill',
    postcode: '4101',
    region: 'Inner South Brisbane',
    nearby: ['west-end', 'dutton-park', 'south-brisbane', 'annerley'],
    headline: 'Elevated inner-south prestige with city outlooks and large blocks.',
    intro:
      "Highgate Hill is one of Brisbane's most established inner-south prestige suburbs. Its elevated position above West End and South Brisbane, generous blocks and Federation-era housing stock have made it a long-standing favourite for established families and professionals. It offers what many inner-city suburbs cannot: large family homes with city outlooks within 3 kilometres of the GPO.",
    body:
      "Buyers in Highgate Hill are predominantly established families and professionals chasing the Brisbane State High School catchment. The detached family home market is the suburb's strongest segment, and renovated Federation and Queenslander homes on the higher streets consistently lead pricing. Block size matters here more than in surrounding suburbs: larger blocks with views or pool potential carry premiums that smaller character cottages cannot match. The suburb's mix of architecturally significant homes and original-condition properties supports a strong renovation and rebuild market.",
    cards: [
      { title: 'Highgate Hill Specialist', sub: 'Inner South Brisbane' },
      { title: 'Brisbane State High Catchment', sub: 'Family-led prestige market' },
    ],
    schools: ['Dutton Park State School / West End State School', 'Brisbane State High School'],
    faqs: [
      {
        q: 'What is the median house price in Highgate Hill Brisbane?',
        a: 'Highgate Hill\'s median house price is consistently one of the highest in inner-south Brisbane, reflecting block sizes, elevation, view potential and Brisbane State High catchment access. Pricing varies meaningfully street-to-street. An appraisal will give you a precise read on where your home sits.',
      },
      {
        q: 'How long does it take to sell a home in Highgate Hill?',
        a: 'Well-presented Highgate Hill homes typically sell within 30 to 45 days. The buyer profile is established families doing thorough due diligence, and the right preparation, pricing and campaign timing make a measurable difference to outcome.',
      },
      {
        q: 'Is Highgate Hill in the Brisbane State High catchment?',
        a: 'Yes, Highgate Hill sits squarely within the Brisbane State High School catchment, which is one of the strongest sustained demand drivers in inner-south Brisbane. Catchment access supports a permanent premium on family homes here.',
      },
      {
        q: 'What types of homes are in Highgate Hill?',
        a: 'Highgate Hill is dominated by Federation-era homes, traditional Queenslanders and architect-designed contemporary rebuilds. Renovation activity is ongoing on the suburb\'s top streets, and original-condition homes on premium blocks attract strong owner-occupier and developer interest.',
      },
    ],
  },
  {
    slug: 'indooroopilly',
    name: 'Indooroopilly',
    postcode: '4068',
    region: 'Inner West Brisbane',
    nearby: ['toowong', 'auchenflower', 'taringa', 'st-lucia'],
    headline: 'Established western family suburb anchored by the train and the centre.',
    intro:
      "Indooroopilly is one of Brisbane's largest and most established inner-west family suburbs. Its train station, Indooroopilly Shopping Centre, school precincts and bridge access to the southern suburbs make it one of the city's most permanent demand markets. At around 7 kilometres from the CBD, it sits at the natural anchor point between the inner west and the outer-west corridor.",
    body:
      "Buyer profile in Indooroopilly is family-led: established families upgrading from smaller inner-west homes, relocators chasing the Indooroopilly State High catchment, and university families connected to UQ. The market splits clearly between detached family homes on flat or gently sloping streets, character homes on the suburb's older blocks, and a growing apartment market around the centre and the railway corridor. The Indooroopilly State High School catchment is one of the strongest sustained demand drivers in the inner west, and properties within it consistently outperform comparable stock outside the catchment line.",
    cards: [
      { title: 'Indooroopilly Specialist', sub: 'Inner West Brisbane' },
      { title: 'School Catchment Market', sub: 'Indooroopilly State High demand' },
    ],
    schools: ['Indooroopilly State School', 'Indooroopilly State High School'],
    faqs: [
      {
        q: 'What is the median house price in Indooroopilly Brisbane?',
        a: 'Indooroopilly\'s median house price reflects its position as a large, established inner-west family suburb. Pricing varies considerably between renovated character homes, post-war family homes, and apartments around the centre. An appraisal will give you a precise read on where your property sits relative to current sales.',
      },
      {
        q: 'How long does it take to sell a home in Indooroopilly?',
        a: 'Well-presented Indooroopilly family homes typically sell within 25 to 40 days. The Indooroopilly State High catchment supports year-round demand, and accurate pricing combined with the right campaign approach consistently delivers a measurable result.',
      },
      {
        q: 'Is Indooroopilly in the Indooroopilly State High catchment?',
        a: 'Yes, Indooroopilly sits within the Indooroopilly State High School catchment. Indooroopilly State High is one of the most sought-after public secondary catchments in the inner west, and it is a meaningful, ongoing demand driver for the family-home market.',
      },
      {
        q: 'What types of homes are in Indooroopilly?',
        a: 'Indooroopilly\'s housing stock is broad: traditional Queenslanders, post-war family homes, mid-century brick homes, contemporary rebuilds and a sizable apartment market around the centre and railway corridor. The detached family home segment is the most consistently in demand.',
      },
    ],
  },
];

function pageTemplate(s) {
  const nearbyCards = s.nearby.slice(0, 6);
  const body2 = s.body2 ? `\n    <p style="font-family:var(--font-sans); font-size:1rem; font-weight:300; line-height:1.8; color:#4a4540; margin-bottom:1.25rem;">\n      ${s.body2}\n    </p>` : '';

  return `---
import Layout from '../../layouts/Layout.astro';
---

<Layout
  title="Selling in ${s.name} | Real Estate Agent | Daniel Gierach"
  description="Thinking of selling in ${s.name}? ${s.headline} Free appraisal from Daniel Gierach, Ray White Bulimba."
>

<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Real Estate Agent ${s.name} Brisbane",
  "description": "Daniel Gierach is a real estate agent serving ${s.name} and ${s.region}.",
  "url": "https://danielgierach.com/suburbs/${s.slug}",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://danielgierach.com" },
      { "@type": "ListItem", "position": 2, "name": "${s.name}", "item": "https://danielgierach.com/suburbs/${s.slug}" }
    ]
  }
})}</script>
<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "RealEstateAgent"],
  "name": "Daniel Gierach, Ray White The Collective",
  "description": "Real estate agent serving ${s.name} and ${s.region}. ${s.headline}",
  "url": "https://danielgierach.com/suburbs/${s.slug}",
  "telephone": "+61412523821",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "${s.name}",
    "addressRegion": "QLD",
    "postalCode": "${s.postcode}",
    "addressCountry": "AU"
  },
  "areaServed": ${JSON.stringify([{ "@type": "Place", "name": `${s.name} QLD ${s.postcode}` }])},
  "knowsAbout": ${JSON.stringify([`${s.name} real estate`, `${s.region} property values`, `${s.name} home values`])},
  "sameAs": ["https://share.google/WipmgyJnjC5nkhGwx"]
})}</script>

<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${s.faqs.map(f => `    { "@type": "Question", "name": ${JSON.stringify(f.q)}, "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(f.a)} } }`).join(',\n')}
  ]
})}</script>

<!-- HERO -->
<section style="background:#1c1917; color:#f2efe9; padding: 100px 24px 80px;">
  <div style="max-width:800px; margin:0 auto; text-align:center;">
    <p style="font-family:var(--font-sans); font-size:0.75rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#c4912a; margin-bottom:1.25rem;">${s.name}</p>
    <h1 style="font-family:var(--font-serif); font-size:clamp(2.4rem, 5vw, 4rem); font-weight:300; line-height:1.15; margin-bottom:1.5rem; color:#f2efe9;">
      Real estate agent ${s.name}.
    </h1>
    <p style="font-family:var(--font-sans); font-size:1.05rem; font-weight:300; line-height:1.7; color:#c9c4bc; max-width:580px; margin:0 auto 2.5rem;">
      Property sales in ${s.name} and ${s.region}.
    </p>
    <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
      <a href="/listings" class="btn-gold" style="font-family:var(--font-sans); font-size:0.85rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:#c4912a; color:#1c1917; padding:0.85rem 2rem; text-decoration:none; display:inline-block;">View Current Listings</a>
      <a href="/property-worth" class="btn-gold" style="font-family:var(--font-sans); font-size:0.85rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:#c4912a; color:#1c1917; padding:0.85rem 2rem; text-decoration:none; display:inline-block;">What's your property worth?</a>
    </div>
  </div>
</section>

<!-- WHY THIS AREA -->
<section style="background:var(--color-base, #f2efe9); padding:80px 24px;">
  <div style="max-width:800px; margin:0 auto;">
    <p style="font-family:var(--font-sans); font-size:0.75rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#c4912a; margin-bottom:1rem;">Local Expertise</p>
    <h2 style="font-family:var(--font-serif); font-size:clamp(1.8rem, 3.5vw, 2.8rem); font-weight:300; line-height:1.2; color:#1c1917; margin-bottom:1.75rem;">${s.headline}</h2>
    <p style="font-family:var(--font-sans); font-size:1rem; font-weight:300; line-height:1.8; color:#4a4540; margin-bottom:1.25rem;">
      ${s.intro}
    </p>
<!-- APPRAISAL FORM -->
<div style="background:#fff; border-left:4px solid #c4912a; padding:2rem 2rem 1.75rem; margin:2rem 0;">
  <p style="font-family:var(--font-sans); font-size:0.72rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#c4912a; margin-bottom:0.5rem;">Free Appraisal</p>
  <h3 style="font-family:var(--font-serif); font-size:1.4rem; font-weight:300; color:#1c1917; margin-bottom:1.25rem; line-height:1.25;">Find out what your ${s.name} home is worth.</h3>
  <form method="POST" action="https://formspree.io/f/xnjgedwp" style="display:flex; flex-direction:column; gap:0.75rem;">
    <input type="hidden" name="_next" value="https://danielgierach.com/thank-you?from=suburb-appraisal" />
    <input type="hidden" name="_subject" value="Appraisal enquiry - ${s.name}" />
    <input type="hidden" name="_source" value="${s.slug}" />
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;" class="suburb-form-grid">
      <input type="text" name="name" required placeholder="Your name" autocomplete="name"
        style="font-family:var(--font-sans); font-size:0.88rem; padding:0.7rem 0.9rem; border:1px solid rgba(28,25,23,0.18); background:#faf9f7; color:#1c1917; outline:none; width:100%; box-sizing:border-box;" />
      <input type="email" name="email" required placeholder="Email address" autocomplete="email"
        style="font-family:var(--font-sans); font-size:0.88rem; padding:0.7rem 0.9rem; border:1px solid rgba(28,25,23,0.18); background:#faf9f7; color:#1c1917; outline:none; width:100%; box-sizing:border-box;" />
    </div>
    <input type="text" name="property_address" required placeholder="Your ${s.name} address (street + number)"
      style="font-family:var(--font-sans); font-size:0.88rem; padding:0.7rem 0.9rem; border:1px solid rgba(28,25,23,0.18); background:#faf9f7; color:#1c1917; outline:none; width:100%; box-sizing:border-box;" />
    <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
      <button type="submit"
        style="font-family:var(--font-sans); font-size:0.78rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:#c4912a; color:#1c1917; padding:0.75rem 1.75rem; border:none; cursor:pointer; white-space:nowrap;">
        Request my free appraisal
      </button>
      <p style="font-family:var(--font-sans); font-size:0.75rem; font-weight:300; color:#78716c; margin:0; line-height:1.5;">Daniel will be in touch promptly. No pressure.</p>
    </div>
  </form>
</div>
<style>
  @media (max-width: 540px) {
    .suburb-form-grid { grid-template-columns: 1fr !important; }
  }
</style>
<!-- END APPRAISAL FORM -->
    <p style="font-family:var(--font-sans); font-size:1rem; font-weight:300; line-height:1.8; color:#4a4540; margin-bottom:1.25rem;">
      ${s.body}
    </p>${body2}
    <div style="display:flex; gap:1.5rem; flex-wrap:wrap;">
${s.cards.map(c => `      <div style="flex:1; min-width:200px; background:#fff; padding:1.75rem; border-left:3px solid #c4912a;">
        <p style="font-family:var(--font-serif); font-size:1.1rem; font-weight:400; color:#1c1917; margin-bottom:0.4rem;">${c.title}</p>
        <p style="font-family:var(--font-sans); font-size:0.85rem; font-weight:300; color:#6b6560;">${c.sub}</p>
      </div>`).join('\n')}
    </div>
    <p style="font-size:0.82rem;color:#78716c;margin-top:2rem;">Also selling in: ${nearbyCards.map(slug => `<a href="/suburbs/${slug}" style="color:#c4912a;">${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</a>`).join(', ')}.</p>
  </div>
</section>

<!-- FAQ -->
<section style="background:var(--color-base, #f2efe9); padding:80px 24px;">
  <div style="max-width:800px; margin:0 auto;">
    <p style="font-family:var(--font-sans); font-size:0.75rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#c4912a; margin-bottom:1rem;">FAQ</p>
    <h2 style="font-family:var(--font-serif); font-size:clamp(1.8rem, 3.5vw, 2.8rem); font-weight:300; line-height:1.2; color:#1c1917; margin-bottom:2.5rem;">Common questions about ${s.name}.</h2>
    <div style="display:flex; flex-direction:column;">
${s.faqs.map((f, i) => `      <details style="${i < s.faqs.length - 1 ? 'border-bottom:1px solid rgba(72,72,72,0.15); ' : ''}padding:1.25rem 0;">
        <summary style="font-family:var(--font-serif); font-size:1.05rem; cursor:pointer; color:#1c1917; list-style:none; display:flex; justify-content:space-between; align-items:center; gap:1rem;">
          ${f.q}
          <span style="color:#c4912a; font-size:1.4rem; flex-shrink:0;">+</span>
        </summary>
        <p style="font-family:var(--font-sans); font-size:0.9rem; line-height:1.75; color:#4a4540; margin-top:0.75rem; padding-right:2rem;">${f.a}</p>
      </details>`).join('\n')}
    </div>
  </div>
</section>

<!-- HOW DANIEL HELPS YOU SELL -->
<section style="background:var(--color-base, #f2efe9); padding:80px 24px;">
  <div style="max-width:800px; margin:0 auto;">
    <p style="font-family:var(--font-sans); font-size:0.75rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#c4912a; margin-bottom:1rem;">Selling in ${s.name}</p>
    <h2 style="font-family:var(--font-serif); font-size:clamp(1.8rem, 3.5vw, 2.8rem); font-weight:300; line-height:1.2; color:#1c1917; margin-bottom:3rem;">What selling with Daniel looks like.</h2>
    <div style="display:flex; flex-direction:column; gap:2.5rem; margin-bottom:3rem;">
      <div style="display:flex; gap:2rem; align-items:flex-start;">
        <span style="font-family:var(--font-serif); font-size:2.5rem; font-weight:300; color:#c4912a; line-height:1; flex-shrink:0; width:2.5rem;">1</span>
        <div>
          <p style="font-family:var(--font-serif); font-size:1.2rem; font-style:italic; font-weight:400; color:#1c1917; margin-bottom:0.5rem;">Free appraisal</p>
          <p style="font-family:var(--font-sans); font-size:0.9rem; font-weight:300; line-height:1.7; color:#6b6560;">Daniel will walk through what your property is worth and what buyers are currently paying in your street.</p>
        </div>
      </div>
      <div style="display:flex; gap:2rem; align-items:flex-start;">
        <span style="font-family:var(--font-serif); font-size:2.5rem; font-weight:300; color:#c4912a; line-height:1; flex-shrink:0; width:2.5rem;">2</span>
        <div>
          <p style="font-family:var(--font-serif); font-size:1.2rem; font-style:italic; font-weight:400; color:#1c1917; margin-bottom:0.5rem;">Tailored campaign</p>
          <p style="font-family:var(--font-sans); font-size:0.9rem; font-weight:300; line-height:1.7; color:#6b6560;">Every property is different. The strategy is built around your home, your timing and the buyer profile in your suburb.</p>
        </div>
      </div>
      <div style="display:flex; gap:2rem; align-items:flex-start;">
        <span style="font-family:var(--font-serif); font-size:2.5rem; font-weight:300; color:#c4912a; line-height:1; flex-shrink:0; width:2.5rem;">3</span>
        <div>
          <p style="font-family:var(--font-serif); font-size:1.2rem; font-style:italic; font-weight:400; color:#1c1917; margin-bottom:0.5rem;">Managed negotiation</p>
          <p style="font-family:var(--font-sans); font-size:0.9rem; font-weight:300; line-height:1.7; color:#6b6560;">Every offer is managed with commercial discipline to protect the final result.</p>
        </div>
      </div>
    </div>
    <a href="/walkthrough" style="font-family:var(--font-sans); font-size:0.85rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:#c4912a; color:#1c1917; padding:0.85rem 2rem; text-decoration:none; display:inline-block;">Request a free appraisal</a>
  </div>
</section>

<!-- CTA STRIP -->
<section style="background:#1c1917; color:#f2efe9; padding:80px 24px; text-align:center;">
  <div style="max-width:700px; margin:0 auto;">
    <h2 style="font-family:var(--font-serif); font-size:clamp(1.8rem, 3.5vw, 2.8rem); font-weight:300; line-height:1.2; color:#f2efe9; margin-bottom:1.25rem;">Thinking of selling in ${s.name}?</h2>
    <p style="font-family:var(--font-sans); font-size:1rem; font-weight:300; line-height:1.75; color:#c9c4bc; margin-bottom:2rem;">Call Daniel directly for a no-obligation conversation about your property and what it could achieve in today's market.</p>
    <p style="margin-bottom:2.5rem;">
      <a href="tel:+61412523821" style="font-family:var(--font-serif); font-size:2rem; font-weight:300; color:#f5d07a; text-decoration:none; letter-spacing:0.02em;">0412 523 821</a>
    </p>
    <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
      <a href="/contact" style="font-family:var(--font-sans); font-size:0.85rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:transparent; color:#f2efe9; padding:0.85rem 2rem; text-decoration:none; display:inline-block; border:1px solid #c4912a;">Send a message</a>
      <a href="/walkthrough" style="font-family:var(--font-sans); font-size:0.85rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:#c4912a; color:#1c1917; padding:0.85rem 2rem; text-decoration:none; display:inline-block;">What's your property worth?</a>
    </div>
  </div>
</section>

</Layout>
`;
}

const targetDir = path.join(ROOT, 'src/pages/suburbs');
let written = 0;
for (const s of SUBURBS) {
  const filename = path.join(targetDir, `${s.slug}.astro`);
  if (fs.existsSync(filename)) {
    console.log(`  · skipping ${s.slug} (already exists)`);
    continue;
  }
  fs.writeFileSync(filename, pageTemplate(s));
  console.log(`  ✓ wrote ${s.slug}.astro`);
  written++;
}
console.log(`\nDone. ${written} new pages written to ${targetDir}`);
