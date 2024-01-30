import React, { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { motion } from 'framer-motion'
import useScreenSize from '../hook/useScreenSize';

interface ConfettiProps {
  show: boolean;
  timeout: number;
}

const TimedConfetti = ({ show, timeout }: ConfettiProps) => {
  const [display, setDisplay] = useState(show)
  const { width, height } = useScreenSize()

  useEffect(() => {
    if (show) {
      setDisplay(true)
      const timer = setTimeout(() => {
        setDisplay(false)
      }, timeout * 1000)
      return () => clearTimeout(timer)
    }
  }, [show, timeout])

  return display ? (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: timeout }}
      style={{ position: 'fixed', width: '100vw', height: '100vh', pointerEvents: 'none' }}
    >
      <Confetti
        width={width}
        height={height}
      />
    </motion.div>
  ) : null
}

export default TimedConfetti