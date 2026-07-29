import { motion } from 'framer-motion'
import {
  Building2,
  ArrowUpRight,
  FlaskConical,
  BookOpen,
  Award,
  Users,
  Briefcase,
  Zap,
  Sparkles,
} from 'lucide-react'

// Valid, real campus building details
const buildingsData = [
  {
    id: 'apj',
    name: 'APJ-BLOCK',
    floors: '7 FLOORS',
    themeColor: 'blue',
    spanClass: 'col-span-1 md:col-span-2',
    colorClass: 'text-blue-500',
    borderClass: 'border-blue-500/30 hover:border-blue-500/80',
    bgGradient: 'from-blue-500/10 via-blue-600/5 to-transparent',
    shadowClass: 'hover:shadow-[0_15px_35px_rgba(59,130,246,0.25)]',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    highlights: [
      { text: 'BTL Lab 1 & 2', icon: FlaskConical },
      { text: 'Advanced AI Research', icon: Sparkles },
      { text: 'Computer Center 34', icon: Zap },
      { text: 'Data Science Hub', icon: BookOpen },
    ],
    description: 'Primary computer laboratories, BTL research facilities, and core department rooms across 7 floors.',
  },
  {
    id: 'cv-raman',
    name: 'CV-RAMAN BLOCK',
    floors: '7 FLOORS',
    themeColor: 'emerald',
    spanClass: 'col-span-1',
    colorClass: 'text-emerald-500',
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/80',
    bgGradient: 'from-emerald-500/10 via-emerald-600/5 to-transparent',
    shadowClass: 'hover:shadow-[0_15px_35px_rgba(16,185,129,0.25)]',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    highlights: [
      { text: 'Physics Labs 1 & 2', icon: FlaskConical },
      { text: 'Chemistry Labs', icon: FlaskConical },
      { text: 'Research Cabins', icon: Award },
    ],
    description: 'Natural & applied sciences division with specialized physics, chemistry, and research cabins.',
  },
  {
    id: 'ramanujan',
    name: 'RAMANUJAN BLOCK',
    floors: '5 FLOORS',
    themeColor: 'purple',
    spanClass: 'col-span-1',
    colorClass: 'text-purple-500',
    borderClass: 'border-purple-500/30 hover:border-purple-500/80',
    bgGradient: 'from-purple-500/10 via-purple-600/5 to-transparent',
    shadowClass: 'hover:shadow-[0_15px_35px_rgba(168,85,247,0.25)]',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    highlights: [
      { text: 'Main Seminar Hall', icon: Sparkles },
      { text: 'Placement Office', icon: Briefcase },
      { text: 'LH003 Dept Office', icon: Users },
    ],
    description: 'Home to the main seminar hall, recruitment cells, placement offices, and math department.',
  },
  {
    id: 'smv',
    name: 'SMV BLOCK',
    floors: '7 FLOORS',
    themeColor: 'amber',
    spanClass: 'col-span-1 md:col-span-2',
    colorClass: 'text-amber-500',
    borderClass: 'border-amber-500/30 hover:border-amber-500/80',
    bgGradient: 'from-amber-500/10 via-amber-600/5 to-transparent',
    shadowClass: 'hover:shadow-[0_15px_35px_rgba(245,158,11,0.25)]',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    highlights: [
      { text: 'Mechanical Workshops', icon: Zap },
      { text: 'CAD/CAM Testing Lab', icon: FlaskConical },
      { text: 'High-Perf Computing', icon: Sparkles },
      { text: '6th Floor Engineering Labs', icon: BookOpen },
    ],
    description: 'Engineering powerhouse with workshops, electronics testing, and computation centers across 7 levels.',
  },
  {
    id: 'atal',
    name: 'ATAL BLOCK',
    floors: '4 FLOORS',
    themeColor: 'rose',
    spanClass: 'col-span-1 md:col-span-2',
    colorClass: 'text-rose-500',
    borderClass: 'border-rose-500/30 hover:border-rose-500/80',
    bgGradient: 'from-rose-500/10 via-rose-600/5 to-transparent',
    shadowClass: 'hover:shadow-[0_15px_35px_rgba(244,63,94,0.25)]',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    highlights: [
      { text: 'Autoliv Incubation Centre', icon: Award },
      { text: 'Startup Innovation Hub', icon: Sparkles },
      { text: 'Advanced Training Labs', icon: BookOpen },
    ],
    description: 'Dedicated innovation & incubation center housing Autoliv Incubation Centre and startup projects.',
  },
  {
    id: 'rajraman',
    name: 'V . RAJRAMAN-BLOCK',
    floors: '4 FLOORS',
    themeColor: 'cyan',
    spanClass: 'col-span-1',
    colorClass: 'text-cyan-500',
    borderClass: 'border-cyan-500/30 hover:border-cyan-500/80',
    bgGradient: 'from-cyan-500/10 via-cyan-600/5 to-transparent',
    shadowClass: 'hover:shadow-[0_15px_35px_rgba(6,182,212,0.25)]',
    badgeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    highlights: [
      { text: 'IT Cell & Data Center', icon: Zap },
      { text: 'Advanced Study Zone', icon: BookOpen },
      { text: 'Layout Setup in Progress', icon: Sparkles },
    ],
    description: 'Latest block addition dedicated to cutting-edge information technology, data centers, and study zones.',
  },
]

