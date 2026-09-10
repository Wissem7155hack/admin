import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2, Loader2, Sparkles, Pencil } from 'lucide-react';
import ImageUploadDropzone from '../common/ImageUploadDropzone';
import EmptyState from '../EmptyState';
import SlideOverDrawer from '../common/SlideOverDrawer';
import { Merchant } from '../../types';
import { useArticles, ArticleRecord, useClinics, handleImageError } from '../../hooks/useSupabaseData';

interface SettingsTabProps {
  clinicId?: string;
  currentMerchant?: Merchant;
  onUpdateClinic?: (updated: Partial<Merchant>) => void;
}

export default function SettingsTab({
  clinicId,
  currentMerchant,
  onUpdateClinic,
}: SettingsTabProps) {
  const { updateClinicTheme, updateClinicDetails } = useClinics();
  const {
    articles: supabaseArticles,
    loading: articlesLoading,
    addArticle,
    updateArticle,
    deleteArticle,
  } = useArticles(clinicId);

  // Branding States
  const [appIcon, setAppIcon] = useState('');
  const [rawLogo, setRawLogo] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [brandColor, setBrandColor] = useState('#EC4899');
  const [greetingColor, setGreetingColor] = useState('#1E293B');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [cashName, setCashName] = useState('Patient App Cash');

  // Business Details
  const [bizName, setBizName] = useState('Glow MedSpa & Laser');
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

  // Article Drawer & Form
  const [openArticleDrawer, setOpenArticleDrawer] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleRecord | null>(null);
  const [articleHeadline, setArticleHeadline] = useState('');
  const [articleDescription, setArticleDescription] = useState('');
  const [articleAuthor, setArticleAuthor] = useState('Clinical Specialist');
  const [articleLink, setArticleLink] = useState('');
  const [articleCover, setArticleCover] = useState('');

  const [savingSettings, setSavingSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [publishingArticle, setPublishingArticle] = useState(false);

  // Initialize from currentMerchant
  useEffect(() => {
    if (currentMerchant) {
      setBizName(currentMerchant.name || 'Glow MedSpa & Laser');
      if (currentMerchant.brandColor) setBrandColor(currentMerchant.brandColor);
      if (currentMerchant.address) setAddress(currentMerchant.address);
      if (currentMerchant.logoUrl) {
        setBannerImage(currentMerchant.logoUrl);
        setRawLogo(currentMerchant.logoUrl);
      }
    }
  }, [currentMerchant]);

  // Handle Save Settings to Supabase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      if (clinicId) {
        // Update live theme palette in Supabase
        const updatedTheme = {
          primaryColor: brandColor,
          accentColor: brandColor,
          secondaryColor: greetingColor,
          backgroundColor: '#F8FAFC',
          surfaceColor: '#FFFFFF',
          borderColor: '#E2E8F0',
          textPrimary: '#0F172A',
          textSecondary: '#64748B',
        };

        await updateClinicTheme(clinicId, updatedTheme);

        // Update clinic row details
        await updateClinicDetails(clinicId, {
          full_name: bizName,
          address,
          hero_image: bannerImage || rawLogo || appIcon,
        });
      }

      if (onUpdateClinic) {
        onUpdateClinic({
          name: bizName,
          brandColor,
          address,
          logoUrl: bannerImage || rawLogo,
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Failed to update clinic in Supabase:', err);
      const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
      alert('Could not update clinic in Supabase: ' + errMsg);
    } finally {
      setSavingSettings(false);
    }
  };

  // Open drawer to create a new article
  const openCreateArticleDrawer = () => {
    setEditingArticle(null);
    setArticleHeadline('');
    setArticleDescription('');
    setArticleAuthor('Clinical Specialist');
    setArticleLink('');
    setArticleCover('');
    setOpenArticleDrawer(true);
  };

  // Open drawer to edit an existing article (prefilled from Supabase record)
  const openEditArticleDrawer = (article: ArticleRecord) => {
    setEditingArticle(article);
    setArticleHeadline(article.title || '');
    setArticleDescription(article.body || article.snippet || '');
    setArticleAuthor(article.author || 'Clinical Specialist');
    setArticleLink((article as any).link || '');
    setArticleCover(article.image || '');
    setOpenArticleDrawer(true);
  };

  const closeArticleDrawer = () => {
    setOpenArticleDrawer(false);
    setTimeout(() => {
      setEditingArticle(null);
      setArticleHeadline('');
      setArticleDescription('');
      setArticleAuthor('Clinical Specialist');
      setArticleLink('');
      setArticleCover('');
    }, 320);
  };

  // Handle Create or Update Educational Article
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleHeadline.trim()) return;

    setPublishingArticle(true);
    try {
      if (clinicId) {
        if (editingArticle) {
          await updateArticle(editingArticle.id, {
            title: articleHeadline,
            author: articleAuthor || 'Clinical Team',
            snippet: articleDescription.substring(0, 120),
            body: articleDescription,
            image: articleCover || '/images/skincare-products.jpg',
          });
        } else {
          await addArticle({
            clinic_id: clinicId,
            title: articleHeadline,
            author: articleAuthor || 'Clinical Team',
            snippet: articleDescription.substring(0, 120),
            body: articleDescription,
            image: articleCover || '/images/skincare-products.jpg',
          });
        }
      }

      closeArticleDrawer();
    } catch (err: unknown) {
      console.error('Failed to save article in Supabase:', err);
      const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
      alert('Could not save the article to Supabase: ' + errMsg);
    } finally {
      setPublishingArticle(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      if (clinicId) {
        await deleteArticle(id);
      }
    } catch (err) {
      console.error('Failed to delete article:', err);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl animate-in fade-in duration-200 pb-12">
      {/* 1. BRANDING */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Branding & Theme Palettes</h3>
            <p className="text-xs text-slate-400">Manage your clinic logos, banner visuals, and live app color palettes.</p>
          </div>
          <span className="text-[11px] font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles size={12} /> Supabase Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ImageUploadDropzone
            label="App icon"
            helperText="Square 512x512px icon"
            aspectRatio="square"
            currentImage={appIcon}
            onImageChange={setAppIcon}
            storageFolder="branding"
          />

          <ImageUploadDropzone
            label="Raw logo (transparent)"
            helperText="PNG with alpha background"
            aspectRatio="square"
            currentImage={rawLogo}
            onImageChange={setRawLogo}
            storageFolder="branding"
          />

          <ImageUploadDropzone
            label="Home screen banner image"
            helperText="1920x1080px hero visual"
            aspectRatio="banner"
            currentImage={bannerImage}
            onImageChange={setBannerImage}
            storageFolder="branding"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Brand color */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Brand Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shadow-2xs"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Secondary / Greeting color */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Greeting / Header Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={greetingColor}
                onChange={(e) => setGreetingColor(e.target.value)}
                className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shadow-2xs"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rewards Cash Name</label>
            <input
              type="text"
              value={cashName}
              onChange={(e) => setCashName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
        </div>
      </div>

      {/* 2. BUSINESS DETAILS */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Business Details</h3>

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
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Checkout Policies</h3>

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

      {/* 4. EDUCATION BLOG SECTION (Live Supabase articles) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Education & Blog Articles</h3>
            <p className="text-xs text-slate-400">Articles stored live in Supabase and displayed in the patient app feed.</p>
          </div>
          <button
            type="button"
            onClick={openCreateArticleDrawer}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Create new content</span>
          </button>
        </div>

        {articlesLoading && (!supabaseArticles || supabaseArticles.length === 0) ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-pink-500" />
          </div>
        ) : !supabaseArticles || supabaseArticles.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title="No educational articles"
              description="Publish care tips, recovery advice, and treatment prep guides directly to client phones."
              action={{
                label: "Write an article",
                onClick: openCreateArticleDrawer,
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supabaseArticles.map((art: ArticleRecord) => (
              <div key={art.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex gap-3 group relative">
                <img
                    onError={handleImageError}
                    src={art.image || '/images/skincare-products.jpg'}
                  alt={art.title}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                />
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{art.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{art.snippet || art.body}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-medium text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                      {art.author || 'Clinical Specialist'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openEditArticleDrawer(art)}
                    className="p-1.5 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-sm"
                    title="Edit article"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteArticle(art.id)}
                    className="p-1.5 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 shadow-sm"
                    title="Delete article"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-between pt-2">
        {savedSuccess ? (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
            <Check size={16} /> Changes saved live to Supabase!
          </span>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={savingSettings}
          className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md flex items-center gap-2 cursor-pointer"
        >
          {savingSettings && <Loader2 size={16} className="animate-spin" />}
          <span>{savingSettings ? 'Updating Supabase...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Article Drawer */}
      <SlideOverDrawer
        isOpen={openArticleDrawer}
        onClose={closeArticleDrawer}
        title={editingArticle ? 'Edit Article' : 'Publish Educational Article'}
        maxWidth="max-w-[540px]"
        footer={
          <>
            <button
              type="button"
              onClick={closeArticleDrawer}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateArticle}
              disabled={publishingArticle}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-pink-200 transition-all hover:shadow-md flex items-center gap-1.5"
            >
              {publishingArticle && <Loader2 size={14} className="animate-spin" />}
              <span>
                {publishingArticle
                  ? editingArticle
                    ? 'Saving...'
                    : 'Publishing...'
                  : editingArticle
                    ? 'Save Changes'
                    : 'Publish Article'}
              </span>
            </button>
          </>
        }
      >
        <div className="space-y-5 text-sm">
          <ImageUploadDropzone
            label="Content Cover Image"
            helperText="Uploaded to Supabase storage"
            aspectRatio="banner"
            currentImage={articleCover}
            onImageChange={setArticleCover}
            storageFolder="articles"
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Article Headline *</label>
            <input
              type="text"
              required
              value={articleHeadline}
              onChange={(e) => setArticleHeadline(e.target.value)}
              placeholder="e.g. Combining Moxi and BBL for Skin Tightening"
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Author / Specialist</label>
            <input
              type="text"
              value={articleAuthor}
              onChange={(e) => setArticleAuthor(e.target.value)}
              placeholder="e.g. Dr. Sarah Louise"
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Content Description / Body</label>
            <textarea
              rows={6}
              value={articleDescription}
              onChange={(e) => setArticleDescription(e.target.value)}
              placeholder="Write the clinical guidance or care tips..."
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reference Link (Optional)</label>
            <input
              type="url"
              value={articleLink}
              onChange={(e) => setArticleLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm"
            />
          </div>
        </div>
      </SlideOverDrawer>
    </form>
  );
}

export { SettingsTab };
