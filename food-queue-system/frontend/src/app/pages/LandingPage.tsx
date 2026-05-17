import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  ArrowRight, Zap, Clock, ShoppingBag,
  BarChart3, Store, Users, CheckCircle2,
  ChefHat, Flame, Coffee, UtensilsCrossed, Plus, Minus,
} from 'lucide-react';

// ─── tiny helpers ─────────────────────────────────────────────────────────────

const useReveal = (margin = '-50px') => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin } as any);
  return { ref, inView };
};

const GradientText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
    {children}
  </span>
);

const GridBg: React.FC = () => (
  <div
    className="absolute inset-0 pointer-events-none select-none"
    style={{
      backgroundImage: `linear-gradient(rgba(59,130,246,0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,0.045) 1px, transparent 1px)`,
      backgroundSize: '52px 52px',
    }}
  />
);

const Orb: React.FC<{ className: string }> = ({ className }) => (
  <div className={`absolute rounded-full blur-[90px] pointer-events-none ${className}`} />
);

// ─── Animated stall browser mock ──────────────────────────────────────────────

const stalls = [
  {
    name: 'Sharma Snacks',
    category: 'Snacks',
    icon: ChefHat,
    color: 'from-orange-500 to-amber-500',
    queue: 3,
    wait: 8,
    items: ['Samosa ₹15', 'Vada Pav ₹20', 'Pav Bhaji ₹45'],
    active: true,
  },
  {
    name: 'Spice Bowl',
    category: 'Meals',
    icon: Flame,
    color: 'from-red-500 to-rose-500',
    queue: 7,
    wait: 18,
    items: ['Dal Rice ₹60', 'Paneer Curry ₹80', 'Roti ₹10'],
    active: false,
  },
  {
    name: 'Brew Corner',
    category: 'Beverages',
    icon: Coffee,
    color: 'from-yellow-500 to-amber-400',
    queue: 1,
    wait: 3,
    items: ['Masala Chai ₹12', 'Cold Coffee ₹40', 'Lassi ₹30'],
    active: false,
  },
];

