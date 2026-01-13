---
description: Pre-deployment checklist for AdSense approval, SEO optimization, AI search visibility, and marketing readiness
---

# Production Deployment Compliance Checklist

**⚠️ MANDATORY: Complete this checklist before EVERY production deployment.**

This guide documents requirements for AdSense approval, SEO optimization, AI search visibility, and marketing readiness based on lessons learned from HearthIQ, SubFree, and PuzzlyNest rejections.

---

## 🔴 CRITICAL: AdSense Rejection Prevention

### Common Rejection Reasons (Experienced)

| Rejection Type | Description | Projects Affected |
|----------------|-------------|-------------------|
| Low Value Content | Insufficient original content | All |
| Broken Layout | Empty ad placeholders visible | PuzzlyNest |
| Policy Violation | Misleading claims, false guarantees | HearthIQ |
| Insufficient Content | Not enough pages/articles | SubFree |
| Navigation Issues | Broken links, missing pages | All |

---

## ✅ Pre-Deployment Checklist

### 1. Legal Pages (MANDATORY)

- [ ] **Privacy Policy** exists at `/privacy`
  - [ ] States correct jurisdiction (India, NOT Germany)
  - [ ] Lists all third-party services used (Google Analytics, AdSense)
  - [ ] Explains cookie usage
  - [ ] Includes data collection details
  - [ ] Has last updated date
  - [ ] Contact email matches site-wide email

- [ ] **Terms of Service** exists at `/terms`
  - [ ] Matches business entity details
  - [ ] No placeholder text
  - [ ] Jurisdiction matches Privacy Policy

- [ ] **Contact Page** exists at `/contact`
  - [ ] Real email address (e.g., `solutions@coredrivn.com`)
  - [ ] NO German/fake addresses
  - [ ] Contact form works (if present)
  - [ ] Response time expectation stated

- [ ] **About Page** exists at `/about`
  - [ ] Explains what the site does
  - [ ] Team/company information
  - [ ] No placeholder content

### 2. Content Quality (MANDATORY)

- [ ] **Minimum 5 original blog articles** at `/blog`
  - [ ] Each article minimum 800+ words
  - [ ] Original content (not copied)
  - [ ] Relevant to site topic
  - [ ] Properly formatted with headings (H1, H2, H3)
  - [ ] Contains images where appropriate
  - [ ] Author attribution (optional but recommended)

- [ ] **No placeholder text anywhere**
  - [ ] Search entire codebase for "Lorem ipsum"
  - [ ] Search for "TODO", "FIXME", "placeholder"
  - [ ] Search for "example.com" URLs
  - [ ] Search for "test@" email addresses

- [ ] **No empty sections**
  - [ ] All cards/boxes have real content
  - [ ] No "Coming Soon" without explanation
  - [ ] No broken images

### 3. Ad Placement Compliance (MANDATORY)

- [ ] **No visible "Advertisement" labels without ads**
  - [ ] Remove all ad placeholder text
  - [ ] No empty ad containers with borders
  - [ ] Ad components should be invisible when no ad loads

- [ ] **Ad density compliance**
  - [ ] No more than 3 ad units per page
  - [ ] Ads don't dominate above-the-fold content
  - [ ] Content-to-ad ratio is appropriate

- [ ] **Ad implementation**
  ```tsx
  // CORRECT: Hidden when no ad
  {adLoaded && <div className="ad-container">...</div>}
  
  // WRONG: Visible empty placeholder
  <div className="ad-container">Advertisement</div>
  ```

### 4. Factual Accuracy (MANDATORY)

- [ ] **No false/misleading claims**
  - [ ] No "guaranteed savings" statements
  - [ ] No "100% accurate" claims
  - [ ] No unverifiable statistics
  - [ ] No fake testimonials

- [ ] **Disclaimers present where needed**
  - [ ] Affiliate disclosure (if applicable)
  - [ ] "Prices may vary" disclaimers
  - [ ] "For informational purposes only"
  - [ ] Data accuracy disclaimers

- [ ] **No COPPA compliance claims** (if using Analytics/AdSense)
  - [ ] These services use persistent identifiers
  - [ ] Cannot claim COPPA compliance with them enabled

### 5. Navigation & UX (MANDATORY)

- [ ] **All navigation links work**
  - [ ] Header links functional
  - [ ] Footer links functional
  - [ ] Internal page links functional
  - [ ] No 404 errors

- [ ] **Footer contains required links**
  - [ ] Privacy Policy
  - [ ] Terms of Service
  - [ ] Contact
  - [ ] Copyright notice with correct year

- [ ] **Mobile responsive**
  - [ ] Test on mobile viewport
  - [ ] No horizontal scrolling
  - [ ] Touch targets adequate size

---

## 🔍 SEO Requirements

### Technical SEO

- [ ] **Sitemap exists** at `/sitemap.xml`
  - [ ] All public pages included
  - [ ] Blog articles included
  - [ ] Legal pages included
  - [ ] No 404 URLs in sitemap
  - [ ] `lastmod` dates are current

- [ ] **robots.txt exists** at `/robots.txt`
  ```
  User-agent: *
  Allow: /
  Sitemap: https://yourdomain.com/sitemap.xml
  ```

