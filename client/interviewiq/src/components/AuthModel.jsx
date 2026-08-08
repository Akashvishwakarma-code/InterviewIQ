import React, { useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import Auth from '../pages/Auth.jsx'
import { useSelector } from 'react-redux'
import {motion} from "motion/react"

function AuthModel({ onClose }) {
    const { userData } = useSelector((state) => state.user)
    useEffect(()=>{
        if(userData){
            onClose()
        }
    },[userData,onClose])
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8">
        <div className="relative w-full max-w-md mx-auto">
            <motion.button 
            initial={{ opacity: 0, y: -20 }}
            animate={{ scale: 1.05, opacity: 1, y: 20 }}
            transition={{ duration: 0.5 }}
            onClick={onClose} className="absolute top-9 right-4 text-gray-800 hover:text-black text-xl z-50">
                <FaTimes size={18} />
            </motion.button>
            <Auth isModel={true} />
        </div>
    </div>
  )
}

export default AuthModel
