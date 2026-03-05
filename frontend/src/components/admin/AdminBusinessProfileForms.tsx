import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
  AlertCircle,
} from "lucide-react";
import { profileFormAPI } from "../../services/api";

const SECTORS = [
  { value: "agriculture", label: "Agriculture" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Services" },
  { value: "technology", label: "Technology" },
  { value: "retail", label: "Retail" },
  { value: "construction", label: "Construction" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "other", label: "Other" },
];

interface ProfileForm {
  id: string;
  sector: string;
  sector_display: string;
  name: string;
  description: string;
  is_active: boolean;
  sections: { id: string; fields: any[] }[];
  created_at: string;
  updated_at: string;
}

export default function AdminBusinessProfileForms() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: forms = [], isLoading } = useQuery<ProfileForm[]>({
    queryKey: ["profile-forms"],
    queryFn: async () => {
      const res = await profileFormAPI.getAll();
      return res.data.results ?? res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => profileFormAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-forms"] });
      setDeleteTarget(null);
    },
  });

  const coveredSectors = new Set(forms.map((f: ProfileForm) => f.sector));
  const missingSectors = SECTORS.filter((s) => !coveredSectors.has(s.value));

  const totalFields = (form: ProfileForm) =>
    form.sections?.reduce((acc, s) => acc + (s.fields?.length ?? 0), 0) ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Business Profile Forms
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            One form per sector — SMEs fill this out when creating their
            business profile.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/profile-forms/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Sector Form
        </button>
      </div>

      {/* Missing sectors alert */}
      {missingSectors.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Missing forms for {missingSectors.length} sector
              {missingSectors.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {missingSectors.map((s) => s.label).join(", ")} — SMEs in these
              sectors will see the default registration form.
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-primary-600" />
        </div>
      )}

      {/* Grid of forms */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form: ProfileForm) => (
            <div
              key={form.id}
              className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              {/* Form header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
                      {form.sector_display}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {form.name}
                    </p>
                  </div>
                </div>
                {form.is_active ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                    <CheckCircle className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                    <XCircle className="h-3 w-3" /> Inactive
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-4 mb-4 text-xs text-neutral-500 dark:text-neutral-400">
                <span>{form.sections?.length ?? 0} sections</span>
                <span>{totalFields(form)} fields</span>
              </div>

              {form.description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                  {form.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                <button
                  onClick={() =>
                    navigate(`/admin/profile-forms/${form.id}/edit`)
                  }
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Form
                </button>
                <button
                  onClick={() => setDeleteTarget(form.id)}
                  className="flex items-center justify-center p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {forms.length === 0 && !isLoading && (
            <div className="col-span-3 text-center py-16">
              <Settings className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">
                No profile forms yet
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                Create a profile form for each sector to customise what
                information SMEs provide.
              </p>
              <button
                onClick={() => navigate("/admin/profile-forms/new")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Create First Form
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Delete Profile Form?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              This will permanently delete the form and all its sections.
              Existing enterprise responses will not be deleted but will become
              unlinked.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget!)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
