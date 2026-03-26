"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface FormRecord {
  id: string;
  fullName: string;
  idNumber: string;
  answers: string;
  pdfPath: string;
  createdAt: string;
}

interface FormsResponse {
  forms: FormRecord[];
  total: number;
  pages: number;
  currentPage: number;
}

export default function AdminFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page.toString());

      const res = await fetch(`/api/forms?${params}`);

      if (res.status === 401) {
        router.push("/admin");
        return;
      }

      const data: FormsResponse = await res.json();
      setForms(data.forms);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch {
      console.error("Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  }, [search, page, router]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchForms();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  };

  const handleDownload = (id: string) => {
    window.open(`/api/forms/${id}?download=true`, "_blank");
  };

  const handleView = (id: string) => {
    setViewingPdf(`/api/forms/${id}?download=true`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            ניהול טפסים חתומים
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            התנתק
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש לפי שם או תעודת זהות..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              dir="rtl"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              חפש
            </button>
          </div>
        </form>

        {/* Stats */}
        <div className="mb-4 text-sm text-gray-500">
          סה&quot;כ {total} טפסים
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">טוען...</div>
        ) : forms.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
            לא נמצאו טפסים
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    שם מלא
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    ת.ז.
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    תאריך
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr
                    key={form.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {form.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 ltr" dir="ltr">
                      {form.idNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(form.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(form.id)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          צפה
                        </button>
                        <button
                          onClick={() => handleDownload(form.id)}
                          className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          הורד
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              הקודם
            </button>
            <span className="text-sm text-gray-600">
              עמוד {page} מתוך {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              הבא
            </button>
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-800">צפייה בטופס</h3>
              <button
                onClick={() => setViewingPdf(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={viewingPdf}
                className="w-full h-full rounded-lg border"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
