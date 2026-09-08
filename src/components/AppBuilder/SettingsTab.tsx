import React, { useState } from 'react';
import { Check, RefreshCw, Plus, ArrowLeft } from 'lucide-react';
import ImageUploadDropzone from '../common/ImageUploadDropzone';
import EmptyState from '../EmptyState';
import SlideOverDrawer from '../common/SlideOverDrawer';
import { EducationArticle } from '../../types';

export default function SettingsTab() {
  const [appIcon, setAppIcon] = useState('');
  const [rawLogo, setRawLogo] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [brandColor, setBrandColor] = useState('#000000');
  const [greetingColor, setGreetingColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [cashName, setCashName] = useState('Patient App Cash');

  const [bizName, setBizName] = useState('Glow MedSpa & Laser');
  const [timezone, setTimezone] = useState('-05:00 Eastern Time - New York City, Brooklyn, Queens, Philadelphia');
  const [currency, setCurrency] = useState('USD ($)');
  const [country, setCountry] = useState('United States');
  const [address, setAddress] = useState('Suite 400, 750 Lexington Ave');
  const [postalCode, setPostalCode] = useState('10001');
  const [personalPhone, setPersonalPhone] = useState('+1 (555) 234-5678');
  const [bizPhone, setBizPhone] = useState('+1 (555) 987-6543');
  const [openingHours, setOpeningHours] = useState('Mon - Fri: 9:00 AM - 6:00 PM');
  const [googleReviewLink, setGoogleReviewLink] = useState('https://g.page/r/glowmedspa');

  const [passFee, setPassFee] = useState(false);
  const [cashBalanceLimit, setCashBalanceLimit] = useState(100);

  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [openArticleDrawer, setOpenArticleDrawer] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenArticleDrawer(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [articleHeadline, setArticleHeadline] = useState('');
  const [articleDescription, setArticleDescription] = useState('');
  const [articleLink, setArticleLink] = useState('');
  const [articleCover, setArticleCover] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleHeadline.trim()) return;
    const newArt: EducationArticle = {
      id: 'art-' + Date.now(),
      headline: articleHeadline,
      description: articleDescription,
      link: articleLink,
      coverUrl: articleCover || '/images/skincare-products.jpg',
      publishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setArticles([newArt, ...articles]);
    setArticleHeadline('');
    setArticleDescription('');
    setArticleLink('');
    setArticleCover('');
    setOpenArticleDrawer(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl animate-in fade-in duration-200">
      {/* 1. BRANDING (Compact 2-col layout) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-5">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Branding</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ImageUploadDropzone
            label="App icon"
            helperText="Square 512x512px icon"
            aspectRatio="square"
            currentImage={appIcon}
            onImageChange={setAppIcon}
          />

          <ImageUploadDropzone
            label="Raw logo (transparent)"
            helperText="PNG with alpha background"
            aspectRatio="square"
            currentImage={rawLogo}
            onImageChange={setRawLogo}
          />

          <ImageUploadDropzone
            label="Home screen banner image"
            helperText="1920x1080px hero visual"
            aspectRatio="banner"
            currentImage={bannerImage}
            onImageChange={setBannerImage}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Brand color */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Brand color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Greeting color */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Greeting text color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={greetingColor}
                onChange={(e) => setGreetingColor(e.target.value)}
                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={greetingColor}
                onChange={(e) => setGreetingColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Font */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            >
              <option value="Inter">Inter (Recommended)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="HK Grotesk">HK Grotesk</option>
              <option value="Roboto">Roboto</option>
              <option value="Outfit">Outfit</option>
            </select>
          </div>

          {/* Cash Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cash Name</label>
            <input
              type="text"
              value={cashName}
              onChange={(e) => setCashName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
        </div>
      </div>

      {/* 2. BUSINESS DETAILS (Compact structured grid) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Business details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Name</label>
            <input
              type="text"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            >
              <option value="USD ($)">USD ($)</option>
              <option value="GBP (£)">GBP (£)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="SGD (SGD)">SGD (SGD)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country / Region</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Postal code</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Personal phone</label>
            <input
              type="text"
              value={personalPhone}
              onChange={(e) => setPersonalPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business phone</label>
            <input
              type="text"
              value={bizPhone}
              onChange={(e) => setBizPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Opening hours</label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Google Review link</label>
            <input
              type="url"
              value={googleReviewLink}
              onChange={(e) => setGoogleReviewLink(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
        </div>
      </div>

      {/* 3. CHECKOUT POLICIES */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Checkout policies</h3>

        <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl">
          <div>
            <p className="text-xs font-semibold text-slate-900">Pass along 2.5% transaction fees</p>
            <p className="text-[11px] text-slate-400">Add card processing fee directly to patient checkout invoice.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={passFee}
              onChange={(e) => setPassFee(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
          </label>
        </div>

        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-900">Max cash balance redemption limit</p>
            <p className="text-[11px] text-slate-400">Prevent checkout if patient rewards cash exceeds percentage of total order.</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <input
              type="number"
              min={1}
              max={100}
              value={cashBalanceLimit}
              onChange={(e) => setCashBalanceLimit(Number(e.target.value))}
              className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
            <span className="text-xs font-semibold text-slate-600">%</span>
          </div>
        </div>
      </div>

      {/* 4. EDUCATION BLOG SECTION */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Education section</h3>
            <p className="text-xs text-slate-400">Post clinic articles and care tips to patient app feed.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpenArticleDrawer(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus size={14} />
            <span>Create new content</span>
          </button>
        </div>

        {articles.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title="No educational articles"
              description="Publish care tips and treatment prep guides directly to client phones."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((art) => (
              <div key={art.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex gap-3">
                <img src={art.coverUrl} alt={art.headline} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{art.headline}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{art.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Published {art.publishedAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-between pt-2">
        {savedSuccess ? (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
            <Check size={16} /> Changes saved successfully!
          </span>
        ) : (
          <span />
        )}
        <button
          type="submit"
          className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
        >
          Save Settings
        </button>
      </div>

      {/* Article Drawer */}
      <SlideOverDrawer
        isOpen={openArticleDrawer}
        onClose={() => setOpenArticleDrawer(false)}
        title="Create new content"
        maxWidth="max-w-[480px]"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpenArticleDrawer(false)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateArticle}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md"
            >
              Publish Article
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <ImageUploadDropzone
            label="Content cover"
            helperText="max. 1920x1080px"
            aspectRatio="banner"
            currentImage={articleCover}
            onImageChange={setArticleCover}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Content headline</label>
            <input
              type="text"
              required
              value={articleHeadline}
              onChange={(e) => setArticleHeadline(e.target.value)}
              placeholder="e.g. 5 Post-Botox Tips"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Content description</label>
            <textarea
              rows={4}
              value={articleDescription}
              onChange={(e) => setArticleDescription(e.target.value)}
              placeholder="Care advice details..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Content link</label>
            <input
              type="url"
              value={articleLink}
              onChange={(e) => setArticleLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
        </div>
      </SlideOverDrawer>
    </form>
  );
}
export { SettingsTab };