const StallBrowserMock: React.FC = () => {
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % stalls.length), 3200);
    return () => clearInterval(t);
  }, []);

  const stall = stalls[active];

  const add = (item: string) => {
    setQty(q => ({ ...q, [item]: (q[item] || 0) + 1 }));
    setAdded(item);
    setTimeout(() => setAdded(null), 900);
  };

  const dec = (item: string) =>
    setQty(q => ({ ...q, [item]: Math.max(0, (q[item] || 0) - 1) }));

  const cartCount = Object.values(qty).reduce((a, b) => a + b, 0);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 blur-3xl scale-105 pointer-events-none" />

      <div className="relative bg-[#0d1117] border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">

        {/* top bar */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <div className="flex-1 mx-3 bg-gray-800 rounded-md px-3 py-1 text-[10px] text-gray-500 text-center">
            skiptheline.app
          </div>
          {cartCount > 0 && (
            <motion.div
              key={cartCount}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[9px] font-black text-white"
            >
              {cartCount}
            </motion.div>
          )}
        </div>

        {/* stall tabs */}
        <div className="flex gap-1 px-3 pb-2">
          {stalls.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActive(i)}
              className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                i === active
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* stall hero */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="px-4 pb-4"
          >
            {/* header */}
            <div className={`rounded-2xl p-4 mb-3 bg-gradient-to-br ${stall.color} relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <stall.icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-white font-black text-sm">{stall.name}</p>
                  <p className="text-white/70 text-[10px] font-medium">{stall.category}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-white font-bold text-xs">{stall.queue} ahead</p>
                  <p className="text-white/70 text-[10px]">~{stall.wait} min</p>
                </div>
              </div>

              {/* queue bar */}
              <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stall.queue / 10) * 100, 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-white/70 rounded-full"
                />
              </div>
            </div>

            {/* menu items */}
            <div className="space-y-2">
              {stall.items.map((item) => {
                const q = qty[item] || 0;
                return (
                  <div
                    key={item}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-colors duration-200 ${
                      added === item
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-gray-800 bg-gray-900/60'
                    }`}
                  >
                    <span className="text-gray-200 text-xs font-medium">{item}</span>
                    {q === 0 ? (
                      <button
                        onClick={() => add(item)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold"
                      >
                        <Plus className="w-2.5 h-2.5" strokeWidth={3} />
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => dec(item)}
                          className="w-5 h-5 rounded-md bg-gray-700 flex items-center justify-center"
                        >
                          <Minus className="w-2.5 h-2.5 text-gray-300" strokeWidth={3} />
                        </button>
                        <span className="text-white text-xs font-bold w-3 text-center tabular-nums">{q}</span>
                        <button
                          onClick={() => add(item)}
                          className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center"
                        >
                          <Plus className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* checkout */}
            {cartCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold text-center"
              >
                View cart · {cartCount} item{cartCount > 1 ? 's' : ''}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Order timeline mock ──────────────────────────────────────────────────────

const OrderTimeline: React.FC = () => {
  const steps = [
    { label: 'Order placed', time: '12:31 PM', done: true, active: false },
    { label: 'Preparing', time: '12:33 PM', done: true, active: false },
    { label: 'Ready for pickup', time: '12:41 PM', done: false, active: true },
    { label: 'Completed', time: '—', done: false, active: false },
  ] as const;

  return (
    <div className="space-y-2.5">
      {steps.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl border transition-colors ${
            s.active
              ? 'bg-blue-500/10 border-blue-500/30'
              : s.done
              ? 'bg-gray-900/60 border-gray-800'
              : 'bg-gray-900/30 border-gray-800/40 opacity-40'
          }`}
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
            s.active
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow shadow-blue-500/40'
              : s.done
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-800 text-gray-600'
          }`}>
            {s.done ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} /> : i + 1}
          </div>
          <span className={`flex-1 text-sm font-medium ${s.active ? 'text-white' : s.done ? 'text-gray-300' : 'text-gray-600'}`}>
            {s.label}
          </span>
          <span className={`text-xs tabular-nums ${s.active ? 'text-cyan-400 font-semibold' : 'text-gray-600'}`}>
            {s.time}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Stat ─────────────────────────────────────────────────────────────────────

const Stat: React.FC<{ value: string; label: string; delay?: number }> = ({ value, label, delay = 0 }) => {
  const { ref, inView } = useReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <p className="text-4xl font-black tabular-nums bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        {value}
      </p>
      <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-widest mt-1.5">{label}</p>
    </motion.div>
  );
};

// ─── Feature card ─────────────────────────────────────────────────────────────

const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
  accent?: boolean;
}> = ({ icon: Icon, title, description, delay = 0, accent = false }) => {
  const { ref, inView } = useReveal('-40px');
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay }}
      className={`group relative p-6 rounded-2xl border transition-all duration-300 ${
        accent
          ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/30 hover:border-blue-500/50'
          : 'bg-gray-900/50 border-gray-800 hover:border-blue-500/25 hover:bg-gray-900/80'
      }`}
    >
      <div className={`mb-4 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
        accent
          ? 'bg-blue-500/20 border border-blue-500/30'
          : 'bg-gray-800 border border-gray-700 group-hover:bg-blue-500/10 group-hover:border-blue-500/20'
      }`}>
        <Icon className="w-5 h-5 text-cyan-400" strokeWidth={1.8} />
      </div>
      <h3 className="text-white font-bold text-base mb-1.5">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

// ─── Step ─────────────────────────────────────────────────────────────────────

const Step: React.FC<{ number: string; title: string; desc: string; delay?: number }> = ({
  number, title, desc, delay = 0,
}) => {
  const { ref, inView } = useReveal('-30px');
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, delay }}
      className="flex gap-4 group"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-black shadow-md shadow-blue-500/25">
        {number}
      </div>
      <div className="pt-0.5">
        <p className="text-white font-semibold text-sm mb-1">{title}</p>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);

  const goAuth = (isLogin = false, mode: 'customer' | 'vendor' = 'customer') => navigate('/auth', { state: { isLogin, mode } });

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden selection:bg-blue-500/25">

      {/* ── Navbar: logo only ─────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-gray-950/75 backdrop-blur-md border-b border-gray-800/50"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <UtensilsCrossed className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-black text-[17px] tracking-tight">
            Skip<GradientText>TheLine</GradientText>
          </span>
        </div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center px-6 pt-20 pb-10 overflow-hidden"
      >
        <GridBg />
        <Orb className="w-[600px] h-[600px] bg-blue-600 -top-40 -left-40 opacity-[0.15]" />
        <Orb className="w-[480px] h-[480px] bg-cyan-500 -top-24 -right-32 opacity-[0.12]" />
        <Orb className="w-[400px] h-[400px] bg-indigo-700 top-[58vh] left-[38%] opacity-[0.13]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* left: copy */}
          <div>
            {/* badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-7"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Zap className="w-3 h-3" strokeWidth={2.5} />
                Real-time campus food ordering
              </span>
            </motion.div>

            {/* headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.04] tracking-tight mb-5"
            >
              Skip the line,{' '}
              <GradientText>savor the time</GradientText>
            </motion.h1>

            {/* sub */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34 }}
              className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md"
            >
              Order digitally from any campus stall, watch your queue live,
              and walk over only when it's ready. No waiting, no missed tokens.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(59,130,246,0.38)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goAuth(false, 'customer')}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 text-base"
              >
                Start ordering
                <ArrowRight className="w-4.5 h-4.5 w-5 h-5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goAuth(false, 'vendor')}
                className="flex items-center justify-center gap-2 px-8 py-4 border border-gray-700 hover:border-gray-600 bg-gray-900/60 hover:bg-gray-800/80 text-white font-semibold rounded-xl text-base transition-colors"
              >
                <Store className="w-4 h-4" strokeWidth={1.8} />
                Open a stall
              </motion.button>
            </motion.div>

            {/* trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-10 flex items-center gap-5 text-gray-600 text-xs"
            >
              {['No app download', 'Real-time tracking', 'Free for students'].map((t, i) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" strokeWidth={2.5} />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* right: interactive stall browser */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <StallBrowserMock />
          </motion.div>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.7 }}
            className="w-5 h-8 rounded-full border-2 border-gray-800 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-gray-700" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 border-y border-gray-800/60 bg-gray-900/25">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value="500+" label="Daily orders" delay={0} />
          <Stat value="30+" label="Active stalls" delay={0.07} />
          <Stat value="~8m" label="Avg. wait" delay={0.14} />
          <Stat value="99%" label="Uptime" delay={0.21} />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <Orb className="w-[380px] h-[380px] bg-indigo-600 top-8 right-0 opacity-[0.09]" />
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-cyan-400 text-[11px] font-bold uppercase tracking-widest mb-3">Why SkipTheLine</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Everything you need,{' '}
              <GradientText>nothing you don't</GradientText>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard accent icon={Clock} title="Live queue tracking" description="See exactly how many orders are ahead and get a precise wait — updated in real time via WebSocket." delay={0} />
            <FeatureCard icon={ShoppingBag} title="One-tap ordering" description="Browse stalls, compare queues, add items, and checkout in a single smooth flow." delay={0.07} />
            <FeatureCard icon={Zap} title="Instant token" description="Receive a unique order token the moment you pay — no paper slip, no confusion." delay={0.14} />
            <FeatureCard icon={Store} title="Vendor dashboard" description="Manage your menu, accept orders, and update statuses from a purpose-built interface." delay={0.21} />
            <FeatureCard icon={BarChart3} title="Sales analytics" description="Track busy hours, top-selling items, and revenue trends at a glance." delay={0.28} />
            <FeatureCard icon={Users} title="Built for campuses" description="Designed for peak lunch-hour chaos — fast, reliable, and simple for everyone." delay={0.35} />
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 border-y border-gray-800/60 bg-gray-900/25">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <p className="text-cyan-400 text-[11px] font-bold uppercase tracking-widest mb-3">How it works</p>
              <h2 className="text-4xl font-black tracking-tight leading-tight">
                From hungry to happy<br />in 3 steps
              </h2>
            </motion.div>
            <div className="space-y-7">
              <Step number="1" title="Browse stalls & add to cart" desc="Explore all stalls, check live queue lengths, and pick exactly what you want." delay={0} />
              <Step number="2" title="Place your order" desc="Checkout in seconds — you get a unique token and estimated wait immediately." delay={0.1} />
              <Step number="3" title="Pick up when ready" desc="Your order status updates live. Head over only when it's your turn." delay={0.2} />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <OrderTimeline />
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <Orb className="w-[640px] h-[640px] bg-blue-600 -top-32 left-1/2 -translate-x-1/2 opacity-[0.13]" />
        <GridBg />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 text-center max-w-xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Ready to{' '}
            <GradientText>ditch the queue?</GradientText>
          </h2>
          <p className="text-gray-400 text-base mb-9 leading-relaxed">
            Join hundreds of students and vendors already using SkipTheLine on campus.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 52px rgba(59,130,246,0.42)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => goAuth(false, 'customer')}
            className="group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 text-lg"
          >
            Get started — it's free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          </motion.button>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-800/60 py-7 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <UtensilsCrossed className="w-3 h-3 text-white" strokeWidth={2} />
            </div>
            <span className="font-black text-sm">
              Skip<GradientText>TheLine</GradientText>
            </span>
          </div>
          <p className="text-gray-700 text-xs">© {new Date().getFullYear()} SkipTheLine. Built for campus life.</p>
        </div>
      </footer>
    </div>
  );
};