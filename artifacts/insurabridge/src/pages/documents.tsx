import { useState, useRef } from "react"
import { useListDocuments, useUploadDocument } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { Upload, FileText, Search, Download, AlertCircle, FileSpreadsheet, FileType2, X, Plus, ExternalLink } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

const ALLOWED_TYPES: Record<string, { label: string; exts: string; mime: string[] }> = {
  pdf: { label: "PDF Document", exts: ".pdf", mime: ["application/pdf"] },
  excel: { label: "Excel Spreadsheet", exts: ".xls,.xlsx", mime: ["application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] },
  word: { label: "Word Document", exts: ".doc,.docx", mime: ["application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"] },
}
const ALL_ALLOWED_MIME = Object.values(ALLOWED_TYPES).flatMap(t => t.mime)
const ALL_ALLOWED_EXTS = Object.values(ALLOWED_TYPES).map(t => t.exts).join(",")

function fileIcon(mimeOrName: string) {
  const s = mimeOrName.toLowerCase()
  if (s.includes("excel") || s.includes("spreadsheet") || s.endsWith(".xls") || s.endsWith(".xlsx"))
    return <FileSpreadsheet className="w-5 h-5 text-green-500" />
  if (s.includes("word") || s.includes("wordprocessing") || s.endsWith(".doc") || s.endsWith(".docx"))
    return <FileType2 className="w-5 h-5 text-blue-400" />
  return <FileText className="w-5 h-5 text-red-400" />
}

function fileLabel(mimeOrName: string) {
  const s = mimeOrName.toLowerCase()
  if (s.includes("excel") || s.includes("spreadsheet") || s.endsWith(".xls") || s.endsWith(".xlsx")) return "Excel"
  if (s.includes("word") || s.includes("wordprocessing") || s.endsWith(".doc") || s.endsWith(".docx")) return "Word"
  return "PDF"
}

export default function Documents() {
  const queryClient = useQueryClient()
  const { formatDate } = useLocale()
  const { user } = useAuth()
  const { data: documents, isLoading } = useListDocuments()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [fileError, setFileError] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [bulkFiles, setBulkFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bulkInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useUploadDocument({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/documents"] })
        setIsUploadOpen(false)
        setSelectedFile(null)
        setFileError("")
      }
    }
  })

  function validateFile(file: File): string | null {
    if (!ALL_ALLOWED_MIME.includes(file.type)) {
      return `File type not allowed. Only PDF, Excel (.xls/.xlsx), and Word (.doc/.docx) files are accepted.`
    }
    if (file.size > 20 * 1024 * 1024) return "File size must be under 20 MB."
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateFile(file)
    if (err) { setFileError(err); setSelectedFile(null); return }
    setFileError("")
    setSelectedFile(file)
  }

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const invalid = files.filter(f => !!validateFile(f))
    if (invalid.length > 0) {
      setFileError(`Some files are not allowed: ${invalid.map(f => f.name).join(", ")}. Only PDF, Excel, Word files accepted.`)
      return
    }
    setFileError("")
    setBulkFiles(prev => [...prev, ...files])
  }

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) { setFileError("Please select a file."); return }
    const fd = new FormData(e.currentTarget)
    uploadMutation.mutate({
      data: {
        fileName: selectedFile.name,
        documentType: fd.get("documentType") as any,
        url: `https://storage.insurabridge.io/docs/${user?.id}/${Date.now()}_${selectedFile.name}`,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        uploadedById: user?.id ?? 1,
        uploaderName: user?.name ?? "User",
        uploaderRole: user?.role ?? "admin",
        notes: fd.get("notes") as string
      }
    })
  }

  const filteredDocs = (documents ?? []).filter(doc => {
    const q = search.toLowerCase()
    if (q && !doc.fileName.toLowerCase().includes(q) && !doc.uploaderName?.toLowerCase().includes(q)) return false
    if (typeFilter !== "all" && !doc.fileType?.toLowerCase().includes(typeFilter)) return false
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Documents Hub</h1>
          <p className="text-muted-foreground mt-1">Manage and verify all uploaded files securely. Accepted: PDF, Excel, Word only.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Bulk Upload
          </Button>
          <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
            <Upload className="w-4 h-4" /> Upload Document
          </Button>
        </div>
      </div>

      {/* File type notice */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
        <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Allowed file types: </span>
          {Object.values(ALLOWED_TYPES).map((t, i, a) => (
            <span key={t.label}><span className="font-medium text-foreground">{t.label}</span> ({t.exts}){i < a.length - 1 ? ", " : ""}</span>
          ))}. Max 20 MB per file.
        </div>
      </div>

      <Card className="border-none shadow-md bg-card">
        <div className="p-4 border-b border-border/50 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
            <Input placeholder="Search by filename or uploader..." className="pl-9 bg-muted/30 border-border" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg bg-muted/40 border border-border text-foreground outline-none">
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="word">Word</option>
          </select>
          {(search || typeFilter !== "all") && (
            <button onClick={() => { setSearch(""); setTypeFilter("all") }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Document</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Uploaded By</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading documents...</td></tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No documents found.</p>
                  </td>
                </tr>
              ) : filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-card border border-border/40 rounded-lg group-hover:border-primary/30 transition-colors">
                        {fileIcon(doc.fileType ?? doc.fileName ?? "")}
                      </div>
                      <div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
                          {doc.fileName}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                        </a>
                        <p className="text-xs text-muted-foreground">
                          {((doc.fileSize ?? 0) / 1024 / 1024).toFixed(2)} MB · {fileLabel(doc.fileType ?? doc.fileName ?? "")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-muted/40 text-muted-foreground rounded-md text-xs font-medium uppercase tracking-wider">
                      {(doc.documentType ?? "").replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{doc.uploaderName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doc.uploaderRole}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(doc.createdAt)}</td>
                  <td className="px-6 py-4"><StatusBadge status={doc.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-primary">
                        <Download className="w-4 h-4" /> Download
                      </Button>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Single Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent onClose={() => { setIsUploadOpen(false); setSelectedFile(null); setFileError("") }}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Accepted formats: PDF, Excel (.xls/.xlsx), Word (.doc/.docx). Max 20 MB.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 mt-4">
            {/* File picker */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Select File <span className="text-red-500">*</span></label>
              <div
                className={cn("mt-2 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-primary/60",
                  selectedFile ? "border-green-500/50 bg-green-500/5" : "border-border")}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    {fileIcon(selectedFile.type)}
                    <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" onClick={e => { e.stopPropagation(); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value="" }}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Click to select a file</p>
                    <p className="text-xs text-muted-foreground/60">PDF, Excel, Word · Max 20 MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept={ALL_ALLOWED_EXTS} className="hidden" onChange={handleFileChange} />
              {fileError && (
                <div className="mt-2 flex items-start gap-2 text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {fileError}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Document Type <span className="text-red-500">*</span></label>
              <select name="documentType" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="bill">Bill</option>
                <option value="discharge_summary">Discharge Summary</option>
                <option value="prescription">Prescription</option>
                <option value="lab_report">Lab Report</option>
                <option value="tpa_form">TPA Form</option>
                <option value="insurance_form">Insurance Form</option>
                <option value="id_proof">ID Proof</option>
                <option value="claims_data">Claims Data</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Notes (Optional)</label>
              <textarea name="notes" rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Additional context..." />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setIsUploadOpen(false); setSelectedFile(null); setFileError("") }}>Cancel</Button>
              <Button type="submit" disabled={uploadMutation.isPending || !selectedFile}>
                {uploadMutation.isPending ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent onClose={() => { setIsBulkOpen(false); setBulkFiles([]); setFileError("") }}>
          <DialogHeader>
            <DialogTitle>Bulk Upload – Claims Data</DialogTitle>
            <DialogDescription>Upload multiple files at once. Accepted: PDF, Excel, Word. Max 20 MB each.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition-colors"
              onClick={() => bulkInputRef.current?.click()}
              onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files); const invalid = files.filter(f => !!validateFile(f)); if (invalid.length) { setFileError(`Not allowed: ${invalid.map(f=>f.name).join(",")}`) } else { setFileError(""); setBulkFiles(p => [...p, ...files.filter(f => !validateFile(f))]) } }}
              onDragOver={e => e.preventDefault()}
            >
              <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-muted-foreground/60 mt-1">PDF, Excel, Word · Max 20 MB each</p>
            </div>
            <input ref={bulkInputRef} type="file" accept={ALL_ALLOWED_EXTS} multiple className="hidden" onChange={handleBulkFileChange} />

            {fileError && (
              <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {fileError}
              </div>
            )}

            {bulkFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{bulkFiles.length} file{bulkFiles.length !== 1 ? "s" : ""} selected:</p>
                {bulkFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted/20 rounded-lg px-3 py-2">
                    {fileIcon(f.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground">{(f.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={() => setBulkFiles(p => p.filter((_,j) => j !== i))}
                      className="text-muted-foreground hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setIsBulkOpen(false); setBulkFiles([]); setFileError("") }}>Cancel</Button>
              <Button disabled={bulkFiles.length === 0} onClick={() => { setBulkFiles([]); setIsBulkOpen(false) }}>
                Upload {bulkFiles.length > 0 ? `${bulkFiles.length} file${bulkFiles.length !== 1 ? "s" : ""}` : ""}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
