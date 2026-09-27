# جسر الوصول — Setup Guide (combined system)

This site now has two layers:

1. **The public site** (`index.html`) — works out of the box with the built-in
   question bank (173 questions now, across 3 terms — including the new
   "الفترة الأولى" / Abbasid Caliphate topic). No setup required for this part.
2. **The cloud layer** (Supabase) — lets a school admin log in, add new
   subjects/topics/questions for any term, and upload PDFs, which then show
   up live on the public site for every visitor.

Your Supabase project is already created and its keys are already in
`supabase.js`. Here's what's left to do.

## 1. Run the SQL

In Supabase → SQL Editor → New query, paste and run **`schema-additions.sql`**.
This only *adds* a new `pdf_resources` table + a `pdfs` storage bucket + a
couple of public-read policies. It does not touch your existing
`schools` / `school_members` / `terms` / `topics` / `questions` tables.

## 2. Create (or reuse) your school

Open `login.html` → sign up → you'll land on `setup.html`. If you haven't
created a school yet, click **Create School** — this now also creates your
3 terms and links topics 06/07 to Term 1 and 01–05 to Term 3 (this was
missing before, so cloud topics silently didn't show up — now fixed).

`setup.html` will show your **School ID**. Copy it.

## 3. Connect the public site to your school

Open **`site-school.js`** and paste your School ID:

```js
export const SITE_SCHOOL_ID = 'paste-your-school-id-here';
```

Once this is set, `index.html` will automatically merge in any topics/
questions you add later from the dashboard, and show a public PDF section —
on top of the built-in 173 questions, never replacing them.

## 4. Manage content

Go to `dashboard.html` (linked from `setup.html`, and from the "دخول
الإدارة" link in the site header once you're logged in):

- **الفصول والمواضيع** — add a new topic/subject and attach it to any term.
- **الأسئلة** — add questions (with the same key-point grading as the
  built-in bank) to any topic.
- **ملفات PDF** — upload a PDF, optionally linked to a subject; it appears
  in the public "ملفات PDF" section immediately.

## 5. Push to GitHub Pages

Upload every file in this folder to your repo root and enable Pages, as
before.

## Files in this package

| File | What it is |
|---|---|
| `index.html`, `app.js`, `style.css`, `questions.js` | the public site |
| `supabase.js` | your Supabase project connection |
| `auth.js`, `school.js` | login/signup, school lookup |
| `term.js` | admin-side term/topic reads (used by dashboard) |
| `classes.js`, `students.js`, `results.js` | class/student/result tracking (built, not yet surfaced in the UI — available for a future step) |
| `cloud-questions.js` | **new** — admin add/delete topic & question |
| `pdfs.js` | **new** — PDF upload/list/delete |
| `public-content.js` | **new** — anonymous public reads for the student-facing site |
| `site-school.js` | **new** — which school's content the public site shows |
| `login.html`, `setup.html`, `dashboard.html` | admin pages (`dashboard.html` is new) |
| `import-questions.html` | one-time: copies the built-in 83 Islamic-History questions into your school's cloud tables (optional — the site already shows them by default without this) |
| `schema-additions.sql` | **new** — run once in Supabase SQL editor |
| `logo.jpg` | your logo, now used as the site favicon + header/footer mark |

## Known limitation

I can't run SQL against your live Supabase project or click through the
signup/dashboard flow myself (no network access from here), so this is
built and syntax-checked, but not end-to-end tested against your live
database. If something doesn't match (e.g. a column name differs from what
these files expect), the browser console will show the Supabase error —
paste it back to me and I'll adjust the query.
