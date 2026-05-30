// sync-monday-contacts.mjs
// Run with: node scripts/sync-monday-contacts.mjs

const SUPABASE_URL = 'https://hmwulvvwsksuyqozuxvw.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtd3VsdnZ3c2tzdXlxb3p1eHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQyMjcsImV4cCI6MjA5MTQ3MDIyN30.hKv56I0CyhRY1xSE1tkQZtutHINbCPzPupPMLLNxMr4'

// Step 1: Add columns via raw SQL using the management API
// Since anon key can't run DDL, we use the REST API upsert which is safe
// The columns must be pre-created (done via supabase CLI or dashboard)

function formatPhone(raw) {
  if (!raw) return null
  const clean = raw.trim()
  if (!clean) return null
  // Strip leading 61 and replace with 0
  if (clean.startsWith('61') && clean.length >= 11) {
    return '0' + clean.slice(2)
  }
  // Already starts with 0
  if (clean.startsWith('0')) return clean
  // Short numbers (landlines without country code, e.g. 338...)
  if (clean.length <= 8) return clean
  return clean
}

function parseSuburb(address) {
  if (!address) return 'Unknown'
  // Try to extract suburb from patterns like "Street, Suburb 4170" or "Street, Suburb QLD 4170"
  const match = address.match(/,\s*([^,]+?)(?:\s+QLD)?(?:\s+\d{4})(?:\s*QLD)?\s*(?:,\s*Australia)?\s*$/i)
  if (match) {
    return match[1].trim()
  }
  // Fallback: take the second-to-last comma-separated part
  const parts = address.split(',')
  if (parts.length >= 2) {
    const candidate = parts[parts.length - 1].trim().replace(/QLD.*/i, '').replace(/\d{4}/, '').trim()
    if (candidate && candidate.length > 1) return candidate
    if (parts.length >= 3) {
      return parts[parts.length - 2].trim()
    }
  }
  return 'Unknown'
}

async function upsertBatch(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tracked_properties`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upsert failed (${res.status}): ${text}`)
  }
  return res.status
}

