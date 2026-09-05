import { motion } from "framer-motion";

const BeyondAISection = () => (
  <section className="py-16 px-4" id="beyond-ai" aria-labelledby="beyond-title">
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-miniapp-foreground/45 text-center mb-3">Это не только про AI</p>
      <motion.h2
        id="beyond-title"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-display text-2xl sm:text-4xl font-bold text-center mb-6 text-balance"
      >
        Мы развиваем новую способность
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-6 text-center mb-6"
      >
        <p className="font-display text-lg sm:text-xl font-semibold bg-gradient-to-r from-miniapp-purple via-miniapp-blue to-miniapp-neon bg-clip-text text-transparent">
          Способность превращать идеи в реальность
        </p>
        <p className="text-sm text-miniapp-foreground/65 mt-2">
          AI просто впервые сделал этот путь настолько доступным.
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 mb-6">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-miniapp-foreground/45 mb-2">Раньше</p>
          <p className="text-sm text-miniapp-foreground/75">Между идеей и продуктом стояла целая команда.</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-miniapp-neon/80 mb-2">Теперь</p>
          <p className="text-sm text-miniapp-foreground/85">Часть этой команды может быть у тебя внутри AI.</p>
        </div>
      </div>

      <p className="text-sm sm:text-base text-center text-miniapp-foreground/75 text-balance">
        Поэтому я не хочу учить людей просто пользоваться нейросетями.{" "}
        <span className="text-miniapp-foreground font-medium">Я хочу научить их создавать.</span>
      </p>
    </div>
  </section>
);

export default BeyondAISection;
