import LogoComponent from "./logoComponent";
import React from "react";
const KickedOutComponent: React.FC= () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <LogoComponent/>
     <div className="max-w-[550px] mt-7 flex flex-col justify-center items-center px-4 text-center">
        <h1 className="text-3xl text-black mb-2">
         Let's <span className="font-bold">You’ve been Kicked out !</span>
        </h1>
        <p className="text-sm text-black/60">
          Looks like the teacher had removed you from the poll system .Please Try again after sometime.
        </p>
      </div>
    </div>
  );
};


export default KickedOutComponent;