'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { getAvailableMenuItems } from '@/db/operations';
import { useAppStore } from '@/stores/appStore';
import { formatPrice } from '@/lib/utils';
import type { MenuItem } from '@/types';

export default function MarketingHomePage() {
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const dbReady = useAppStore((s) => s.dbReady);

  useEffect(() => {
    if (!dbReady) return;
    async function load() {
      try {
        const items = await getAvailableMenuItems();
        setPopularItems(items.filter(i => i.isPopular).slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dbReady]);

  const newsItems = [
    {
      id: 1,
      title: 'HOBI Cuisine เปิดตัวเมนูใหม่ประจำฤดูกาล!',
      desc: 'สัมผัสรสชาติอันเป็นเอกลักษณ์กับเมนูพิเศษที่คัดสรรวัตถุดิบชั้นเลิศ เฉพาะเดือนนี้เท่านั้น',
      date: '10 ก.ค. 2026',
      image: '/images/bg-section-hero1.png'
    },
    {
      id: 2,
      title: 'ฉลองครบรอบ 1 ปี HOBI Cuisine ลด 20% ทุกเมนู',
      desc: 'ขอบคุณลูกค้าทุกท่านที่สนับสนุนเรามาตลอด 1 ปีเต็ม รับส่วนลดพิเศษทันทีเมื่อทานครบ 1,000 บาท',
      date: '5 ก.ค. 2026',
      image: '/images/bg-section-hero.png'
    },
    {
      id: 3,
      title: 'เปิดรับสมัครสมาชิกระดับ Gold รับสิทธิประโยชน์มากมาย',
      desc: 'สมัครสมาชิกวันนี้ พร้อมสะสมแต้มเพื่อแลกรับส่วนลดและเมนูฟรีในมื้อถัดไป',
      date: '1 ก.ค. 2026',
      image: '/images/bg-section-hero1.png'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6e5cc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#88042b]/20 border-t-[#88042b] rounded-full animate-spin" />
          <span className="text-[#88042b]/60 text-sm font-medium">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6e5cc] text-[#88042b] overflow-x-hidden pb-20 md:pb-0">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[85vh] py-20 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/bg-section-hero.png" 
            alt="HOBI Cuisine Atmosphere" 
            fill 
            className="object-cover opacity-20 mix-blend-multiply"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f6e5cc] via-[#f6e5cc]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="relative mx-auto flex justify-center drop-shadow-xl">
              <Image 
                src="/images/logo-section-hero.png" 
                alt="HOBI Cuisine Logo" 
                width={600}
                height={300}
                className="w-auto h-auto max-w-full max-h-[25vh] object-contain"
                priority
              />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-[#88042b] drop-shadow-sm"
          >
            สัมผัสรสชาติอาหารจีนต้นตำรับ
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto"
          >
            ศาสตร์แห่งความอร่อยที่สืบทอดมารุ่นสู่รุ่น พร้อมเสิร์ฟในบรรยากาศสุดพรีเมียมใจกลางเมือง
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/menu" 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#88042b] to-[#c41e3a] hover:from-[#6a0321] hover:to-[#a01830] text-[#f6e5cc] font-bold rounded-xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <UtensilsCrossed className="w-5 h-5" />
              ดูเมนู / สั่งอาหาร
            </Link>
            <Link 
              href="/book-table" 
              className="w-full sm:w-auto px-8 py-4 bg-white/60 hover:bg-white backdrop-blur-md border border-[#88042b]/20 text-[#88042b] font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <MapPin className="w-5 h-5" />
              จองโต๊ะในร้าน
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. OUR STORY SECTION */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl"
          >
            <Image 
              src="/images/bg-section-hero1.png" 
              alt="HOBI Cuisine Restaurant" 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#88042b]/90 to-transparent flex items-end p-8">
              <div className="text-2xl font-bold text-[#f6e5cc] italic">"ความพิถีพิถันในทุกคำ"</div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm font-bold text-[#88042b]/80 tracking-widest uppercase mb-2">Our Story</h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#88042b]">ตำนานความอร่อยของ HOBI Cuisine</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              HOBI Cuisine ก่อตั้งขึ้นจากความหลงใหลในศิลปะการทำอาหารจีนโบราณ เราผสมผสานสูตรลับต้นตำรับที่สืบทอดกันมาหลายทศวรรษเข้ากับเทคนิคการทำอาหารสมัยใหม่ เพื่อนำเสนอประสบการณ์การรับประทานอาหารที่ไม่เหมือนใคร
            </p>
            <p className="text-gray-700 mb-8 leading-relaxed">
              วัตถุดิบทุกชิ้นถูกคัดสรรอย่างพิถีพิถันจากแหล่งที่ดีที่สุด เพื่อให้มั่นใจว่าทุกเมนูที่เสิร์ฟถึงโต๊ะคุณคือความสมบูรณ์แบบ ทั้งรสชาติ กลิ่นหอม และรูปลักษณ์ที่งดงาม
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-[#c41e3a] mb-1">10+</div>
                <div className="text-sm text-gray-600 font-medium">ปีแห่งความเชี่ยวชาญ</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#c41e3a] mb-1">50+</div>
                <div className="text-sm text-gray-600 font-medium">เมนูต้นตำรับ</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. SIGNATURE MENU SECTION */}
      <section className="py-20 bg-white/50 px-4 relative border-y border-[#88042b]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-[#88042b]/80 tracking-widest uppercase mb-2">Signature Dishes</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-[#88042b]">เมนูแนะนำที่ต้องลอง</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularItems.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white shadow-md border border-[#88042b]/10 rounded-2xl overflow-hidden group hover:shadow-xl hover:border-[#88042b]/30 transition-all"
              >
                <div className="relative h-48 bg-gradient-to-br from-[#f6e5cc] to-white flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-500 drop-shadow-md">
                      {item.name.includes('เป็ด') ? '🦆' : item.name.includes('หมู') ? '🐷' : item.name.includes('กุ้ง') ? '🦐' : '🍜'}
                    </span>
                  )}
                  <div className="absolute top-3 right-3 bg-[#c41e3a] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    ยอดนิยม
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-lg mb-1 truncate text-[#88042b]">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">{item.description || 'สูตรต้นตำรับแท้ สไตล์ HOBI Cuisine'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#c41e3a] font-bold text-lg">{formatPrice(item.price)}</span>
                    <Link href={`/menu?item=${item.id}`} className="w-8 h-8 bg-[#f6e5cc] text-[#88042b] rounded-full flex items-center justify-center hover:bg-[#88042b] hover:text-white transition-colors shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/menu" 
              className="inline-flex items-center gap-2 text-[#c41e3a] hover:text-[#88042b] font-bold transition-colors"
            >
              ดูเมนูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. NEWS & PROMOTIONS (SEO) */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#88042b]/80 tracking-widest uppercase mb-2">News & Updates</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-[#88042b]">อัปเดตข่าวสารและโปรโมชั่น</h3>
          </div>
          <button className="text-gray-600 hover:text-[#88042b] transition-colors font-medium">ดูทั้งหมด</button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {newsItems.map((news, idx) => (
            <motion.div 
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[#88042b]/10 pb-5"
            >
              <div className="relative h-60 w-full mb-5 overflow-hidden">
                <Image 
                  src={news.image} 
                  alt={news.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-[#f6e5cc] text-[#88042b] text-xs font-bold px-3 py-1 rounded-md shadow-sm">ข่าวสาร</span>
                </div>
              </div>
              <div className="px-5">
                <div className="text-sm text-gray-500 mb-2 font-medium">{news.date}</div>
                <h4 className="text-xl font-bold mb-3 text-[#88042b] group-hover:text-[#c41e3a] transition-colors line-clamp-2">{news.title}</h4>
                <p className="text-gray-600 text-sm line-clamp-3">{news.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. LOCATION & CONTACT & FOOTER */}
      <footer id="contact" className="bg-[#88042b] pt-20 border-t border-[#88042b]/20 relative overflow-hidden text-[#f6e5cc]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <div className="mb-6">
                <Image 
                  src="/images/logo-section-2.png" 
                  alt="HOBI Cuisine Logo" 
                  width={200}
                  height={65}
                  className="h-16 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <p className="text-[#f6e5cc]/80 text-sm leading-relaxed mb-6">
                ร้านอาหารจีนสไตล์โมเดิร์นที่รักษารสชาติแบบดั้งเดิม พร้อมเสิร์ฟความอร่อยระดับพรีเมียมให้คุณทุกวัน
              </p>
              <div className="flex items-center gap-4">
                <span className="text-[#f6e5cc]/80 text-sm font-medium">Follow us on Social Media</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">เมนูทางลัด</h4>
              <ul className="space-y-4">
                <li><Link href="/" className="text-[#f6e5cc]/80 hover:text-white transition-colors text-sm">หน้าหลัก</Link></li>
                <li><Link href="/menu" className="text-[#f6e5cc]/80 hover:text-white transition-colors text-sm">สั่งอาหารออนไลน์</Link></li>
                <li><Link href="/promotions" className="text-[#f6e5cc]/80 hover:text-white transition-colors text-sm">โปรโมชั่น</Link></li>
                <li><Link href="/auth" className="text-[#f6e5cc]/80 hover:text-white transition-colors text-sm">สมัครสมาชิก / เข้าสู่ระบบ</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">ติดต่อเรา</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <span className="text-[#f6e5cc]/80 text-sm leading-relaxed">
                    123 ถนนสุขุมวิท แขวงคลองเตยเหนือ <br />เขตวัฒนา กรุงเทพมหานคร 10110
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-white shrink-0" />
                  <span className="text-[#f6e5cc]/80 text-sm">02-123-4567</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <div className="text-[#f6e5cc]/80 text-sm">
                    <p>เปิดให้บริการทุกวัน</p>
                    <p className="text-white font-medium mt-1">10:00 น. - 22:00 น.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">รับข่าวสาร</h4>
              <p className="text-[#f6e5cc]/80 text-sm mb-4">สมัครรับข้อมูลข่าวสารและโปรโมชั่นพิเศษก่อนใคร</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="กรอกอีเมลของคุณ" 
                  className="bg-black/20 border border-white/20 rounded-lg px-4 py-2 text-sm w-full text-white placeholder-white/50 focus:outline-none focus:border-white transition-colors"
                />
                <button className="bg-white hover:bg-gray-100 px-4 py-2 rounded-lg text-[#88042b] font-bold transition-colors">
                  ส่ง
                </button>
              </div>
            </div>

          </div>
          
          <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#f6e5cc]/60 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} HOBI Cuisine. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-[#f6e5cc]/60">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
