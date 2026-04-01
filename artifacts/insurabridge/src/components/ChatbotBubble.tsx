import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot, User, Loader2, RotateCcw } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const SUGGESTED = [
  "How do I file a claim?",
  "How do I join the hospital network?",
  "What is InsuraBridge?",
  "Contact support",
]

function getApiBase() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "")
  return `${base}/api`
}

export function ChatbotBubble() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streaming])

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return
    const userMsg: Message = { role: "user", content: text.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput("")
    setStreaming(true)

    const assistantMsg: Message = { role: "assistant", content: "" }
    setMessages([...next, assistantMsg])

    abortRef.current = new AbortController()

    try {
      const resp = await fetch(`${getApiBase()}/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: abortRef.current.signal,
      })

      if (!resp.ok || !resp.body) throw new Error("Failed to connect")

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.content) {
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + data.content,
                }
                return updated
              })
            }
            if (data.done) break
            if (data.error) throw new Error(data.error)
          } catch {}
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again or contact us at sayanbhandari007@gmail.com",
        }
        return updated
      })
    } finally {
      setStreaming(false)
      if (!open) setUnread(u => u + 1)
    }
  }

  function reset() {
    abortRef.current?.abort()
    setMessages([])
    setInput("")
    setStreaming(false)
  }

  return (
    <>
      {/* Floating bubble */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="w-[340px] sm:w-[380px] rounded-2xl border border-border shadow-2xl shadow-black/40 overflow-hidden flex flex-col"
              style={{ height: "500px", background: "hsl(var(--card))" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #00BFA5 100%)" }}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">InsuraBridge Assistant</p>
                  <p className="text-xs text-white/70">AI-powered support · Usually replies instantly</p>
                </div>
                <button onClick={reset} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Clear chat">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #00BFA5 100%)" }}>
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Hi there! 👋</p>
                      <p className="text-xs text-muted-foreground mt-1">I'm your InsuraBridge assistant. Ask me anything about claims, policies, or our platform.</p>
                    </div>
                    <div className="w-full space-y-2">
                      {SUGGESTED.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      {msg.role === "user"
                        ? <User className="w-3.5 h-3.5" />
                        : <Bot className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}>
                      {msg.content || (streaming && i === messages.length - 1
                        ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Thinking…</span>
                        : "")}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
                  className="flex gap-2"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything…"
                    disabled={streaming}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || streaming}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                    style={{ background: "linear-gradient(135deg, hsl(var(--primary)), #00BFA5)" }}
                  >
                    {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
                <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                  AI assistant · For urgent help call +91 8806822007
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bubble button */}
        <motion.button
          onClick={() => setOpen(o => !o)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="w-14 h-14 rounded-full text-white shadow-xl shadow-primary/40 flex items-center justify-center relative"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #00BFA5 100%)" }}
          aria-label="Open chat support"
        >
          <AnimatePresence mode="wait">
            {open
              ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <X className="w-6 h-6" />
                </motion.span>
              : <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <MessageCircle className="w-6 h-6" />
                </motion.span>
            }
          </AnimatePresence>
          {unread > 0 && !open && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
              {unread}
            </span>
          )}
          {/* Pulse ring */}
          {!open && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ background: "hsl(var(--primary))" }} />
          )}
        </motion.button>
      </div>
    </>
  )
}
