import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./Home/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <>
      <main className="w-dvw h-dvh flex justify-center items-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </main>
    </>
  );
}

export default App;
