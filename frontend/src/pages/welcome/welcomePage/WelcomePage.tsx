import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-4 text-sm font-medium tracking-widest text-gray-500 uppercase">
          Razorpay Buildathon · Track 03
        </div>

        <h1 className="text-5xl font-semibold text-white mb-4">
          Meet <span className="text-white">Revo</span>
        </h1>

        <p className="text-xl text-gray-300 mb-3">
          Your AI Revenue Recovery Agent
        </p>

        <p className="text-gray-500 mb-10 leading-relaxed">
          Revo identifies revenue at risk, uncovers why payments fail,
          and automatically takes the right action to recover lost revenue.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3 font-medium text-black transition-all duration-200 hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
        >
          Enter Revo
        </button>
      </div>
    </div>
  );
}