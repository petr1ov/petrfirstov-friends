import { motion } from "framer-motion";
import { CreditCard, Bot, Mic, Smartphone } from "lucide-react";

const products = [
  { icon: CreditCard, name: "Ботовизитка", desc: "Вход в автоматизацию", price: "от 10 000 ₽", popular: true },
  { icon: Bot, name: "AI-бот", desc: "Telegram / VK / MAX", price: "от 15 000 ₽", popular: false },
  { icon: Mic, name: "Голосовой бот", desc: "Обработка звонков", price: "от 20 000 ₽/мес", popular: false },
  { icon: Smartphone, name: "Мини-приложение", desc: "Полноценный сервис", price: "от 30 000 ₽", popular: false },
];

const ProductsSection = () => (
  <section className="py-16 px-4" id="products">
    <div className="max-w-lg mx-auto">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-2xl font-bold text-center mb-2"
      >
        Продукты
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-miniapp-muted text-sm text-center mb-8"
      >
        Можно начать с простого и масштабировать
      </motion.p>

      <div className="grid grid-cols-2 gap-3">
        {products.map((p, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-4 rounded-2xl border backdrop-blur-sm ${
              p.popular
                ? "bg-gradient-to-b from-miniapp-purple/10 to-transparent border-miniapp-purple/30"
                : "bg-white/[0.03] border-white/[0.06]"
            }`}
          >
            {p.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full bg-miniapp-purple text-white font-semibold">
                Популярное
              </span>
            )}
            <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
              p.popular ? "bg-miniapp-purple/20" : "bg-white/5"
            }`}>
              <p.icon className={`w-5 h-5 ${p.popular ? "text-miniapp-purple" : "text-miniapp-muted"}`} />
            </div>
            <p className="font-semibold text-sm mb-0.5">{p.name}</p>
            <p className="text-xs text-miniapp-muted mb-3">{p.desc}</p>
            <p className={`text-sm font-bold ${p.popular ? "text-miniapp-purple" : "text-miniapp-neon"}`}>
              {p.price}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProductsSection;
