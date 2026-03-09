import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Briefcase,
  Link as LinkIcon,
  Phone,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { assessmentAPI } from "../../services/api";

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  contact: string;
  link: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const emptyForm = (): Omit<Service, "id" | "created_at" | "updated_at"> => ({
  name: "",
  description: "",
  price: "",
  contact: "",
  link: "",
  is_active: true,
});

const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await assessmentAPI.getServices();
      setServices(res.data.results ?? res.data);
    } catch {
      setError("Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreate = () => {
    setEditingService(null);
    setFormData(emptyForm());
    setError(null);
    setShowModal(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      contact: service.contact,
      link: service.link,
      is_active: service.is_active,
    });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData(emptyForm());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Service name is required.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      if (editingService) {
        await assessmentAPI.updateService(editingService.id, formData);
        setSuccess("Service updated successfully.");
      } else {
        await assessmentAPI.createService(formData);
        setSuccess("Service created successfully.");
      }
      closeModal();
      await fetchServices();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.name?.[0] ||
          "Failed to save service.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!window.confirm(`Delete "${service.name}"? This cannot be undone.`))
      return;
    try {
      setDeleting(service.id);
      await assessmentAPI.deleteService(service.id);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      setSuccess(`"${service.name}" deleted.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to delete service.");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const updated = await assessmentAPI.updateService(service.id, {
        is_active: !service.is_active,
      });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? updated.data : s)),
      );
    } catch {
      setError("Failed to update service status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Services
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage platform services that can be recommended to SMEs.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && !showModal && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Service cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 animate-pulse glass-effect dark:bg-neutral-800 h-44"
            />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 glass-effect dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <Briefcase className="w-14 h-14 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            No services yet
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            Add services so they can be recommended to SMEs in assessments.
          </p>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`glass-effect dark:bg-neutral-800 rounded-2xl border p-5 flex flex-col gap-3 transition-all ${
                service.is_active
                  ? "border-neutral-200 dark:border-neutral-700"
                  : "border-neutral-100 dark:border-neutral-800 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white truncate">
                    {service.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleToggleActive(service)}
                  title={service.is_active ? "Deactivate" : "Activate"}
                  className="text-neutral-400 hover:text-primary-500 transition-colors flex-shrink-0"
                >
                  {service.is_active ? (
                    <ToggleRight className="w-6 h-6 text-primary-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
              </div>

              {service.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {service.description}
                </p>
              )}

              <div className="space-y-1.5 text-sm">
                {service.price && (
                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                    <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{service.price}</span>
                  </div>
                )}
                {service.contact && (
                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{service.contact}</span>
                  </div>
                )}
                {service.link && (
                  <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                    <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <a
                      href={service.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {service.link}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-neutral-100 dark:border-neutral-700">
                <button
                  onClick={() => openEdit(service)}
                  className="flex-1 btn-secondary py-1.5 text-sm flex items-center justify-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service)}
                  disabled={deleting === service.id}
                  className="flex-1 py-1.5 text-sm flex items-center justify-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting === service.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect dark:bg-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {editingService ? "Edit Service" : "Add Service"}
              </h2>
              <button
                onClick={closeModal}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Service Name *
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                  placeholder="e.g. Business Advisory Services"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none resize-none"
                  placeholder="Brief description of what the service offers…"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Price
                  </label>
                  <input
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, price: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                    placeholder="e.g. RWF 50,000 or Free"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Contact
                  </label>
                  <input
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, contact: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                    placeholder="+250 700 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Link / URL
                </label>
                <input
                  value={formData.link}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, link: e.target.value }))
                  }
                  type="url"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:outline-none"
                  placeholder="https://example.com/service"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="svc-active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, is_active: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600"
                />
                <label
                  htmlFor="svc-active"
                  className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  Active (visible for recommendations)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn-secondary py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving
                    ? "Saving…"
                    : editingService
                      ? "Save Changes"
                      : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
