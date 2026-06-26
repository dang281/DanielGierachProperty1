# Supabase schema

Single source of truth for the dashboard's Postgres schema, tracked via the Supabase CLI.

## Layout

- `migrations/`: applied in timestamp order. Generated via `supabase migration new <name>`.
- `legacy/`: the loose SQL files that lived in `supabase/` before the baseline migration was set up on 2026-06-22. Kept for history only. Do not run.
- `config.toml`: Supabase CLI config for this project.
- `.temp/`: CLI scratch space (gitignored).

## Applying changes

Project is linked to `hmwulvvwsksuyqozuxvw` (`.temp/linked-project.json`). All commands below assume you're in `dashboard/`.

### One-time setup (already done)

The baseline migration `20260622000001_baseline.sql` already matches prod. Tell the CLI it's applied so it doesn't try to re-run it:

```
supabase migration repair --status applied 20260622000001
```

### Apply the user_id + RLS migration

```
supabase db push
```

This applies `20260622000002_user_id_rls.sql`:

- Adds `user_id uuid references auth.users` to every public table.
- Backfills `user_id` with Daniel's auth.users id (matched by email).
- Enables RLS on `tracked_properties` and `property_alerts` and adds authenticated-only policies (closes the hole where the anon key could read every contact).

### Future schema changes

Always go through the CLI:

```
supabase migration new <short_name>
```

Write the change in the generated file, then `supabase db push` to apply.

## Gap: tables not in the baseline

Three tables exist on prod but were created via the Supabase dashboard, so their `CREATE TABLE` isn't captured here yet:

- `tracked_properties`
- `property_alerts`
- `profiles`

To pull their authoritative schema into a new migration:

```
supabase db pull --linked
```

That generates a fresh `<timestamp>_remote_schema.sql` that captures the live state. Review and commit.
