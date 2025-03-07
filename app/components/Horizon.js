import { LinearGradient } from "expo-linear-gradient"
import hexToRgba from "../utils/hexToRgba"
import { useEffect, useState } from "react"

export default function Horizon({ size, direction, color, style }) {
  const [colors, setColors] = useState([])

  useEffect(() => {
    if (direction === "top" || direction === "right") {
      setColors([
        hexToRgba(color, 1),
        hexToRgba(color, 1),
        hexToRgba(color, 0),
      ])
    } else if (direction === "bottom" || direction === "left") {
      setColors([
        hexToRgba(color, 0),
        hexToRgba(color, 1),
        hexToRgba(color, 1),
      ])
    }
  }, [direction, color])

  let start = undefined, end = undefined;
  if (direction === "left" || direction === "right") {
    start = { x: 1, y: 0.5 }
    end = { x: 0, y: 0.5 }
  }

  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[
        style, 
        (direction === 'top' || direction === 'bottom') && { height: size },
        (direction === 'left' || direction === 'right') && { width: size },
      ]}
    />
  )
}
