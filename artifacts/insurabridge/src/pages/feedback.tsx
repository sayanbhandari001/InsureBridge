import { useState } from "react"
import { useListFeedback, useListAppFeedback } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MessageSquare, Shield, Building2, Smartphone } from "lucide-react"
import { formatDate } from "@/lib/utils"

const TABS = [
  { id: "customer", label: "Customer", icon: MessageSquare, color: "text-blue-600" },
  { id: "tpa", label: "TPA", icon: Shield, color: "text-purple-600" },
  { id: "insurer", label: "Insurer", icon: Building2, color: "text-amber-600" },
  { id: "app", label: "App Feedback", icon: Smartphone, color: "text-green-600" },
]

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"}`} />
      ))}
    </div>
  )
}

function FeedbackCard({ feedback }: { feedback: any }) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">{feedback.customerName ?? feedback.userName ?? "Anonymous"}</h3>
            <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">{(feedback.category ?? feedback.feature ?? "").replace("_", " ")}</p>
          </div>
          {feedback.rating !== undefined && <StarRow rating={feedback.rating} />}
        </div>
        <p className="text-sm text-slate-700 italic border-l-2 border-primary/20 pl-3 py-1 mb-4">
          "{feedback.comment || feedback.description || "No comment provided."}"
        </p>
        <div className="flex justify-between items-center text-xs text-slate-400 pt-4 border-t border-slate-100">
          {feedback.targetEntity && (
            <span>Target: <span className="capitalize text-slate-600 font-medium">{feedback.targetEntity}</span></span>
          )}
          {feedback.deviceType && (
            <span className="capitalize bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{feedback.deviceType}</span>
          )}
          {feedback.status && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${feedback.status === "resolved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {feedback.status}
            </span>
          )}
          <span>{formatDate(feedback.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Feedback() {
  const [activeTab, setActiveTab] = useState("customer")
  const { data: allFeedback, isLoading: loadingFeedback } = useListFeedback()
  const { data: appFeedback, isLoading: loadingApp } = useListAppFeedback()

  const customerFeedback = allFeedback?.filter(f => f.targetEntity === "customer" || f.targetEntity === "hospital")
  const tpaFeedback = allFeedback?.filter(f => f.targetEntity === "tpa")
  const insurerFeedback = allFeedback?.filter(f => f.targetEntity === "insurer")

  const getTabData = () => {
    if (activeTab === "customer") return { items: customerFeedback, loading: loadingFeedback }
    if (activeTab === "tpa") return { items: tpaFeedback, loading: loadingFeedback }
    if (activeTab === "insurer") return { items: insurerFeedback, loading: loadingFeedback }
    return { items: appFeedback, loading: loadingApp }
  }

  const { items, loading } = getTabData()

  const avgRating = (data: typeof allFeedback) => {
    if (!data || data.length === 0) return 0
    const sum = data.reduce((acc, f) => acc + (f.rating ?? 0), 0)
    return (sum / data.length).toFixed(1)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Feedback & Ratings</h1>
        <p className="text-slate-500 mt-1">Monitor satisfaction, service quality and app experience.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Customer Reviews", value: customerFeedback?.length ?? 0, rating: avgRating(customerFeedback), color: "text-blue-600 bg-blue-50" },
          { label: "TPA Feedback", value: tpaFeedback?.length ?? 0, rating: avgRating(tpaFeedback), color: "text-purple-600 bg-purple-50" },
          { label: "Insurer Feedback", value: insurerFeedback?.length ?? 0, rating: avgRating(insurerFeedback), color: "text-amber-600 bg-amber-50" },
          { label: "App Feedback", value: appFeedback?.length ?? 0, rating: null, color: "text-green-600 bg-green-50" },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-md bg-white">
            <CardContent className="p-5">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              {s.rating !== null && s.value > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-slate-700">{s.rating}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ""}`} />
            {tab.label}
            {tab.id !== "app" && (
              <span className="ml-1 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                {tab.id === "customer" ? customerFeedback?.length : tab.id === "tpa" ? tpaFeedback?.length : insurerFeedback?.length}
              </span>
            )}
            {tab.id === "app" && (
              <span className="ml-1 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                {appFeedback?.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading feedback...</div>
        ) : !items || items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No feedback in this category yet.</p>
          </div>
        ) : items.map((feedback: any) => (
          <FeedbackCard key={feedback.id} feedback={feedback} />
        ))}
      </div>
    </div>
  )
}
