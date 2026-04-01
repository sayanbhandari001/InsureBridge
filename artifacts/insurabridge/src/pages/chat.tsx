import { useState, useEffect, useRef, useCallback } from "react"
import { useListThreads, useListMessages, useSendMessage, useCreateThread } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Send, MessageSquare, Search, Lock, AtSign, RefreshCw } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuth, ROLE_LABELS, ROLE_COLORS } from "@/lib/auth"

const ALL_ROLES = ["customer", "hospital", "tpa", "insurer", "admin"]

const ROLE_DISPLAY: Record<string, string> = {
  customer: "Patient Party",
  hospital: "Hospital",
  tpa: "TPA",
  insurer: "Insurance Company",
  admin: "Admin",
}

function renderMessageContent(content: string) {
  const parts = content.split(/(@\w+)/g)
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="bg-primary/20 text-primary font-semibold rounded px-1 py-0.5 text-[0.9em]">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export default function Chat() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { formatDate } = useLocale()
  const { data: allThreads, isLoading: threadsLoading, refetch: refetchThreads } = useListThreads()
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null)
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [search, setSearch] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [showMention, setShowMention] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionAnchor, setMentionAnchor] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const myThreads = allThreads?.filter(t =>
    user?.role && Array.isArray(t.participants) && t.participants.includes(user.role)
  ) ?? []

  const filteredThreads = myThreads.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase())
  )

  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useListMessages(
    { threadId: activeThreadId?.toString() },
    { query: { enabled: !!activeThreadId, refetchInterval: 5000 } }
  )

  // Auto-poll threads every 10s
  useEffect(() => {
    const id = setInterval(() => refetchThreads(), 10000)
    return () => clearInterval(id)
  }, [refetchThreads])

  const sendMutation = useSendMessage({
    mutation: {
      onSuccess: () => {
        setMessage("")
        queryClient.invalidateQueries({ queryKey: ["/api/messages"] })
        queryClient.invalidateQueries({ queryKey: ["/api/threads"] })
        setTimeout(() => refetchMessages(), 300)
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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle @mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMessage(val)
    const cursor = e.target.selectionStart ?? val.length
    const beforeCursor = val.slice(0, cursor)
    const atIdx = beforeCursor.lastIndexOf("@")
    if (atIdx !== -1 && !beforeCursor.slice(atIdx).includes(" ")) {
      setMentionQuery(beforeCursor.slice(atIdx + 1))
      setMentionAnchor(atIdx)
      setShowMention(true)
    } else {
      setShowMention(false)
    }
  }

  const insertMention = (role: string) => {
    const label = ROLE_DISPLAY[role] || role
    const before = message.slice(0, mentionAnchor)
    const after = message.slice(mentionAnchor + mentionQuery.length + 1)
    const newVal = `${before}@${label} ${after}`
    setMessage(newVal)
    setShowMention(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const mentionSuggestions = ALL_ROLES.filter(r =>
    r !== user?.role &&
    (ROLE_DISPLAY[r] || r).toLowerCase().includes(mentionQuery.toLowerCase())
  )

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

  function formatMsgTime(dateString: string) {
    const d = new Date(dateString)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    if (isToday) return time
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} · ${time}`
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col sm:flex-row gap-6 animate-in fade-in duration-500">
      {/* Threads sidebar */}
      <Card className="w-full sm:w-80 lg:w-96 flex-shrink-0 flex flex-col overflow-hidden border-none shadow-md bg-card">
        <div className="p-4 border-b border-border/50 flex flex-col gap-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">Messages</h2>
              {user && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  As <span className={`font-semibold px-1.5 py-0.5 rounded text-xs ${ROLE_COLORS[user.role]}`}>{ROLE_LABELS[user.role]}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => refetchThreads()} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Refresh">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <Button size="icon" variant="ghost" onClick={() => setIsNewThreadOpen(true)} className="h-8 w-8 bg-card border border-border hover:border-primary/40">
                <Plus className="w-4 h-4 text-primary" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
            <Input placeholder="Search threads..." className="pl-9 bg-card border-border h-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threadsLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-6 text-center">
              <Lock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No threads for your role.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Start a new conversation using the + button.</p>
            </div>
          ) : filteredThreads.map(thread => {
            return (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-150 ${
                  activeThreadId === thread.id
                    ? "bg-primary/5 border border-primary/20"
                    : "hover:bg-muted/30 border border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className={`font-medium text-sm truncate pr-2 ${activeThreadId === thread.id ? "text-primary" : "text-foreground"}`}>
                    {thread.subject}
                  </h4>
                  <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap shrink-0">
                    {thread.lastMessageAt ? formatDate(thread.lastMessageAt) : "New"}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {thread.participants.map((p: string) => (
                    <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[p] || "bg-muted/40 text-muted-foreground"} ${p === user?.role ? "ring-1 ring-current" : ""}`}>
                      {ROLE_LABELS[p] || p}{p === user?.role ? " (you)" : ""}
                    </span>
                  ))}
                </div>
                {thread.messageCount > 0 && (
                  <p className="text-[10px] text-muted-foreground/70 mt-1.5">{thread.messageCount} message{thread.messageCount !== 1 ? "s" : ""}</p>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-md bg-card min-h-0">
        {activeThreadId && activeThread ? (
          <>
            <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{activeThread.subject}</h3>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground/70">Participants:</span>
                  {activeThread.participants.map((p: string) => (
                    <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[p] || "bg-muted/40 text-muted-foreground"}`}>
                      {ROLE_LABELS[p] || p}{p === user?.role ? " (you)" : ""}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => refetchMessages()} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Refresh messages">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0 bg-muted/10">
              {messagesLoading ? (
                <div className="text-center text-muted-foreground text-sm">Loading messages...</div>
              ) : messages?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/70">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                  <p className="text-xs mt-1 opacity-60">Tip: Use <span className="bg-primary/20 text-primary px-1 rounded">@Role</span> to mention someone</p>
                </div>
              ) : messages?.map(msg => {
                const isMe = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`flex items-center gap-2 mb-1.5 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isMe ? "bg-primary" : "bg-muted-foreground/40"}`}>
                        {msg.senderName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{isMe ? "You" : msg.senderName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[msg.senderRole] || "bg-muted/40 text-muted-foreground"}`}>
                        {ROLE_LABELS[msg.senderRole] || msg.senderRole}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">{formatMsgTime(msg.createdAt)}</span>
                    </div>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-border/50 text-foreground rounded-tl-sm"
                    }`}>
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Mention suggestions */}
            {showMention && mentionSuggestions.length > 0 && (
              <div className="mx-4 mb-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                <p className="text-[10px] text-muted-foreground/60 px-3 py-1.5 border-b border-border/40 flex items-center gap-1">
                  <AtSign className="w-3 h-3" /> Mention a participant
                </p>
                {mentionSuggestions.map(role => (
                  <button key={role} type="button" onMouseDown={() => insertMention(role)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/40 transition-colors text-left">
                    <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${ROLE_COLORS[role] || ""}`}>{ROLE_LABELS[role]}</span>
                    @{ROLE_DISPLAY[role]}
                  </button>
                ))}
              </div>
            )}

            <div className="p-4 bg-card border-t border-border/50">
              <form onSubmit={handleSend} className="flex gap-2 items-center">
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${user ? "bg-primary" : "bg-muted/60"}`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={handleInputChange}
                    placeholder={`Message as ${user?.name ?? "you"}… (use @ to mention)`}
                    className="flex-1 rounded-full bg-muted/30 border-border pr-10"
                  />
                  <button type="button" onClick={() => { setMessage(m => m + "@"); setShowMention(true); setMentionQuery(""); inputRef.current?.focus() }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors" title="Mention someone">
                    <AtSign className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Button type="submit" disabled={!message.trim() || sendMutation.isPending} className="rounded-full px-5 gap-2 shrink-0">
                  Send <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground/40 text-center mt-1.5">
                Use @Role to highlight a participant · Messages refresh every 5s
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/70 bg-muted/20 p-8">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-1">Select a conversation</h3>
            <p className="text-sm text-center">Choose an existing thread from the left, or start a new one.</p>
            <p className="text-xs text-center mt-2 opacity-60">
              Use <span className="bg-primary/20 text-primary px-1 rounded">@Role</span> to tag participants in messages
            </p>
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
            <DialogDescription>Start a thread with the relevant parties. You can @mention them in messages to highlight.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateThread} className="space-y-5 mt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Subject <span className="text-red-500">*</span></label>
              <Input name="subject" required placeholder="Regarding Claim #CLM-123..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Add participants</label>
              <p className="text-xs text-muted-foreground">You ({ROLE_LABELS[user?.role ?? ""]}) are always included:</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-current opacity-60 ${ROLE_COLORS[user?.role ?? ""] || "bg-muted/40 text-muted-foreground"}`}>
                  {ROLE_LABELS[user?.role ?? ""]} (you)
                </span>
                {otherRoles.map(role => (
                  <button key={role} type="button" onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-150 ${
                      selectedRoles.includes(role)
                        ? `${ROLE_COLORS[role] || "bg-muted/40 text-muted-foreground"} border-current`
                        : "bg-card border-border text-muted-foreground hover:border-border"
                    }`}>
                    {selectedRoles.includes(role) ? "✓ " : ""}{ROLE_LABELS[role] || role}
                  </button>
                ))}
              </div>
              {selectedRoles.length === 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1 pt-0.5">Select at least one other participant.</p>
              )}
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setIsNewThreadOpen(false); setSelectedRoles([]) }}>Cancel</Button>
              <Button type="submit" disabled={threadMutation.isPending || selectedRoles.length === 0}>
                {threadMutation.isPending ? "Creating..." : "Create Thread"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
