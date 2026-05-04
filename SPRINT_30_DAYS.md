# Chingu — 30-Day Revenue Sprint

**Target: $500–$2,000 in real dollars by Day 30.**
**Realistic: $200–$800 if execution is consistent.**
**Floor: $50 (still beats most extensions in their first month).**

This is the aggressive plan. Based on real Starter Story / Indie Hackers cases:

- **Saeed Ezzati** ($20K/mo Superpower ChatGPT): made his **first dollars from a newsletter**, not the extension. Paid sponsor in Week 2.
- **Easy Folders** ($3.7K MRR in 6mo): lifetime deals + Product Hunt drove 80% of revenue.
- **Web Highlights**: organic SEO + freemium, 100K users over time.
- **Eightify** ($45K/mo): Twitter + ProductHunt blast at launch.

The pattern: **monetize the audience before the product**. Open source builds the audience.

---

## Three revenue rails (all running in parallel)

### Rail 1: Lifetime Pro ($29 one-time) — REAL DOLLARS THIS WEEK

**What:** A `Pro` tier that costs $29 one-time, lifetime access. People who like Chingu can lock in every future paid feature for the price of one Scribe seat-month.

**How:**
1. **Stripe Payment Link** — set up a $29 product, get a `buy.stripe.com/...` URL. 5 minutes.
2. Update `pro.html` (already in repo) — replace `REPLACE_WITH_PAYMENT_LINK` with the real Stripe URL.
3. Push to GitHub Pages — already enabled, will serve at `21428122.github.io/chingu/pro.html`.
4. The `⭐ Get Pro` button is already in the popup footer + viewer top bar.

**Realistic conversion:**
- 200 installs × 1.5% conversion = 3 Pro sales = $87
- 500 installs × 2% conversion = 10 Pro sales = $290
- Stretch: 1,500 installs × 2.5% conversion = 37 sales = $1,073

**Why lifetime works:** No subscription decision. Tool buyers prefer one-time. Founder pricing creates urgency. ($29 not $99 because launching empty — too high gets ignored, too low signals weakness.)

---

### Rail 2: Donations (Buy Me Coffee + GitHub Sponsors) — TIPS THIS WEEK

**What:** Two donate buttons. Buy Me Coffee for one-time tips ($3–$10). GitHub Sponsors for monthly recurring.

**How:**
1. Sign up at **buymeacoffee.com/chingu** (5 min, no fees up to $10/mo)
2. Sign up at **github.com/sponsors/21428122** (waitlist, can take a week — start now)
3. Already linked in popup footer + pro.html

**Realistic:**
- 1 tip per week at $5 = $20/month
- 1 GitHub Sponsor at $10/month recurring
- Floor: $30/month, no upside but no work

This is gravy. Don't optimize. Just have the link there.

---

### Rail 3: Newsletter sponsorship (Saeed's playbook) — BIGGER DOLLARS BY DAY 30

**What:** Start a weekly newsletter NOW. Even with 0 subscribers. By Day 30 you should have 100–500 subscribers (every Chingu user gets prompted to subscribe). At 200+ subscribers, **SaaS tools will pay $50–$200 to sponsor a single email** in a niche dev/ops audience.

**How:**
1. **Sign up at beehiiv** (free up to 2,500 subscribers)
2. Create newsletter: "**The SOP Stack** — weekly notes from a solo dev building open source documentation tools"
3. Add a `Subscribe to The SOP Stack` link in:
   - popup footer
   - viewer top bar
   - "Made with Chingu" link in PDF/Markdown footer
4. **Issue 1 (Day 1):** "Why I'm building Chingu in public" — story-driven, your journey
5. **Issue 2 (Day 8):** "Scribe vs Chingu — a brutally honest comparison" (drives conversion)
6. **Issue 3 (Day 15):** "How to write SOPs that nobody hates" — actually useful content
7. **Issue 4 (Day 22):** "Inside a Chrome extension launch — Week 3 numbers" — transparent metrics
8. **Issue 5 (Day 29):** "First Pro customer story" — social proof

**Sponsorship pitch (start sending Day 22):**
- Target: 5 SaaS tools that benefit from being documented in SOPs (Slack, Notion, Stripe, Vercel, Linear, Figma, Loom alternatives)
- Pitch: "I'm building Chingu, a Chrome extension for SOPs. My first 'Made with Chingu' guide will document YOUR product. 5,000 dev/ops readers will see it. $200 to sponsor."
- Realistic: 1 sponsor at $200 in Month 1

---

## The day-by-day execution

### Day 1 (TODAY)
- [ ] Create Stripe account, set up $29 Pro product, get Payment Link URL
- [ ] Replace `REPLACE_WITH_PAYMENT_LINK` in `pro.html`
- [ ] Push to GitHub
- [ ] Sign up beehiiv, claim "thesopstack.com" or use beehiiv subdomain
- [ ] Sign up buymeacoffee.com/chingu
- [ ] Apply to GitHub Sponsors
- [ ] Build & upload v0.4.0 to Chrome Web Store
- [ ] Update store listing with new SEO title/description (already prepared in STORE_LISTING.md)