// All items collected from monday.com
const allItems = [
  // Off-Market (5)
  {"id":"2658851455","name":"19 Walter Street, Murarrie 4172 (copy)","group":"Off-Market","owner":"","phone":"61403619082","email":""},
  {"id":"2716832450","name":"4/15 Karumba Street, Carina Heights QLD 4152, Australia","group":"Off-Market","owner":"","phone":"","email":""},
  {"id":"2716748693","name":"274 Gallipoli Road, Carina Heights QLD 4152, Australia","group":"Off-Market","owner":"","phone":"","email":""},
  {"id":"2718547534","name":"5 Apollo Road, Bulimba QLD, Australia","group":"Off-Market","owner":"","phone":"","email":""},
  {"id":"2540085390","name":"118 Darcy Road, Seven Hills 4170","group":"Off-Market","owner":"James Huang","phone":"61433098333","email":""},
  // From Open Homes (1)
  {"id":"2706361191","name":"5/35 Burrai Street, Morningside QLD 4170, Australia","group":"From Open Homes","owner":"","phone":"0404457471","email":""},
  // HOTSTOCK (47)
  {"id":"2067629373","name":"29 Pattison Avenue, Norman Park 4170 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61408756557","email":""},
  {"id":"2067629378","name":"77 Tranters Ave, Camp Hill QLD 4152, Australia","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61405559378","email":""},
  {"id":"2067629390","name":"25A Munce Place, Cannon Hill 4170 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61415509996","email":""},
  {"id":"2076187021","name":"18 Burnby Road, Hemmant","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"0478489237","email":""},
  {"id":"2076187027","name":"52 Aster Street, Cannon Hill 4170 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61422985145","email":""},
  {"id":"2076188244","name":"176 Agnew Street, Morningside 4170 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61413167511","email":""},
  {"id":"2076188252","name":"26 Sutton Place, Cannon Hill 4170 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61403882353","email":""},
  {"id":"2076188268","name":"30 Russell Avenue, Norman Park 4170 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61406837836","email":""},
  {"id":"2076293474","name":"8 Myall ST, Norman Park 4170 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61452264731","email":""},
  {"id":"2540017194","name":"27 Munce Place, Cannon Hill 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Abdul Khan","phone":"61418327084","email":""},
  {"id":"2540017265","name":"1/11 Zahel St, Carina 4152","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Blair James Anderson","phone":"61449893217","email":""},
  {"id":"2540017572","name":"36 Bodalla Street, Norman Park 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Michele Spatuzzo","phone":"61438698885","email":""},
  {"id":"2540085389","name":"121 Oateson Skyline Drive, Seven Hills 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Emma Stephens","phone":"61412845246","email":""},
  {"id":"2540085394","name":"151 Oateson Skyline Drive, Seven Hills 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Scott Little","phone":"61428688862","email":""},
  {"id":"2540085396","name":"97 Billan Street, Carina 4152","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Dennis Ahn","phone":"61423878428","email":""},
  {"id":"2540085402","name":"67 Gray Street, Carina 4152","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Josh Drum","phone":"61401213019","email":""},
  {"id":"2540085418","name":"315 Ferguson Road, Seven Hills 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Darlene Myles","phone":"61414343673","email":""},
  {"id":"2540085640","name":"15 Foxton Street, Morningside 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Sandra Janssen","phone":"61435346254","email":""},
  {"id":"2540085651","name":"19B Pinedale Street, Morningside 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Dhruv Sahni","phone":"61413187381","email":""},
  {"id":"2540085669","name":"90 Windemere Avenue, Morningside 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Brian Reitano","phone":"61419744588","email":""},
  {"id":"2540099302","name":"62 Macrossan Ave, Norman Park 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"DEBORAH BUFFETT","phone":"61432253098","email":""},
  {"id":"2540124381","name":"30/35 Smith Place, Cannon Hill 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Juan Paez","phone":"61402057741","email":""},
  {"id":"2583605848","name":"1/10 Gary Street, Morningside","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61477040655","email":""},
  {"id":"2584410399","name":"7 Paramount Terrace, Seven Hills 4170 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61417641657","email":""},
  {"id":"2622337688","name":"122 Fifth Avenue, Balmoral 4171","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61421020990","email":""},
  {"id":"2624966500","name":"1809/855 Stanley Street, Woolloongabba 4102 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61439463525","email":""},
  {"id":"2645517150","name":"77 Wynnum Road, Norman Park 4170 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61438698885","email":""},
  {"id":"2645534072","name":"81 Wynnum Road, Norman Park 4170 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61438698885","email":""},
  {"id":"2671302143","name":"17 Redrock Street, Murarrie 4172","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61402916480","email":""},
  {"id":"2675988760","name":"26 Suncroft Street, Mount Gravatt 4122","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61420370414","email":""},
  {"id":"2679799146","name":"7 Dunstan Crescent, Strathpine 4500 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61451785238","email":""},
  {"id":"2679915573","name":"4 Michigan Circuit, Warner 4500 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61451785238","email":""},
  {"id":"2688016750","name":"4/45 Derby Street, Coorparoo 4151","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61400869694","email":""},
  {"id":"2689255943","name":"3/60 Barron Street, Gordon Park 4031 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61401656992","email":""},
  {"id":"2697506303","name":"11 Christina Place, Belmont 4153","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61408954516","email":""},
  {"id":"5024624110","name":"40 Bonar Street, Morningside","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61423115472","email":""},
  {"id":"5004335710","name":"6 Paget Street, Carina 4152 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61413651203","email":""},
  {"id":"5000449714","name":"5/15 Cambridge Street, Carina Heights 4152 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61410034070","email":""},
  {"id":"5004227151","name":"3/11 Zahel Street, Carina 4152 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61447303267","email":""},
  {"id":"5025022751","name":"20 Stanmere Street, Carindale 4152 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61413791495","email":""},
  {"id":"5018166672","name":"91 Billan Street, Carina 4152 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61433064781","email":""},
  {"id":"2076188232","name":"44 Florida Street, Morningside 4170 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61400597255","email":""},
  {"id":"2540124302","name":"26 Macrossan Ave, Norman Park 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61477026838","email":""},
  {"id":"2540085666","name":"6 Hillsdale Street, Morningside 4170","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"David Paice","phone":"61490166669","email":""},
  {"id":"2540027932","name":"99 Emerald Street, Murarrie 4172","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Nagin Raniga","phone":"61416983979","email":""},
  {"id":"2714403818","name":"34 Herbert Street, Murarrie 4172 QLD","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"","phone":"61406523132","email":""},
  {"id":"2540099434","name":"8 Pikedale Street, Murarrie 4172","group":"HOTSTOCK - Weekly Touch Point - Looking to sell at some point","owner":"Peter Kirkwood","phone":"61402218886","email":""},
]

// Convert raw item to tracked_properties row
function toRow(item) {
  const suburb = parseSuburb(item.name)
  return {
    monday_item_id: item.id,
    monday_group: item.group,
    address: item.name.replace(' (copy)', '').trim(),
    suburb: suburb,
    owner_name: item.owner || '',
    phone: formatPhone(item.phone),
    email: item.email || null,
    active: true,
  }
}

async function main() {
  console.log(`Processing ${allItems.length} items...`)

  const rows = allItems.map(toRow)

  // Batch in groups of 50
  let upserted = 0
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50)
    try {
      await upsertBatch(batch)
      upserted += batch.length
      console.log(`Upserted batch ${Math.floor(i/50)+1}: ${batch.length} rows (total: ${upserted})`)
    } catch (e) {
      console.error(`Error in batch ${Math.floor(i/50)+1}:`, e.message)
    }
  }
  console.log(`Done. Total upserted: ${upserted}`)
}

main().catch(console.error)
