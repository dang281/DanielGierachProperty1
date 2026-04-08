import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/pages/suburbs');

const suburbs = [
  {
    slug: 'west-end',
    name: 'West End',
    postcode: '4101',
    metaDesc: 'Daniel Gierach, real estate agent in West End Brisbane. Inner-south suburb with café culture, riverside living and strong buyer demand. Ray White Bulimba. Call 0412 523 821.',
    h2: 'Inner-south living with exceptional lifestyle appeal.',
    intro: 'West End is one of Brisbane\'s most vibrant inner-south suburbs, known for its multicultural café strip on Boundary Street, riverside parklands and proximity to South Bank and the CBD. It draws a diverse mix of buyers seeking inner-city lifestyle with genuine character.',
    body: 'West End attracts buyers who value walkability, independent retail and the creative energy of an established inner-city precinct. Montague Road and Boundary Street frame the suburb\'s identity, and the Brisbane River along the northern edge provides parkland, cycling paths and water views for residents. Properties range from heritage Queenslanders and character terraces to contemporary apartments and townhouses, offering a range of entry points for buyers. Demand is consistently supported by the suburb\'s proximity to South Bank cultural precinct, the University of Queensland bus corridor and the CBD, making it a top choice for professionals, downsizers and young families alike.',
    badge1: 'Inner South Specialist', badge1sub: 'Riverside lifestyle appeal',
    badge2: 'Café Strip Living', badge2sub: 'Boundary Street precinct',
    nearby: [{ name: 'Dutton Park', href: '/suburbs/dutton-park' }, { name: 'Kangaroo Point', href: '/suburbs/kangaroo-point' }, { name: 'Woolloongabba', href: '/suburbs/woolloongabba' }],
    gridSuburbs: [
      { name: 'West End', desc: 'Multicultural café culture and riverside appeal' },
      { name: 'South Brisbane', desc: 'Cultural precinct and CBD fringe living' },
      { name: 'Dutton Park', desc: 'Quiet riverside suburb with character homes' },
      { name: 'Kangaroo Point', desc: 'Cliff apartments and city views' },
      { name: 'Woolloongabba', desc: 'Transforming inner south, CBD proximity' },
      { name: 'Annerley', desc: 'Affordable inner south with character appeal' },
    ],
    medianPrice: '$1.8 million to $2 million',
    medianContext: 'West End\'s strong lifestyle credentials, walkable CBD proximity and limited housing supply underpin consistent demand from professionals and families seeking inner-city character living.',
    days: '20 to 35',
    daysContext: 'The suburb\'s diverse buyer pool — professionals, downsizers and investors — creates active competition at sale.',
    q3: 'What makes West End attractive to buyers?',
    a3: 'West End offers a rare combination of walkable inner-city lifestyle, independent café culture on Boundary Street, direct access to South Bank and the river, and a strong sense of community identity. Buyers are typically professionals and couples seeking inner-city proximity with more character than a CBD apartment provides.',
    q4: 'Is West End a good suburb to sell in?',
    a4: 'West End\'s proximity to the CBD, its established lifestyle reputation and limited land supply make it a strong selling environment. The suburb\'s appeal to both owner-occupiers and investors provides a broad buyer pool that supports competitive sale conditions.',
    areaServed: ['West End QLD 4101', 'Dutton Park QLD', 'Kangaroo Point QLD', 'South Brisbane QLD', 'Woolloongabba QLD'],
    knowsAbout: ['West End real estate', 'Brisbane inner south property', 'Boundary Street precinct homes', 'West End house prices'],
  },
  {
    slug: 'hamilton',
    name: 'Hamilton',
    postcode: '4007',
    metaDesc: 'Daniel Gierach, real estate agent in Hamilton Brisbane. Prestige riverfront suburb with exceptional lifestyle appeal and blue-chip buyer demand. Ray White Bulimba. Call 0412 523 821.',
    h2: 'Prestige riverfront living at the top of the market.',
    intro: 'Hamilton is one of Brisbane\'s most prestigious suburbs, known for its grand character homes, riverfront position and blue-chip buyer profile. Located approximately 5km from the CBD on the north bank of the Brisbane River, it consistently ranks among Brisbane\'s top addresses.',
    body: 'Hamilton\'s appeal is anchored by its elevated ridge streets with river and city views, the Portside Wharf precinct with fine dining and retail, and the suburb\'s historic character homes ranging from Federation bungalows to grand inter-war residences. The suburb attracts buyers at the top of the market — executives, downsizers from the northside prestige corridor and interstate migrants seeking a premium lifestyle address. Racecourse Road provides the suburb\'s retail and dining spine, and the Brisbane Riverwalk connection along the foreshore adds a significant lifestyle amenity. Hamilton has consistently outperformed broader Brisbane market growth due to its scarcity of stock and depth of prestige buyer demand.',
    badge1: 'Prestige River Suburb', badge1sub: 'Blue-chip buyer demand',
    badge2: 'Character Homes', badge2sub: 'Federation and inter-war prestige',
    nearby: [{ name: 'Ascot', href: '/suburbs/ascot' }, { name: 'Bulimba', href: '/suburbs/bulimba' }, { name: 'New Farm', href: '/suburbs/new-farm' }],
    gridSuburbs: [
      { name: 'Hamilton', desc: 'Prestige riverfront with grand character homes' },
      { name: 'Ascot', desc: 'Blue-chip northside racing precinct' },
      { name: 'Bulimba', desc: 'Riverside village with Oxford Street lifestyle' },
      { name: 'New Farm', desc: 'Heritage inner-city living and park precinct' },
      { name: 'Teneriffe', desc: 'Prestige woolstore conversions and river views' },
      { name: 'Hawthorne', desc: 'Premium riverside with Riding Road village' },
    ],
    medianPrice: '$2.5 million to $3 million',
    medianContext: 'Hamilton\'s combination of riverfront position, prestige character homes and proximity to the Portside Wharf precinct places it consistently among Brisbane\'s highest-value suburb addresses.',
    days: '20 to 40',
    daysContext: 'The prestige buyer pool in Hamilton is more selective, requiring well-targeted campaigns. Properties positioned correctly attract multiple qualified buyers.',
    q3: 'What types of properties are in Hamilton?',
    a3: 'Hamilton features a range of prestige residential stock including Federation bungalows, inter-war residences, post-war homes on large blocks and contemporary luxury builds. The elevated ridge streets offer city and river views, while flat blocks closer to the river foreshore provide direct access to the Riverwalk. Most homes sit on generous allotments of 600 to 900 square metres or larger.',
    q4: 'Is Hamilton a good suburb for property investment?',
    a4: 'Hamilton is a strong long-term hold due to its scarcity of stock, blue-chip buyer profile and consistent demand from the top end of the market. Capital growth has outperformed Brisbane\'s broader market over most measured periods. The Portside Wharf precinct and ongoing riverfront amenity investment continue to underpin the suburb\'s premium positioning.',
    areaServed: ['Hamilton QLD 4007', 'Ascot QLD', 'Bulimba QLD', 'New Farm QLD', 'Teneriffe QLD'],
    knowsAbout: ['Hamilton real estate', 'prestige Brisbane riverfront homes', 'Hamilton house prices', 'Brisbane northside prestige property'],
  },
  {
    slug: 'stones-corner',
    name: 'Stones Corner',
    postcode: '4120',
    metaDesc: 'Daniel Gierach, real estate agent in Stones Corner Brisbane. Inner-south suburb with emerging café culture and strong buyer demand. Ray White Bulimba. Call 0412 523 821.',
    h2: 'Emerging inner-south suburb with improving amenity.',
    intro: 'Stones Corner sits at the junction of Old Cleveland Road and Logan Road in Brisbane\'s inner south, approximately 4km from the CBD. The suburb\'s improving café and retail strip, character housing stock and proximity to the Gabba precinct have driven increasing buyer interest over recent years.',
    body: 'Stones Corner is part of Brisbane\'s broader inner-south renewal story. Logan Road provides the suburb\'s commercial spine, with a growing number of cafés, specialty retailers and hospitality businesses establishing themselves in the precinct. The suburb\'s housing mix includes Queenslanders, post-war homes and newer townhouses, offering good entry-level and mid-market options for buyers priced out of Coorparoo or Greenslopes. Proximity to the Princess Alexandra Hospital precinct, the Gabba and South East Busway access makes Stones Corner an increasingly practical choice for professionals and families. Buyers who move here tend to appreciate the value relative to immediately adjacent suburbs and the trajectory of amenity growth.',
    badge1: 'Inner South Specialist', badge1sub: 'Improving amenity and value',
    badge2: 'Logan Road Precinct', badge2sub: 'Emerging café and retail strip',
    nearby: [{ name: 'Coorparoo', href: '/suburbs/coorparoo' }, { name: 'Greenslopes', href: '/suburbs/greenslopes' }, { name: 'Woolloongabba', href: '/suburbs/woolloongabba' }],
    gridSuburbs: [
      { name: 'Stones Corner', desc: 'Emerging inner south, improving amenity' },
      { name: 'Coorparoo', desc: 'Established inner south with character homes' },
      { name: 'Greenslopes', desc: 'Leafy inner south with family appeal' },
      { name: 'Woolloongabba', desc: 'Transforming inner south, CBD proximity' },
      { name: 'Annerley', desc: 'Affordable inner south character homes' },
      { name: 'Holland Park', desc: 'Established south Brisbane family suburb' },
    ],
    medianPrice: '$1.3 million to $1.4 million',
    medianContext: 'Stones Corner offers relative value within the inner-south corridor. Its improving amenity and CBD proximity have supported consistent price growth, attracting buyers seeking affordable entry into the inner south.',
    days: '20 to 35',
    daysContext: 'The suburb\'s improving profile and competitive pricing relative to Coorparoo and Greenslopes attract an active buyer pool, supporting reasonable sale timeframes.',
    q3: 'What is the lifestyle like in Stones Corner?',
    a3: 'Stones Corner has a relaxed inner-south lifestyle anchored by Logan Road\'s growing café and retail precinct. It is well-serviced by public transport via the South East Busway and offers easy access to the Gabba, Princess Alexandra Hospital and the CBD. The suburb appeals to young professionals, first-home buyers and investors who value proximity to employment nodes and improving amenity.',
    q4: 'Is Stones Corner a good suburb to buy in?',
    a4: 'Stones Corner represents good value relative to immediately surrounding suburbs like Coorparoo and Greenslopes. Its improving amenity, strong transport links and proximity to the growing Gabba precinct and Princess Alexandra Hospital employment hub make it an increasingly attractive buying option for those priced out of the established inner-south corridor.',
    areaServed: ['Stones Corner QLD 4120', 'Coorparoo QLD', 'Greenslopes QLD', 'Woolloongabba QLD', 'Annerley QLD'],
    knowsAbout: ['Stones Corner real estate', 'Brisbane inner south property', 'Stones Corner house prices', 'Logan Road precinct real estate'],
  },
  {
    slug: 'annerley',
    name: 'Annerley',
    postcode: '4103',
    metaDesc: 'Daniel Gierach, real estate agent in Annerley Brisbane. Inner-south suburb with character homes and strong value relative to adjacent suburbs. Ray White Bulimba. Call 0412 523 821.',
    h2: 'Character inner-south suburb with strong relative value.',
    intro: 'Annerley sits approximately 4km from the Brisbane CBD in the inner south, bordered by Ipswich Road and offering good access to the South East Busway and Princess Alexandra Hospital precinct. Its Queenslander housing stock and competitive pricing relative to Coorparoo attract a consistent buyer pool.',
    body: 'Annerley\'s housing mix of original Queenslanders, post-war homes and newer townhouses provides accessible entry points for buyers who have been priced out of Coorparoo or Greenslopes. Ipswich Road forms the suburb\'s western boundary and provides direct bus access to the CBD, while the suburb\'s quieter back streets offer a more residential character. The Princess Alexandra Hospital at the suburb\'s edge is a significant employment driver, consistently attracting medical professionals and hospital workers to the surrounding precinct as renters and buyers. Buyers are typically first-home buyers, young families and investors drawn to the suburb\'s value relative to adjacent addresses and its improving amenity along the Ipswich Road corridor.',
    badge1: 'Inner South Specialist', badge1sub: 'Good value inner-south entry point',
    badge2: 'Character Housing Stock', badge2sub: 'Queenslanders and post-war homes',
    nearby: [{ name: 'Coorparoo', href: '/suburbs/coorparoo' }, { name: 'Dutton Park', href: '/suburbs/dutton-park' }, { name: 'Greenslopes', href: '/suburbs/greenslopes' }],
    gridSuburbs: [
      { name: 'Annerley', desc: 'Character inner south with good value' },
      { name: 'Coorparoo', desc: 'Established inner south character homes' },
      { name: 'Dutton Park', desc: 'Quiet riverside suburb with character appeal' },
      { name: 'Greenslopes', desc: 'Leafy inner south family suburb' },
      { name: 'Stones Corner', desc: 'Emerging inner south, improving amenity' },
      { name: 'Woolloongabba', desc: 'Transforming inner south, CBD proximity' },
    ],
    medianPrice: '$1.2 million to $1.3 million',
    medianContext: 'Annerley offers relative affordability within the inner-south corridor, attracting buyers seeking character homes with good transport and proximity to the PA Hospital precinct and CBD.',
    days: '20 to 35',
    daysContext: 'First-home buyers and investors seeking inner-south value provide a consistent buyer pool, and well-presented properties attract quick interest.',
    q3: 'What types of buyers look in Annerley?',
    a3: 'Annerley attracts first-home buyers seeking accessible inner-south entry points, young families wanting proximity to the CBD and PA Hospital, and investors targeting strong rental yields from the substantial hospital workforce in the area. The suburb also draws buyers who have missed out in Coorparoo or Greenslopes and are redirecting their search for relative value.',
    q4: 'Is Annerley a good suburb for investment?',
    a4: 'Annerley offers a strong rental market underpinned by the Princess Alexandra Hospital workforce and its proximity to the University of Queensland via busway. Gross rental yields are competitive within the inner south, and consistent demand from hospital workers and students supports low vacancy rates. The suburb\'s improving amenity profile and relative value add to its investment case.',
    areaServed: ['Annerley QLD 4103', 'Coorparoo QLD', 'Dutton Park QLD', 'Greenslopes QLD', 'Stones Corner QLD'],
    knowsAbout: ['Annerley real estate', 'Brisbane inner south property', 'Annerley house prices', 'character homes Annerley'],
  },
  {
    slug: 'dutton-park',
    name: 'Dutton Park',
    postcode: '4102',
    metaDesc: 'Daniel Gierach, real estate agent in Dutton Park Brisbane. Quiet inner-south suburb with riverside parkland and character housing. Ray White Bulimba. Call 0412 523 821.',
    h2: 'Quiet riverside character suburb close to the CBD.',
    intro: 'Dutton Park is a small, tightly held inner-south Brisbane suburb approximately 3km from the CBD, bounded by the Brisbane River to the north and the Princess Alexandra Hospital precinct to the south. Its character housing stock and riverside parklands attract buyers seeking a quieter inner-city lifestyle.',
    body: 'Dutton Park has a distinctly village-like character uncommon in suburbs this close to the Brisbane CBD. The suburb\'s riverside parks along the Brisbane River foreshore provide exceptional green space, and the Dutton Park Ferry Terminal offers a direct connection to South Bank and the CBD by CityCat. Housing stock is predominantly original Queenslanders and post-war homes, with limited new development maintaining the suburb\'s established character. Proximity to the Princess Alexandra Hospital, Mater Hospital and the University of Queensland via the Eleanor Schonell Bridge makes Dutton Park a consistently sought-after address for medical and academic professionals. Limited listing volumes mean properties attract strong interest when they come to market.',
    badge1: 'Inner South Riverside', badge1sub: 'Quiet and tightly held',
    badge2: 'Ferry Access to CBD', badge2sub: 'CityCat from Dutton Park terminal',
    nearby: [{ name: 'Annerley', href: '/suburbs/annerley' }, { name: 'West End', href: '/suburbs/west-end' }, { name: 'Woolloongabba', href: '/suburbs/woolloongabba' }],
    gridSuburbs: [
      { name: 'Dutton Park', desc: 'Quiet riverside suburb with character homes' },
      { name: 'West End', desc: 'Inner south café culture and riverside living' },
      { name: 'Annerley', desc: 'Character inner south with relative value' },
      { name: 'Woolloongabba', desc: 'Transforming inner south, CBD proximity' },
      { name: 'Kangaroo Point', desc: 'Cliff apartments and city river views' },
      { name: 'South Brisbane', desc: 'Cultural precinct and CBD fringe' },
    ],
    medianPrice: '$1.4 million to $1.5 million',
    medianContext: 'Dutton Park\'s extremely limited housing stock, riverside setting and proximity to the CBD and major hospital and university precincts support strong values relative to its size.',
    days: '20 to 35',
    daysContext: 'Low listing volumes in Dutton Park mean well-presented properties attract significant buyer interest quickly, often resulting in competitive auction or off-market outcomes.',
    q3: 'What makes Dutton Park appealing to buyers?',
    a3: 'Dutton Park offers a rare combination of riverside parkland, ferry access to South Bank and the CBD, walkable proximity to the Princess Alexandra and Mater Hospitals, and a quiet residential character at odds with its inner-city location. The suburb is particularly sought-after by medical and academic professionals working in the adjacent hospital and university precincts.',
    q4: 'How often do properties come to market in Dutton Park?',
    a4: 'Dutton Park is a very small suburb with limited housing stock, meaning properties come to market infrequently. This scarcity is a structural driver of price performance — buyers who want to be in this suburb have few options and typically compete strongly when something does come up. Working with an agent who tracks off-market opportunities is particularly valuable here.',
    areaServed: ['Dutton Park QLD 4102', 'West End QLD', 'Annerley QLD', 'Woolloongabba QLD', 'South Brisbane QLD'],
    knowsAbout: ['Dutton Park real estate', 'Brisbane inner south riverside homes', 'Dutton Park house prices', 'character homes inner Brisbane'],
  },
  {
    slug: 'ascot',
    name: 'Ascot',
    postcode: '4007',
    metaDesc: 'Daniel Gierach, real estate agent in Ascot Brisbane. Prestigious northside suburb with grand homes and strong blue-chip buyer demand. Ray White Bulimba. Call 0412 523 821.',
    h2: 'One of Brisbane\'s most prestigious addresses.',
    intro: 'Ascot is among Brisbane\'s most prestigious suburbs, known for its grand character homes, the Eagle Farm and Doomben racecourses, and its position in the city\'s established northside prestige corridor. Located approximately 7km from the CBD, it attracts a blue-chip buyer profile seeking a premium lifestyle address.',
    body: 'Ascot\'s character is defined by its wide, tree-lined streets and the concentration of some of Brisbane\'s finest residences — from grand Federation and Queenslander homes to contemporary prestige builds on large allotments. Racecourse Road provides an upmarket retail and dining precinct that serves as the suburb\'s social centre. The suburb\'s northside positioning, proximity to Eagle Farm and the Hamilton area, and its strong school catchments including St Margaret\'s and Clayfield College underpin its consistent appeal to Brisbane\'s most discerning buyers. Ascot has historically been a top performer in Brisbane\'s prestige market, with limited stock and strong emotional buyer appeal contributing to resilient values across market cycles.',
    badge1: 'Prestige Northside Suburb', badge1sub: 'Blue-chip buyer profile',
    badge2: 'Grand Character Homes', badge2sub: 'Racecourse Road lifestyle precinct',
    nearby: [{ name: 'Hamilton', href: '/suburbs/hamilton' }, { name: 'New Farm', href: '/suburbs/new-farm' }, { name: 'Teneriffe', href: '/suburbs/teneriffe' }],
    gridSuburbs: [
      { name: 'Ascot', desc: 'Prestige northside with grand character homes' },
      { name: 'Hamilton', desc: 'Prestigious riverfront and Portside precinct' },
      { name: 'New Farm', desc: 'Heritage inner-city living and park precinct' },
      { name: 'Teneriffe', desc: 'Prestige woolstore conversions and river views' },
      { name: 'Bulimba', desc: 'Riverside village with Oxford Street lifestyle' },
      { name: 'Hawthorne', desc: 'Premium riverside with Riding Road village' },
    ],
    medianPrice: '$2.5 million to $3 million',
    medianContext: 'Ascot consistently ranks among Brisbane\'s top performing prestige suburbs. Grand homes on large allotments and the suburb\'s established blue-chip reputation underpin strong and resilient values at the top of the market.',
    days: '25 to 45',
    daysContext: 'Prestige properties in Ascot attract a selective buyer pool. Well-positioned and well-presented homes generate competitive campaigns, though the time on market can be longer than the broader Brisbane median.',
    q3: 'What types of properties are in Ascot?',
    a3: 'Ascot features some of Brisbane\'s most impressive residential real estate, including grand Federation and Queenslander homes, inter-war bungalows, post-war residences and contemporary prestige builds. Allotment sizes are typically generous, with many properties on 600 to 1,200 square metres or larger. Racecourse Road provides the suburb\'s retail and café precinct, and the racecourses add to its distinctive character.',
    q4: 'Is Ascot a good suburb for long-term property investment?',
    a4: 'Ascot has consistently demonstrated strong long-term capital growth due to its scarcity of stock, blue-chip buyer profile and position within Brisbane\'s established northside prestige corridor. Its appeal to interstate and international buyers, strong school catchments and lifestyle credentials make it a resilient performer across market cycles.',
    areaServed: ['Ascot QLD 4007', 'Hamilton QLD', 'New Farm QLD', 'Teneriffe QLD', 'Clayfield QLD'],
    knowsAbout: ['Ascot real estate', 'prestige Brisbane northside homes', 'Ascot house prices', 'grand character homes Brisbane'],
  },
];

