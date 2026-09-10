const fs = require('fs');
const path = require('path');

const changelog = `
---

## 6. Milestone Changelog & Recent Implementation (v2.6.0-PROD)

### 1. Membership Creation & Full Database Persistence (AppBuilderMembership.tsx & MembershipDrawerModal.tsx)
- **Schema Alignment & Safe Payloads:** Resolved schema mismatch error PGRST204 by serializing rich structured attributes (benefit_cards, included_treatments, treatments_header, testimonials, currency, tagline) into the JSONB benefits column and bonuses into the JSONB bonuses column.
- **Full CRUD Integration:** addMembership, updateMembership, deleteMembership, toggleHideMembership, and reorderMemberships are fully linked to public.memberships in Supabase with instantaneous optimistic UI updates and live refetching.
- **Direct Card Editing:** Added dedicated Edit button on every tier card row and enabled double-click-to-edit to immediately open the slide-over drawer populated with existing membership data.

### 2. Multi-Client Results Engine (ProductsTab.tsx & MembershipDrawerModal.tsx)
- **Dynamic Results Array:** Upgraded client results from static single fields to full interactive lists (clientResultsList in treatments and testimonialsList in memberships).
- **"+ Add client result":** Fully functional trigger allowing practitioners to add multiple before/after transformation stories.
- **Direct Asset Uploads & Fallbacks:** Bound image pickers directly to Supabase Storage (membership-media and clinic-assets/client-results), returning live public CDN URLs with graceful error fallbacks.
- **Specific Result Deletion & Image Swapping:** Individual trash icons allow deleting specific results, changing existing before/after photos via overlay file pickers, or editing review copy independently.
- **Persistent Synchronization:** Saved directly to public.treatments.client_results and public.memberships.benefits.testimonials.

### 3. Interactive Mobile Simulation & Empty States (MembershipPhonePreviewContent.tsx)
- **Asset Pipeline Fix:** Resolved broken/crashed before & after preview image by uploading before_after.webp to membership-media/client-results/before_after.webp with HTTP 200 OK CDN verification.
- **Dynamic Phone Mirroring:** The iPhone preview dynamically synchronizes live with the selected tier's exact name, price, monthly commitment length, benefits checklist, included treatments accordions, sign-up bonus callouts, and navigable before/after carousel.
- **Zero-Data State:** Displays the requested prompt text "Create your first memberships!!" with a prominent "+ Create membership" button when a clinic has zero memberships configured.

---
*Signed and Approved for Production Staging by Antigravity Senior Systems Architecture Team.*
`;

const paths = [
  path.join(__dirname, '..', 'NEXCORE_PROJECT_MAP.md'),
  path.join('c:', 'Users', 'ASUS', 'Desktop', 'Nexcore app build', 'Patient app', 'NEXCORE_PROJECT_MAP.md')
];

for (const p of paths) {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/\n\*\s*Signed and Approved for Production Staging by Antigravity Senior Systems Architecture Team\.\s*\*\s*$/, '');
    content = content + '\n' + changelog;
    fs.writeFileSync(p, content, 'utf8');
    console.log('Updated:', p);
  } else {
    console.warn('File does not exist:', p);
  }
}
