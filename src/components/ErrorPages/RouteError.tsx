import { useEffect, useState } from 'react';
import { FaTriangleExclamation } from 'react-icons/fa6';

function RouteError() {
    const [count, setCount] = useState(5);

    useEffect(() => {
        if (count === 0) {
            window.location.href = "/";
            return;
        }

        const timer = setInterval(() => {
            setCount((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [count]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate__animated animate__fadeIn">
            <FaTriangleExclamation className="text-8xl text-[#4ADE80] mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
            
            <h1 className="text-6xl font-bold mb-4 text-white">
                404 <span className="text-[#4ADE80]">Not Found</span>
            </h1>
            
            <p className="text-2xl text-gray-300 mb-8 max-w-md">
                Oops! The page you are looking for seems to have wandered off.
            </p>
            
            <div className="text-gray-400 text-lg bg-[#171717] px-6 py-4 rounded-lg border border-gray-800">
                Redirecting to homepage in <span className="text-[#4ADE80] font-bold text-2xl mx-1">{count}</span> seconds...
            </div>

            <button 
                onClick={() => window.location.href = "/"}
                className="mt-8 px-8 py-3 bg-transparent border-2 border-[#4ADE80] rounded-lg text-white hover:bg-[#4ADE80] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(74,222,128,0.1)] hover:shadow-[0_0_25px_rgba(74,222,128,0.4)] font-bold"
            >
                Go Home Now
            </button>
        </div>
    );
}

export default RouteError;