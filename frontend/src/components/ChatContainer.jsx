import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { completeChatRoute, sendMessageRoute } from "../utils/APIRoutes";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import axios from "axios";
import { getAllMessageRoute } from "./../utils/APIRoutes";
import { v4 as uuidv4 } from "uuid";

export default function ChatContainer({ currentChat, currentUser, socket }) {
  const [chatStatus, setChatStatus] = useState("pending");
  const [messages, setMessages] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState(undefined);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    async function getMessages() {
      const res = await axios.post(getAllMessageRoute, {
        from: currentUser._id,
        id: currentChat._id,
      });
      setMessages(res.data);
    }
    if (currentChat && currentUser) {
      getMessages();
      setChatStatus(currentChat.status);
    }
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    const res = await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat.user._id,
      message: msg,
      id: currentChat._id,
    });
    socket.current.emit("send-msg", {
      id: currentChat._id,
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
      socket.current.on("chat-complete", () => {
        setChatStatus("complete");
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

  const markChatComplete = () => {
    axios.get(`${completeChatRoute}/${currentChat._id}`);
    setChatStatus("complete");
    if (socket.current) {
      socket.current.emit("chat-ended", currentChat._id);
    }
  };

  return (
    <>
      {currentChat && (
        <Container>
          <div className="chat-header">
            <div className="user-details">
              <div className="name">
                <h3>{currentChat.user.name}</h3>
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
            <Button
              onClick={markChatComplete}
              hidden={chatStatus !== "pending"}
            >
              End Chat
            </Button>
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
      border-radius: 1rem;
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
        background-color: #fefffe;
        color: black;
      }
    }
  }
`;
const Button = styled.button`
  padding: 0.4rem;
  background-color: red;
  color: white;
  border-radius: 0.3rem;
  border: none;
  cursor: pointer;
`;
//Color codes: light blue- #4ECCFF, dark blue- #19345F, white- #FEFFFE, black- #333333
