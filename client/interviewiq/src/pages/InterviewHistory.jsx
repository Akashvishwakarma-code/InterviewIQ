import axios from 'axios'
import { useEffect, useState } from 'react'
import { ServerUrl } from '../App'

function InterviewHistory() {
    const [interviews, setInterviews] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const getMyInterviews = async () => {
            try{
                const result = await axios.get(ServerUrl+"/api/interview/get-interview" , {withCredentials:true})
                setInterviews(result.data)
            }catch(error) {
                setErrorMessage(error.response?.data?.message || 'Unable to load interview history.')
            } finally {
                setIsLoading(false)
            }
        }
        getMyInterviews()
    }, [])

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald py-10"></div>
  )
}

export default InterviewHistory
