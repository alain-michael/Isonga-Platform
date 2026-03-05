import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  FileText,
  Upload,
  Hash,
  Type,
  List,
  Database,
  Calendar,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

const FIELD_TYPES = [
  { value: "text", label: "Short Text", icon: Type },
  { value: "long_text", label: "Long Text", icon: FileText },
  { value: "number", label: "Number", icon: Hash },
  { value: "date", label: "Date", icon: Calendar },
  { value: "choice", label: "Single Choice", icon: List },
  { value: "multi_choice", label: "Multi Choice", icon: List },
  { value: "file", label: "File Upload", icon: Upload },
  { value: "auto_fill", label: "Auto-fill from Profile", icon: Database },
];

const AUTO_FILL_SOURCES = [
  { value: "business_name", label: "Business Name" },
  { value: "tin_number", label: "TIN Number" },
  { value: "registration_number", label: "Registration Number" },
  { value: "enterprise_type", label: "Enterprise Type" },
  { value: "sector", label: "Sector" },
  { value: "province", label: "Province" },
  { value: "district", label: "District" },
  { value: "phone", label: "Phone Number" },
  { value: "email", label: "Email Address" },
  { value: "website", label: "Website" },
  { value: "year_established", label: "Year Established" },
  { value: "number_of_employees", label: "Number of Employees" },
  { value: "annual_revenue", label: "Annual Revenue" },
  { value: "description", label: "Business Description" },
];

interface FormField {
  id?: string;
  field_type: string;
  label: string;
  help_text: string;
  placeholder: string;
  is_required: boolean;
  order: number;
  choices: { value: string; label: string }[];
  accepted_file_types: string[];
  max_file_size_mb: number | null;
  auto_fill_source: string;
  min_value: number | null;
  max_value: number | null;
}

interface FormSection {
  id?: string;
  title: string;
  description: string;
  order: number;
  fields: FormField[];
}

interface ProfileFormData {
  sector: string;
  name: string;
  description: string;
  is_active: boolean;
  sections: FormSection[];
}

const emptyField = (order: number): FormField => ({
  field_type: "text",
  label: "",
  help_text: "",
  placeholder: "",
  is_required: true,
  order,
  choices: [],
  accepted_file_types: [],
  max_file_size_mb: null,
  auto_fill_source: "",
  min_value: null,
  max_value: null,
});

const emptySection = (order: number): FormSection => ({
  title: "",
  description: "",
  order,
  fields: [emptyField(0)],
});

export default function AdminBusinessProfileFormEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== "new";
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProfileFormData>({
    sector: "",
    name: "",
    description: "",
    is_active: true,
    sections: [emptySection(0)],
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0]),
  );

  // Load existing form if editing
  const { isLoading } = useQuery({
    queryKey: ["profile-form", id],
    queryFn: async () => {
      const res = await profileFormAPI.getById(id!);
      return res.data;
    },
    enabled: isEdit,
    onSuccess: (data: any) => {
      setFormData({
        sector: data.sector,
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        sections: data.sections.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          order: s.order,
          fields: s.fields.map((f: any) => ({
            id: f.id,
            field_type: f.field_type,
            label: f.label,
            help_text: f.help_text,
            placeholder: f.placeholder ?? "",
            is_required: f.is_required,
            order: f.order,
            choices: f.choices ?? [],
            accepted_file_types: f.accepted_file_types ?? [],
            max_file_size_mb: f.max_file_size_mb,
            auto_fill_source: f.auto_fill_source ?? "",
            min_value: f.min_value,
            max_value: f.max_value,
          })),
        })),
      });
      setExpandedSections(new Set(data.sections.map((_: any, i: number) => i)));
    },
  } as any);

  const saveMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (isEdit) {
        return profileFormAPI.update(id!, data);
      }
      return profileFormAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-forms"] });
      setSaveSuccess(true);
      setTimeout(() => {
        navigate("/admin/profile-forms");
      }, 1200);
    },
  });

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.sector) errs.sector = "Sector is required";
    if (!formData.name.trim()) errs.name = "Form name is required";
    formData.sections.forEach((s, si) => {
      if (!s.title.trim())
        errs[`section_${si}_title`] = "Section title is required";
      s.fields.forEach((f, fi) => {
        if (!f.label.trim())
          errs[`section_${si}_field_${fi}_label`] = "Field label is required";
      });
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    saveMutation.mutate(formData);
  };

  // Section helpers
  const addSection = () => {
    const idx = formData.sections.length;
    setFormData((d) => ({
      ...d,
      sections: [...d.sections, emptySection(idx)],
    }));
    setExpandedSections((s) => new Set([...s, idx]));
  };

  const removeSection = (idx: number) => {
    setFormData((d) => ({
      ...d,
      sections: d.sections
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, order: i })),
    }));
  };

  const updateSection = (idx: number, patch: Partial<FormSection>) => {
    setFormData((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));
  };

  const toggleSection = (idx: number) => {
    setExpandedSections((s) => {
      const n = new Set(s);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  };

  // Field helpers
  const addField = (sectionIdx: number) => {
    setFormData((d) => ({
      ...d,
      sections: d.sections.map((s, i) =>
        i === sectionIdx
          ? { ...s, fields: [...s.fields, emptyField(s.fields.length)] }
          : s,
      ),
    }));
  };

  const removeField = (sectionIdx: number, fieldIdx: number) => {
    setFormData((d) => ({
      ...d,
      sections: d.sections.map((s, i) =>
        i === sectionIdx
          ? {
              ...s,
              fields: s.fields
                .filter((_, fi) => fi !== fieldIdx)
                .map((f, fi) => ({ ...f, order: fi })),
            }
          : s,
      ),
    }));
  };

  const updateField = (
    sectionIdx: number,
    fieldIdx: number,
    patch: Partial<FormField>,
  ) => {
    setFormData((d) => ({
      ...d,
      sections: d.sections.map((s, i) =>
        i === sectionIdx
          ? {
              ...s,
              fields: s.fields.map((f, fi) =>
                fi === fieldIdx ? { ...f, ...patch } : f,
              ),
            }
          : s,
      ),
    }));
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/profile-forms")}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              {isEdit ? "Edit Profile Form" : "New Sector Profile Form"}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Build the form that SMEs in this sector will fill out.
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || saveSuccess}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Saved!
            </>
          ) : saveMutation.isPending ? (
            "Saving…"
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Form
            </>
          )}
        </button>
      </div>

      {/* Form meta */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">
          Form Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Sector <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.sector}
              onChange={(e) =>
                setFormData((d) => ({ ...d, sector: e.target.value }))
              }
              disabled={isEdit}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60"
            >
              <option value="">Select sector…</option>
              {SECTORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {errors.sector && (
              <p className="text-xs text-red-500 mt-1">{errors.sector}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Form Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((d) => ({ ...d, name: e.target.value }))
              }
              placeholder="e.g. Agriculture Business Profile"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((d) => ({ ...d, description: e.target.value }))
              }
              rows={2}
              placeholder="Optional description shown to SMEs"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((d) => ({ ...d, is_active: e.target.checked }))
              }
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="is_active"
              className="text-sm text-neutral-700 dark:text-neutral-300"
            >
              Active (SMEs will see this form)
            </label>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {formData.sections.map((section, sIdx) => (
          <div
            key={sIdx}
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
          >
            {/* Section header */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-750"
              onClick={() => toggleSection(sIdx)}
            >
              <GripVertical className="h-4 w-4 text-neutral-300" />
              {expandedSections.has(sIdx) ? (
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateSection(sIdx, { title: e.target.value });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={`Section ${sIdx + 1} Title *`}
                  className="w-full bg-transparent text-sm font-semibold text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
                />
                {errors[`section_${sIdx}_title`] && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors[`section_${sIdx}_title`]}
                  </p>
                )}
              </div>
              <span className="text-xs text-neutral-400">
                {section.fields.length} field
                {section.fields.length !== 1 ? "s" : ""}
              </span>
              {formData.sections.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSection(sIdx);
                  }}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Section body */}
            {expandedSections.has(sIdx) && (
              <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-700">
                {/* Section description */}
                <div className="mt-3 mb-4">
                  <input
                    type="text"
                    value={section.description}
                    onChange={(e) =>
                      updateSection(sIdx, { description: e.target.value })
                    }
                    placeholder="Section description (optional)"
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  {section.fields.map((field, fIdx) => (
                    <FieldEditor
                      key={fIdx}
                      field={field}
                      fieldIdx={fIdx}
                      sectionIdx={sIdx}
                      errors={errors}
                      onChange={(patch) => updateField(sIdx, fIdx, patch)}
                      onRemove={() => removeField(sIdx, fIdx)}
                      canRemove={section.fields.length > 1}
                    />
                  ))}
                </div>

                <button
                  onClick={() => addField(sIdx)}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Field
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add section */}
        <button
          onClick={addSection}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </button>
      </div>

      {/* Error summary */}
      {saveMutation.isError && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          Failed to save form. Please check your inputs and try again.
        </div>
      )}
    </div>
  );
}

// ─── Field Editor ─────────────────────────────────────────────────────────────

