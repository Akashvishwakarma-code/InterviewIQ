import React from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer.jsx'
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa"

function Step2Interview({interviewData , onFinish}) {
  const { interviewId , questions , userName} = interviewData
  const [isIntroPhase, setIsIntroPhase]= useState(true);

  const [isMicon, setIsMicon]=useState(true);
  const recognitionRef =useRef(null);
  const [isAiPlaying, setAiPlaying] =useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] =useState("");
  const [feedback, setFeedback] =useState("");
  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-[1320px] h-[78vh] min-h-[620px] bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-xl flex flex-col lg:flex-row">
        {/* Left panel: video + status */}
        <div className="w-full lg:w-[38%] bg-white p-3 sm:p-4 border-r-2 border-black flex flex-col gap-3">
          <div className="w-full overflow-hidden rounded-3xl bg-black">
            <video
              src={femaleVideo}
              muted
              playsInline
              preload="auto"
              className="w-full h-[220px] sm:h-[260px] lg:h-[300px] object-cover"
            />
          </div>

          <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-4 sm:p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>
              <span className="text-sm font-semibold text-emerald-600">AI Speaking</span>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-center">
              <Timer timeLeft="30" totalTime="60" />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-emerald-600">1</span>
                <span className="text-xs text-gray-400">Current Question</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-emerald-600">5</span>
                <span className="text-xs text-gray-400">Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: interview content */}
        <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6 relative bg-gray-50/40">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-600">
              AI Smart Interview
            </h2>
          </div>

          <div className="space-y-3">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">
                Question 1 of 5
              </p>
              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                First Question
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm">
              <textarea
                placeholder="Type your answer here..."
                className="w-full min-h-[220px] resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
              />
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg"
                  type="button"
                >
                  <FaMicrophone size={20} />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold"
                  type="button"
                >
                  Submit Answer
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step2Interview
