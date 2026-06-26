# Monday cutover plan

Step-by-step to switch off Monday.com and run from the dashboard.

## Prerequisites

- Supabase migrations applied (see `supabase/README.md`).
- `MONDAY_API_TOKEN` set in `dashboard/.env.local` (monday.com -> profile picture -> Developers -> My access tokens).
- `SUPABASE_SERVICE_ROLE_KEY` set in `dashboard/.env.local` (Supabase dashboard -> Project Settings -> API).

## Step 1: dry run

```bash
cd /Users/danielgierach/DanielGierachProperty/dashboard
node scripts/import-monday.mjs --dry-run
```

You should see counts close to:
- Property Pipeline: 971
- Contacts: 1,039
- Buyers / Investors / Developers: 111
- Properties: 66

If any board returns 0, the token doesn't have access to that board. Fix in Monday (share the board with yourself or generate a new token with admin scope) before continuing.

## Step 2: full import

```bash
node scripts/import-monday.mjs
```

The script writes a row to `monday_import_runs` at the start and updates it with counts when finished. If it crashes, the row stays at `status=running` with no `finished_at` so it's obvious from the Import tab.

## Step 3: verify in the dashboard

Open the dashboard (`npm run dev` or your preview URL).

- `/app/import` shows row counts per table and the run status. Should be the same totals as the dry run.
- `/app/pipeline` shows the contacts grouped by stage, filterable, with a detail panel.

Spot-check three contacts you know well. Confirm name, phone, follow-up date and notes match Monday.

## Step 4: archive Monday (optional, the safe move)

In Monday, for each of the four boards:

1. Open the board.
2. Three-dot menu in the top right -> Archive board.

Archived boards are read-only and out of sight. Restore later if anything's missing. Don't delete for at least four weeks.

The duplicate Property Pipeline (board 5025851235) and the "Properties template" workspace can stay as-is. They were already not in use.

## Step 5: stop paying

Once you've used the dashboard for a fortnight without missing Monday:

1. Monday -> Admin -> Billing -> Cancel subscription.
2. Set a calendar reminder for a month before the next billing date in case anything resurfaces.

## Re-running the import

The import is idempotent on `monday_item_id`, so re-running just refreshes. If Monday data has drifted, run again:

```bash
node scripts/import-monday.mjs
```

If something looks wrong in the dashboard after a re-import, check `/app/import` for the run status.

## Rollback

The import writes to new `monday_*` tables only. It does not touch `tracked_properties`, `property_alerts`, or anything the existing dashboard depends on. If the new Pipeline tab is broken, hide it by editing `components/dashboard/NavLinks.tsx` and removing the `/app/pipeline` and `/app/import` entries. The old `/app/properties` keeps working unchanged.

To wipe the imported data and start fresh:

```sql
-- Run in Supabase SQL editor
truncate
  monday_pipeline_items,
  monday_contacts,
  monday_leads,
  monday_properties,
  monday_subitems,
  monday_links,
  monday_import_runs
restart identity;
```

Then re-run the import.
