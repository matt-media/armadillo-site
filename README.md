# armadillosafety.ai

A single-page site for Armadillo: the product demos, the KORA benchmark results, the
validation plan, and a contact form.

```
index.html              the whole page
assets/css/styles.css   all styling
assets/js/main.js       slideshow, charts, popup, form
assets/img/demos/       12 demo screenshots (4 scenarios x 3 models)
assets/img/            validation-plan.webp, favicon.svg
apps-script/Code.gs     the form backend — paste this into Google Apps Script
CNAME                   tells GitHub Pages the custom domain
.nojekyll               stops GitHub from running Jekyll over the files
```

The charts in the benchmark section are live HTML, not images. The first two show the
failing / adequate / exemplary breakdown as stacked bars; the third shows paired
failure rates by risk category. To update a number, edit the `style="--w:89.6%"` value
on the segment and the matching figure in the `<ul class="grades">` list (or the
`<span class="bar__val">` on the paired chart). Nothing else needs to change.

---

## Part 1 — the form backend (do this first)

The site is static, so it can't send email by itself. A Google Apps Script bound to a
Sheet does both jobs: it logs every submission, and emails you when someone wants a
follow-up. Free, no third-party service, about five minutes.

**1. Make the Sheet.** Signed in as `armadilloaisafety@gmail.com`, create a new Google
Sheet called `Armadillo signups`. Copy its ID out of the address bar — it's the long
string between `/d/` and `/edit`.

**2. Open the script.** In that Sheet: **Extensions → Apps Script**. Delete whatever is
in `Code.gs` and paste in the contents of `apps-script/Code.gs` from this repo. Replace
`PASTE_YOUR_SHEET_ID_HERE` with the ID from step 1. Save.

**3. Authorize it.** Pick `setup` from the function dropdown and hit Run. Google will
ask for permission and then warn you the app isn't verified — that's expected for your
own script. Click **Advanced → Go to (project name)**, then **Allow**. The Sheet should
now have a `Signups` tab with a header row.

**4. Deploy it.** **Deploy → New deployment**. Click the gear, choose **Web app**, then:

- Description: `armadillo form`
- Execute as: **Me**
- Who has access: **Anyone**

Deploy, and copy the web app URL. It ends in `/exec`.

> "Anyone" means anyone can POST to the endpoint, not that anyone can see your Sheet.
> The honeypot field in the form filters out the bots that find it.

**5. Wire it up.** Near the bottom of `index.html`:

```js
window.ARMADILLO_CONFIG = {
  endpoint: "https://script.google.com/macros/s/AKfy.../exec"
};
```

**6. Check it.** Paste the `/exec` URL into a browser tab. You should see
`{"ok":true,"service":"armadillo form endpoint"}`. If you get a login page instead, the
deployment isn't set to "Anyone" — go back to step 4.

**If you ever edit `Code.gs`:** changes don't go live until you redeploy.
**Deploy → Manage deployments →** pencil icon **→ Version: New version → Deploy.** Same
URL, new code. This trips up everyone once.

---

## Part 2 — GitHub Pages

**1. New repository.** Public, any name (`armadillo-site` works). Public is required
for Pages on a free account.

**2. Upload.** Drag the *contents* of this folder into the repo, not the folder itself
— `index.html` has to sit at the top level. Commit.

**3. Turn on Pages.** **Settings → Pages →** Source: **Deploy from a branch**, Branch:
`main`, folder: `/ (root)`. Save. A minute later the site is live at
`https://<you>.github.io/armadillo-site/`.

**4. Custom domain.** In the same Pages settings, enter `armadillosafety.ai` under
Custom domain and save. The `CNAME` file in this repo already says the same thing, so
they'll agree.

**5. DNS at your registrar.** Add these records for `armadillosafety.ai`:

| Type  | Name | Value |
|-------|------|-------|
| A     | `@`  | `185.199.108.153` |
| A     | `@`  | `185.199.109.153` |
| A     | `@`  | `185.199.110.153` |
| A     | `@`  | `185.199.111.153` |
| CNAME | `www`| `<you>.github.io` |

Four separate A records, all on `@`. DNS usually settles in 10–30 minutes.

**6. HTTPS.** Once GitHub verifies the domain, tick **Enforce HTTPS** on the Pages
settings page. The certificate can take up to an hour to issue; if the checkbox is
greyed out, come back later.

### Updating the site later

Edit the file in GitHub's web editor and commit, or push from your machine. Every
commit is a version you can roll back to — **History** on any file shows what changed
and when.

---

## Things worth knowing

- **The popup** shows once per visitor and then stays quiet for 30 days. It's stored in
  the browser's `localStorage`, so it reappears in a different browser or after someone
  clears their data. It also stays hidden if someone arrives on a deep link like
  `armadillosafety.ai/#contact`.
- **The update-list checkbox** controls one thing: whether you get an email. Every
  submission lands in the Sheet either way, tagged `Updates only` or
  `Wants a follow-up`.
- **Email quota.** A free Gmail account can send 100 Apps Script emails a day. You will
  not get near it.
- **Testing the form locally** won't work by opening `index.html` from your desktop —
  browsers block the request from a `file://` page. Run `python3 -m http.server` in this
  folder and visit `localhost:8000`, or just test it once it's on Pages.
- **Images** are WebP at 88% quality, roughly a third the size of the original PNGs. To
  swap one, export at 1920×1080 and keep the same filename.
