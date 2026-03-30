import { useState } from "react"
import { useListThreads, useListMessages, useSendMessage, useCreateThread } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Send, MessageSquare, Search } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function Chat() {
  const queryClient = useQueryClient()
  const { data: threads, isLoading: threadsLoading } = useListThreads()
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null)
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false)
  const [message, setMessage] = useState("")

  const { data: messages, isLoading: messagesLoading } = useListMessages(
    { threadId: activeThreadId?.toString() },
    { query: { enabled: !!activeThreadId } }
  )

  const sendMutation = useSendMessage({
    mutation: {
      onSuccess: () => {
        setMessage("")
        queryClient.invalidateQueries({ queryKey: ["/api/messages"] })
      }
    }
  })

  const threadMutation = useCreateThread({
    mutation: {
      onSuccess: (data) => {
        setIsNewThreadOpen(false)
        setActiveThreadId(data.id)
        queryClient.invalidateQueries({ queryKey: ["/api/threads"] })
      }
    }
  })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !activeThreadId) return
    sendMutation.mutate({
      data: {
        threadId: activeThreadId,
        content: message,
        senderId: 1, // mock user
        senderName: "Admin User",
        senderRole: "admin"
      }
    })
  }

  const handleCreateThread = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    threadMutation.mutate({
      data: {
        subject: fd.get("subject") as string,
        participants: ["admin", "hospital"] // mocked for demo
      }
    })
  }

  const activeThread = threads?.find(t => t.id === activeThreadId)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col sm:flex-row gap-6 animate-in fade-in duration-500">
      {/* Threads List */}
      <Card className="w-full sm:w-80 lg:w-96 flex-shrink-0 flex flex-col overflow-hidden border-none shadow-md bg-white">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-slate-900">Messages</h2>
            <Button size="icon" variant="ghost" onClick={() => setIsNewThreadOpen(true)} className="h-8 w-8 bg-white border border-slate-200">
              <Plus className="w-4 h-4 text-primary" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search messages..." className="pl-9 bg-white border-slate-200 h-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threadsLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
          ) : threads?.map(thread => (
            <button
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                activeThreadId === thread.id 
                  ? "bg-primary/5 border border-primary/20" 
                  : "hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className={`font-medium truncate pr-2 ${activeThreadId === thread.id ? 'text-primary' : 'text-slate-900'}`}>
                  {thread.subject}
                </h4>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {thread.lastMessageAt ? formatDate(thread.lastMessageAt) : 'New'}
                </span>
              </div>
              <p className="text-sm text-slate-500 truncate">
                {thread.participants.join(', ')}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-md bg-white">
        {activeThreadId ? (
          <>
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-900">{activeThread?.subject}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Participants: {activeThread?.participants.join(', ')}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {messagesLoading ? (
                <div className="text-center text-slate-500">Loading messages...</div>
              ) : messages?.map(msg => {
                const isMe = msg.senderRole === "admin" // Mock check
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-xs font-medium text-slate-700">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{msg.senderRole}</span>
                      <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                      isMe 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              {messages?.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type your message..." 
                  className="flex-1 rounded-full bg-slate-50 border-slate-200"
                />
                <Button type="submit" disabled={!message.trim() || sendMutation.isPending} className="rounded-full px-6 gap-2">
                  Send <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-slate-600 mb-1">Select a thread</h3>
            <p className="text-sm">Choose an existing conversation or start a new one.</p>
          </div>
        )}
      </Card>

      <Dialog open={isNewThreadOpen} onOpenChange={setIsNewThreadOpen}>
        <DialogContent onClose={() => setIsNewThreadOpen(false)}>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>Start a new thread with related parties.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateThread} className="space-y-4 mt-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Subject</label>
              <Input name="subject" required placeholder="Regarding Claim #CLM-123" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsNewThreadOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={threadMutation.isPending}>
                {threadMutation.isPending ? "Creating..." : "Create Thread"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