function generatePage(s) {
  const WebPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Real Estate Agent ${s.name} Brisbane`,
    description: `Daniel Gierach is a specialist real estate agent in ${s.name} Brisbane, serving the inner east and south.`,
    url: `https://www.danielgierach.com/suburbs/${s.slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.danielgierach.com' },
        { '@type': 'ListItem', position: 2, name: s.name, item: `https://www.danielgierach.com/suburbs/${s.slug}` },
      ],
    },
  };

  const LocalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'RealEstateAgent'],
    name: 'Daniel Gierach — Ray White The Collective',
    description: `Specialist real estate agent in ${s.name} and Brisbane's inner east and south. Selling property in ${s.name}, ${s.areaServed.slice(1, 4).map(a => a.split(' QLD')[0]).join(', ')} and surrounding suburbs.`,
    url: `https://www.danielgierach.com/suburbs/${s.slug}`,
    telephone: '+61412523821',
    address: {
      '@type': 'PostalAddress',
      addressLocality: s.name,
      addressRegion: 'QLD',
      postalCode: s.postcode,
      addressCountry: 'AU',
    },
    areaServed: s.areaServed.map(a => ({ '@type': 'Place', name: a })),
    knowsAbout: s.knowsAbout,
    sameAs: ['https://share.google/WipmgyJnjC5nkhGwx'],
  };

  const FAQSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Who is the best real estate agent in ${s.name}?`,
        acceptedAnswer: { '@type': 'Answer', text: `Daniel Gierach of Ray White The Collective is an active agent across Brisbane's inner east and south, including ${s.name}. He brings local market knowledge, a targeted buyer database and a proven track record of results across the inner south and east corridor. Call 0412 523 821 for a no-obligation appraisal.` },
      },
      {
        '@type': 'Question',
        name: `What is the median house price in ${s.name}?`,
        acceptedAnswer: { '@type': 'Answer', text: `${s.name}'s median house price is approximately ${s.medianPrice} as of early 2026. ${s.medianContext}` },
      },
      {
        '@type': 'Question',
        name: s.q3,
        acceptedAnswer: { '@type': 'Answer', text: s.a3 },
      },
      {
        '@type': 'Question',
        name: s.q4,
        acceptedAnswer: { '@type': 'Answer', text: s.a4 },
      },
    ],
  };

  const nearbyLinks = s.nearby.map(n => `<a href="${n.href}" style="color:#c4912a;">${n.name}</a>`).join(', ');
  const gridItems = s.gridSuburbs.map(g => `
      <div style="background:var(--color-base, #f2efe9); padding:1.75rem;">
        <p style="font-family:var(--font-serif); font-size:1.15rem; font-weight:400; color:#1c1917; margin-bottom:0.5rem;">${g.name}</p>
        <p style="font-family:var(--font-sans); font-size:0.85rem; font-weight:300; color:#6b6560; line-height:1.6;">${g.desc}</p>
      </div>`).join('');

  return `---
import Layout from '../../layouts/Layout.astro';
---

<Layout
  title="Real Estate Agent ${s.name} Brisbane | Daniel Gierach"
  description="${s.metaDesc}"
>

<script type="application/ld+json">{JSON.stringify(${JSON.stringify(WebPageSchema, null, 2)})}</script>
<script type="application/ld+json">{JSON.stringify(${JSON.stringify(LocalBusinessSchema, null, 2)})}</script>
<script type="application/ld+json">{JSON.stringify(${JSON.stringify(FAQSchema, null, 2)})}</script>

<!-- ═══════════════════════════════════════════════
     SECTION 1: HERO
════════════════════════════════════════════════ -->
<section style="background:#1c1917; color:#f2efe9; padding: 100px 24px 80px;">
  <div style="max-width:800px; margin:0 auto; text-align:center;">
    <p style="font-family:var(--font-sans); font-size:0.75rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#c4912a; margin-bottom:1.25rem;">${s.name}</p>
    <h1 style="font-family:var(--font-serif); font-size:clamp(2.4rem, 5vw, 4rem); font-weight:300; line-height:1.15; margin-bottom:1.5rem; color:#f2efe9;">
      Real Estate Agent<br/><em style="color:#f5d07a;">${s.name}.</em>
    </h1>
    <p style="font-family:var(--font-sans); font-size:1.05rem; font-weight:300; line-height:1.7; color:#c9c4bc; max-width:580px; margin:0 auto 2.5rem;">
      Specialist property sales in ${s.name} and Brisbane's inner east and south.
    </p>
    <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
      <a href="/listings" class="btn-gold" style="font-family:var(--font-sans); font-size:0.85rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:#c4912a; color:#1c1917; padding:0.85rem 2rem; text-decoration:none; display:inline-block;">View Current Listings</a>
      <a href="/property-worth" class="btn-gold" style="font-family:var(--font-sans); font-size:0.85rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:#c4912a; color:#1c1917; padding:0.85rem 2rem; text-decoration:none; display:inline-block;">What's Your Property Worth?</a>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════
     SECTION 2: WHY THIS AREA
════════════════════════════════════════════════ -->
<section style="background:var(--color-base, #f2efe9); padding:80px 24px;">
  <div style="max-width:800px; margin:0 auto;">
    <p style="font-family:var(--font-sans); font-size:0.75rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#c4912a; margin-bottom:1rem;">Local Expertise</p>
    <h2 style="font-family:var(--font-serif); font-size:clamp(1.8rem, 3.5vw, 2.8rem); font-weight:300; line-height:1.2; color:#1c1917; margin-bottom:1.75rem;">${s.h2}</h2>
    <p style="font-family:var(--font-sans); font-size:1rem; font-weight:300; line-height:1.8; color:#4a4540; margin-bottom:1.25rem;">
      ${s.intro}
    </p>
    <p style="font-family:var(--font-sans); font-size:1rem; font-weight:300; line-height:1.8; color:#4a4540; margin-bottom:1.25rem;">
      I understand the buyer profile active in ${s.name} and what drives competition at sale. I build campaigns that attract the right buyers and generate genuine results for my clients.
    </p>
    <p style="font-family:var(--font-sans); font-size:1rem; font-weight:300; line-height:1.8; color:#4a4540; margin-bottom:1.25rem;">
      ${s.body}
    </p>
    <div style="display:flex; gap:1.5rem; flex-wrap:wrap;">
      <div style="flex:1; min-width:200px; background:#fff; padding:1.75rem; border-left:3px solid #c4912a;">
        <p style="font-family:var(--font-serif); font-size:1.1rem; font-weight:400; color:#1c1917; margin-bottom:0.4rem;">${s.badge1}</p>
        <p style="font-family:var(--font-sans); font-size:0.85rem; font-weight:300; color:#6b6560;">${s.badge1sub}</p>
      </div>
      <div style="flex:1; min-width:200px; background:#fff; padding:1.75rem; border-left:3px solid #c4912a;">
        <p style="font-family:var(--font-serif); font-size:1.1rem; font-weight:400; color:#1c1917; margin-bottom:0.4rem;">${s.badge2}</p>
        <p style="font-family:var(--font-sans); font-size:0.85rem; font-weight:300; color:#6b6560;">${s.badge2sub}</p>
      </div>
    </div>
    <p style="font-size:0.82rem;color:#78716c;margin-top:2rem;">Also selling in: ${nearbyLinks}.</p>
  </div>
</section>

<!-- ═══════════════════════════════════════════════
     SECTION: FAQ
════════════════════════════════════════════════ -->
<section style="background:var(--color-base, #f2efe9); padding:80px 24px;">
  <div style="max-width:800px; margin:0 auto;">
    <p style="font-family:var(--font-sans); font-size:0.75rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#c4912a; margin-bottom:1rem;">FAQ</p>
    <h2 style="font-family:var(--font-serif); font-size:clamp(1.8rem, 3.5vw, 2.8rem); font-weight:300; line-height:1.2; color:#1c1917; margin-bottom:2.5rem;">Common questions about ${s.name}.</h2>
    <div style="display:flex; flex-direction:column;">

      <details style="border-bottom:1px solid rgba(72,72,72,0.15); padding:1.25rem 0;">
        <summary style="font-family:var(--font-serif); font-size:1.05rem; cursor:pointer; color:#1c1917; list-style:none; display:flex; justify-content:space-between; align-items:center; gap:1rem;">
          Who is the best real estate agent in ${s.name}?
          <span style="color:#c4912a; font-size:1.4rem; flex-shrink:0;">+</span>
        </summary>
        <p style="font-family:var(--font-sans); font-size:0.9rem; line-height:1.75; color:#4a4540; margin-top:0.75rem; padding-right:2rem;">Daniel Gierach of Ray White The Collective is an active agent across Brisbane's inner east and south, including ${s.name}. He brings local market knowledge, a targeted buyer database and a proven track record of results. Call 0412 523 821 for a no-obligation appraisal.</p>
      </details>

      <details style="border-bottom:1px solid rgba(72,72,72,0.15); padding:1.25rem 0;">
        <summary style="font-family:var(--font-serif); font-size:1.05rem; cursor:pointer; color:#1c1917; list-style:none; display:flex; justify-content:space-between; align-items:center; gap:1rem;">
          What is the median house price in ${s.name}?
          <span style="color:#c4912a; font-size:1.4rem; flex-shrink:0;">+</span>
        </summary>
        <p style="font-family:var(--font-sans); font-size:0.9rem; line-height:1.75; color:#4a4540; margin-top:0.75rem; padding-right:2rem;">${s.name}'s median house price is approximately ${s.medianPrice} as of early 2026. ${s.medianContext}</p>
      </details>

      <details style="border-bottom:1px solid rgba(72,72,72,0.15); padding:1.25rem 0;">
        <summary style="font-family:var(--font-serif); font-size:1.05rem; cursor:pointer; color:#1c1917; list-style:none; display:flex; justify-content:space-between; align-items:center; gap:1rem;">
          How long does it take to sell a home in ${s.name}?
          <span style="color:#c4912a; font-size:1.4rem; flex-shrink:0;">+</span>
        </summary>
        <p style="font-family:var(--font-sans); font-size:0.9rem; line-height:1.75; color:#4a4540; margin-top:0.75rem; padding-right:2rem;">Well-priced ${s.name} homes typically sell within ${s.days} days. ${s.daysContext} Daniel Gierach's median days on market across his Brisbane portfolio is 20 days.</p>
      </details>

      <details style="padding:1.25rem 0;">
        <summary style="font-family:var(--font-serif); font-size:1.05rem; cursor:pointer; color:#1c1917; list-style:none; display:flex; justify-content:space-between; align-items:center; gap:1rem;">
          ${s.q4}
          <span style="color:#c4912a; font-size:1.4rem; flex-shrink:0;">+</span>
        </summary>
        <p style="font-family:var(--font-sans); font-size:0.9rem; line-height:1.75; color:#4a4540; margin-top:0.75rem; padding-right:2rem;">${s.a4}</p>
      </details>

    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════
     SECTION 3: SUBURBS SERVED
════════════════════════════════════════════════ -->
<section style="background:#fff; padding:80px 24px;">
  <div style="max-width:900px; margin:0 auto;">
    <p style="font-family:var(--font-sans); font-size:0.75rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#c4912a; margin-bottom:1rem;">Areas Covered</p>
    <h2 style="font-family:var(--font-serif); font-size:clamp(1.8rem, 3.5vw, 2.8rem); font-weight:300; line-height:1.2; color:#1c1917; margin-bottom:2.5rem;">Suburbs I specialise in.</h2>
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1.25rem;">${gridItems}
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════
     SECTION 4: HOW I CAN HELP YOU SELL
════════════════════════════════════════════════ -->
<section style="background:var(--color-base, #f2efe9); padding:80px 24px;">
  <div style="max-width:800px; margin:0 auto;">
    <p style="font-family:var(--font-sans); font-size:0.75rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#c4912a; margin-bottom:1rem;">Selling in ${s.name}</p>
    <h2 style="font-family:var(--font-serif); font-size:clamp(1.8rem, 3.5vw, 2.8rem); font-weight:300; line-height:1.2; color:#1c1917; margin-bottom:3rem;">What selling with Daniel looks like.</h2>
    <div style="display:flex; flex-direction:column; gap:2.5rem; margin-bottom:3rem;">
      <div style="display:flex; gap:2rem; align-items:flex-start;">
        <span style="font-family:var(--font-serif); font-size:2.5rem; font-weight:300; color:#c4912a; line-height:1; flex-shrink:0; width:2.5rem;">1</span>
        <div>
          <p style="font-family:var(--font-serif); font-size:1.2rem; font-style:italic; font-weight:400; color:#1c1917; margin-bottom:0.5rem;">Free appraisal</p>
          <p style="font-family:var(--font-sans); font-size:0.9rem; font-weight:300; line-height:1.7; color:#6b6560;">I'll walk you through what your property is worth and what buyers are currently paying in your area.</p>
        </div>
      </div>
      <div style="display:flex; gap:2rem; align-items:flex-start;">
        <span style="font-family:var(--font-serif); font-size:2.5rem; font-weight:300; color:#c4912a; line-height:1; flex-shrink:0; width:2.5rem;">2</span>
        <div>
          <p style="font-family:var(--font-serif); font-size:1.2rem; font-style:italic; font-weight:400; color:#1c1917; margin-bottom:0.5rem;">Tailored campaign</p>
          <p style="font-family:var(--font-sans); font-size:0.9rem; font-weight:300; line-height:1.7; color:#6b6560;">Every property is different. I build a strategy around your home, your timeline and your buyer profile.</p>
        </div>
      </div>
      <div style="display:flex; gap:2rem; align-items:flex-start;">
        <span style="font-family:var(--font-serif); font-size:2.5rem; font-weight:300; color:#c4912a; line-height:1; flex-shrink:0; width:2.5rem;">3</span>
        <div>
          <p style="font-family:var(--font-serif); font-size:1.2rem; font-style:italic; font-weight:400; color:#1c1917; margin-bottom:0.5rem;">Managed negotiation</p>
          <p style="font-family:var(--font-sans); font-size:0.9rem; font-weight:300; line-height:1.7; color:#6b6560;">I manage every offer with commercial discipline to protect your final result.</p>
        </div>
      </div>
    </div>
    <a href="/walkthrough" style="font-family:var(--font-sans); font-size:0.85rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:#c4912a; color:#1c1917; padding:0.85rem 2rem; text-decoration:none; display:inline-block;">Request a Free Appraisal</a>
  </div>
</section>

<!-- ═══════════════════════════════════════════════
     SECTION 5: CTA STRIP
════════════════════════════════════════════════ -->
<section style="background:#1c1917; color:#f2efe9; padding:80px 24px; text-align:center;">
  <div style="max-width:700px; margin:0 auto;">
    <h2 style="font-family:var(--font-serif); font-size:clamp(1.8rem, 3.5vw, 2.8rem); font-weight:300; line-height:1.2; color:#f2efe9; margin-bottom:1.25rem;">Thinking of selling in ${s.name}?</h2>
    <p style="font-family:var(--font-sans); font-size:1rem; font-weight:300; line-height:1.75; color:#c9c4bc; margin-bottom:2rem;">Call me directly for a no-obligation conversation about your property and what it could achieve in today's market.</p>
    <p style="margin-bottom:2.5rem;">
      <a href="tel:+61412523821" style="font-family:var(--font-serif); font-size:2rem; font-weight:300; color:#f5d07a; text-decoration:none; letter-spacing:0.02em;">0412 523 821</a>
    </p>
    <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
      <a href="/contact" style="font-family:var(--font-sans); font-size:0.85rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:transparent; color:#f2efe9; padding:0.85rem 2rem; text-decoration:none; display:inline-block; border:1px solid #c4912a;">Send a Message</a>
      <a href="/walkthrough" style="font-family:var(--font-sans); font-size:0.85rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:#c4912a; color:#1c1917; padding:0.85rem 2rem; text-decoration:none; display:inline-block;">What's Your Property Worth?</a>
    </div>
  </div>
</section>

<style>
  @media (max-width: 768px) {
    section div[style*="grid-template-columns:repeat(3"] {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  @media (max-width: 480px) {
    section div[style*="grid-template-columns:repeat(3"] {
      grid-template-columns: 1fr !important;
    }
  }
</style>

</Layout>
`;
}

for (const suburb of suburbs) {
  const filePath = path.join(dir, `${suburb.slug}.astro`);
  if (fs.existsSync(filePath)) {
    console.log(`SKIP (exists): ${suburb.slug}`);
    continue;
  }
  fs.writeFileSync(filePath, generatePage(suburb), 'utf8');
  console.log(`CREATED: ${suburb.slug}`);
}

console.log('\nDone.');
