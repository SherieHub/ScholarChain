"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  addScholarAchievement,
  getAchievementsByScholarId,
} from "@/lib/firebase/scholarAchievements";
import { uploadAchievementProof } from "@/lib/firebase/storage";
import ScholarAchievementCard from "./ScholarAchievementCard";
import ScholarAchievementForm from "./ScholarAchievementForm";
import type { ScholarAchievement, AchievementType } from "@/types/scholarAchievement";

interface AchievementsPanelProps {
  scholarId: string;
}

export default function AchievementsPanel({ scholarId }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useState<ScholarAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAchievementsByScholarId(scholarId)
      .then(setAchievements)
      .catch(() => setAchievements([]))
      .finally(() => setLoading(false));
  }, [scholarId]);

  async function handleSubmit(data: {
    achievementName: string;
    achievementType: AchievementType;
    issuingOrganization: string;
    dateAchieved: string;
    proofFile: File;
  }) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const proofLink = await uploadAchievementProof(scholarId, data.proofFile);
      const { proofFile, ...rest } = data;
      const id = await addScholarAchievement({
        ...rest,
        scholarId,
        proofLink,
        proofFileName: proofFile.name,
      });
      const newEntry: ScholarAchievement = {
        id,
        scholarId,
        ...rest,
        proofLink,
        proofFileName: proofFile.name,
        status: "Pending Review",
        submittedAt: new Date().toISOString(),
      };
      setAchievements((prev) => [newEntry, ...prev]);
      setShowForm(false);
      setSuccessMessage(`"${data.achievementName}" submitted for review.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setSubmitError("Upload failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Achievements
          </h3>
          {!loading && (
            <p className="text-xs text-slate-600 mt-0.5">
              {achievements.length === 0
                ? "No achievements submitted yet."
                : `${achievements.length} achievement${achievements.length !== 1 ? "s" : ""} on record`}
            </p>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 hover:border-blue-400/40 rounded-xl px-3.5 py-2 transition-all duration-150"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Achievement
          </button>
        )}
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-300">
          <span className="text-green-400 font-bold text-base">✓</span>
          {successMessage}
        </div>
      )}

      {/* Error banner */}
      {submitError && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-300">
          <span className="text-red-400 font-bold text-base">✕</span>
          {submitError}
        </div>
      )}

      {/* Add achievement form */}
      {showForm && (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
          <p className="text-sm font-semibold text-white mb-4">New Achievement</p>
          <ScholarAchievementForm
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setSubmitError(null); }}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-white/[0.03] border border-white/[0.05] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : achievements.length === 0 && !showForm ? (
        <div className="text-center py-8 text-slate-600 text-sm border border-dashed border-white/[0.06] rounded-xl">
          Submit your first achievement using the button above.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {achievements.map((a) => (
            <ScholarAchievementCard key={a.id} achievement={a} />
          ))}
        </div>
      )}
    </div>
  );
}
