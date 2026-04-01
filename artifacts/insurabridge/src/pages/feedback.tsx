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
        <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground fill-muted-foreground/30"}`} />
      ))}
    </div>
  )
}

function FeedbackCard({ feedback }: { feedback: any }) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-foreground">{feedback.customerName ?? feedback.userName ?? "Anonymous"}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">{(feedback.category ?? feedback.feature ?? "").replace("_", " ")}</p>
          </div>
          {feedback.rating !== undefined && <StarRow rating={feedback.rating} />}
        </div>
        <p className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3 py-1 mb-4">
          "{feedback.comment || feedback.description || "No comment provided."}"
        </p>
        <div className="flex justify-between items-center text-xs text-muted-foreground/70 pt-4 border-t border-border/50">
          {feedback.targetEntity && (
            <span>Target: <span className="capitalize text-muted-foreground font-medium">{feedback.targetEntity}</span></span>
          )}
          {feedback.deviceType && (
            <span className="capitalize bg-muted/40 text-muted-foreground px-2 py-0.5 rounded font-medium">{feedback.deviceType}</span>
          )}
          {feedback.status && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${feedback.status === "resolved" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
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
        <h1 className="text-3xl font-display font-bold text-foreground">Feedback & Ratings</h1>
        <p className="text-muted-foreground mt-1">Monitor satisfaction, service quality and app experience.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Customer Reviews", value: customerFeedback?.length ?? 0, rating: avgRating(customerFeedback), color: "text-blue-400 bg-blue-500/15" },
          { label: "TPA Feedback", value: tpaFeedback?.length ?? 0, rating: avgRating(tpaFeedback), color: "text-purple-400 bg-purple-500/15" },
          { label: "Insurer Feedback", value: insurerFeedback?.length ?? 0, rating: avgRating(insurerFeedback), color: "text-amber-400 bg-amber-500/15" },
          { label: "App Feedback", value: appFeedback?.length ?? 0, rating: null, color: "text-emerald-400 bg-emerald-500/15" },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-md bg-card">
            <CardContent className="p-5">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              {s.rating !== null && s.value > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-muted-foreground">{s.rating}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-muted-foreground"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ""}`} />
            {tab.label}
            {tab.id !== "app" && (
              <span className="ml-1 text-xs bg-muted/40 text-muted-foreground px-1.5 py-0.5 rounded-full">
                {tab.id === "customer" ? customerFeedback?.length : tab.id === "tpa" ? tpaFeedback?.length : insurerFeedback?.length}
              </span>
            )}
            {tab.id === "app" && (
              <span className="ml-1 text-xs bg-muted/40 text-muted-foreground px-1.5 py-0.5 rounded-full">
                {appFeedback?.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Loading feedback...</div>
        ) : !items || items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground/70">
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
