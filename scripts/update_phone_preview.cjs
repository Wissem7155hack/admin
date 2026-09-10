const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'components', 'AppBuilder', 'MembershipPhonePreviewContent.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Update DEFAULT_CLIENT_RESULTS with active 200 OK CDN URL and fallback
content = content.replace(
  /const DEFAULT_CLIENT_RESULTS = \[[\s\S]*?\];/m,
  `const DEFAULT_CLIENT_RESULTS = [
  {
    photoUrl:
      'https://jndcmymcnivessmvzpzc.supabase.co/storage/v1/object/public/membership-media/client-results/before_after.webp',
    text: "The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn't be happier with the results!",
    clientName: 'Sarah M.',
    treatmentTag: 'After 3 months on Refined Method',
  },
  {
    photoUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    text: 'Clearer skin, smaller pores, and effortless daily radiance. Best investment in self care!',
    clientName: 'Elena R.',
    treatmentTag: 'After 6 HydraFacials & Peels',
  },
];`
);

// 2. Update empty state text to exact user requirement
content = content.replace(
  /<h4 className="text-base font-bold text-slate-900 tracking-tight">\s*Create your first membership!?\s*<\/h4>/,
  '<h4 className="text-base font-bold text-slate-900 tracking-tight">Create your first memberships!!</h4>'
);

// 3. Add onError fallback on client results image in carousel
content = content.replace(
  /<img\s+src=\{currentResult\.photoUrl\}\s+alt="Member Result"\s+className="w-full h-full object-cover"\s*\/>/,
  `<img
              src={currentResult.photoUrl || '/images/before_after.webp'}
              onError={(e) => { e.currentTarget.src = '/images/before_after.webp'; }}
              alt="Member Result"
              className="w-full h-full object-cover"
            />`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated MembershipPhonePreviewContent.tsx');
