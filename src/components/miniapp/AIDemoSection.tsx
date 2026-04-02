import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const AIDemoSection = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-demo", {
        body: { message: text, history: messages.slice(-6) },
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Извините, произошла ошибка. Попробуйте снова." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4" id="ai-demo">
      <div className="max-w-lg mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-center mb-2"
        >
          Попробуй AI
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-miniapp-muted text-sm text-center mb-6"
        >
          Напиши вопрос как клиент — AI ответит за эксперта
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden"
        >
          {/* Chat area */}
          <div ref={scrollRef} className="h-72 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-miniapp-muted text-xs space-y-3">
                <Bot className="w-8 h-8 opacity-30" />
                <p>Задайте вопрос, например:</p>
                <div className="space-y-1.5">
                  {["Сколько стоит сделать бота?", "Мне нужен сайт для бизнеса", "Как AI поможет моей компании?"].map(
                    (q, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(q); }}
                        className="block w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-miniapp-foreground text-xs"
                      >
                        «{q}»
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-miniapp-purple to-miniapp-blue flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-miniapp-purple text-white rounded-br-md"
                      : "bg-white/[0.06] text-miniapp-foreground rounded-bl-md"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-miniapp-purple to-miniapp-blue flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="px-3 py-2 rounded-2xl rounded-bl-md bg-white/[0.06] text-miniapp-muted text-xs flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Думаю...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/[0.06] p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Напишите вопрос..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-miniapp-foreground placeholder:text-miniapp-muted focus:outline-none focus:border-miniapp-purple/50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-miniapp-purple to-miniapp-blue flex items-center justify-center disabled:opacity-40 hover:shadow-lg hover:shadow-miniapp-purple/20 transition-all"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIDemoSection;
