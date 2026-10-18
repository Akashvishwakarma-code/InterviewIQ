import React, { useState, useRef, useEffect } from 'react'
import maleVideo from "../assets/Videos/male-ai.mp4"
import femaleVideo from "../assets/Videos/female-ai.mp4"
import Timer from './Timer.jsx'
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa"
import {BsArrowRight} from "react-icons/bs"
import axios from "axios";
import { ServerUrl } from '../App.jsx';

function Step2Interview({ interviewData, onFinish }) {
  const questions = interviewData?.questions || []
  const userName = interviewData?.userName || "there"
  const interviewId = interviewData?.interviewId

  const [isIntroPhase, setIsIntroPhase] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null)
  const [isAiPlaying, setIsAiPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [voiceGender, setVoiceGender] = useState("female")
  const [subtitle, setSubtitle] = useState("")

  const videoRef = useRef(null)
  const hasQuestions = questions.length > 0
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
          v.name.toLowerCase().includes("male")
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
    window.speechSynthesis.onvoiceschanged = loadVoices;
  },[])

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo ;

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const humanText = text
        .replace(/,/g, ", ...")
        .replace(/\./g, ". ...");

      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAiPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
        setIsAiPlaying(false);

        if(isMicOn) {
          startMic();
        };

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      utterance.onerror = () => {
        setIsAiPlaying(false);
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      window.speechSynthesis.speak(utterance);
    })
  };

  useEffect(() => {
    if (!selectedVoice) return

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        )

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        )
        setIsIntroPhase(false)
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800))

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.")
        }
      }

      if (currentQuestion) {
        await speakText(currentQuestion.question);

        if(isMicOn) {
          startMic();
        }
      }
    }

    runIntro()
  }, [selectedVoice, isIntroPhase, currentIndex, currentQuestion, hasQuestions, questions.length, userName])

  useEffect(()=>{
    if(isIntroPhase) return ;
    if(!currentQuestion) return ;
    if(isSubmitting || feedback) return ;
    const timer = setInterval(() => {
      setTimeLeft((prev)=>{
        if(prev <= 1){
          clearInterval(timer)
          return 0;
        }
        return prev -1
      })
    }, 1000)

    return () => clearInterval(timer)
  },[isIntroPhase, currentIndex, isSubmitting, feedback, currentQuestion])

 useEffect(()=>{
  if (!("webkitSpeechRecognition" in window )) return ;
  
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onresult = (event) =>{
    const transcript =
      event.results[event.results.length - 1] [0].transcript;

    setAnswer((prev)=> prev + " " + transcript);

  };
  recognitionRef.current = recognition;

 },[])

 const startMic = () => {
  if( recognitionRef.current && !isAiPlaying ) {
    try{
      recognitionRef.current.start();
    }catch{ }
  }
 };

 const stopMic = () => {
  if(recognitionRef.current) {
    recognitionRef.current.stop();
  }
 };

 const toggleMic = () => {
  if(isMicOn){
    stopMic();
  }else{
    startMic();
  }
  setIsMicOn(!isMicOn);
 };

 const submitAnswer = async () => {
  if(isSubmitting) return ;
  stopMic()
  setIsSubmitting(true)

  try {
    const result = await axios.post(ServerUrl + "/api/interview/submit-answer" , { 
      interviewId,
      questionIndex : currentIndex,
      answer, 
      timeTaken: 
      currentQuestion.timeLimit - timeLeft,
    },{withCredentials: true})
    setFeedback(result.data.feedback)
    speakText(result.data.feedback)
    setIsSubmitting(false)
  }catch(error){
    console.log(error)
    setIsSubmitting(false)
  }
 }

