const fs = require('fs');
const path = require('path');

// 1. Fix ProductsTab.tsx
const productsFile = path.join(__dirname, '..', 'src', 'components', 'AppBuilder', 'ProductsTab.tsx');
let prodContent = fs.readFileSync(productsFile, 'utf8');

// Add X to lucide-react imports
prodContent = prodContent.replace(
  '  GripVertical,\n} from \x27lucide-react\x27;',
  '  GripVertical,\n  X,\n} from \x27lucide-react\x27;'
);

// Add uploadToBucket to hooks import
prodContent = prodContent.replace(
  "from '../../hooks/useSupabaseData';",
  "uploadToBucket,\n} from '../../hooks/useSupabaseData';"
);
prodContent = prodContent.replace(
  "import { useTreatments, TreatmentRecord, useTeamMembers uploadToBucket,",
  "import { useTreatments, TreatmentRecord, useTeamMembers, uploadToBucket"
);

fs.writeFileSync(productsFile, prodContent, 'utf8');
console.log('Fixed ProductsTab.tsx');

// 2. Fix MembershipPhonePreviewContent.tsx
const phoneFile = path.join(__dirname, '..', 'src', 'components', 'AppBuilder', 'MembershipPhonePreviewContent.tsx');
let phoneContent = fs.readFileSync(phoneFile, 'utf8');

// Insert bonus banner right before Intro Section
const targetIntro = '{/* Intro Section (Photo 1) */}';
const bonusBanner = `{/* Sign-up Bonus Banner */}
      {giftCallout && (
        <div className="mx-4 mt-3 mb-1 p-2.5 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/80 rounded-xl flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-pink-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Gift size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[8px] font-extrabold uppercase text-pink-600 tracking-wider">Sign-up Bonus</span>
            <p className="text-[9px] font-semibold text-slate-800 leading-tight truncate">{giftCallout}</p>
          </div>
        </div>
      )}

      {/* Intro Section (Photo 1) */}`;

phoneContent = phoneContent.replace(targetIntro, bonusBanner);
fs.writeFileSync(phoneFile, phoneContent, 'utf8');
console.log('Fixed MembershipPhonePreviewContent.tsx');
