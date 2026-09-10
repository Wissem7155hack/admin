const fs = require('fs');
const path = require('path');

// 1. Update AppBuilderMembership.tsx
const membershipFile = path.join(__dirname, '..', 'src', 'components', 'AppBuilder', 'AppBuilderMembership.tsx');
let membershipContent = fs.readFileSync(membershipFile, 'utf8');

// Add onDoubleClick on card and an explicit Edit button
membershipContent = membershipContent.replace(
  /onClick=\{\(\) => setSelectedMembershipId\(m\.id\)\}/,
  'onClick={() => setSelectedMembershipId(m.id)}\n                    onDoubleClick={() => openEdit(m)}'
);

membershipContent = membershipContent.replace(
  /\{\/\* 3-Dots Action Menu \*\/\}/,
  `{/* Direct Edit Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(m);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="Edit Membership"
                      >
                        <Pencil size={13} />
                        <span>Edit</span>
                      </button>

                      {/* 3-Dots Action Menu */}`
);

fs.writeFileSync(membershipFile, membershipContent, 'utf8');
console.log('Successfully updated AppBuilderMembership.tsx');

// 2. Update ProductsTab.tsx
const productsFile = path.join(__dirname, '..', 'src', 'components', 'AppBuilder', 'ProductsTab.tsx');
let productsContent = fs.readFileSync(productsFile, 'utf8');

// Fix initial broken image
productsContent = productsContent.replace(
  'https://jndcmymcnivessmvzpzc.supabase.co/storage/v1/object/public/offer-media/memberships/clientResults/176fbed4-f26a-47fb-8af6-39908f8f8a79-before20after.webp',
  'https://jndcmymcnivessmvzpzc.supabase.co/storage/v1/object/public/membership-media/client-results/before_after.webp'
);

// Replace state
productsContent = productsContent.replace(
  /const \[clientResultPhoto, setClientResultPhoto\] = useState\(''\);\s*const \[clientTestimonial, setClientTestimonial\] = useState\(''\);/,
  `interface TreatmentClientResult {
    id: string;
    photoUrl: string;
    testimonial: string;
  }
  const [clientResultsList, setClientResultsList] = useState<TreatmentClientResult[]>([]);
  const [uploadingTreatmentResultId, setUploadingTreatmentResultId] = useState<string | null>(null);`
);

// Replace resetForm lines
productsContent = productsContent.replace(
  /setClientResultPhoto\(''\);\s*setClientTestimonial\(''\);/,
  'setClientResultsList([]);'
);

// Replace openEditDrawer lines
productsContent = productsContent.replace(
  /if \(product\.clientResults && product\.clientResults\.length > 0\) \{\s*setClientResultPhoto\(product\.clientResults\[0\]\.photoUrl \|\| ''\);\s*setClientTestimonial\(product\.clientResults\[0\]\.testimonial \|\| ''\);\s*\}/,
  `if (product.clientResults && product.clientResults.length > 0) {
      setClientResultsList(
        product.clientResults.map((r: any, idx: number) => ({
          id: r.id || (Date.now() + idx).toString(),
          photoUrl: r.photoUrl || r.photo_url || r.image || '',
          testimonial: r.testimonial || r.text || '',
        }))
      );
    } else {
      setClientResultsList([]);
    }`
);

// Add client result handlers right before handleCreateProduct
const handlersCode = `  const handleAddClientResult = () => {
    setClientResultsList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        photoUrl: '',
        testimonial: '',
      },
    ]);
  };

  const handleDeleteClientResult = (id: string) => {
    setClientResultsList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClientResultPhotoUpload = async (id: string, file: File) => {
    try {
      setUploadingTreatmentResultId(id);
      const url = await uploadToBucket('clinic-assets', file, 'client-results');
      setClientResultsList((prev) =>
        prev.map((r) => (r.id === id ? { ...r, photoUrl: url } : r))
      );
    } catch {
      const local = URL.createObjectURL(file);
      setClientResultsList((prev) =>
        prev.map((r) => (r.id === id ? { ...r, photoUrl: local } : r))
      );
    } finally {
      setUploadingTreatmentResultId(null);
    }
  };

  const handleClearClientResultPhoto = (id: string) => {
    setClientResultsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, photoUrl: '' } : r))
    );
  };

  const handleClientResultTestimonialChange = (id: string, text: string) => {
    setClientResultsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, testimonial: text } : r))
    );
  };

  const handleCreateProduct =`;

productsContent = productsContent.replace('  const handleCreateProduct =', handlersCode);