const handleNext = async () => {
  if (isAdvancing) return;
  setIsAdvancing(true);

  try {
    if (currentIndex + 1 >= questions.length) {
      await finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    const nextIndex = currentIndex + 1;
    setAnswer("");
    setFeedback("");
    setTimeLeft(questions[nextIndex]?.timeLimit || 60);
    setCurrentIndex(nextIndex);
  } finally {
    setIsAdvancing(false);
  }
}

const finishInterview = async () => {
  stopMic()
  setIsMicOn(false)
  try{
    const result = await axios.post(ServerUrl + "/api/interview/finish",{
      interviewId}, {withCredentials:true
    })
    console.log(result.data)
    onFinish(result.data)
  }catch(error){
    console.log(error)
  }
}

useEffect(() => {
  if (isIntroPhase) return ;
  if (!currentQuestion) return ;

  if (timeLeft !== 0 || isSubmitting || feedback) return;

  const timeout = setTimeout(() => {
    submitAnswer();
  }, 0);

  return () => clearTimeout(timeout);
}, [timeLeft, isSubmitting, feedback, isIntroPhase, currentQuestion, submitAnswer]);

useEffect(() => {
  return ()  => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.abort();
    }

    window.speechSynthesis.cancel();
  }
},[]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-start lg:items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-[1320px] h-auto lg:h-[86vh] lg:min-h-[640px] bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xl flex flex-col lg:flex-row overflow-hidden my-auto">
        {/* Left panel: video + status */}
        <div className="w-full lg:w-[380px] xl:w-[420px] bg-white p-3 sm:p-4 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col gap-3 shrink-0 lg:overflow-y-auto">
          <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-black">
            <video
              src={videoSource}
              key={videoSource} 
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-[180px] sm:h-[220px] lg:h-[280px] object-cover"
            />
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm">
              <p className="text-gray-700 text-xs sm:text-sm font-medium text-center leading-relaxed">{subtitle}</p>
            </div>
          )}

          {/* Status card */}
          <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-3 sm:p-4 space-y-3">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">Interview Status</span>
              <span className="font-semibold text-emerald-600">
                {isAiPlaying ? "AI Speaking..." : "Your Turn"}
              </span>
            </div>

            <div className="h-px bg-gray-100"></div>

            <div className="flex items-center justify-around gap-2">
              <div className="flex flex-col items-center gap-1">
                <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} />
                <span className="text-[11px] text-gray-400 font-medium">Time Left</span>
              </div>

              <div className="h-10 w-px bg-gray-200"></div>

              <div className="flex items-center gap-4 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600">{currentIndex + 1}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400">Current</span>
                </div>
                <span className="text-gray-300 text-lg font-light">/</span>
                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-bold text-gray-700">{questions.length}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400">Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: interview content (question, textarea, controls) */}
        <div className="w-full flex-1 flex flex-col p-3 sm:p-5 md:p-6 bg-gray-50/50 lg:overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg sm:text-2xl font-bold text-emerald-700">
              AI Smart Interview
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {hasQuestions && (
            <div className="flex-1 flex flex-col gap-3">
              {/* Question display */}
              <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                  Question
                </p>
                <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 leading-relaxed">
                  {currentQuestion?.question || "Loading question..."}
                </div>
              </div>

              {/* Answer input */}
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col">
                <textarea
                  placeholder="Type or speak your answer here..."
                  onChange={(e) => setAnswer(e.target.value)}
                  value={answer}
                  className="w-full min-h-[140px] sm:min-h-[180px] lg:min-h-[220px] resize-y rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4 text-sm sm:text-base text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 transition"
                />
              </div>

              {/* Controls: mic + submit / feedback */}
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm">
                {!feedback ? (
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleMic}
                      className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center rounded-full transition shadow-md ${
                        isMicOn ? "bg-red-500 text-white animate-pulse" : "bg-gray-800 text-white hover:bg-black"
                      }`}
                      type="button"
                      title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                    >
                      {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                    </motion.button>

                    <motion.button
                      onClick={submitAnswer}
                      disabled={isSubmitting}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl shadow-md font-semibold text-sm sm:text-base transition disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Answer"}
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-200 p-4 sm:p-5 rounded-2xl"
                  >
                    <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Feedback</p>
                    <p className="text-emerald-900 text-sm sm:text-base font-medium mb-4 leading-relaxed">{feedback}</p>
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      disabled={isAdvancing}
                      whileHover={!isAdvancing ? { scale: 1.01 } : undefined}
                      whileTap={!isAdvancing ? { scale: 0.98 } : undefined}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3 font-semibold text-white shadow-md hover:from-emerald-700 hover:to-teal-600 transition disabled:opacity-60"
                    >
                      {isAdvancing
                        ? "Loading..."
                        : currentIndex + 1 >= questions.length
                          ? "Finish Interview"
                          : "Next Question"}
                      {!isAdvancing && <BsArrowRight size={18} aria-hidden="true" />}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step2Interview
