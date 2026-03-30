import { useState } from "react"
import { useListDocuments, useUploadDocument } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { Upload, File, Search, Download } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

export default function Documents() {
  const queryClient = useQueryClient()
  const { data: documents, isLoading } = useListDocuments()
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const uploadMutation = useUploadDocument({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/documents"] })
        setIsUploadOpen(false)
      }
    }
  })

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    uploadMutation.mutate({
      data: {
        fileName: fd.get("fileName") as string,
        documentType: fd.get("documentType") as any,
        url: "https://example.com/mock-doc.pdf",
        fileType: "application/pdf",
        fileSize: 1024500,
        uploadedById: 1,
        uploaderName: "Admin User",
        uploaderRole: "admin",
        notes: fd.get("notes") as string
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Documents Hub</h1>
          <p className="text-slate-500 mt-1">Manage and verify all uploaded files securely.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
          <Upload className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      <Card className="border-none shadow-md">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search documents by name or type..." className="pl-9 bg-slate-50 border-slate-200" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Document</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Uploaded By</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading documents...</td></tr>
              ) : documents?.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-primary">
                        <File className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{doc.fileName}</p>
                        <p className="text-xs text-slate-500">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.fileType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium uppercase tracking-wider">
                      {doc.documentType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{doc.uploaderName}</p>
                    <p className="text-xs text-slate-500 capitalize">{doc.uploaderRole}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(doc.createdAt)}</td>
                  <td className="px-6 py-4"><StatusBadge status={doc.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-slate-600 hover:text-primary">
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent onClose={() => setIsUploadOpen(false)}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Add a new document to the system repository.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 mt-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">File Name</label>
              <Input name="fileName" required placeholder="Patient_Bill_01.pdf" />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Document Type</label>
              <select name="documentType" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="bill">Bill</option>
                <option value="discharge_summary">Discharge Summary</option>
                <option value="prescription">Prescription</option>
                <option value="lab_report">Lab Report</option>
                <option value="tpa_form">TPA Form</option>
                <option value="insurance_form">Insurance Form</option>
                <option value="id_proof">ID Proof</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Notes (Optional)</label>
              <textarea name="notes" rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Additional context..." />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
