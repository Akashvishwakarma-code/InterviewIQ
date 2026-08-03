import React from 'react'
import { BsRobot } from 'react-icons/bs'
import { IoSparkles } from 'react-icons/io5'
import { motion } from 'motion/react'
import { FcGoogle } from 'react-icons/fc'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../utils/firebase.js'
import { ServerUrl } from '../App.jsx'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice.js'

function Auth({ isModel = false }) {
  const dispatch = useDispatch()

  const handleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, provider)
      const User = response.user
      const name = User.displayName
      const email = User.email
      const result = await axios.post(ServerUrl + '/api/auth',
        { name, email }, { withCredentials: true })
      console.log(result)
      if (result?.data) {
        dispatch(setUserData(result.data))
      }
    } catch (error) {
      console.log('error:', error)
    }
  }

  return (
    <div className={`w-full ${isModel ? 'py-4' : 'min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20'}`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ scale: 1.05, opacity: 1, y: 20 }}
        transition={{ duration: 0.5 }}
        className={`w-full ${isModel ? 'max-w-md p-8 rounded-3xl bg-white shadow-xl' : 'max-w-3xl p-12 rounded-[32px] bg-white shadow-xl'}`}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h2 className="font-semibold text-lg">InterviewIQ</h2>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-center leading-snug mb-4">
          Continue with{' '}
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center">
            <IoSparkles size={16} />
            Ai Smart interview
          </span>
        </h1>
        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">
          Sign in to start AI-powered mock interviews, track your progress and unlock detailed performance insights.
        </p>
        <motion.button
          onClick={handleAuth}
          whileHover={{ opacity: 0.9, scale: 1.03 }}
          whileTap={{ opacity: 1, scale: 0.98 }}
          className='w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md'>
          <FcGoogle size={20} />
          Continue with Google
        </motion.button>
      </motion.div>
    </div>
  )
}

export default Auth
