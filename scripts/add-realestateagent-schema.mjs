import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const suburbsDir = path.join(__dirname, '../src/pages/suburbs');

const suburbData = {
  'balmoral':           { name: 'Balmoral',           postcode: '4171', nearby: ['Hawthorne','Norman Park','Bulimba','East Brisbane'], knowsAbout: ['Balmoral real estate','prestige Brisbane inner east homes','character Queenslanders Balmoral','riverside property Brisbane'] },
  'belmont':            { name: 'Belmont',             postcode: '4153', nearby: ['Carindale','Carina Heights','Tingalpa','Cannon Hill'], knowsAbout: ['Belmont real estate','Brisbane southside property','family homes Belmont','Belmont character homes'] },
  'brisbane-cbd':       { name: 'Brisbane CBD',        postcode: '4000', nearby: ['Kangaroo Point','East Brisbane','Fortitude Valley','Woolloongabba'], knowsAbout: ['Brisbane CBD apartments','inner-city real estate Brisbane','CBD investment property'] },
  'bulimba':            { name: 'Bulimba',             postcode: '4171', nearby: ['Hawthorne','Morningside','Cannon Hill','Balmoral'], knowsAbout: ['Bulimba real estate','Oxford Street Bulimba property','Bulimba riverside homes','inner east Brisbane agent'] },
  'camp-hill':          { name: 'Camp Hill',           postcode: '4152', nearby: ['Norman Park','Seven Hills','Carina','Morningside'], knowsAbout: ['Camp Hill real estate','elevated Brisbane inner east homes','character homes Camp Hill','Camp Hill property values'] },
  'cannon-hill':        { name: 'Cannon Hill',         postcode: '4151', nearby: ['Morningside','Murarrie','Bulimba','Carina'], knowsAbout: ['Cannon Hill real estate','Brisbane inner east property','Cannon Hill family homes','character homes Brisbane'] },
  'carina':             { name: 'Carina',              postcode: '4152', nearby: ['Camp Hill','Cannon Hill','Carina Heights','Carindale'], knowsAbout: ['Carina real estate','Carina house prices','Brisbane southeast property','family homes Carina'] },
  'carina-heights':     { name: 'Carina Heights',      postcode: '4152', nearby: ['Carina','Camp Hill','Carindale','Belmont'], knowsAbout: ['Carina Heights real estate','Carina Heights property values','Brisbane family homes','inner east Brisbane agent'] },
  'carindale':          { name: 'Carindale',           postcode: '4152', nearby: ['Carina','Carina Heights','Belmont','Upper Mount Gravatt'], knowsAbout: ['Carindale real estate','Carindale house prices','Brisbane south property','family homes Carindale'] },
  'coorparoo':          { name: 'Coorparoo',           postcode: '4151', nearby: ['East Brisbane','Greenslopes','Holland Park','Norman Park'], knowsAbout: ['Coorparoo real estate','Coorparoo house prices','inner south Brisbane property','character homes Coorparoo'] },
  'east-brisbane':      { name: 'East Brisbane',       postcode: '4169', nearby: ['Kangaroo Point','Woolloongabba','Coorparoo','Norman Park'], knowsAbout: ['East Brisbane real estate','East Brisbane terrace homes','inner-city character homes Brisbane','East Brisbane property values'] },
  'fortitude-valley':   { name: 'Fortitude Valley',    postcode: '4006', nearby: ['New Farm','Teneriffe','Brisbane CBD','Kangaroo Point'], knowsAbout: ['Fortitude Valley real estate','Valley apartments Brisbane','inner-city property Brisbane','New Farm Teneriffe agent'] },
  'greenslopes':        { name: 'Greenslopes',         postcode: '4120', nearby: ['Coorparoo','Holland Park','Tarragindi','Camp Hill'], knowsAbout: ['Greenslopes real estate','Greenslopes property values','inner south Brisbane homes','character homes Greenslopes'] },
  'hawthorne':          { name: 'Hawthorne',           postcode: '4171', nearby: ['Bulimba','Balmoral','Norman Park','Morningside'], knowsAbout: ['Hawthorne real estate','premium Brisbane inner east homes','Hawthorne riverside living','Riding Road precinct property'] },
  'hemmant':            { name: 'Hemmant',             postcode: '4174', nearby: ['Murarrie','Tingalpa','Cannon Hill','Morningside'], knowsAbout: ['Hemmant real estate','Hemmant property values','Brisbane bayside suburbs','affordable Brisbane east homes'] },
  'holland-park':       { name: 'Holland Park',        postcode: '4121', nearby: ['Greenslopes','Holland Park West','Tarragindi','Coorparoo'], knowsAbout: ['Holland Park real estate','Holland Park house prices','Brisbane south character homes','inner south Brisbane agent'] },
  'holland-park-west':  { name: 'Holland Park West',   postcode: '4121', nearby: ['Holland Park','Greenslopes','Tarragindi','Upper Mount Gravatt'], knowsAbout: ['Holland Park West real estate','Holland Park West property','Brisbane south homes','family property Brisbane south'] },
  'kangaroo-point':     { name: 'Kangaroo Point',      postcode: '4169', nearby: ['East Brisbane','Woolloongabba','New Farm','Fortitude Valley'], knowsAbout: ['Kangaroo Point real estate','Kangaroo Point cliff apartments','riverside Brisbane property','inner-city Brisbane homes'] },
  'morningside':        { name: 'Morningside',         postcode: '4170', nearby: ['Cannon Hill','Bulimba','Murarrie','Norman Park'], knowsAbout: ['Morningside real estate','Morningside house prices','Brisbane inner east family homes','character homes Morningside'] },
  'mount-gravatt':      { name: 'Mount Gravatt',       postcode: '4122', nearby: ['Mount Gravatt East','Upper Mount Gravatt','Greenslopes','Holland Park'], knowsAbout: ['Mount Gravatt real estate','Mount Gravatt property values','Brisbane south homes','family property Mount Gravatt'] },
  'mount-gravatt-east': { name: 'Mount Gravatt East',  postcode: '4122', nearby: ['Mount Gravatt','Upper Mount Gravatt','Carindale','Belmont'], knowsAbout: ['Mount Gravatt East real estate','Mount Gravatt East house prices','Brisbane south family homes','character homes southeast Brisbane'] },
  'new-farm':           { name: 'New Farm',            postcode: '4005', nearby: ['Teneriffe','Fortitude Valley','Kangaroo Point','East Brisbane'], knowsAbout: ['New Farm real estate','New Farm Park precinct property','heritage Brisbane inner-city homes','New Farm house prices'] },
  'norman-park':        { name: 'Norman Park',         postcode: '4170', nearby: ['Camp Hill','Seven Hills','East Brisbane','Balmoral'], knowsAbout: ['Norman Park real estate','Norman Park Queenslanders','Brisbane inner east character homes','Norman Park property values'] },
  'tarragindi':         { name: 'Tarragindi',          postcode: '4121', nearby: ['Holland Park','Greenslopes','Holland Park West','Upper Mount Gravatt'], knowsAbout: ['Tarragindi real estate','Tarragindi house prices','Brisbane south family homes','character homes Tarragindi'] },
  'teneriffe':          { name: 'Teneriffe',           postcode: '4005', nearby: ['New Farm','Fortitude Valley','Kangaroo Point','Bulimba'], knowsAbout: ['Teneriffe real estate','Teneriffe woolstore apartments','prestige Brisbane inner-city property','Teneriffe house prices'] },
  'tingalpa':           { name: 'Tingalpa',            postcode: '4173', nearby: ['Murarrie','Hemmant','Cannon Hill','Belmont'], knowsAbout: ['Tingalpa real estate','Tingalpa house prices','affordable Brisbane east homes','family property Tingalpa'] },
  'upper-mount-gravatt':{ name: 'Upper Mount Gravatt', postcode: '4122', nearby: ['Mount Gravatt','Mount Gravatt East','Holland Park West','Carindale'], knowsAbout: ['Upper Mount Gravatt real estate','Upper Mount Gravatt house prices','Brisbane south family homes','elevated Brisbane south property'] },
  'woolloongabba':      { name: 'Woolloongabba',       postcode: '4102', nearby: ['East Brisbane','Kangaroo Point','Coorparoo','South Brisbane'], knowsAbout: ['Woolloongabba real estate','The Gabba precinct property','inner south Brisbane homes','Woolloongabba house prices'] },
};

