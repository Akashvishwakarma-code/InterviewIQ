import React, { useState, useRef, useEffect } from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer.jsx'
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa"

function Step2Interview({ interviewData, onFinish }) {
  const questions = interviewData?.questions || []

  const [isIntroPhase, setIsIntroPhase] = useState(true)
  const [isMicon, setIsMicon] = useState(true)
  const recognitionRef = useRef(null)
  const [isAiPlaying, setIsAiPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voiceGender, setVoiceGender] = useState("female")
  const [subtitle, setSubtitle] = useState("")

  const videoRef = useRef(null)

  const currentQuestion = questions[currentIndex]
  
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      // Try known female voices first 
      const femaleVoice = 
      voices.find(v => 
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("female")
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      //Try known male voices
      const maleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().include("male")
        );

        if (maleVoice) {
          setSelectedVoice(maleVoice);
          setVoiceGender("male");
          return;
        }

        setSelectedVoice(voices[0]);
        setVoiceGender("female");

    };
    loadVoices();
    window.speechSynthesis.onVoicechanged = loadVoices;
  },[])

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo ;

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice){
        resolve();
        return;
      }
      window.speechSynthesis.cancel();

      //Add natural pauses after commas and periods
      const humanText = text
      .replace(/,/g, ", ...")
      .replace(/\./g, ". ...");

      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;

      //Human-like pacing 
      utterance.rate = 0.92; // slightly slower than normal
      utterance.pitch = 1.05; // small warmth
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAiPlaying(true);
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAiPlaying(false);

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

    })
  };

  useEffect(() => {
    if(!selectedVoice){
      return;
    }
    const runIntro = async () => {
      if(isIntroPhase){
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );
        setIsIntroPhase(false)
      }else if (currentQuestion){
        await new Promise(r => setTimeout(r, 800));

        //If last question (hard level)
        if(currentIndex === questions.length - 1){
          await speakText("Alright, this one might be a bit more challenging.");
        }
      }

      await speakText(currentQuestion.question);
    }
    runIntro()
  },[selectedVoice , isIntroPhase, currentIndex])
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-[1320px] h-[78vh] min-h-[620px] bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-xl flex flex-col lg:flex-row">
        {/* Left panel: video + status */}
        <div className="w-full lg:w-[38%] bg-white p-3 sm:p-4 border-r-2 border-black flex flex-col gap-3">
          <div className="w-full overflow-hidden rounded-3xl bg-black">
            <video
              src={videoSource}
              key={videoSource} 
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-[220px] sm:h-[260px] lg:h-[300px] object-cover"
            />
          </div>

          { /* subtitle */}
          { subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">{subtitle}</p>
            </div>
          )}

          <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-4 sm:p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>
              {isAiPlaying && <span className="text-sm font-semibold text-emerald-600">{isAiPlaying ? "AI Speaking " :""}</span>}
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-center">
              <Timer timeLeft="30" totalTime="60" />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-emerald-600">{currentIndex + 1}</span>
                <span className="text-xs text-gray-400">Current Question</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-emerald-600">{questions.length}</span>
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
                Question {currentIndex + 1 } of {questions.length}
              </p>
              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.question}
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
