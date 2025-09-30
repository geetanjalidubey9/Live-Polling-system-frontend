import  { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./Components/socketContext";
const WelcomePage = lazy(() => import("./Components/WelcomeScreen"));
const StudentPage =lazy(()=>import("./Components/StudentComponent"));
const KickedOutPage=lazy(()=>import("./Components/kickedOut"));
const LoadingPage=lazy(()=>import("./Components/Loading"));
const QuesPage=lazy(()=>import("./Components/questionsComponent"))
const PollPage=lazy(()=>import("./Components/PollComponent"))
const PollhistoryPage=lazy(()=>import("./Components/PollHistory"))
// const ChatPage=lazy(()=>import("./Components/chatComponent"))
function App() {
  return (
    <SocketProvider>
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/student" element={<StudentPage />} />
          <Route path="/kick-out" element={<KickedOutPage />} />
          <Route path="/waiting" element={<LoadingPage/>} />
          <Route path="/ques" element={<QuesPage role="teacher" />} />
          <Route path="/poll" element={<PollPage/>} />
          <Route path="/poll-history" element={<PollhistoryPage/>}/>
        </Routes>
      </Suspense>
    </Router>
    </SocketProvider>
  );
}
export default App;
