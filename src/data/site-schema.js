// Global JSON-LD schema, identical on every page.
// Pre-stringified at module load time (once per build), not per-page render.
// See PERF-010 in the website performance audit.

const globalSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["RealEstateAgent", "LocalBusiness"],
      "@id": "https://danielgierach.com/#business",
      "name": "Daniel Gierach",
      "description": "Brisbane real estate agent at Ray White Bulimba. A documented three-phase method for selling homes across Brisbane, with deep local knowledge across the inner east and south.",
      "url": "https://danielgierach.com",
      "telephone": "+61412523821",
      "email": "daniel.gierach@raywhite.com",
      "image": "https://danielgierach.com/img/daniel-headshot.jpg",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "2A, 57-59 Oxford Street",
        "addressLocality": "Bulimba",
        "addressRegion": "QLD",
        "postalCode": "4171",
        "addressCountry": "AU"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -27.4568,
        "longitude": 153.0523
      },
      "areaServed": [
        { "@type": "Place", "name": "Brisbane" },
        { "@type": "Place", "name": "Annerley QLD" },
        { "@type": "Place", "name": "Ascot QLD" },
        { "@type": "Place", "name": "Ashgrove QLD" },
        { "@type": "Place", "name": "Auchenflower QLD" },
        { "@type": "Place", "name": "Balmoral QLD" },
        { "@type": "Place", "name": "Bardon QLD" },
        { "@type": "Place", "name": "Belmont QLD" },
        { "@type": "Place", "name": "Bowen Hills QLD" },
        { "@type": "Place", "name": "Brisbane CBD QLD" },
        { "@type": "Place", "name": "Bulimba QLD" },
        { "@type": "Place", "name": "Camp Hill QLD" },
        { "@type": "Place", "name": "Cannon Hill QLD" },
        { "@type": "Place", "name": "Carina QLD" },
        { "@type": "Place", "name": "Carina Heights QLD" },
        { "@type": "Place", "name": "Carindale QLD" },
        { "@type": "Place", "name": "Chelmer QLD" },
        { "@type": "Place", "name": "Clayfield QLD" },
        { "@type": "Place", "name": "Coorparoo QLD" },
        { "@type": "Place", "name": "Corinda QLD" },
        { "@type": "Place", "name": "Dutton Park QLD" },
        { "@type": "Place", "name": "East Brisbane QLD" },
        { "@type": "Place", "name": "Fortitude Valley QLD" },
        { "@type": "Place", "name": "Graceville QLD" },
        { "@type": "Place", "name": "Greenslopes QLD" },
        { "@type": "Place", "name": "Hamilton QLD" },
        { "@type": "Place", "name": "Hawthorne QLD" },
        { "@type": "Place", "name": "Hemmant QLD" },
        { "@type": "Place", "name": "Highgate Hill QLD" },
        { "@type": "Place", "name": "Holland Park QLD" },
        { "@type": "Place", "name": "Holland Park West QLD" },
        { "@type": "Place", "name": "Indooroopilly QLD" },
        { "@type": "Place", "name": "Kangaroo Point QLD" },
        { "@type": "Place", "name": "Kelvin Grove QLD" },
        { "@type": "Place", "name": "Lutwyche QLD" },
        { "@type": "Place", "name": "Milton QLD" },
        { "@type": "Place", "name": "Morningside QLD" },
        { "@type": "Place", "name": "Mount Gravatt QLD" },
        { "@type": "Place", "name": "Mount Gravatt East QLD" },
        { "@type": "Place", "name": "Murarrie QLD" },
        { "@type": "Place", "name": "New Farm QLD" },
        { "@type": "Place", "name": "Newstead QLD" },
        { "@type": "Place", "name": "Norman Park QLD" },
        { "@type": "Place", "name": "Nundah QLD" },
        { "@type": "Place", "name": "Paddington QLD" },
        { "@type": "Place", "name": "Red Hill QLD" },
        { "@type": "Place", "name": "Seven Hills QLD" },
        { "@type": "Place", "name": "Sherwood QLD" },
        { "@type": "Place", "name": "Spring Hill QLD" },
        { "@type": "Place", "name": "St Lucia QLD" },
        { "@type": "Place", "name": "Stones Corner QLD" },
        { "@type": "Place", "name": "Tarragindi QLD" },
        { "@type": "Place", "name": "Teneriffe QLD" },
        { "@type": "Place", "name": "Tingalpa QLD" },
        { "@type": "Place", "name": "Toowong QLD" },
        { "@type": "Place", "name": "Upper Mount Gravatt QLD" },
        { "@type": "Place", "name": "West End QLD" },
        { "@type": "Place", "name": "Windsor QLD" },
        { "@type": "Place", "name": "Woolloongabba QLD" },
        { "@type": "Place", "name": "Yeronga QLD" }
      ],
      "review": [
        {
          "@type": "Review",
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "author": { "@type": "Person", "name": "Seller" },
          "reviewBody": "Dan's professionalism and genuine approach stood out immediately. He explained every step clearly, set expectations up front, and kept me updated without me ever having to chase. The result went well above and beyond expectations."
        },
        {
          "@type": "Review",
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "author": { "@type": "Person", "name": "Buyer" },
          "reviewBody": "We had a great experience working with Daniel through our buying process. He was super honest, never pushy, and made the whole process way less stressful. Daniel is a genuinely solid, trustworthy person. Highly recommend."
        }
      ],
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "07:00",
        "closes": "20:00"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "10",
        "bestRating": "5",
        "worstRating": "1"
      },
      "sameAs": [
        "https://www.raywhite.com/agents/agent/daniel-gierach-88889915",
        "https://www.linkedin.com/in/danielgierach",
        "https://www.facebook.com/danielgierachproperty",
        "https://www.instagram.com/dgierach/",
        "https://www.wikidata.org/wiki/Q140611609",        "https://www.ratemyagent.com.au/real-estate-agent/daniel-gierach-mx883",
        "https://www.realestate.com.au/agent/daniel-gierach-3819232"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://danielgierach.com/#person",
      "name": "Daniel Gierach",
      "givenName": "Daniel",
      "familyName": "Gierach",
      "alternateName": ["Dan Gierach", "danielgierach", "Daniel Gierach Property"],
      "jobTitle": "Licensed Real Estate Agent",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "QLD Property Occupations Act registration",
        "value": "4873633"
      },
      "hasCredential": [
        {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "licence",
          "name": "Queensland real estate registration, Licence No. 4873633",
          "recognizedBy": { "@type": "GovernmentOrganization", "name": "Queensland Office of Fair Trading" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "degree",
          "name": "Bachelor of Property Economics, Queensland University of Technology"
        }
      ],
      "description": "Daniel Gierach is a Brisbane inner-east real estate agent at Ray White Bulimba. He specialises in property sales across Camp Hill, Hawthorne, Bulimba, Norman Park, Balmoral, Seven Hills, Morningside, Cannon Hill, Murarrie and Carina. Not to be confused with Daniel Giersch, the German entrepreneur.",
      "disambiguatingDescription": "Australian real estate agent based in Brisbane, Queensland. Distinct from Daniel Giersch, the German entrepreneur and former husband of Kelly Rutherford.",
      "url": "https://danielgierach.com",
      "telephone": "+61412523821",
      "email": "daniel.gierach@raywhite.com",
      "nationality": "Australian",
      "homeLocation": {
        "@type": "Place",
        "name": "Brisbane, Queensland, Australia"
      },
      "image": {
        "@type": "ImageObject",
        "url": "https://danielgierach.com/img/daniel-headshot.jpg",
        "width": 400,
        "height": 400
      },
      "worksFor": {
        "@type": "Organization",
        "name": "Ray White Bulimba",
        "url": "https://raywhitebulimba.com.au"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "2A, 57-59 Oxford Street",
        "addressLocality": "Bulimba",
        "addressRegion": "QLD",
        "postalCode": "4171",
        "addressCountry": "AU"
      },
      "knowsAbout": [
        "Real Estate",
        "Property Sales",
        "Brisbane Property Market",
        "Inner East Brisbane Real Estate",
        "Queensland Property Market",
        "Property Valuation",
        "Auction Strategy",
        "Character Home Sales",
        "Queenslander Home Sales",
        "Queenslander homes",
        "Character homes Brisbane",
        "Post-war homes Brisbane",
        "Prestige inner east property",
        "Off-market property Brisbane",
        "Pre-sale property preparation",
        "Brisbane property appraisal",
        "Queensland auction campaigns",
        "Bulimba real estate",
        "Hawthorne real estate",
        "Balmoral real estate",
        "Morningside real estate",
        "Norman Park real estate",
        "Camp Hill real estate",
        "Cannon Hill real estate",
        "Carina real estate",
        "Coorparoo real estate",
        "East Brisbane real estate",
        "Seven Hills real estate",
        "Murarrie real estate",
        "Tingalpa real estate",
        "Carina Heights real estate",
        "Carindale real estate",
        "Annerley real estate",
        "Ascot real estate",
        "Ashgrove real estate",
        "Auchenflower real estate",
        "Bardon real estate",
        "Belmont real estate",
        "Bowen Hills real estate",
        "Brisbane CBD real estate",
        "Chelmer real estate",
        "Clayfield real estate",
        "Corinda real estate",
        "Dutton Park real estate",
        "Fortitude Valley real estate",
        "Graceville real estate",
        "Greenslopes real estate",
        "Hamilton real estate",
        "Hemmant real estate",
        "Highgate Hill real estate",
        "Holland Park real estate",
        "Holland Park West real estate",
        "Indooroopilly real estate",
        "Kangaroo Point real estate",
        "Kelvin Grove real estate",
        "Lutwyche real estate",
        "Milton real estate",
        "Mount Gravatt real estate",
        "Mount Gravatt East real estate",
        "New Farm real estate",
        "Newstead real estate",
        "Nundah real estate",
        "Paddington real estate",
        "Red Hill real estate",
        "Sherwood real estate",
        "Spring Hill real estate",
        "St Lucia real estate",
        "Stones Corner real estate",
        "Tarragindi real estate",
        "Teneriffe real estate",
        "Toowong real estate",
        "Upper Mount Gravatt real estate",
        "West End real estate",
        "Windsor real estate",
        "Woolloongabba real estate",
        "Yeronga real estate"
      ],
      "sameAs": [
        "https://www.raywhite.com/agents/agent/daniel-gierach-88889915",
        "https://raywhitebulimba.com.au/agents/daniel-gierach/177117",
        "https://www.linkedin.com/in/danielgierach",
        "https://www.facebook.com/danielgierachproperty",
        "https://www.instagram.com/dgierach/",
        "https://www.wikidata.org/wiki/Q140611609",        "https://www.ratemyagent.com.au/real-estate-agent/daniel-gierach-mx883",
        "https://www.realestate.com.au/agent/daniel-gierach-3819232",
        "https://danielgierach.com"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://danielgierach.com/#website",
      "url": "https://danielgierach.com",
      "name": "Daniel Gierach Property",
      "publisher": { "@id": "https://danielgierach.com/#business" },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".eyebrow", "title"]
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://danielgierach.com/insights?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

// Pre-stringify once at module load. This export is reused across every page render.
export const GLOBAL_SCHEMA_JSON = JSON.stringify(globalSchema);
