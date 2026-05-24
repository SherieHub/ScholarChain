"use client";
import { useRef, useState } from "react";
import type { AchievementType } from "@/types/scholarAchievement";
import { validateProofFile } from "@/lib/firebase/storage";

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
  proofFile: File | null;
}

type SubmitData = Omit<FormData, "achievementType" | "proofFile"> & {
  achievementType: AchievementType;
  proofFile: File;
};

interface ScholarAchievementFormProps {
  onSubmit: (data: SubmitData) => Promise<void>;
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
    proofFile: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.achievementName.trim()) e.achievementName = "Achievement name is required.";
    if (!form.achievementType) e.achievementType = "Please select an achievement type.";
    if (!form.issuingOrganization.trim()) e.issuingOrganization = "Issuing organization is required.";
    if (!form.dateAchieved) e.dateAchieved = "Date achieved is required.";
    if (!form.proofFile) {
      e.proofFile = "Please attach a proof file.";
    } else {
      const fileError = validateProofFile(form.proofFile);
      if (fileError) e.proofFile = fileError;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form as SubmitData);
  }

  function field(key: keyof Omit<FormData, "proofFile">, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setForm((p) => ({ ...p, proofFile: file }));
    if (errors.proofFile) setErrors((p) => ({ ...p, proofFile: undefined }));
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

      {/* Row 4: File upload */}
      <div className="border-t border-white/[0.06] pt-2">
        <label className={labelCls}>Proof of Achievement</label>
        <div
          onClick={() => !isSubmitting && fileInputRef.current?.click()}
          className={`flex items-center gap-3 w-full bg-white/[0.04] border ${
            errors.proofFile ? "border-red-500/50" : "border-white/[0.10] hover:border-white/[0.18]"
          } rounded-xl px-4 py-2.5 cursor-pointer transition-all ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span className={`text-sm truncate ${form.proofFile ? "text-white" : "text-slate-500"}`}>
            {form.proofFile ? form.proofFile.name : "Choose file…"}
          </span>
          {form.proofFile && (
            <span className="ml-auto text-xs text-slate-500 shrink-0">
              {(form.proofFile.size / 1024 / 1024).toFixed(1)} MB
            </span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          disabled={isSubmitting}
        />
        {errors.proofFile && <p className={errorCls}>{errors.proofFile}</p>}
        <p className="text-xs text-slate-600 mt-1.5">
          JPG, PNG, WEBP, PDF, DOC, or DOCX — max 10 MB.
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
              Uploading…
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
