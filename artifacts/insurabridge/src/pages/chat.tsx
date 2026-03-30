import { useState, useEffect, useRef } from "react"
import { useListThreads, useListMessages, useSendMessage, useCreateThread } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Send, MessageSquare, Search, Lock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuth, ROLE_LABELS, ROLE_COLORS } from "@/lib/auth"

const ALL_ROLES = ["customer", "hospital", "tpa", "insurer", "admin"]

export default function Chat() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data: allThreads, isLoading: threadsLoading } = useListThreads()
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null)
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [search, setSearch] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter threads to only those where the current user's role is a participant
  const myThreads = allThreads?.filter(t =>
    user?.role && Array.isArray(t.participants) && t.participants.includes(user.role)
  ) ?? []

  const filteredThreads = myThreads.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase())
  )

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
        setSelectedRoles([])
        setActiveThreadId(data.id)
        queryClient.invalidateQueries({ queryKey: ["/api/threads"] })
      }
    }
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !activeThreadId || !user) return
    sendMutation.mutate({
      data: {
        threadId: activeThreadId,
        content: message,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
      }
    })
  }

  const handleCreateThread = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    const fd = new FormData(e.currentTarget)
    // Always include the current user's role; add selected additional roles
    const participants = Array.from(new Set([user.role, ...selectedRoles]))
    threadMutation.mutate({
      data: {
        subject: fd.get("subject") as string,
        participants,
      }
    })
  }

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const activeThread = myThreads.find(t => t.id === activeThreadId)
  const otherRoles = ALL_ROLES.filter(r => r !== user?.role)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col sm:flex-row gap-6 animate-in fade-in duration-500">
      {/* Threads sidebar */}
      <Card className="w-full sm:w-80 lg:w-96 flex-shrink-0 flex flex-col overflow-hidden border-none shadow-md bg-white">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900">Messages</h2>
              {user && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing threads for <span className={`font-semibold px-1.5 py-0.5 rounded text-xs ${ROLE_COLORS[user.role]}`}>{ROLE_LABELS[user.role]}</span>
                </p>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsNewThreadOpen(true)}
              className="h-8 w-8 bg-white border border-slate-200 hover:border-primary/40"
            >
              <Plus className="w-4 h-4 text-primary" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search threads..."
              className="pl-9 bg-white border-slate-200 h-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threadsLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-6 text-center">
              <Lock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No threads for your role.</p>
              <p className="text-xs text-slate-400 mt-1">Start a new conversation using the + button.</p>
            </div>
          ) : filteredThreads.map(thread => {
            const otherParticipants = thread.participants.filter((p: string) => p !== user?.role)
            return (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-150 ${
                  activeThreadId === thread.id
                    ? "bg-primary/5 border border-primary/20"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className={`font-medium text-sm truncate pr-2 ${activeThreadId === thread.id ? "text-primary" : "text-slate-900"}`}>
                    {thread.subject}
                  </h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                    {thread.lastMessageAt ? formatDate(thread.lastMessageAt) : "New"}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {thread.participants.map((p: string) => (
                    <span
                      key={p}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[p] || "bg-slate-100 text-slate-600"} ${p === user?.role ? "ring-1 ring-current ring-offset-0" : ""}`}
                    >
                      {ROLE_LABELS[p] || p}
                      {p === user?.role && " (you)"}
                    </span>
                  ))}
                </div>
                {thread.messageCount > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1.5">{thread.messageCount} message{thread.messageCount !== 1 ? "s" : ""}</p>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-md bg-white min-h-0">
        {activeThreadId && activeThread ? (
          <>
            {/* Thread header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900">{activeThread.subject}</h3>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-xs text-slate-400">Participants:</span>
                {activeThread.participants.map((p: string) => (
                  <span
                    key={p}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[p] || "bg-slate-100 text-slate-600"}`}
                  >
                    {ROLE_LABELS[p] || p}
                    {p === user?.role && " (you)"}
                  </span>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/30 min-h-0">
              {messagesLoading ? (
                <div className="text-center text-slate-500 text-sm">Loading messages...</div>
              ) : messages?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : messages?.map(msg => {
                const isMe = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`flex items-center gap-2 mb-1.5 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isMe ? "bg-primary" : "bg-slate-400"}`}>
                        {msg.senderName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-slate-700">{isMe ? "You" : msg.senderName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[msg.senderRole] || "bg-slate-100 text-slate-600"}`}>
                        {ROLE_LABELS[msg.senderRole] || msg.senderRole}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Send box */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex gap-2 items-center">
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${user ? "bg-primary" : "bg-slate-300"}`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <Input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Message as ${user?.name ?? "you"}...`}
                  className="flex-1 rounded-full bg-slate-50 border-slate-200"
                />
                <Button
                  type="submit"
                  disabled={!message.trim() || sendMutation.isPending}
                  className="rounded-full px-5 gap-2 shrink-0"
                >
                  Send <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-8">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-slate-600 mb-1">Select a conversation</h3>
            <p className="text-sm text-center">Choose an existing thread from the left, or start a new one.</p>
            {myThreads.length === 0 && !threadsLoading && (
              <Button className="mt-6 gap-2" onClick={() => setIsNewThreadOpen(true)}>
                <Plus className="w-4 h-4" /> Start a Conversation
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* New thread dialog */}
      <Dialog open={isNewThreadOpen} onOpenChange={setIsNewThreadOpen}>
        <DialogContent onClose={() => { setIsNewThreadOpen(false); setSelectedRoles([]) }}>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>Start a thread with the relevant parties for this issue.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateThread} className="space-y-5 mt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Subject</label>
              <Input name="subject" required placeholder="Regarding Claim #CLM-123..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Add participants</label>
              <p className="text-xs text-slate-500">You ({ROLE_LABELS[user?.role ?? ""]}) are always included. Select who else can see this thread:</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {/* Current user's role — always included, disabled */}
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-current opacity-60 ${ROLE_COLORS[user?.role ?? ""] || "bg-slate-100 text-slate-700"}`}>
                  {ROLE_LABELS[user?.role ?? ""]} (you)
                </span>
                {otherRoles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-150 ${
                      selectedRoles.includes(role)
                        ? `${ROLE_COLORS[role] || "bg-slate-100 text-slate-700"} border-current`
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                    }`}
                  >
                    {selectedRoles.includes(role) ? "✓ " : ""}{ROLE_LABELS[role] || role}
                  </button>
                ))}
              </div>
              {selectedRoles.length === 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1 pt-0.5">
                  Select at least one other participant to start a conversation.
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setIsNewThreadOpen(false); setSelectedRoles([]) }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={threadMutation.isPending || selectedRoles.length === 0}
              >
                {threadMutation.isPending ? "Creating..." : "Create Thread"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