// Update save payloads
productsContent = productsContent.replace(
  /client_results: clientTestimonial \|\| clientResultPhoto \? \[\{ photoUrl: clientResultPhoto, testimonial: clientTestimonial \}\] : \[\],/g,
  'client_results: clientResultsList.filter((r) => r.photoUrl || r.testimonial.trim()),'
);

productsContent = productsContent.replace(
  /clientResults: clientTestimonial \|\| clientResultPhoto \? \[\{ photoUrl: clientResultPhoto, testimonial: clientTestimonial \}\] : undefined,/g,
  'clientResults: clientResultsList.filter((r) => r.photoUrl || r.testimonial.trim()),'
);

productsContent = productsContent.replace(
  /clientResults: clientTestimonial \|\| clientResultPhoto \? \[\{ photoUrl: clientResultPhoto, testimonial: clientTestimonial \}\] : p\.clientResults,/g,
  'clientResults: clientResultsList.filter((r) => r.photoUrl || r.testimonial.trim()),'
);

// Replace Section 3 UI in JSX
const pSec3Start = productsContent.indexOf('{/* Section 3: Client results (optional) (Matching Photo 2) */}');
const pSec4Start = productsContent.indexOf('{/* Section 4: Consultation & Payment options (Matching Photo 2 with iOS Switch) */}');

const newSec3UI = `{/* Section 3: Client results (optional) (Matching Photo 2) */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Client results (optional)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Showcase verified before & after transformations for this treatment</p>
              </div>
              <button
                type="button"
                onClick={handleAddClientResult}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm bg-white"
              >
                <PlusCircle size={14} className="text-slate-500" />
                <span>Add client result</span>
              </button>
            </div>

            {clientResultsList.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-600">No client results added yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Show off before & after transformations to boost bookings</p>
                <button
                  type="button"
                  onClick={handleAddClientResult}
                  className="mt-3 px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  + Add first client result
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {clientResultsList.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Client Result #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteClientResult(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete specific result"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">Before / After photo</label>
                        <div className="border border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center bg-white hover:bg-slate-50 transition-colors min-h-[120px] relative overflow-hidden group shadow-2xs">
                          {item.photoUrl ? (
                            <>
                              <img
                                src={item.photoUrl}
                                onError={(e) => { e.currentTarget.src = '/images/before_after.webp'; }}
                                alt="Result"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleClearClientResultPhoto(item.id)}
                                className="absolute top-2 right-2 w-6 h-6 bg-white/95 rounded-full shadow-sm text-slate-600 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-all z-10"
                                title="Remove photo"
                              >
                                <X size={13} />
                              </button>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <input
                                  id={'treatment-result-photo-change-' + item.id}
                                  type="file"
                                  accept="image/*"
                                  onChange={(ev) => {
                                    const file = ev.target.files?.[0];
                                    if (file) handleClientResultPhotoUpload(item.id, file);
                                  }}
                                  className="hidden"
                                />
                                <label
                                  htmlFor={'treatment-result-photo-change-' + item.id}
                                  className="px-3 py-1.5 bg-white text-slate-800 rounded-full text-xs font-bold shadow-md cursor-pointer hover:bg-slate-50 flex items-center gap-1.5"
                                >
                                  <UploadCloud size={13} />
                                  <span>{uploadingTreatmentResultId === item.id ? 'Uploading...' : 'Change photo'}</span>
                                </label>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center w-full h-full">
                              <input
                                id={'treatment-result-photo-upload-' + item.id}
                                type="file"
                                accept="image/*"
                                onChange={(ev) => {
                                  const file = ev.target.files?.[0];
                                  if (file) handleClientResultPhotoUpload(item.id, file);
                                }}
                                className="hidden"
                              />
                              <label
                                htmlFor={'treatment-result-photo-upload-' + item.id}
                                className="flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity w-full h-full"
                              >
                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-1 shadow-2xs">
                                  <UploadCloud size={15} />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">
                                  {uploadingTreatmentResultId === item.id ? 'Uploading to Supabase...' : 'Click to upload photo'}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or WebP</span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">Testimonial</label>
                        <textarea
                          rows={4}
                          value={item.testimonial}
                          onChange={(e) => handleClientResultTestimonialChange(item.id, e.target.value)}
                          placeholder="Client review or feedback after this treatment..."
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-2xs resize-none h-[120px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          `;

if (pSec3Start !== -1 && pSec4Start !== -1) {
  productsContent = productsContent.substring(0, pSec3Start) + newSec3UI + productsContent.substring(pSec4Start);
  fs.writeFileSync(productsFile, productsContent, 'utf8');
  console.log('Successfully updated ProductsTab.tsx');
} else {
  console.error('Indices not found for Section 3 in ProductsTab.tsx:', { pSec3Start, pSec4Start });
}
