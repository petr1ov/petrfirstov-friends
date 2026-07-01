import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, Rocket, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export type LeadMode = "calculate" | "want_same";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: LeadMode;
  caseTitle?: string;
  caseBudget?: string | null;
};

const platformOptions = [
  { label: "Telegram", value: "telegram", mult: 1 },
  { label: "WhatsApp", value: "whatsapp", mult: 1.2 },
  { label: "VK", value: "vk", mult: 1.1 },
  { label: "Сайт/PWA", value: "web", mult: 1.15 },
];
const scopeOptions = [
  { label: "Минимум (MVP)", value: "mvp", base: 20000 },
  { label: "Средний функционал", value: "mid", base: 60000 },
  { label: "Сложный проект", value: "big", base: 120000 },
];
const aiOptions = [
  { label: "Без AI", value: "no", add: 0 },
  { label: "Базовый AI", value: "basic", add: 10000 },
  { label: "Полноценный AI", value: "full", add: 25000 },
];
const termOptions = [
  { label: "Срочно", value: "urgent", mult: 1.5 },
  { label: "Стандарт", value: "standard", mult: 1 },
  { label: "Не спешу", value: "relaxed", mult: 0.9 },
];

const CaseLeadDialog = ({ open, onOpenChange, mode, caseTitle, caseBudget }: Props) => {
  const [scope, setScope] = useState(scopeOptions[1]);
  const [platform, setPlatform] = useState(platformOptions[0]);
  const [ai, setAi] = useState(aiOptions[1]);
  const [term, setTerm] = useState(termOptions[1]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const price = Math.round((scope.base * platform.mult + ai.add) * term.mult);

  const reset = () => {
    setName(""); setContact(""); setComment(""); setDone(false);
  };

  const handleClose = (o: boolean) => {
    if (!o) setTimeout(reset, 200);
    onOpenChange(o);
  };

  const submit = async () => {
    if (!name.trim() || !contact.trim()) {
      toast({ title: "Заполните имя и контакт", variant: "destructive" });
      return;
    }
    if (name.length > 100 || contact.length > 200 || comment.length > 1000) {
      toast({ title: "Слишком длинное значение", variant: "destructive" });
      return;
    }
    setLoading(true);
    const parts: string[] = [];
    if (caseTitle) parts.push(`Кейс: ${caseTitle}`);
    if (mode === "calculate") {
      parts.push(`Расчёт: ${scope.label} / ${platform.label} / ${ai.label} / ${term.label}`);
      parts.push(`Оценка: от ${price.toLocaleString("ru-RU")} ₽`);
    }
    if (comment.trim()) parts.push(`Комментарий: ${comment.trim()}`);
    const contactPayload = `${contact.trim()}${parts.length ? " | " + parts.join(" | ") : ""}`.slice(0, 200);
    const fullNote = parts.join("\n");

    try {
      const { error } = await supabase.functions.invoke("create-lead", {
        body: {
          ref_code: mode === "calculate" ? "miniapp_case_calc" : "miniapp_case_want",
          name: name.trim().slice(0, 100),
          telegram: contact.trim().slice(0, 100),
          contact: (fullNote || contactPayload).slice(0, 200),
        },
      });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Не удалось отправить", description: "Попробуйте ещё раз", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isCalc = mode === "calculate";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[hsl(var(--miniapp-bg))] border-white/10 text-[hsl(var(--miniapp-fg))] max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {done ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-miniapp-neon to-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-black" />
            </div>
            <p className="font-display text-xl font-bold mb-2">Заявка отправлена!</p>
            <p className="text-sm text-miniapp-foreground/70 mb-6">Свяжусь с вами в ближайшее время</p>
            <Button onClick={() => handleClose(false)} className="w-full">Закрыть</Button>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                {isCalc ? <Calculator className="w-5 h-5 text-miniapp-purple" /> : <Rocket className="w-5 h-5 text-miniapp-neon" />}
                {isCalc ? "Расчёт проекта" : "Хочу такой же"}
              </DialogTitle>
              {caseTitle && (
                <DialogDescription className="text-miniapp-foreground/60">
                  {isCalc ? "Прикинем стоимость под ваш запрос" : `На основе кейса: ${caseTitle}`}
                  {caseBudget && !isCalc && ` • ${caseBudget}`}
                </DialogDescription>
              )}
            </DialogHeader>

            {isCalc && (
              <div className="space-y-3">
                <PickerRow label="Объём" options={scopeOptions} value={scope} onChange={setScope as any} />
                <PickerRow label="Платформа" options={platformOptions} value={platform} onChange={setPlatform as any} />
                <PickerRow label="AI" options={aiOptions} value={ai} onChange={setAi as any} />
                <PickerRow label="Срок" options={termOptions} value={term} onChange={setTerm as any} />

                <div className="p-4 rounded-xl bg-gradient-to-br from-miniapp-purple/15 to-miniapp-blue/15 border border-miniapp-purple/30 text-center">
                  <p className="text-[11px] uppercase tracking-wider text-miniapp-foreground/60 mb-1">Примерная стоимость</p>
                  <p className="font-display text-2xl font-bold bg-gradient-to-r from-miniapp-purple via-miniapp-blue to-miniapp-neon bg-clip-text text-transparent">
                    от {price.toLocaleString("ru-RU")} ₽
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div>
                <Label htmlFor="lead-name" className="text-xs text-miniapp-foreground/70">Имя *</Label>
                <Input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="Как вас зовут" className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label htmlFor="lead-contact" className="text-xs text-miniapp-foreground/70">Telegram или телефон *</Label>
                <Input id="lead-contact" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={100} placeholder="@username / +7..." className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label htmlFor="lead-comment" className="text-xs text-miniapp-foreground/70">
                  {isCalc ? "Комментарий (необязательно)" : "Что хотите реализовать"}
                </Label>
                <Textarea id="lead-comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={3} placeholder="Кратко опишите задачу" className="bg-white/5 border-white/10 resize-none" />
              </div>
            </div>

            <Button onClick={submit} disabled={loading} className="w-full bg-gradient-to-r from-miniapp-purple to-miniapp-blue text-white font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Отправка…</> : "Отправить заявку"}
            </Button>
            <p className="text-[10px] text-miniapp-foreground/50 text-center">Отправляя форму, вы соглашаетесь на обработку данных</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const PickerRow = <T extends { label: string; value: string }>({
  label, options, value, onChange,
}: { label: string; options: T[]; value: T; onChange: (v: T) => void }) => (
  <div>
    <Label className="text-xs text-miniapp-foreground/70 mb-1.5 block">{label}</Label>
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-ring ${
            value.value === o.value
              ? "border-miniapp-purple bg-miniapp-purple/15 text-white"
              : "border-white/10 bg-white/[0.03] text-miniapp-foreground/75 hover:border-white/20"
          }`}
        >{o.label}</button>
      ))}
    </div>
  </div>
);

export default CaseLeadDialog;
