import { useState } from 'react'
import axios from 'axios';
import { motion } from "motion/react"
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice.js';

function Pricing() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [selectedPlan, setSelectedPlan] = useState("free");
    const [hoveredPlan, setHoveredPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [paymentError, setPaymentError] = useState("");
    const [paymentMessage, setPaymentMessage] = useState("");

    const plans = [
        {
            id:"free",
            name:"Free",
            price: "₹0",
            credits: 100,
            description: "Perfect for beginners starting interview preparation.",
            features:[
                "100 Ai Interview Credits",
                "Basic Performance Report",
                "Voice Interview Access",
                "Limited History Tracking",
            ],
            default: true,
        },
        {
            id:"basic",
            name:"Starter Pack",
            price: "₹100",
            credits: 150,
            description: "Great for focused practice and skill improvement.",
            features: [
                "150 AI Interview Credits",
                "Detailed Feedback",
                "Performance Analytics",
                "Full Interview History",
            ],
        },
        {
            id:"pro",
            name: "Pro Pack",
            price: "₹500",
            credits: 650,
            description: "Best value for serious job preparation.",
            features: [
                "650 AI Interview Credits",
                "Advanced AI Feedback",
                "Skill Trend Analysis",
                "Priority AI Processing",
            ],
            badge: "Best Value",
        },
    ];

    const handlePayment = async (plan) => {
        if (plan.id === "free") {
            setSelectedPlan(plan.id);
            return;
        }

        try {
            setLoadingPlan(plan.id);
            setPaymentError("");
            setPaymentMessage("");

            const amount =
                plan.id === "basic" ? 100 :
                plan.id === "pro" ? 500 : 0;

            const { data } = await axios.post(`${ServerUrl}/api/payment/order`, {
                planId: plan.id,
                amount,
                credits: plan.credits,
            }, { withCredentials: true });

            if (!data.key) {
                throw new Error("Razorpay key ID is missing from the server configuration.");
            }
            if (!window.Razorpay) {
                throw new Error("Razorpay Checkout did not load. Refresh the page and try again.");
            }

            const options = {
                key: data.key,
                amount: data.amount,
                currency: "INR",
                name: "InterviewIQ.AI",
                description: `${plan.name} - ${plan.credits} Credits`,
                order_id: data.id,
                handler: async function (response) {
                    try {
                        setLoadingPlan(plan.id);
                        const { data: verification } = await axios.post(
                            `${ServerUrl}/api/payment/verify`,
                            response,
                            { withCredentials: true }
                        );
                        if (!verification.user) {
                            throw new Error("Payment was verified, but the updated account details were not returned.");
                        }
                        dispatch(setUserData(verification.user));
                        setPaymentMessage(verification.message || "Payment verified successfully.");
                    } catch (error) {
                        console.error("Unable to verify Razorpay payment:", error);
                        setPaymentError(error.response?.data?.message || error.message || "Payment verification failed.");
                    } finally {
                        setLoadingPlan(null);
                    }
                },
                theme: {
                    color: "#10b981"
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Unable to start Razorpay checkout:", error);
            setPaymentError(error.response?.data?.message || error.message || "Unable to start payment. Please try again.");
        } finally {
            setLoadingPlan(null);
        }
    }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-5 py-16 px-6">
        <div className="max-w-6xl mx-auto mb-14 flex items-start gap-4">
            <button onClick={()=>navigate("/")} className="mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition">
                <FaArrowLeft className="text-gray-600" />
            </button>
            
            <div className="text-center w-full">
                <h1 className="text-4xl font-bold text-gray-800">
                    Choose Your Plan
                </h1>
                <p className="text-gray-500 mt-3 text-lg">
                    Flexible pricing to match your interview preparation goals.
                </p>
            </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan)=>{
                const isSelected = selectedPlan === plan.id

                return(
                    <motion.div key={plan.id}
                    whileHover={{y:-4}}
                    className={`relative rounded-3xl p-8 transition-all duration-300 border
                        ${
                            isSelected
                            ? "border-emerald-600 shadow-2xl bg-white"
                            : "border-gray-200 bg-white shadow-md"
                        }
                        ${plan.default ? "cursor-default" : "cursor-pointer"}
                        `}
                     >
                        {plan.badge && (
                            <span className="absolute -top-3 right-6 rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white shadow">
                                {plan.badge}
                            </span>
                        )}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">{plan.name}</h2>
                            <p className="mt-2 min-h-12 text-sm leading-relaxed text-gray-500">
                                {plan.description}
                            </p>
                        </div>

                        <div className="mb-6 flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                            <span className="text-sm text-gray-500">/{plan.credits} credits</span>
                        </div>

                        <ul className="mb-8 space-y-3">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                                    <span aria-hidden="true" className="font-bold text-emerald-600">✓</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            type="button"
                            disabled={loadingPlan === plan.id}
                            onClick={(e) => {e.stopPropagation();
                                if(!isSelected){
                                    setSelectedPlan(plan.id)
                                    if (plan.id === "free") {
                                        return;
                                    }
                                }
                                handlePayment(plan)
                            }}
                            onMouseEnter={() => setHoveredPlan(plan.id)}
                            onMouseLeave={() => setHoveredPlan(null)}
                            onFocus={() => setHoveredPlan(plan.id)}
                            onBlur={() => setHoveredPlan(null)}
                            aria-pressed={isSelected}
                            className={`w-full rounded-xl px-5 py-3 font-semibold transition ${
                                isSelected
                                    ? "bg-emerald-600 text-white"
                                    : "border border-gray-300 bg-white text-gray-700 hover:border-emerald-600 hover:text-emerald-700"
                            } ${loadingPlan === plan.id ? "opacity-80 cursor-not-allowed" : ""}`}
                        >
                            {loadingPlan === plan.id
                                ? "Processing..."
                                : !plan.default && hoveredPlan === plan.id
                                    ? "Proceed to Pay"
                                    : isSelected
                                        ? "Selected"
                                        : plan.default
                                            ? "Choose Free Plan"
                                            : "Select Plan"}
                        </button>
                    </motion.div>
                )
            })}
        </div>
        {paymentError && (
            <p role="alert" className="mt-6 text-center text-sm text-red-600">
                {paymentError}
            </p>
        )}
        {paymentMessage && (
            <p role="status" className="mt-6 text-center text-sm text-emerald-700">
                {paymentMessage}
            </p>
        )}
      
    </div>
  )
}

export default Pricing
