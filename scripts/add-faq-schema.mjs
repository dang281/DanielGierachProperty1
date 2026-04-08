import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const suburbsDir = path.join(__dirname, '../src/pages/suburbs');

const faqData = {
  'mount-gravatt': {
    name: 'Mount Gravatt',
    faqs: [
      {
        q: 'Who is the best real estate agent in Mount Gravatt?',
        a: 'Daniel Gierach of Ray White The Collective is a specialist agent across Brisbane\'s inner east and south, including Mount Gravatt. He brings data-driven campaigns, deep local buyer knowledge and a proven track record of results in the southern suburbs. Call Daniel on 0412 523 821 for a free appraisal.',
      },
      {
        q: 'What is the median house price in Mount Gravatt?',
        a: 'Mount Gravatt\'s median house price sits at approximately $1.1 million as of early 2026, reflecting sustained demand from families drawn to its accessibility, the Westfield Garden City precinct and strong school catchments. Price points vary by street, land size and property type.',
      },
      {
        q: 'How long does it take to sell a home in Mount Gravatt?',
        a: 'Well-positioned Mount Gravatt homes typically sell within 20 to 35 days when correctly priced and supported by a targeted marketing campaign. Daniel Gierach\'s median days on market across his Brisbane south portfolio is 20 days.',
      },
      {
        q: 'Is Mount Gravatt a good suburb to sell in?',
        a: 'Mount Gravatt attracts a broad buyer pool including families, downsizers and investors, which supports healthy competition at sale. Its central location, proximity to Garden City and consistent demand from buyers priced out of inner-east suburbs make it a strong selling environment in the current market.',
      },
    ],
  },
  'mount-gravatt-east': {
    name: 'Mount Gravatt East',
    faqs: [
      {
        q: 'Who is the best real estate agent in Mount Gravatt East?',
        a: 'Daniel Gierach of Ray White The Collective is an active agent across Brisbane\'s south and inner east, including Mount Gravatt East. He understands the buyer profile in this suburb and builds targeted campaigns that attract motivated buyers. Call 0412 523 821 for a no-obligation appraisal.',
      },
      {
        q: 'What is the median house price in Mount Gravatt East?',
        a: 'Mount Gravatt East\'s median house price is approximately $950,000 to $1 million as of early 2026. The suburb continues to attract families and upsizers seeking relative affordability close to Westfield Garden City, good schools and easy arterial access.',
      },
      {
        q: 'How long does it take to sell a home in Mount Gravatt East?',
        a: 'Mount Gravatt East homes typically sell within 25 to 40 days when priced accurately and well-presented. Daniel Gierach\'s median days on market is 20 days across his Brisbane south campaigns.',
      },
      {
        q: 'What types of buyers are active in Mount Gravatt East?',
        a: 'Mount Gravatt East draws a mix of families upgrading from smaller homes, first-home buyers entering the market and investors seeking rental yield close to the Griffith University Nathan campus. Understanding these buyer segments is key to pricing and marketing effectively in this suburb.',
      },
    ],
  },
  'new-farm': {
    name: 'New Farm',
    faqs: [
      {
        q: 'Who is the best real estate agent in New Farm?',
        a: 'Daniel Gierach of Ray White The Collective operates across Brisbane\'s inner east and premium inner-city suburbs, including New Farm. He brings a strong understanding of the prestige buyer profile active in New Farm and tailors campaigns accordingly. Call 0412 523 821 to discuss your property.',
      },
      {
        q: 'What is the median house price in New Farm?',
        a: 'New Farm\'s median house price is approximately $2 million or above as of early 2026, with prestige properties on larger blocks and heritage homes significantly exceeding that figure. The suburb\'s proximity to New Farm Park, the river and Brunswick Street\'s café precinct underpins consistently strong buyer demand.',
      },
      {
        q: 'How long does it take to sell a home in New Farm?',
        a: 'Prestige New Farm homes typically sell within 30 to 50 days depending on price point and presentation. The buyer pool for premium inner-city homes is more selective, making precise pricing and targeted marketing critical. Daniel Gierach\'s median days on market is 20 days across his portfolio.',
      },
      {
        q: 'Should I sell my New Farm home by auction or private treaty?',
        a: 'New Farm\'s competitive buyer pool and strong emotional appeal make it well-suited to auction, particularly for character homes and heritage properties. Auction creates genuine urgency and competition between qualified buyers. Private treaty can suit premium properties where the buyer profile is narrower. Daniel will recommend the right method based on your specific property.',
      },
    ],
  },
  'norman-park': {
    name: 'Norman Park',
    faqs: [
      {
        q: 'Who is the best real estate agent in Norman Park?',
        a: 'Daniel Gierach of Ray White The Collective is a specialist agent in Norman Park and Brisbane\'s broader inner east. He has sold extensively in Norman Park and understands the character home buyer profile that drives competition in this suburb. Call 0412 523 821 for a free appraisal.',
      },
      {
        q: 'What is the median house price in Norman Park?',
        a: 'Norman Park\'s median house price is approximately $1.4 million as of early 2026. Original Queenslanders on larger blocks and homes backing onto Norman Creek reserve consistently attract premium results. Renovated character homes and properties within strong school catchments command the top of the market.',
      },
      {
        q: 'How long does it take to sell a home in Norman Park?',
        a: 'Well-priced Norman Park homes typically sell within 20 to 35 days. The suburb\'s tightly held nature and consistent family demand create strong conditions for competitive campaigns. Daniel Gierach\'s median days on market is 20 days.',
      },
      {
        q: 'What makes Norman Park a strong suburb for sellers?',
        a: 'Norman Park benefits from consistent demand from families priced out of Balmoral and Hawthorne who still want inner-east character living. Limited listing supply, strong school catchments and the suburb\'s green credentials along Norman Creek create competitive conditions that support strong sale prices.',
      },
    ],
  },
  'tarragindi': {
    name: 'Tarragindi',
    faqs: [
      {
        q: 'Who is the best real estate agent in Tarragindi?',
        a: 'Daniel Gierach of Ray White The Collective is an active agent across Brisbane\'s inner south, including Tarragindi. He understands the family buyer profile in this suburb and builds campaigns that attract motivated, qualified buyers. Call 0412 523 821 for a free property appraisal.',
      },
      {
        q: 'What is the median house price in Tarragindi?',
        a: 'Tarragindi\'s median house price is approximately $1.1 million as of early 2026. The suburb attracts families drawn to its quiet character, good school options, Toohey Forest proximity and relative value compared to Greenslopes and Holland Park.',
      },
      {
        q: 'How long does it take to sell a home in Tarragindi?',
        a: 'Tarragindi homes typically sell within 25 to 40 days when correctly priced and well-presented. Daniel Gierach\'s median days on market across his Brisbane south and inner-east campaigns is 20 days.',
      },
      {
        q: 'What types of buyers look in Tarragindi?',
        a: 'Tarragindi primarily attracts families seeking affordable inner-south living with access to quality schools, Toohey Forest and good arterial connections. Buyers often include those who have been outpriced in Greenslopes or Holland Park and are seeking comparable lifestyle at better value.',
      },
    ],
  },
  'tingalpa': {
    name: 'Tingalpa',
    faqs: [
      {
        q: 'Who is the best real estate agent in Tingalpa?',
        a: 'Daniel Gierach of Ray White The Collective sells across Brisbane\'s east, including Tingalpa. He knows the buyer profile active in this suburb and delivers targeted campaigns that generate genuine interest. Call 0412 523 821 to find out what your Tingalpa property could achieve.',
      },
      {
        q: 'What is the median house price in Tingalpa?',
        a: 'Tingalpa\'s median house price sits at approximately $800,000 to $870,000 as of early 2026, making it one of Brisbane\'s more accessible eastern suburbs. Buyers are typically families and investors seeking value within easy reach of the Gateway Motorway and Cannon Hill amenity.',
      },
      {
        q: 'How long does it take to sell a home in Tingalpa?',
        a: 'Tingalpa homes typically sell within 25 to 40 days in normal market conditions. Accurate pricing and good presentation are the key drivers of a faster sale. Daniel Gierach\'s median days on market is 20 days across his Brisbane east portfolio.',
      },
      {
        q: 'Is Tingalpa a good suburb to invest in?',
        a: 'Tingalpa offers strong rental yields relative to more established eastern suburbs, with good access to the Gateway Motorway, Cannon Hill Shopping Centre and the Lytton Road corridor. Infrastructure investment and proximity to Murarrie\'s growing employment precinct are positive long-term indicators for the suburb.',
      },
    ],
  },
  'upper-mount-gravatt': {
    name: 'Upper Mount Gravatt',
    faqs: [
      {
        q: 'Who is the best real estate agent in Upper Mount Gravatt?',
        a: 'Daniel Gierach of Ray White The Collective is a specialist agent across Brisbane\'s south, including Upper Mount Gravatt. He understands the elevated lifestyle appeal that drives buyer demand in this suburb. Call 0412 523 821 for a free, no-obligation property appraisal.',
      },
      {
        q: 'What is the median house price in Upper Mount Gravatt?',
        a: 'Upper Mount Gravatt\'s median house price is approximately $1 million to $1.1 million as of early 2026. The suburb\'s elevated position, views, proximity to Westfield Garden City and strong school catchments underpin consistent family demand.',
      },
      {
        q: 'How long does it take to sell a home in Upper Mount Gravatt?',
        a: 'Upper Mount Gravatt homes typically sell within 20 to 35 days when priced correctly and marketed to the right buyer profile. Daniel Gierach\'s median days on market is 20 days across his Brisbane south campaigns.',
      },
      {
        q: 'What makes Upper Mount Gravatt attractive to buyers?',
        a: 'Upper Mount Gravatt offers elevated land with views, proximity to Westfield Garden City and the Griffith University Nathan campus, and access to strong school catchments including MacGregor State School. Buyers are primarily families seeking suburban lifestyle, quality amenity and good long-term capital growth potential.',
      },
    ],
  },
  'woolloongabba': {
    name: 'Woolloongabba',
    faqs: [
      {
        q: 'Who is the best real estate agent in Woolloongabba?',
        a: 'Daniel Gierach of Ray White The Collective sells across Brisbane\'s inner south, including Woolloongabba. He understands the evolving buyer profile in this rapidly transforming suburb. Call 0412 523 821 to discuss what your Woolloongabba property could achieve in today\'s market.',
      },
      {
        q: 'What is the median house price in Woolloongabba?',
        a: 'Woolloongabba\'s median house price is approximately $1.3 million as of early 2026. The suburb\'s proximity to the CBD, The Gabba precinct redevelopment and strong café and retail amenity on Logan Road continue to drive strong buyer interest from professionals and families alike.',
      },
      {
        q: 'How long does it take to sell a home in Woolloongabba?',
        a: 'Well-positioned Woolloongabba homes typically sell within 20 to 35 days. The suburb\'s inner-city credentials and transformation story attract motivated buyers. Daniel Gierach\'s median days on market is 20 days across his inner-south campaigns.',
      },
      {
        q: 'Is now a good time to sell in Woolloongabba?',
        a: 'Woolloongabba is in a strong selling position given ongoing infrastructure investment around The Gabba, continued gentrification of the Logan Road and Ipswich Road corridors, and persistent buyer demand from professionals seeking inner-city living at sub-Kangaroo Point prices. Sellers who act before further listing supply enters the market are well-placed.',
      },
    ],
  },
};

let updated = 0;

for (const [slug, data] of Object.entries(faqData)) {
  const filePath = path.join(suburbsDir, `${slug}.astro`);
  if (!fs.existsSync(filePath)) {
    console.log(`MISSING FILE: ${slug}`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('FAQPage')) {
    console.log(`SKIP (already has FAQPage): ${slug}`);
    continue;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const schemaBlock = `\n<script type="application/ld+json">{JSON.stringify(${JSON.stringify(schema, null, 2)})}</script>\n`;

  // Insert before </Layout>
  const insertBefore = '</Layout>';
  const insertIndex = content.lastIndexOf(insertBefore);
  if (insertIndex === -1) {
    console.log(`ERROR: no </Layout> found in ${slug}`);
    continue;
  }

  const newContent = content.slice(0, insertIndex) + schemaBlock + content.slice(insertIndex);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`UPDATED: ${slug}`);
  updated++;
}

console.log(`\nDone. Updated: ${updated}`);
