import AddGirthy from "../svg/AddGirthy"
import AddSquare from "../svg/AddSquare"
import AddUser from "../svg/AddUser"
import BlockAdd from "../svg/BlockAdd"
import BookIcon from "../svg/BookIcon"
import BookWithBookmark from "../svg/BookWithBookmark"
import ClockIcon from "../svg/Clock"
import EarthIcon from "../svg/EarthIcon"
import Fire from "../svg/Fire"
import FlagIcon from "../svg/Flag"
import HomeIcon from "../svg/HomeIcon"
import LaurelWreath from "../svg/LaurelWreath"
import LaurelWreathLeft from "../svg/LaurelWreathLeft"
import LaurelWreathRight from "../svg/LaurelWreathRight"
import MessageBubble from "../svg/MessageBubble"
import PauseIcon from "../svg/Pause"
import PlayIcon from "../svg/Play"
import QuillBlock from "../svg/QuillBlock"
import SparklesIcon from "../svg/SparklesIcon"
import Zap from "../svg/Zap"

export default function HugeIcon({ icon, color, fill, size, style }) {
  const props = {
    width: size,
    height: size,
    color: color,
    fill: color,
    style: style,
  }

  const icons = {
    "add-block": <BlockAdd {...props} />,
    "add-girthy": <AddGirthy {...props} />,
    "add-square": <AddSquare {...props} />,
    "add-user": <AddUser {...props} />,
    "book": <BookIcon {...props} />,
    "book-bookmark": <BookWithBookmark {...props} />,
    "clock": <ClockIcon {...props} />,
    "earth": <EarthIcon {...props} />,
    "fire": <Fire {...props} />,
    "flag": <FlagIcon {...props} />,
    "home": <HomeIcon {...props} />,
    "laurel-wreath": <LaurelWreath {...props} />,
    "laurel-wreath-left": <LaurelWreathLeft {...props} />,
    "laurel-wreath-right": <LaurelWreathRight {...props} />,
    "message-bubble": <MessageBubble {...props} />,
    "play": <PlayIcon {...props} />,
    "pause": <PauseIcon {...props} />,
    "quill-block": <QuillBlock {...props} />,
    "sparkles": <SparklesIcon {...props} />,
    "zap": <Zap {...props} />,
  }

  return (
    <>
      {icons[icon]}
    </>
  )
}