interface FieldEditorProps {
  field: FormField;
  fieldIdx: number;
  sectionIdx: number;
  errors: Record<string, string>;
  onChange: (patch: Partial<FormField>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function FieldEditor({
  field,
  fieldIdx,
  sectionIdx,
  errors,
  onChange,
  onRemove,
  canRemove,
}: FieldEditorProps) {
  const [expanded, setExpanded] = useState(true);
  const labelError = errors[`section_${sectionIdx}_field_${fieldIdx}_label`];
  const FieldIcon =
    FIELD_TYPES.find((t) => t.value === field.field_type)?.icon ?? Type;

  return (
    <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg">
      {/* Field header */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer bg-neutral-50 dark:bg-neutral-700/50 rounded-t-lg"
        onClick={() => setExpanded((e) => !e)}
      >
        <FieldIcon className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 flex-1 truncate">
          {field.label || `Field ${fieldIdx + 1}`}
          {field.is_required && <span className="text-red-400 ml-1">*</span>}
        </span>
        <span className="text-xs text-neutral-400">
          {FIELD_TYPES.find((t) => t.value === field.field_type)?.label}
        </span>
        {canRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-0.5 text-red-400 hover:text-red-600 rounded"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        )}
      </div>

      {/* Field body */}
      {expanded && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Field type */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Field Type
              </label>
              <select
                value={field.field_type}
                onChange={(e) => onChange({ field_type: e.target.value })}
                className="w-full px-2 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onChange({ label: e.target.value })}
                placeholder="Field label"
                className="w-full px-2 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500"
              />
              {labelError && (
                <p className="text-xs text-red-500 mt-0.5">{labelError}</p>
              )}
            </div>

            {/* Help text */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Help Text
              </label>
              <input
                type="text"
                value={field.help_text}
                onChange={(e) => onChange({ help_text: e.target.value })}
                placeholder="Instructions shown under the field"
                className="w-full px-2 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Placeholder */}
            {["text", "long_text", "number"].includes(field.field_type) && (
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={field.placeholder}
                  onChange={(e) => onChange({ placeholder: e.target.value })}
                  placeholder="Placeholder text"
                  className="w-full px-2 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Auto fill source */}
            {field.field_type === "auto_fill" && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Auto-fill from
                </label>
                <select
                  value={field.auto_fill_source}
                  onChange={(e) =>
                    onChange({ auto_fill_source: e.target.value })
                  }
                  className="w-full px-2 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select source…</option>
                  {AUTO_FILL_SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Number min/max */}
            {field.field_type === "number" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Min Value
                  </label>
                  <input
                    type="number"
                    value={field.min_value ?? ""}
                    onChange={(e) =>
                      onChange({
                        min_value: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-2 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Max Value
                  </label>
                  <input
                    type="number"
                    value={field.max_value ?? ""}
                    onChange={(e) =>
                      onChange({
                        max_value: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-2 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </>
            )}

            {/* File accepted types */}
            {field.field_type === "file" && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Accepted File Types (comma-separated, e.g. .pdf,.docx)
                </label>
                <input
                  type="text"
                  value={field.accepted_file_types.join(",")}
                  onChange={(e) =>
                    onChange({
                      accepted_file_types: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder=".pdf,.docx,.xlsx"
                  className="w-full px-2 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Choices */}
            {["choice", "multi_choice"].includes(field.field_type) && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Choices
                </label>
                <ChoicesEditor
                  choices={field.choices}
                  onChange={(choices) => onChange({ choices })}
                />
              </div>
            )}
          </div>

          {/* Required toggle */}
          <div className="flex items-center gap-2">
            <input
              id={`req-${sectionIdx}-${fieldIdx}`}
              type="checkbox"
              checked={field.is_required}
              onChange={(e) => onChange({ is_required: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor={`req-${sectionIdx}-${fieldIdx}`}
              className="text-xs text-neutral-600 dark:text-neutral-400"
            >
              Required field
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Choices Editor ───────────────────────────────────────────────────────────

function ChoicesEditor({
  choices,
  onChange,
}: {
  choices: { value: string; label: string }[];
  onChange: (choices: { value: string; label: string }[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      {choices.map((choice, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="text"
            value={choice.label}
            onChange={(e) =>
              onChange(
                choices.map((c, i) =>
                  i === idx
                    ? {
                        ...c,
                        label: e.target.value,
                        value: e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "_"),
                      }
                    : c,
                ),
              )
            }
            placeholder={`Option ${idx + 1}`}
            className="flex-1 px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
          />
          <button
            onClick={() => onChange(choices.filter((_, i) => i !== idx))}
            className="text-red-400 hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...choices, { value: "", label: "" }])}
        className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700"
      >
        <Plus className="h-3 w-3" />
        Add option
      </button>
    </div>
  );
}
