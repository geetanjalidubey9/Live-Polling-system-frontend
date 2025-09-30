import React, { useEffect, useState } from "react";

type PollData = {
  _id: string;
  question: string;
  options: { [key: string]: number };
  correctAnswer: string;
  studentCount: number;
  status: string;
  createdAt: string;
};

const PollHistoryComponent: React.FC = () => {
  const [polls, setPolls] = useState<PollData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchAllPolls() {
    try {
      const response = await fetch("https://live-polling-system-backend-production-4f28.up.railway.app/api/users/get-allpolls", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch polls");
      return data;
    } catch (error) {
      console.error("Error fetching polls:", error);
      throw error;
    }
  }

  useEffect(() => {
    const getPolls = async () => {
      try {
        const data = await fetchAllPolls();
        setPolls(data.polls || []);
      } catch (error) {
        console.error("Failed to load polls:", error);
      } finally {
        setLoading(false);
      }
    };

    getPolls();
  }, []);

  if (loading) {
    return <div className="p-4">Loading polls...</div>;
  }

  if (!polls || polls.length === 0) {
    return <div className="p-4">No polls available</div>;
  }

  return (
    <div className="ml-[15%] min-h-screen flex flex-col justify-center items-left gap-6 p-4">
      <h1 className="text-3xl text-black mt-2">
            View  <span className="font-bold">Poll History </span>
          </h1>
 
      {polls.map((poll, index) => {
        const totalResponses = Object.values(poll.options || {}).reduce((sum, val) => sum + val, 0);
        return (
        <div>
           <h4 className="mb-2 text-black bold"> Question {index + 1} </h4>
          <div
            key={poll._id}
            className="w-[40%]  min-w-[240px] rounded-lg flex flex-col border border-[#AF8FF1] shadow-md overflow-hidden"
          >
            <div className="w-full h-[50px] bg-gradient-to-r from-[#343434] to-[#6E6E6E] flex items-center px-4">
              <h2 className="text-white text-[17px] font-semibold">
              {poll.question}
              </h2>
            </div>

            <div className="flex flex-col gap-4 p-4">
              {Object.keys(poll.options || {}).map((opt, idx) => {
                const count = poll.options[opt];
                const percent = totalResponses === 0 ? 0 : Math.round((count / totalResponses) * 100);

                return (
                  <div
                    key={idx}
                    className="relative flex items-center justify-between p-4 border rounded-md cursor-pointer overflow-hidden transition bg-[#F7F7F7] border-gray-300"
                  >
                    <div
                      className="absolute top-0 left-0 h-full transition-all duration-500 rounded-md"
                      style={{ width: `${percent}%`, backgroundColor: "#6766D5" }}
                    />
                    <div className="relative flex items-center gap-4 z-10">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#6766D5] font-semibold">
                        {idx + 1}
                      </div>
                      <span className="text-[#2E2E2E] font-medium text-[16px]">{opt}</span>
                    </div>
                    <span className="relative z-10 text-sm font-medium font-bold text-black">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default PollHistoryComponent;
