import { SparklesIcon } from "@heroicons/react/24/solid";
import React from "react";
const logoComponent:React.FC=()=>{
    return(
         <div>
        <div className="w-[150px] h-[40px] text-white flex justify-center items-center rounded-[34px] gap-1 intervue-gradient mt-15">
            <div className="w-4 h-4">
            <SparklesIcon className="w-full h-full text-white" />
            </div>
            <div className="font-semibold">Intervue Poll</div>
        </div>
    </div>
    );

}
export default logoComponent;