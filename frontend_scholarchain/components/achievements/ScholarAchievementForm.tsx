"use client";
import { useState } from "react";
import type { AchievementType } from "@/types/scholarAchievement";

const ACHIEVEMENT_TYPES: AchievementType[] = [
  "Competition",
  "Certification",
  "Leadership",
  "Community Service",
  "Academic Award",
  "Seminar & Training",
  "Research",
  "Sports",
  "Arts & Culture",
];

interface FormData {
  achievementName: string;
  achievementType: AchievementType | "";
  issuingOrganization: string;
  dateAchieved: string;
  proofLink: string;
}

interface ScholarAchievementFormProps {
  onSubmit: (data: Omit<FormData, "achievementType"> & { achievementType: AchievementType }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ScholarAchievementForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: ScholarAchievementFormProps) {
  const [form, setForm] = useState<FormData>({
    achievementName: "",
    achievementType: "",
    issuingOrganization: "",
    dateAchieved: "",
    proofLink: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.achievementName.trim()) e.achievementName = "Achievement name is required.";
    if (!form.achievementType) e.achievementType = "Please select an achievement type.";
    if (!form.issuingOrganization.trim()) e.issuingOrganization = "Issuing organization is required.";
    if (!form.dateAchieved) e.dateAchieved = "Date achieved is required.";
    if (!form.proofLink.trim()) {
      e.proofLink = "Proof link is required.";
    } else {
      try { new URL(form.proofLink); } catch { e.proofLink = "Enter a valid URL."; }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form as Omit<FormData, "achievementType"> & { achievementType: AchievementType });
  }

  function field(key: keyof FormData, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  const inputCls =
    "w-full bg-white/[0.04] border border-white/[0.10] hover:border-white/[0.18] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all";
  const labelCls = "block text-xs font-medium text-slate-400 mb-1.5";
  const errorCls = "text-xs text-red-400 mt-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Row 1: Achievement Name */}
      <div>
        <label className={labelCls}>Achievement Name</label>
        <input
          type="text"
          placeholder="e.g. Regional Programming Competition 1st Place"
          value={form.achievementName}
          onChange={(e) => field("achievementName", e.target.value)}
          className={inputCls}
          disabled={isSubmitting}
        />
        {errors.achievementName && <p className={errorCls}>{errors.achievementName}</p>}
      </div>

      {/* Row 2: Type + Org side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Achievement Type</label>
          <select
            value={form.achievementType}
            onChange={(e) => field("achievementType", e.target.value)}
            className={`${inputCls} appearance-none`}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select type…</option>
            {ACHIEVEMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.achievementType && <p className={errorCls}>{errors.achievementType}</p>}
        </div>

        <div>
          <label className={labelCls}>Issuing Organization</label>
          <input
            type="text"
            placeholder="e.g. DICT Philippines"
            value={form.issuingOrganization}
            onChange={(e) => field("issuingOrganization", e.target.value)}
            className={inputCls}
            disabled={isSubmitting}
          />
          {errors.issuingOrganization && <p className={errorCls}>{errors.issuingOrganization}</p>}
        </div>
      </div>

      {/* Row 3: Date */}
      <div>
        <label className={labelCls}>Date Achieved</label>
        <input
          type="date"
          value={form.dateAchieved}
          onChange={(e) => field("dateAchieved", e.target.value)}
          className={`${inputCls} [color-scheme:dark]`}
          disabled={isSubmitting}
        />
        {errors.dateAchieved && <p className={errorCls}>{errors.dateAchieved}</p>}
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.06] pt-2">
        <label className={labelCls}>Proof of Achievement (link)</label>
        <input
          type="url"
          placeholder="https://drive.google.com/…"
          value={form.proofLink}
          onChange={(e) => field("proofLink", e.target.value)}
          className={inputCls}
          disabled={isSubmitting}
        />
        {errors.proofLink && <p className={errorCls}>{errors.proofLink}</p>}
        <p className="text-xs text-slate-600 mt-1.5">
          Provide a publicly accessible link to your certificate, award document, or photo.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          {isSubmitting ? (
            <>
              <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit Achievement"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white border border-white/[0.18] hover:border-white/[0.30] bg-white/[0.04] hover:bg-white/[0.08] rounded-xl px-5 py-2.5 transition-all duration-150 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
