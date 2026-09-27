# جسر الوصول لحل مشكلة الرسوب

A responsive revision, memorisation and quiz website for **التاريخ الإسلامي** (Islamic History).

## What changed in v3

- **Renamed** from "IUS AND SONS" to **جسر الوصول لحل مشكلة الرسوب** everywhere (title, header, footer, meta tags).
- **Term selection added.** Home page now walks the student through: **Term → Topic → Mode**.
  - الفصل الأول (First Term): 06 الخلفاء الراشدون (24), 07 قيام الدولة الأموية (5)
  - الفصل الثاني (Second Term): no topics yet — shown as "coming soon" (edit `TERMS` in `questions.js` once you have them)
  - الفصل الثالث (Third Term): 01 الدولة الأموية في الأندلس (8), 02 عبد الرحمن الداخل (11), 03 عبد الرحمن الأوسط (9), 04 عبد الرحمن الناصر (17), 05 انهيار الدولة في الأندلس (9)
  - All topics belong to one subject: **التاريخ الإسلامي**.
- **Full paper mode.** Selecting a topic + a study mode now shows *every* question in that topic on one scrollable "paper" — no more one-question-at-a-time. Answer everything, tap **تصحيح الورقة / Mark paper**, and see every question marked in place plus a full score summary. Works across all three modes (choice, typing, revision).
- **Boot / splash video.**
  - Portrait video (`intro-portrait.mp4`) plays on phones/tablets held in portrait.
  - Landscape video (`intro-landscape.mp4`) plays on desktop or phones/tablets held in landscape.
  - Detected automatically via screen orientation; plays once per browser session; has a skip button; falls back safely if autoplay is blocked.
- Arabic/English switch for the **website interface only**; quiz content stays in Arabic.
- Local progress tracking with localStorage (unchanged).

## Files

- `index.html` – markup
- `style.css` – styling
- `app.js` – all logic (term/topic/mode wizard, full-paper quiz engine, i18n, boot splash)
- `questions.js` – the question bank (`QUESTIONS`) plus new `TOPIC_META` and `TERMS` metadata
- `intro-portrait.mp4`, `intro-landscape.mp4` – boot/splash videos (converted from the supplied .mov files to H.264 for broad browser support)

## Editing terms/topics

Open `questions.js` and edit the `TERMS` array at the bottom:

```js
const TERMS = [
  { id: 'first',  ar: 'الفصل الأول',  en: 'First Term',  topics: ['06', '07'] },
  { id: 'second', ar: 'الفصل الثاني', en: 'Second Term', topics: [] },
  { id: 'third',  ar: 'الفصل الثالث', en: 'Third Term',  topics: ['01', '02', '03', '04', '05'] }
];
```

Each entry in `topics` is a topic `code` from `TOPIC_META` (also at the bottom of `questions.js`). To populate Second Term, just move or add codes to its `topics` array.

## Run

Open `index.html` directly, or deploy all files (including the two `.mp4` files) to GitHub Pages. No database or server is required.

## v5 update

- **Second Term is now live**: added "الفترة الثانية" (73 questions — Abbasid–Byzantine wars, the decline of the Abbasid state, Islamic civilization under the Abbasids, and the states that broke from the caliphate) under الفصل الثاني. It was previously an empty placeholder term; it now has real content, no cloud setup required.
- **New: `library.html`** — "مكتبة جسر الوصول لحل مشكلة الرسوب", a public page (linked from the header) listing 6 reference PDFs grouped by educational stage:
  - **الابتدائية**: تحفة الأطفال والغلمان (Tajweed poem), and the author's own Grade 6 Tajweed booklet
  - **الإعدادية**: the author's original History booklet — the actual source the site's Islamic History question bank was built from
  - **الثانوية**: three university-level Arabic Balagha texts (علم البيان / المعاني / البديع) by Dr. Mohammed Kalo
  - All 6 files live in `/library/` and download directly, no login needed.


## Accounts and Platform Admin

`login.html` now provides a complete account screen:
- Sign up: **Name + Email + Password**
- Login: **Email + Password**
- **Continue with Google** (Google must be enabled in Supabase Authentication → Providers)
- Existing users are sent to the school setup/dashboard flow.

`admin.html` is the platform-owner control panel. It is protected by the Supabase `platform_admins` table; the Admin password is never stored in the public JavaScript.

### Create the owner Admin
1. In Supabase → Authentication → Users, create a user with:
   - Email: `admin@jisralwusool.local`
   - Password: `Assalaamalaikum`
2. Run the final Admin mapping SQL in `schema-additions.sql`.
3. Open `admin.html` and enter the name **Admin** and the password above.

Do not create a front-end password check for Admin. The real Supabase Auth account + `platform_admins` role is what protects the control panel.