- [ ] **Meta tags on every page**
  ```tsx
  export const metadata = {
    title: "Unique Page Title | Brand Name",
    description: "Compelling 150-160 char description with keywords",
    keywords: ["relevant", "keywords"],
    openGraph: {
      title: "...",
      description: "...",
      images: ["/og-image.png"],
    },
  };
  ```

- [ ] **Structured Data (JSON-LD)**
  - [ ] Organization schema on homepage
  - [ ] Article schema on blog posts
  - [ ] BreadcrumbList on subpages
  - [ ] FAQ schema where applicable

### Content SEO

- [ ] **Every page has unique H1**
- [ ] **Heading hierarchy** (H1 → H2 → H3, not skipping)
- [ ] **Alt text on all images**
- [ ] **Internal linking** between related pages
- [ ] **External links** to authoritative sources (opens in new tab)

---

## 🤖 AI Search Visibility

### For ChatGPT, Perplexity, Claude, etc.

- [ ] **Clear, factual content** (AI prioritizes accuracy)
- [ ] **Structured data** (helps AI understand content)
- [ ] **FAQ sections** (commonly scraped by AI)
- [ ] **Definitive statements** where appropriate
- [ ] **Updated dates** on content (freshness signal)

### Schema.org Implementation

```tsx
// Homepage - Organization
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BrandName",
  "url": "https://yourdomain.com",
  "logo": "https://yourdomain.com/logo.png",
  "sameAs": ["https://twitter.com/...", "https://linkedin.com/..."]
}
</script>

// Blog Article
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": {"@type": "Person", "name": "Author Name"},
  "datePublished": "2026-01-05",
  "dateModified": "2026-01-05"
}
</script>
```

---

## 📢 Marketing Readiness

### Social Presence

- [ ] **Open Graph images** (1200x630px)
- [ ] **Twitter Card meta tags**
- [ ] **Favicon** in multiple sizes
- [ ] **Apple Touch Icon**

### Analytics

- [ ] **Google Analytics 4** configured
  - [ ] Correct property ID
  - [ ] Events tracking key actions
  - [ ] No PII in custom dimensions

- [ ] **Google Search Console**
  - [ ] Domain verified
  - [ ] Sitemap submitted
  - [ ] Key pages indexed

### Conversion Optimization

- [ ] **Clear Call-to-Action** on homepage
- [ ] **Value proposition** visible above fold
- [ ] **Trust signals** (testimonials, badges) if real
- [ ] **Loading performance** < 3s on mobile

---

## 🔧 Verification Commands

### Search for Placeholder Content
```powershell
# In project directory
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.jsx,*.js,*.html,*.css | 
  Select-String -Pattern "lorem|placeholder|TODO|FIXME|example\.com|test@" -CaseSensitive:$false
```

### Verify Sitemap Contains All Routes
```powershell
# Fetch and display sitemap
curl https://yourdomain.com/sitemap.xml
```

### Check for 404s on Key Pages
```powershell
$pages = @("/", "/blog", "/privacy", "/terms", "/contact", "/about")
foreach ($page in $pages) {
    $status = (Invoke-WebRequest -Uri "https://yourdomain.com$page" -Method Head).StatusCode
    Write-Host "$page : $status"
}
```

### Validate Structured Data
Visit: https://search.google.com/test/rich-results

---

## 📋 Pre-Deployment Sign-Off

Before deploying to production, confirm:

```
Date: _______________
Project: _______________
Deployer: _______________

☐ All Legal Pages verified
☐ Minimum 5 blog articles published
☐ No placeholder text found
☐ No empty ad containers
☐ All claims are factual
☐ Sitemap is current
☐ Structured data validated
☐ Mobile responsive verified
☐ All links working

Ready for Production: YES / NO
```

---

## 🚨 Common Mistakes to Avoid

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Empty ad placeholders | Broken layout rejection | Hide components when no ad |
| "Guaranteed savings" claims | Policy violation | Use "potential" or "estimated" |
| COPPA compliance claim | False claim penalty | Remove if using GA/AdSense |
| German address on Indian site | Jurisdiction confusion | Use correct business address |
| Outdated blog dates | Stale content perception | Update or remove dates |
| Fake testimonials | Trust violation | Use real or remove |
| "Coming Soon" everywhere | Low value content | Have real content or remove |

---

## 📅 Post-Deployment

After successful deployment:

1. **Submit to Google Search Console**
   - Request indexing for homepage
   - Request indexing for key pages
   - Monitor for crawl errors

2. **Apply for AdSense**
   - Wait 24-48 hours after deployment
   - Ensure all pages are indexed
   - Application takes 1-14 days

3. **Monitor**
   - Check Google Analytics for traffic
   - Monitor Search Console for issues
   - Track Core Web Vitals

---

## Files Updated: 2026-01-05

Based on lessons learned from:
- HearthIQ (gethearthiq.com) - Content compliance audit
- SubFree (subfree.io) - Ad placement issues
- PuzzlyNest (puzzlynest.com) - Legal page issues, COPPA claims
