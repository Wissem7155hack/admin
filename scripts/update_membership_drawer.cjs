const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'components', 'AppBuilder', 'MembershipDrawerModal.tsx');
let content = fs.readFileSync(file, 'utf8');

// Update DEFAULT_CLIENT_PHOTO
content = content.replace(
  /const DEFAULT_CLIENT_PHOTO = [^;]+;/,
  "const DEFAULT_CLIENT_PHOTO = 'https://jndcmymcnivessmvzpzc.supabase.co/storage/v1/object/public/membership-media/client-results/before_after.webp';"
);

// Replace state and handlers for resultsPhoto / testimonial
const stateTarget = `  // Client Results
  const [resultsPhoto, setResultsPhoto] = useState(DEFAULT_CLIENT_PHOTO);
  const [testimonial, setTestimonial] = useState(
    'The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn\\'t be happier with the results!'
  );

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResultPhoto, setUploadingResultPhoto] = useState(false);`;

const newState = `  interface ClientTestimonialItem {
    id: string;
    photoUrl: string;
    text: string;
  }

  // Multi-Client Results list (Add, Change photo, Delete specific result)
  const [testimonialsList, setTestimonialsList] = useState<ClientTestimonialItem[]>([
    {
      id: 'default-1',
      photoUrl: DEFAULT_CLIENT_PHOTO,
      text: "The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn't be happier with the results!",
    },
  ]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResultId, setUploadingResultId] = useState<string | null>(null);`;

content = content.replace(stateTarget, newState);

// Update useEffect testimonials handling
const oldEditTestimonials = `      if (editingMembership.testimonials && editingMembership.testimonials.length > 0) {
        setResultsPhoto(editingMembership.testimonials[0].photoUrl || DEFAULT_CLIENT_PHOTO);
        setTestimonial(editingMembership.testimonials[0].text || '');
      } else {
        setResultsPhoto(DEFAULT_CLIENT_PHOTO);
        setTestimonial(
          'The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn\\'t be happier with the results!'
        );
      }`;

const newEditTestimonials = `      if (editingMembership.testimonials && editingMembership.testimonials.length > 0) {
        setTestimonialsList(
          editingMembership.testimonials.map((t, idx) => ({
            id: (t as any).id || (Date.now() + idx).toString(),
            photoUrl: t.photoUrl || DEFAULT_CLIENT_PHOTO,
            text: t.text || '',
          }))
        );
      } else {
        setTestimonialsList([
          {
            id: 'default-1',
            photoUrl: DEFAULT_CLIENT_PHOTO,
            text: "The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn't be happier with the results!",
          },
        ]);
      }`;

content = content.replace(oldEditTestimonials, newEditTestimonials);

const oldResetTestimonials = `      setResultsPhoto(DEFAULT_CLIENT_PHOTO);
      setTestimonial(
        'The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn\\'t be happier with the results!'
      );`;

const newResetTestimonials = `      setTestimonialsList([
        {
          id: 'default-1',
          photoUrl: DEFAULT_CLIENT_PHOTO,
          text: "The transformation was unbelievable. My skin went from dull and tired to glowing and radiant within weeks. I couldn't be happier with the results!",
        },
      ]);`;

content = content.replace(oldResetTestimonials, newResetTestimonials);

// Replace handleResultPhotoUpload with handlers
const oldResultUpload = `  async function handleResultPhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingResultPhoto(true);
      const url = await uploadMembershipAsset(file);
      setResultsPhoto(url);
    } catch (err) {
      console.warn('Fallback to local blob for result photo:', err);
      setResultsPhoto(URL.createObjectURL(file));
    } finally {
      setUploadingResultPhoto(false);
    }
  }`;

const newResultHandlers = `  function handleAddTestimonial() {
    setTestimonialsList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        photoUrl: '',
        text: '',
      },
    ]);
  }

  function handleDeleteTestimonial(id: string) {
    setTestimonialsList((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleTestimonialPhotoUpload(id: string, file: File) {
    try {
      setUploadingResultId(id);
      const url = await uploadMembershipAsset(file);
      setTestimonialsList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, photoUrl: url } : t))
      );
    } catch {
      const local = URL.createObjectURL(file);
      setTestimonialsList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, photoUrl: local } : t))
      );
    } finally {
      setUploadingResultId(null);
    }
  }

  function handleClearTestimonialPhoto(id: string) {
    setTestimonialsList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, photoUrl: '' } : t))
    );
  }

  function handleTestimonialTextChange(id: string, text: string) {
    setTestimonialsList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text } : t))
    );
  }`;