**End of Day 1: monetization infrastructure live. Ready to receive first dollar.**

### Day 2
- [ ] Write & send Newsletter Issue 1: "Why I'm building Chingu in public"
- [ ] Add subscribe link to popup, viewer, PDF footer
- [ ] Tweet thread: "I just shipped a free open source Scribe alternative. Here's how it compares to all 20 SOP tools on the market." (use the competitive table from MASTER_PLAN)
- [ ] Post on r/SideProject

### Day 3
- [ ] Post on Indie Hackers — full launch story
- [ ] DM 10 people in your network (LinkedIn / Twitter)
- [ ] Submit to ProductHunt for **Day 8 launch** (PH lets you schedule)

### Day 4
- [ ] Post on r/selfhosted: "I built an open source SOP tool — alternative to Scribe"
- [ ] Post on r/opensource
- [ ] Reach out to 3 SaaS Slack/Discord communities (Indie Hackers, MicroConf, etc.)

### Day 5
- [ ] **Hacker News Show HN** — Tuesday morning (US time) for best ranking
- [ ] Title format: "Show HN: Chingu — Free open source Chrome extension for SOPs (Scribe alternative)"
- [ ] First comment: a personal story about why you built it (not a feature list)

### Day 6
- [ ] Reach out to 5 YouTubers/bloggers in productivity/ops space
- [ ] Subject: "Built a free open source Scribe alternative — would love your feedback"
- [ ] No payment, just the offer to help them

### Day 7
- [ ] **Newsletter Issue 2** if you have 20+ subscribers
- [ ] **First Pro sale check.** Even 1 = success.

### Day 8 — PRODUCT HUNT LAUNCH
- [ ] Post goes live at 12:01am PT
- [ ] Tweet from @21_4281_22 every 2 hours
- [ ] Reply to every comment within 30 min
- [ ] DM your network with the link
- [ ] Goal: top 5 of the day = 200+ extra installs

### Day 9–14
- [ ] Build the **first "Made with Chingu" public guide** — pick a high-traffic workflow
- [ ] Publish to chingu.dev/guides/[slug]
- [ ] SEO target: "How to set up Stripe webhooks step by step"
- [ ] Newsletter Issue 3: useful content piece
- [ ] Reach out to 5 more potential sponsors

### Day 15–21
- [ ] Build 4 more "Made with Chingu" guides (1 per day)
- [ ] Newsletter Issue 4: transparent week-3 metrics
- [ ] First sponsorship pitch sent (target: $200 newsletter sponsor)
- [ ] Apply to **AppSumo Lifetime Deal** (60-day deal can generate $2K–$10K in a single launch)

### Day 22–30
- [ ] Newsletter Issue 5: first Pro customer story
- [ ] Lock in first newsletter sponsor
- [ ] Submit to **PitchGround** (alternative LTD marketplace)
- [ ] Twitter thread: "30 days of building Chingu in public — what worked, what didn't"
- [ ] Calculate Day 30 numbers honestly

---

## Day 30 success criteria

| Metric | Floor | Target | Stretch |
|---|---|---|---|
| Chrome installs | 200 | 500 | 1,500 |
| Newsletter subs | 50 | 200 | 600 |
| Twitter followers | +50 | +200 | +500 |
| Pro lifetime sales | 0 | 5 ($145) | 30 ($870) |
| BMC tips | $5 | $30 | $80 |
| Newsletter sponsor | 0 | 0 | 1 ($200) |
| **TOTAL REVENUE** | **$5** | **$175** | **$1,150** |

If you hit `Floor`, you're learning. If you hit `Target`, you're winning. If you hit `Stretch`, you're on the trajectory of a real business.

---

## What NOT to build in these 30 days

- Cloud sync infrastructure
- AI-powered features
- Team workspaces
- Self-hosted backend
- Desktop app

Every hour spent building is one not spent talking to users / writing newsletter / pitching sponsors. **The product is good enough. The audience is what's missing.**

The Pro tier is **selling future features, not present ones.** Founders pricing exists exactly because the buyer knows they're buying ahead. That's the deal — they get founders pricing, you get runway to build.

---

## The mental model

You are not building a SaaS company in 30 days.
You are building a **vehicle that can produce a few hundred dollars of real revenue every month while you build the actual SaaS company.**

That few hundred dollars is what proves the model works.
Then you scale.

The Saeed Ezzati move: **monetize the audience before the product.** Newsletter sponsors fund development. Lifetime deals fund infrastructure. Cloud subscriptions come once you have signal.

This is the path. Execute one day at a time.
