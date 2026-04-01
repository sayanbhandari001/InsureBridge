import { motion } from "framer-motion"
import { useTheme } from "@/lib/theme-context"

const DARK_BLOBS = [
  {
    id: "a1",
    style: { width: 720, height: 720, top: "-18%", left: "-12%",
      background: "radial-gradient(circle, rgba(0,191,165,0.22) 0%, transparent 65%)" },
    animate: { x: [0, 60, -20, 0], y: [0, 40, 80, 0] },
    duration: 22,
  },
  {
    id: "a2",
    style: { width: 640, height: 640, bottom: "-20%", right: "-14%",
      background: "radial-gradient(circle, rgba(27,58,107,0.35) 0%, transparent 65%)" },
    animate: { x: [0, -50, 30, 0], y: [0, -60, -20, 0] },
    duration: 26,
  },
  {
    id: "a3",
    style: { width: 500, height: 500, top: "30%", right: "8%",
      background: "radial-gradient(circle, rgba(0,137,123,0.18) 0%, transparent 65%)" },
    animate: { x: [0, 30, -30, 0], y: [0, -40, 20, 0] },
    duration: 18,
  },
  {
    id: "a4",
    style: { width: 420, height: 420, bottom: "5%", left: "10%",
      background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 65%)" },
    animate: { x: [0, -20, 40, 0], y: [0, 30, -30, 0] },
    duration: 30,
  },
  {
    id: "a5",
    style: { width: 380, height: 380, top: "10%", left: "40%",
      background: "radial-gradient(circle, rgba(129,140,248,0.10) 0%, transparent 65%)" },
    animate: { x: [0, 25, -25, 0], y: [0, -25, 25, 0] },
    duration: 20,
  },
]

const LIGHT_BLOBS = [
  {
    id: "a1",
    style: { width: 720, height: 720, top: "-18%", left: "-12%",
      background: "radial-gradient(circle, rgba(0,191,165,0.10) 0%, transparent 65%)" },
    animate: { x: [0, 60, -20, 0], y: [0, 40, 80, 0] },
    duration: 22,
  },
  {
    id: "a2",
    style: { width: 640, height: 640, bottom: "-20%", right: "-14%",
      background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 65%)" },
    animate: { x: [0, -50, 30, 0], y: [0, -60, -20, 0] },
    duration: 26,
  },
  {
    id: "a3",
    style: { width: 500, height: 500, top: "30%", right: "8%",
      background: "radial-gradient(circle, rgba(0,137,123,0.08) 0%, transparent 65%)" },
    animate: { x: [0, 30, -30, 0], y: [0, -40, 20, 0] },
    duration: 18,
  },
  {
    id: "a4",
    style: { width: 420, height: 420, bottom: "5%", left: "10%",
      background: "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 65%)" },
    animate: { x: [0, -20, 40, 0], y: [0, 30, -30, 0] },
    duration: 30,
  },
  {
    id: "a5",
    style: { width: 380, height: 380, top: "10%", left: "40%",
      background: "radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 65%)" },
    animate: { x: [0, 25, -25, 0], y: [0, -25, 25, 0] },
    duration: 20,
  },
]

export function AuroraBackground() {
  const { theme } = useTheme()
  const blobs = theme === "light" ? LIGHT_BLOBS : DARK_BLOBS
  const scanLineColor = theme === "light"
    ? "rgba(0,191,165,0.10)"
    : "rgba(0,191,165,0.25)"

  return (
    <>
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full pointer-events-none"
          style={{ ...blob.style, position: "absolute", borderRadius: "50%" }}
          animate={blob.animate}
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
          aria-hidden="true"
        />
      ))}
      <motion.div
        className="absolute inset-x-0 pointer-events-none"
        style={{ height: 1, background: `linear-gradient(90deg, transparent, ${scanLineColor}, transparent)` }}
        animate={{ top: ["-2%", "102%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      />
    </>
  )
}
