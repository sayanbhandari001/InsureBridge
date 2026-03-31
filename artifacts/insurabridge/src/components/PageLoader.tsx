import { motion, AnimatePresence } from "framer-motion"
import { InsuraBridgeLogo } from "./InsuraBridgeLogo"

export function PageLoader({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(145deg,#060c1a 0%,#081428 55%,#060f12 100%)",
          }}
        >
          {/* Animated ambient orbs */}
          {[
            { size: 500, color: "rgba(0,137,123,0.18)", delay: 0 },
            { size: 320, color: "rgba(27,58,107,0.22)", delay: 0.6 },
          ].map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{ width: orb.size, height: orb.size, background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)` }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
            />
          ))}

          {/* Logo spring-pop */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.05 }}
            className="relative z-10 mb-8"
          >
            <InsuraBridgeLogo size={52} textSize="1.4rem" />
          </motion.div>

          {/* Bouncing dots */}
          <div className="relative z-10 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="block w-2 h-2 rounded-full"
                style={{ background: "linear-gradient(135deg,#93c5fd,#34d399)" }}
                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </div>

          {/* Top progress sweep */}
          <motion.div
            className="absolute top-0 left-0 h-[3px]"
            style={{ background: "linear-gradient(90deg,#1B3A6B,#00897B,#34d399)" }}
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.42, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