// Pages that already have RealEstateAgent schema
const alreadyHaveSchema = new Set(['murarrie', 'seven-hills']);

let updated = 0;
let skipped = 0;

for (const [slug, data] of Object.entries(suburbData)) {
  if (alreadyHaveSchema.has(slug)) {
    console.log(`SKIP (already has schema): ${slug}`);
    skipped++;
    continue;
  }

  const filePath = path.join(suburbsDir, `${slug}.astro`);
  if (!fs.existsSync(filePath)) {
    console.log(`MISSING FILE: ${slug}`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('RealEstateAgent')) {
    console.log(`SKIP (already has RealEstateAgent): ${slug}`);
    skipped++;
    continue;
  }

  const areaServed = [
    { '@type': 'Place', name: `${data.name} QLD ${data.postcode}` },
    ...data.nearby.map(n => ({ '@type': 'Place', name: `${n} QLD` })),
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'RealEstateAgent'],
    name: 'Daniel Gierach — Ray White The Collective',
    description: `Specialist real estate agent in ${data.name} and Brisbane's inner east and south. Selling property in ${data.name}, ${data.nearby.slice(0, 3).join(', ')} and surrounding suburbs.`,
    url: `https://www.danielgierach.com/suburbs/${slug}`,
    telephone: '+61412523821',
    address: {
      '@type': 'PostalAddress',
      addressLocality: data.name,
      addressRegion: 'QLD',
      postalCode: data.postcode,
      addressCountry: 'AU',
    },
    areaServed,
    knowsAbout: data.knowsAbout,
    sameAs: ['https://share.google/WipmgyJnjC5nkhGwx'],
  };

  const schemaBlock = `\n<script type="application/ld+json">{JSON.stringify(${JSON.stringify(schema, null, 2)})}</script>\n`;

  // Insert after the first closing </script> tag (after the existing WebPage schema)
  const insertAfter = '</script>';
  const insertIndex = content.indexOf(insertAfter);
  if (insertIndex === -1) {
    console.log(`ERROR: no </script> found in ${slug}`);
    continue;
  }

  const newContent = content.slice(0, insertIndex + insertAfter.length) + schemaBlock + content.slice(insertAfter.length + insertIndex);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`UPDATED: ${slug}`);
  updated++;
}

console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
