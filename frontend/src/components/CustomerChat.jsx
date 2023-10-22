import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { completeChatRoute, sendMessageRoute } from "../utils/APIRoutes";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import axios from "axios";
import { getAllMessageRoute } from "../utils/APIRoutes";
import { v4 as uuidv4 } from "uuid";
import { getChatRoute } from "./../utils/APIRoutes";
import { useNavigate } from "react-router-dom";

export default function CustomerChat({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [chatStatus, setChatStatus] = useState("pending");
  const [searchKeyword, setSearchKeyword] = useState(undefined);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [chat, setChat] = useState(currentChat);
  const scrollRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentChat) {
      setChat(currentChat);
      setChatStatus(currentChat.status);
      if (socket.current) {
        socket.current.emit("chat-opened", currentChat._id);
      }
    }
  }, [currentChat]);

  async function getMessages() {
    const res = await axios.post(getAllMessageRoute, {
      from: currentUser._id,
      id: chat._id,
    });
    setMessages(res.data);
  }

  useEffect(() => {
    if (chat && currentUser) {
      getMessages();
    }
  }, [chat]);

  const handleSendMsg = async (msg) => {
    const res = await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: chat.agent,
      message: msg,
      id: chat._id,
    });
    socket.current.emit("send-msg", {
      id: chat._id,
      from: currentUser._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-receive", (msg) => {
        setArrivalMessage({
          fromSelf: false,
          message: msg,
        });
      });
      socket.current.on("chat-complete", async () => {
        chat.status = "complete";
        setChatStatus("complete");
        localStorage.setItem("support-chat", await JSON.stringify(chat));
      });
    }
  }, []);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("chat-started", async (chatid) => {
        const updChat = await axios.get(`${getChatRoute}/${chatid}`);
        if (updChat.data.status === true) {
          setChat(updChat.data.chat);
          // getMessages()
        }
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [messages, searchKeyword]);

  const filterMessages = (keyword) => {
    keyword = keyword.toLowerCase().trim();
    if (keyword === "") keyword = undefined;
    setSearchKeyword(keyword);
  };

  const endChat = () => {
    axios.get(`${completeChatRoute}/${chat._id}`);
    chat.status = "complete";
    setChat(chat);
    if (socket.current) {
      socket.current.emit("chat-ended", chat._id);
    }
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      {chat && (
        <Container>
          <div className="chat-header">
            <div className="user-details">
              <div className="name">
                <h3>Branch Chat Support</h3>
              </div>
            </div>
            <div className="search">
              <input
                type="text"
                placeholder="Search messages..."
                onChange={(event) => {
                  filterMessages(event.target.value);
                }}
              />
            </div>
            <Button onClick={endChat}>End</Button>
          </div>
          <div className="chat-messages">
            {messages.map((message) => {
              return (
                <div
                  ref={scrollRef}
                  key={uuidv4()}
                  hidden={
                    searchKeyword !== undefined &&
                    !message.message.toLowerCase().includes(searchKeyword)
                  }
                >
                  <div
                    className={`message ${
                      message.fromSelf ? "sent" : "received"
                    }`}
                  >
                    <div className="content">
                      <p>{message.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <ChatInput
            handleSendMsg={handleSendMsg}
            disabled={chatStatus !== "pending"}
          />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-rows: 5% 85% 10%;
  background-color: #4eccff;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    background-color: #19345f;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .name {
        h3 {
          color: white;
        }
      }
    }
    .search {
      width: 30%;
      border-radius: 2rem;
      min-height: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      background-color: #ffffffe3;
      margin: 1rem 0rem;
      cursor: text;
      input {
        width: 95%;
        height: 60%;
        background-color: transparent;
        color: black;
        border: none;
        padding-left: 0.5rem;
        font-size: 1rem;
        &::selection {
          background-color: #9186f3;
        }
        &:focus {
          outline: none;
        }
      }
    }
  }
  .chat-messages {
    padding: 0.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 0.1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
      }
    }
    .sent {
      justify-content: flex-end;
      .content {
        background-color: green;
      }
    }
    .received {
      justify-content: flex-start;
      .content {
        background-color: white;
        color: black;
      }
    }
  }
`;
const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #d22323e2;
  font-size: 1rem;
  color: white;
  border: none;
  border-radius: 0.3rem;
  cursor: pointer;
`;

//Color codes: light blue- #4ECCFF, dark blue- #19345F, white- #FEFFFE, black- #333333
