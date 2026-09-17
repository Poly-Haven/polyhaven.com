# polyhaven.com

See the parent `CLAUDE.md` for how this fits with the other services.

## i18n / i18nexus

i18nexus is the source of truth; `public/locales/**` is generated. **Never hand-edit a locale file to
change a translation** — the next pull overwrites it.

There is an `i18nexus` skill in `.claude/skills/i18nexus` with a `scripts/import.js` that is the
right tool for changing a translation (dry-runs by default, diffs, backs up, polls until the value
lands, fails loudly on unintended changes). **`.claude` is gitignored**, so that skill may not exist
in a fresh clone — hence the facts below live here, in a tracked file.

`npm run translate` (`i18nexus pull && jsonsort`) pulls **every** namespace, so it can bring down
unrelated translation edits other people made since the last pull. Check
`git diff --numstat public/locales` and split anything that isn't yours into its own commit. Most
files come back "modified" with zero line changes — i18nexus writes LF, the repo stores CRLF — and
those are no-ops on commit.

### The CLI cannot write per-locale translations. The API can.

`npx i18nexus` offers only `pull`, `add-string`, `update-string`, `delete-string` and `import`, and
every write command operates on the **English base string**; `update-string` has no translations
field at all. That is a limit of the CLI, **not of i18nexus** — do not conclude from a CLI `--help`
that setting a French string is impossible.

Auth for the REST API is `Authorization: Bearer <I18NEXUS_PERSONAL_ACCESS_TOKEN>` plus
`?api_key=<I18NEXUS_API_KEY>`; both are in `.mcp.json` (gitignored). `@i18nexus/mcp` is a thin
wrapper over the same endpoints, so `npm pack @i18nexus/mcp` and reading `dist/i18nexusClient.js` is
the quickest way to find a request shape. Verified 2026-09-17:

- `POST /project_resources/import.json` — what `import.js` wraps, and the way to change the
  translations of a string that already exists. Merges by key; unlisted keys and other languages are
  untouched. Values land **unconfirmed**, which is the normal flow — a human confirms them in the
  web UI later, and there is no API to confirm them.
- `POST /project_resources/base_strings.json` — add a string. **Accepts
  `translations: { fr: "...", … }`, but only at creation.** Omitted languages get machine-translated.
- `PATCH /project_resources/base_strings.json` — base string only. `id` is an **object**,
  `{ namespace, key }`; a string `id` 422s with "Incorrect format for 'id'". A `translations` field
  is **silently ignored**: 200, nothing changed.
- `DELETE /project_resources/base_strings.json` — same object `id`, and returns **204**, not 200.
  Don't gate a follow-up call on `status === 200`.
- `POST /project_resources/base_strings/bulk_create.json` — create-only. An existing key returns 200
  with `{"base_strings_invalid_values":["<key>"]}` and writes nothing.
- `GET /project_resources/project.json` — project settings. Ours has
  `mcp_prefer_agent_translations: true`, so **supply translations when adding a string**. Add one
  without them and every language is machine-translated: that is how `common:more` first arrived with
  French "En savoir plus" ("learn more") on a show-more button.
- `GET /project_resources/languages.json` — `full_code` matches the `public/locales/<code>` folder
  names. 27 targets plus English.
- `GET /project_resources/translations/<lang>/<namespace>.json` — read one locale back without a full
  pull. `confirmed_only=true` is **silently ignored here** and returns everything, which looks like a
  fully-confirmed locale; use the MCP's `get_translation_json` with `confirmedOnly` for that.

**Do not fix an existing translation by deleting and re-POSTing the string.** It works, but it throws
away every confirmed translation on it, and re-sending only the languages you care about lets
i18nexus re-machine-translate the rest. Reads also lag writes by ~10–30s, so poll rather than
checking once.

### Choosing a key

Prefer `common` for any string a second page might want: it is loaded on every page, so it costs
nothing extra. A namespace added to a page's `serverSideTranslations` is serialised into that page's
`__NEXT_DATA__` for every locale — pulling `home` onto the asset page to reuse one word cost 2.5 KB
(en) / 3.0 KB (de) per page view, and German asset pages already sit at Next's 128 KB warning
threshold.

Reusing an existing key across contexts has a second cost: a translator retuning it for the original
context silently changes it everywhere else it is used.
