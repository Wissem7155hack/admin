const fs = require('fs');
const file = 'src/components/AppBuilder/ProductsTab.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /import \{ useTreatments, TreatmentRecord, useTeamMembers[\s\S]*?from '\.\.\/\.\.\/hooks\/useSupabaseData';/,
  "import { useTreatments, TreatmentRecord, useTeamMembers, uploadToBucket } from '../../hooks/useSupabaseData';"
);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed import in ProductsTab.tsx');
