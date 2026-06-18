import { motion } from 'framer-motion';

const orbs = [
  { size: 420, top: '-5%', left: '-8%', color: 'rgba(103,58,183,0.22)', delay: 0 },
  { size: 360, bottom: '-8%', right: '-6%', color: 'rgba(33,150,243,0.16)', delay: 1.4 },
  { size: 240, top: '38%', right: '12%', color: 'rgba(179,157,219,0.24)', delay: 0.7 },
];

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: `${8 + (i * 5.2) % 84}%`,
  y: `${12 + (i * 7.3) % 76}%`,
  size: 3 + (i % 3),
  delay: i * 0.35,
}));

export default function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(103,58,183,0.12) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 85% 75%, rgba(33,150,243,0.1) 0%, transparent 50%)',
        }}
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '160%',
          height: '160%',
          marginLeft: '-80%',
          marginTop: '-80%',
          background:
            'conic-gradient(from 0deg, transparent 0%, rgba(103,58,183,0.04) 15%, transparent 30%, rgba(33,150,243,0.04) 50%, transparent 65%, rgba(179,157,219,0.05) 80%, transparent 100%)',
        }}
      />

      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: [1, 1.12, 1],
            x: [0, i % 2 === 0 ? 30 : -26, 0],
            y: [0, i % 2 === 0 ? -22 : 28, 0],
          }}
          transition={{
            opacity: { duration: 1.2 },
            scale: { duration: 9, repeat: Infinity, ease: 'easeInOut', delay: orb.delay },
            x: { duration: 11, repeat: Infinity, ease: 'easeInOut', delay: orb.delay },
            y: { duration: 10, repeat: Infinity, ease: 'easeInOut', delay: orb.delay },
          }}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 68%)`,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            filter: 'blur(1px)',
          }}
        />
      ))}

      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.15, 0.55, 0.15],
            y: [0, -18, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 4 + (p.id % 3),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.id % 2 === 0 ? 'rgba(103,58,183,0.5)' : 'rgba(33,150,243,0.45)',
            boxShadow: '0 0 12px rgba(103,58,183,0.3)',
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.35,
          backgroundImage:
            'linear-gradient(rgba(103,58,183,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(103,58,183,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 75%)',
        }}
      />
    </div>
  );
}
