import { useListFeedback } from "@workspace/api-client-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function Feedback() {
  const { data: feedbacks, isLoading } = useListFeedback()

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"}`} />
    ))
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Customer Feedback</h1>
        <p className="text-slate-500 mt-1">Monitor satisfaction and service ratings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading feedback...</div>
        ) : feedbacks?.map((feedback) => (
          <Card key={feedback.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{feedback.customerName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">{feedback.category.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-0.5">
                  {renderStars(feedback.rating)}
                </div>
              </div>
              <p className="text-sm text-slate-700 italic border-l-2 border-primary/20 pl-3 py-1 mb-4">
                "{feedback.comment || 'No comment provided.'}"
              </p>
              <div className="flex justify-between items-center text-xs text-slate-400 pt-4 border-t border-slate-100">
                <span>Target: <span className="capitalize text-slate-600 font-medium">{feedback.targetEntity}</span></span>
                <span>{formatDate(feedback.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
