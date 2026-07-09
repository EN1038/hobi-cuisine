'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { UtensilsCrossed, ChefHat, MonitorSmartphone, BarChart3 } from 'lucide-react';

const roles = [
  {
    title: 'ลูกค้า',
    titleEn: 'Customer',
    desc: 'สั่งอาหาร, ดูเมนู, สะสมแต้ม',
    icon: UtensilsCrossed,
    href: '/menu',
    color: 'from-[#88042b] to-[#c41e3a]',
    borderColor: 'group-hover:border-[#c41e3a]/50',
    iconColor: 'text-[#88042b]',
  },
  {
    title: 'ครัว',
    titleEn: 'Kitchen',
    desc: 'ดูคิวออเดอร์ (KDS), ปรุงอาหาร',
    icon: ChefHat,
    href: '/kitchen',
    color: 'from-orange-600 to-orange-500',
    borderColor: 'group-hover:border-orange-500/50',
    iconColor: 'text-orange-500',
  },
  {
    title: 'แคชเชียร์',
    titleEn: 'POS',
    desc: 'รับออเดอร์หน้าร้าน, คิดเงิน',
    icon: MonitorSmartphone,
    href: '/pos',
    color: 'from-amber-600 to-amber-500',
    borderColor: 'group-hover:border-amber-500/50',
    iconColor: 'text-amber-500',
  },
  {
    title: 'ผู้จัดการ',
    titleEn: 'Admin',
    desc: 'ดูยอดขาย, จัดการเมนู, CRM',
    icon: BarChart3,
    href: '/admin',
    color: 'from-emerald-600 to-emerald-500',
    borderColor: 'group-hover:border-emerald-500/50',
    iconColor: 'text-emerald-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-[#f6e5cc]">
      {/* Background patterns and gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#c41e3a]/10 via-[#f6e5cc] to-[#f6e5cc]"></div>
        {/* Subtle pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #88042b 25%, transparent 25%, transparent 75%, #88042b 75%, #88042b), repeating-linear-gradient(45deg, #88042b 25%, transparent 25%, transparent 75%, #88042b 75%, #88042b)`,
            backgroundPosition: `0 0, 10px 10px`,
            backgroundSize: `20px 20px`,
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#88042b]/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 py-12 flex flex-col items-center">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[#88042b]/20 bg-white/50 backdrop-blur-md shadow-sm">
            <span className="text-[#88042b] text-sm font-bold tracking-wider">PREMIUM RESTAURANT SYSTEM</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4 flex flex-col md:flex-row items-center justify-center gap-4">
            <span className="text-[#88042b] drop-shadow-sm">🥢 HOBI</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#88042b] to-[#c41e3a]">Cuisine</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#88042b]/80 font-bold max-w-2xl mx-auto">
            ระบบสั่งอาหารและจัดการร้านอาหารจีนแบบครบวงจร
          </p>
        </motion.div>

        {/* Roles Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
        >
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <motion.div key={role.href} variants={itemVariants} className="h-full">
                <Link href={role.href} className="group block h-full outline-none">
                  <div className={`relative h-full overflow-hidden rounded-3xl p-8 border border-[#88042b]/10 bg-white/70 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 ${role.borderColor} hover:shadow-xl shadow-md`}>
                    
                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 bg-gradient-to-br ${role.color}`}></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-white border border-gray-100 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                        <Icon className={`w-10 h-10 ${role.iconColor}`} />
                      </div>
                      <h2 className={`text-2xl font-bold text-[#88042b] mb-1 group-hover:text-[#c41e3a] transition-colors`}>{role.title}</h2>
                      <h3 className="text-sm font-bold text-gray-500 mb-4">{role.titleEn}</h3>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        {role.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-24 text-center"
        >
          <p className="text-gray-600 font-bold text-sm flex items-center justify-center gap-2">
            © 2026 HOBI Cuisine
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            <span className="text-[#88042b]">Demo Environment</span>
          </p>
        </motion.div>

      </div>
    </div>
  );
}
