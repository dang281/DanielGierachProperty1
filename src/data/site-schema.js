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
      "image": "https://cdn6.ep.dynamics.net/s3/rw-media/memberphotos/88889915-cef5-4a5f-9c19-0cea700d7bca.jpeg",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Unit 6, 57-59 Oxford Street",
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
        { "@type": "City", "name": "Brisbane" },
        { "@type": "City", "name": "Balmoral" },
        { "@type": "City", "name": "Belmont" },
        { "@type": "City", "name": "Brisbane CBD" },
        { "@type": "City", "name": "Bulimba" },
        { "@type": "City", "name": "Camp Hill" },
        { "@type": "City", "name": "Cannon Hill" },
        { "@type": "City", "name": "Carina" },
        { "@type": "City", "name": "Carina Heights" },
        { "@type": "City", "name": "Carindale" },
        { "@type": "City", "name": "Coorparoo" },
        { "@type": "City", "name": "East Brisbane" },
        { "@type": "City", "name": "Fortitude Valley" },
        { "@type": "City", "name": "Greenslopes" },
        { "@type": "City", "name": "Hawthorne" },
        { "@type": "City", "name": "Hemmant" },
        { "@type": "City", "name": "Holland Park" },
        { "@type": "City", "name": "Holland Park West" },
        { "@type": "City", "name": "Kangaroo Point" },
        { "@type": "City", "name": "Morningside" },
        { "@type": "City", "name": "Mount Gravatt" },
        { "@type": "City", "name": "Mount Gravatt East" },
        { "@type": "City", "name": "Murarrie" },
        { "@type": "City", "name": "New Farm" },
        { "@type": "City", "name": "Norman Park" },
        { "@type": "City", "name": "Seven Hills" },
        { "@type": "City", "name": "Tarragindi" },
        { "@type": "City", "name": "Teneriffe" },
        { "@type": "City", "name": "Tingalpa" },
        { "@type": "City", "name": "Upper Mount Gravatt" },
        { "@type": "City", "name": "Woolloongabba" }
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
        "https://www.linkedin.com/in/daniel-gierach",
        "https://www.facebook.com/danielgierachproperty",
        "https://www.instagram.com/danielgierach",
        "https://www.ratemyagent.com.au/real-estate-agent/daniel-gierach",
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
        "url": "https://cdn6.ep.dynamics.net/s3/rw-media/memberphotos/88889915-cef5-4a5f-9c19-0cea700d7bca.jpeg",
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
        "streetAddress": "Unit 6, 57-59 Oxford Street",
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
        "Queenslander Home Sales"
      ],
      "sameAs": [
        "https://www.raywhite.com/agents/agent/daniel-gierach-88889915",
        "https://raywhitebulimba.com.au/agents/daniel-gierach/177117",
        "https://www.linkedin.com/in/daniel-gierach",
        "https://www.facebook.com/danielgierachproperty",
        "https://www.instagram.com/danielgierach",
        "https://www.ratemyagent.com.au/real-estate-agent/daniel-gierach",
        "https://www.realestate.com.au/agent/daniel-gierach-3819232",
        "https://danielgierach.com"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://danielgierach.com/#identity-faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Who is Daniel Gierach?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Daniel Gierach is a Brisbane real estate agent at Ray White Bulimba. He specialises in residential property sales across Brisbane's inner east and south, including Bulimba, Hawthorne, Balmoral, Norman Park, Camp Hill, Seven Hills, Morningside, Murarrie, Cannon Hill and Carina. Daniel Gierach is not the same person as Daniel Giersch, the German entrepreneur and former husband of Kelly Rutherford."
          }
        },
        {
          "@type": "Question",
          "name": "Where is Daniel Gierach based?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Daniel Gierach is based in Bulimba, Brisbane, Queensland, Australia. His office is at Unit 6, 57-59 Oxford Street, Bulimba QLD 4171 (Ray White Bulimba)."
          }
        },
        {
          "@type": "Question",
          "name": "How do I contact Daniel Gierach?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Daniel Gierach can be contacted on 0412 523 821, at daniel.gierach@raywhite.com, or through the contact form at danielgierach.com."
          }
        }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://danielgierach.com/#website",
      "url": "https://danielgierach.com",
      "name": "Daniel Gierach Property",
      "publisher": { "@id": "https://danielgierach.com/#business" },
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
