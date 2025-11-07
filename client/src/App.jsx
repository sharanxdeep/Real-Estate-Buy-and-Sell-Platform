import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import ListProperty from "./pages/ListProperty";
import ChatPage from "./pages/Chat";
import { SocketProvider } from "./services/socket";

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/about" element={<About />} />
          <Route path="/list-property" element={<ListProperty />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
