import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { createChatRoute } from "../utils/APIRoutes";
import { io } from "socket.io-client";
import { host } from "./../utils/APIRoutes";
import CustomerChat from "../components/CustomerChat";

function Request() {
  const socket = useRef();

  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [currentChat, setCurrentChat] = useState(undefined);

  useEffect(() => {
    socket.current = io(host);
  }, []);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("chat-started", (chatId) => {
        console.log(chatId);
      });
    }
  }, [socket]);

  useEffect(() => {
    async function getChat() {
      const tempChat = await JSON.parse(localStorage.getItem("support-chat"));
      setCurrentChat(tempChat);
    }
    if (localStorage.getItem("support-chat")) {
      getChat();
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (handleValidation()) {
      const { name, email, message } = values;
      const { data } = await axios.post(createChatRoute, {
        user: {
          name: name,
          email: email,
        },
        message: message,
        priority: Math.round(1 + Math.random() * (2 - 1)),
      });
      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      } else if (data.status === true) {
        toast.success("Chat created", toastOptions);
        socket.current = io(host);
        socket.current.emit("new-request", data.chat);
        localStorage.setItem("support-chat", JSON.stringify(data.chat));
        setCurrentChat(data.chat);
        //     navigate('/')
      }
    }
  };

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const handleValidation = () => {
    const { name, email, message } = values;
    if (name === "") {
      toast.error("Name is required", toastOptions);
      return false;
    } else if (email === "") {
      toast.error("Email is required", toastOptions);
      return false;
    } else if (message.trim().length < 10) {
      toast.error(
        "Message should be contain atleast 10 characters",
        toastOptions
      );
      return false;
    }

    return true;
  };

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  return (
    <>
      {currentChat === undefined ? (
        <FormContainer>
          <form onSubmit={(event) => handleSubmit(event)}>
            <div className="brand">
              <h1>Branch Chat Support</h1>
            </div>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Name"
              onChange={(e) => handleChange(e)}
            />
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              onChange={(e) => handleChange(e)}
            />
            <textarea
              name="message"
              id="message"
              rows="10"
              placeholder="Enter your message here..."
              onChange={(e) => handleChange(e)}
            />
            <button type="submit">Send</button>
          </form>
        </FormContainer>
      ) : (
        <CustomerChat
          currentChat={currentChat}
          currentUser={currentChat.user}
          socket={socket}
        />
      )}
      <ToastContainer />
    </>
  );
}

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #4eccff;

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    h1 {
      color: white;
      text-transform: uppercase;
    }
  }
  form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    background-color: #19345f;
    border-radius: 0.5rem;
    padding: 3rem 7rem;
    input,
    textarea {
      background-color: transparent;
      padding: 1rem;
      border: 0.1rem solid #fefffe;
      border-radius: 0.4rem;
      color: white;
      width: 150%;
      font-size: 1rem;
      &:focus {
        border: 0.1rem solid #fefffe;
        outline: none;
      }
      &::-webkit-scrollbar {
        width: 0.2rem;
        &-thumb {
          background-color: #ffffff39;
          width: 0.1rem;
          border-radius: 0.1rem;
        }
      }
    }
    button {
      background-color: #4eccff;
      color: #19345f;
      padding: 1rem 2rem;
      border: none;
      font-weight: none;
      cursor: pointer;
      border-radius: 0.4rem;
      font-size: 1rem;
      text-transform: uppercase;
      transition: 0.3s ease-in-out;
      &:hover {
        background-color: #4e0eff;
        color: white;
      }
    }
    span {
      color: white;
      text-transform: uppercase;
      a {
        color: #4e0eff;
        text-decoration: none;
        font-weight: bold;
      }
    }
  }
`;
//Color codes: light blue- #4ECCFF, dark blue- #19345F, white- #FEFFFE, black- #333333

export default Request;