content = content.replace(oldResultUpload, newResultHandlers);

// Update testimonials in handleSave
content = content.replace(
  /testimonials: resultsPhoto \|\| testimonial \? \[\{ photoUrl: resultsPhoto, text: testimonial \}\] : \[\],/,
  'testimonials: testimonialsList.filter((t) => t.photoUrl || t.text.trim()),'
);

// Replace Section 5 UI in JSX
const pSection5 = content.indexOf('{/* Section 5: Client results (optional) */}');
const pSection5End = content.indexOf('</div>\n    </SlideOverDrawer>');
const pSection5EndAlt = content.indexOf('</div>\r\n    </SlideOverDrawer>');
const actualEnd = pSection5End !== -1 ? pSection5End : pSection5EndAlt;

const newSection5UI = `{/* Section 5: Client results (optional) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">Client results (optional)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Showcase verified client before & after results and testimonials</p>
            </div>
            <button
              type="button"
              onClick={handleAddTestimonial}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-pink-300 rounded-full text-xs font-semibold text-slate-700 hover:text-pink-600 transition-colors cursor-pointer bg-white shadow-2xs"
            >
              <Plus size={13} />
              <span>Add client result</span>
            </button>
          </div>

          {testimonialsList.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-600">No client results added yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Before & after proof dramatically increases membership conversions</p>
              <button
                type="button"
                onClick={handleAddTestimonial}
                className="mt-3 px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                + Add first client result
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonialsList.map((item, idx) => (
                <div key={item.id} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Client Result #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTestimonial(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete specific result"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before/After Photo Card */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Before / After photo</label>
                      <div className="relative w-full aspect-[4/3] rounded-xl border border-slate-200 overflow-hidden bg-slate-100 group flex items-center justify-center">
                        {item.photoUrl ? (
                          <>
                            <img
                              src={item.photoUrl}
                              onError={(e) => { e.currentTarget.src = '/images/before_after.webp'; }}
                              alt="Results"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleClearTestimonialPhoto(item.id)}
                              className="absolute top-2 right-2 w-6 h-6 bg-white/95 rounded-full shadow-sm text-slate-600 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-all"
                              title="Remove photo"
                            >
                              <X size={13} />
                            </button>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <input
                                id={'change-result-photo-' + item.id}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleTestimonialPhotoUpload(item.id, f);
                                }}
                                className="hidden"
                              />
                              <label
                                htmlFor={'change-result-photo-' + item.id}
                                className="px-3 py-1.5 bg-white text-slate-800 rounded-full text-xs font-bold shadow-md cursor-pointer hover:bg-slate-50 flex items-center gap-1.5"
                              >
                                <UploadCloud size={13} />
                                <span>{uploadingResultId === item.id ? 'Uploading...' : 'Change photo'}</span>
                              </label>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 flex flex-col items-center justify-center text-center w-full h-full">
                            <input
                              id={'upload-result-photo-' + item.id}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleTestimonialPhotoUpload(item.id, f);
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor={'upload-result-photo-' + item.id}
                              className="flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity w-full h-full"
                            >
                              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-1 shadow-xs">
                                <UploadCloud size={15} />
                              </div>
                              <span className="text-xs font-semibold text-slate-700">
                                {uploadingResultId === item.id ? 'Uploading to Supabase...' : 'Click to upload photo'}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or WebP</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Testimonial text block */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Testimonial</label>
                      <textarea
                        rows={5}
                        value={item.text}
                        onChange={(e) => handleTestimonialTextChange(item.id, e.target.value)}
                        placeholder="The transformation was unbelievable. My skin went from dull and tired to glowing and radiant..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none leading-relaxed h-[130px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>`;

if (pSection5 !== -1 && actualEnd !== -1) {
  content = content.substring(0, pSection5) + newSection5UI + '\n      ' + content.substring(actualEnd);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated MembershipDrawerModal.tsx');
} else {
  console.error('Indices not found for Section 5:', { pSection5, actualEnd });
}
