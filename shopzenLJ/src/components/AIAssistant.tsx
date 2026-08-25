import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User as UserIcon, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { apiAIChat } from "@/services/api";
import { Product } from "@/types";
import { Link } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommended_products?: Product[];
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! 👋 I'm ShopZen AI Assistant. How can I help you find products, outfits, or recommendations today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const payload = newMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await apiAIChat(payload);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: res.reply,
          recommended_products: res.recommended_products
        }
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I ran into an error retrieving recommendations. Please try again!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-105 transition-all duration-200 ring-4 ring-primary/20"
        aria-label="Open AI Shopping Assistant"
      >
        <Sparkles className="h-6 w-6 animate-pulse text-amber-300" />
      </button>

      {/* Slide-over Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[540px] bg-background border shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-amber-300" />
              <div>
                <h3 className="font-semibold text-sm">ShopZen AI Assistant</h3>
                <p className="text-[10px] text-primary-foreground/80">Real-time smart recommendations</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages container */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 text-sm bg-muted/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent/20 text-accent-foreground"
                }`}>
                  {msg.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`space-y-2 max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                  <div className={`p-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card border text-card-foreground shadow-sm rounded-tl-none"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Render Recommended Products if present */}
                  {msg.recommended_products && msg.recommended_products.length > 0 && (
                    <div className="space-y-2 pt-1 text-left">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Recommended Items:
                      </p>
                      <div className="grid gap-2">
                        {msg.recommended_products.map((p) => (
                          <Card key={p.id} className="p-2 flex items-center gap-2 hover:bg-muted/50 transition-colors">
                            <img src={p.image || "https://picsum.photos/48/48"} alt="" className="h-10 w-10 rounded object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold line-clamp-1">{p.name || p.title}</p>
                              <p className="text-[11px] text-green-600 font-bold">₹{p.price.toLocaleString()}</p>
                            </div>
                            <Link to={`/products/${p.id}`} onClick={() => setIsOpen(false)}>
                              <Button size="icon" variant="ghost" className="h-7 w-7">
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-muted-foreground">
                <Bot className="h-5 w-5 animate-spin" />
                <span className="text-xs">Thinking & searching catalog…</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t bg-background flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI for products or outfits..."
              className="text-xs"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
