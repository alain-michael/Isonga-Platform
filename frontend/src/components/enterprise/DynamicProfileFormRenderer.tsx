/**
 * DynamicProfileFormRenderer
 *
 * Renders a sector-specific business profile form definition returned by the
 * API (/enterprises/api/profile-forms/by-sector/?sector=...).
 *
 * Props:
 *   form          – form definition object (sections, fields)
 *   existingData  – { responses: {fieldId: value}, enterprise: EnterpriseData }
 *   onSubmit      – (responses, enterpriseFields) => void
 *   isSaving      – show loading state on save button
 *   readOnly      – disables all inputs (view mode)
 */

import React, { useState, useEffect } from "react";
import { Save, Upload, AlertCircle, Eye } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FieldDefinition {
  id: string;
  field_type: string;
  label: string;
  help_text: string;
  placeholder?: string;
  is_required: boolean;
  order: number;
  choices: { value: string; label: string }[];
  accepted_file_types: string[];
  max_file_size_mb: number | null;
  auto_fill_source: string;
  min_value: number | null;
  max_value: number | null;
}

export interface SectionDefinition {
  id: string;
  title: string;
  description: string;
  order: number;
  fields: FieldDefinition[];
}

export interface ProfileFormDefinition {
  id: string;
  sector: string;
  sector_display: string;
  name: string;
  description: string;
  is_active: boolean;
  sections: SectionDefinition[];
}

interface Props {
  form: ProfileFormDefinition;
  /** Existing saved responses: { fieldId: value } */
  existingResponses?: Record<string, any>;
  /** Enterprise data used to pre-fill auto_fill fields */
  enterpriseData?: Record<string, any>;
  onSubmit: (
    responses: Record<string, any>,
    enterpriseFields: Record<string, any>,
  ) => void;
  isSaving?: boolean;
  readOnly?: boolean;
  /** If true, renders in "view submitted answers" mode (compact) */
  viewMode?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DynamicProfileFormRenderer({
  form,
  existingResponses = {},
  enterpriseData = {},
  onSubmit,
  isSaving,
  readOnly,
  viewMode,
}: Props) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [fileValues, setFileValues] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialise values from existing responses or enterprise data (auto_fill)
  useEffect(() => {
    const init: Record<string, any> = {};
    form.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (existingResponses[String(field.id)] !== undefined) {
          init[String(field.id)] = existingResponses[String(field.id)];
        } else if (
          field.field_type === "auto_fill" &&
          field.auto_fill_source &&
          enterpriseData[field.auto_fill_source] !== undefined
        ) {
          init[String(field.id)] = enterpriseData[field.auto_fill_source];
        } else {
          init[String(field.id)] =
            field.field_type === "multi_choice" ? [] : "";
        }
      });
    });
    setValues(init);
  }, [form, existingResponses, enterpriseData]);

  const setValue = (fieldId: string, value: any) => {
    setValues((v) => ({ ...v, [fieldId]: value }));
    setErrors((e) => ({ ...e, [fieldId]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    form.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (!field.is_required) return;
        const val = values[String(field.id)];
        if (field.field_type === "file") {
          if (
            !fileValues[String(field.id)] &&
            !existingResponses[String(field.id)]
          ) {
            errs[String(field.id)] = `${field.label} is required`;
          }
        } else if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          errs[String(field.id)] = `${field.label} is required`;
        }
      });
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Collect enterprise model fields from auto_fill fields
    const enterpriseFields: Record<string, any> = {};
    form.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.field_type === "auto_fill" && field.auto_fill_source) {
          enterpriseFields[field.auto_fill_source] = values[String(field.id)];
        }
      });
    });

    // Build responses (include file names for file fields)
    const responses: Record<string, any> = { ...values };
    Object.entries(fileValues).forEach(([id, file]) => {
      if (file) responses[id] = file.name; // Will be uploaded separately
    });

    onSubmit(responses, enterpriseFields);
  };

  if (viewMode) {
    return <ViewModeRenderer form={form} responses={existingResponses} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {form.description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
          {form.description}
        </p>
      )}

      {form.sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <div
            key={section.id}
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5"
          >
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              {section.title}
            </h3>
            {section.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                {section.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.fields
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <FieldInput
                    key={field.id}
                    field={field}
                    value={values[String(field.id)] ?? ""}
                    fileValue={fileValues[String(field.id)] ?? null}
                    error={errors[String(field.id)]}
                    readOnly={readOnly || field.field_type === "auto_fill"}
                    onChange={(val) => setValue(String(field.id), val)}
                    onFileChange={(file) =>
                      setFileValues((fv) => ({
                        ...fv,
                        [String(field.id)]: file,
                      }))
                    }
                  />
                ))}
            </div>
          </div>
        ))}

      {!readOnly && (
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}

// ─── View Mode (read-only structured display) ─────────────────────────────────

function ViewModeRenderer({
  form,
  responses,
}: {
  form: ProfileFormDefinition;
  responses: Record<string, any>;
}) {
  return (
    <div className="space-y-4">
      {form.sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <div
            key={section.id}
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5"
          >
            <h4 className="font-semibold text-sm text-neutral-900 dark:text-white mb-3">
              {section.title}
            </h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {section.fields
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((field) => {
                  const raw = responses[String(field.id)];
                  let displayValue: React.ReactNode = (
                    <span className="text-neutral-400 italic text-xs">—</span>
                  );

                  if (raw !== undefined && raw !== null && raw !== "") {
                    if (field.field_type === "file") {
                      displayValue = (
                        <a
                          href={raw}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 text-xs underline"
                        >
                          <Eye className="h-3 w-3" />
                          View document
                        </a>
                      );
                    } else if (Array.isArray(raw)) {
                      displayValue = (
                        <span className="text-sm text-neutral-700 dark:text-neutral-200">
                          {raw.join(", ")}
                        </span>
                      );
                    } else {
                      displayValue = (
                        <span className="text-sm text-neutral-700 dark:text-neutral-200">
                          {String(raw)}
                        </span>
                      );
                    }
                  }

                  return (
                    <div key={field.id}>
                      <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {field.label}
                        {field.is_required && (
                          <span className="text-red-400 ml-0.5">*</span>
                        )}
                      </dt>
                      <dd className="mt-0.5">{displayValue}</dd>
                    </div>
                  );
                })}
            </dl>
          </div>
        ))}
    </div>
  );
}

