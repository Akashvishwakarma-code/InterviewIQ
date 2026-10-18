import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { ServerUrl } from '../App';
import axios from 'axios';
import Step3Report from '../components/Step3Report';

function InterviewReport() {
  const {id} = useParams()
  const [report,setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(()=>{
    let isMounted = true;

    const fetchReport = async () => {
      try{
        const result = await axios.get(
          `${ServerUrl}/api/interview/report/${id}`,
          {withCredentials:true}
        );
        if (isMounted) {
          setReport(result.data);
        }
      }catch(error) {
        console.error("Failed to load interview report:", error);
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message || error.message || "Unable to load this report."
          );
        }
      }
    }

    fetchReport()
    return () => {
      isMounted = false;
    };
  },[id])

  if(!report) {
    return(
      <div className="min-h-screen flex items-center justify-center ">
        <p className={errorMessage ? "text-red-600 text-lg" : "text-gray-500 text-lg"}>
          {errorMessage ? `Failed to load report: ${errorMessage}` : "Loading Report ....."}
        </p>
      </div>
    );
  }
  
  return <Step3Report report={report}/>
}

export default InterviewReport