export default function BuildingBentoGrid({ onSelectBuilding }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 py-2 px-1 md:px-0 w-full max-w-5xl mx-auto">
      {buildingsData.map((item, idx) => (
        <motion.button
          key={item.id}
          onClick={() => onSelectBuilding(item.id)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.06, type: 'spring', stiffness: 300, damping: 22 }}
          whileHover={{ scale: 1.015, y: -3 }}
          whileTap={{ scale: 0.98 }}
          className={`group relative ${item.spanClass} bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl border ${item.borderClass} p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col justify-between overflow-hidden transition-all duration-500 ${item.shadowClass} shadow-md text-left active:scale-[0.98]`}
        >
          {/* Animated Ambient Glow Gradient Background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
          />

          {/* Top Section: Building Header & Floor Badge */}
          <div className="relative z-10 flex flex-col gap-2 md:gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 md:gap-3">
                <div
                  className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black/5 dark:bg-white/10 border border-white/10 flex items-center justify-center ${item.colorClass} shadow-sm group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}
                >
                  <Building2 className="w-4.5 h-4.5 md:w-6 md:h-6" />
                </div>
                <div className="flex flex-col">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-orbitron font-black uppercase tracking-widest border w-fit ${item.badgeClass}`}
                  >
                    {item.floors}
                  </span>
                  <h2
                    className={`text-base md:text-xl lg:text-2xl font-orbitron font-black tracking-tighter transition-colors group-hover:${item.colorClass}`}
                  >
                    {item.name}
                  </h2>
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className="p-1.5 md:p-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-400 group-hover:text-white group-hover:bg-blue-500 transition-all flex-shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Middle Animated Marquee Loop (Magic UI Style) */}
          <div className="relative z-10 mt-3 md:mt-4 overflow-hidden rounded-xl md:rounded-2xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 p-2 md:p-2.5">
            <div className="flex items-center gap-2 overflow-hidden mask-fade-edge">
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="flex items-center gap-2 flex-shrink-0"
              >
                {[...item.highlights, ...item.highlights].map((h, hIdx) => {
                  const IconComp = h.icon
                  return (
                    <div
                      key={hIdx}
                      className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-black/10 dark:border-white/10 shadow-sm flex-shrink-0"
                    >
                      <IconComp className={`w-3 h-3 md:w-3.5 md:h-3.5 ${item.colorClass}`} />
                      <span className="text-[9px] md:text-[10px] font-orbitron font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider whitespace-nowrap">
                        {h.text}
                      </span>
                    </div>
                  )
                })}
              </motion.div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