// ─── Individual Field Input ───────────────────────────────────────────────────

interface FieldInputProps {
  field: FieldDefinition;
  value: any;
  fileValue: File | null;
  error?: string;
  readOnly?: boolean;
  onChange: (value: any) => void;
  onFileChange: (file: File | null) => void;
}

function FieldInput({
  field,
  value,
  fileValue,
  error,
  readOnly,
  onChange,
  onFileChange,
}: FieldInputProps) {
  const baseInput =
    "w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60 " +
    (error ? "border-red-400" : "border-neutral-300 dark:border-neutral-600");

  const isLongField = ["long_text"].includes(field.field_type);

  return (
    <div className={isLongField ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
        {field.label}
        {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
        {field.field_type === "auto_fill" && (
          <span className="ml-1 text-xs text-neutral-400 font-normal">
            (auto-filled)
          </span>
        )}
      </label>

      {field.help_text && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
          {field.help_text}
        </p>
      )}

      {/* Text */}
      {["text", "auto_fill"].includes(field.field_type) && (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || field.label}
          disabled={readOnly}
          className={baseInput}
        />
      )}

      {/* Long text */}
      {field.field_type === "long_text" && (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || field.label}
          rows={3}
          disabled={readOnly}
          className={baseInput + " resize-none"}
        />
      )}

      {/* Number */}
      {field.field_type === "number" && (
        <input
          type="number"
          value={value ?? ""}
          min={field.min_value ?? undefined}
          max={field.max_value ?? undefined}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : "")
          }
          placeholder={field.placeholder || ""}
          disabled={readOnly}
          className={baseInput}
        />
      )}

      {/* Date */}
      {field.field_type === "date" && (
        <input
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          className={baseInput}
        />
      )}

      {/* Single choice */}
      {field.field_type === "choice" && (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          className={baseInput}
        >
          <option value="">Select…</option>
          {field.choices.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      )}

      {/* Multi choice */}
      {field.field_type === "multi_choice" && (
        <div className="space-y-1 mt-1">
          {field.choices.map((c) => (
            <label
              key={c.value}
              className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
            >
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(c.value)}
                onChange={(e) => {
                  const arr = Array.isArray(value) ? [...value] : [];
                  onChange(
                    e.target.checked
                      ? [...arr, c.value]
                      : arr.filter((v) => v !== c.value),
                  );
                }}
                disabled={readOnly}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600"
              />
              {c.label}
            </label>
          ))}
        </div>
      )}

      {/* File upload */}
      {field.field_type === "file" && !readOnly && (
        <div>
          <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer hover:border-primary-400 bg-neutral-50 dark:bg-neutral-700/30">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-xs">
              <Upload className="h-4 w-4" />
              {fileValue ? (
                <span className="text-primary-600 font-medium">
                  {fileValue.name}
                </span>
              ) : value ? (
                <span className="text-green-600">File uploaded ✓</span>
              ) : (
                <span>
                  Click to upload
                  {field.accepted_file_types.length > 0 &&
                    ` (${field.accepted_file_types.join(", ")})`}
                </span>
              )}
            </div>
            <input
              type="file"
              accept={field.accepted_file_types.join(",") || undefined}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>
      )}

      {field.field_type === "file" && readOnly && value && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary-600 text-sm underline"
        >
          View uploaded file
        </a>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
