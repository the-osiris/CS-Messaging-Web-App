import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { allUsersRoute, host } from "../utils/APIRoutes";
import Contacts from "../components/Contacts";
import Welcome from "./../components/Welcome";
import ChatContainer from "./../components/ChatContainer";
import { io } from "socket.io-client";

function Chat() {
  const socket = useRef();

  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);

  const [currentUser, setCurrentUser] = useState(undefined);

  const [currentChat, setCurrentChat] = useState(undefined);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function checkUser() {
      if (!localStorage.getItem("support-chat-user")) {
        navigate("/login");
      } else {
        const user = await JSON.parse(
          localStorage.getItem("support-chat-user")
        );
        setCurrentUser(user);
        setIsLoaded(true);
      }
    }
    checkUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    async function getContacts() {
      if (currentUser) {
        const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        setContacts(data.data);
      }
    }
    getContacts();
  }, [currentUser]);

  const handleChatChange = (chat) => {
    if (socket.current && chat !== undefined) {
      socket.current.emit("chat-opened", chat._id);
    }
    setCurrentChat(chat);
  };

  return (
    <Container>
      <div className="container">
        {isLoaded && currentChat === undefined ? (
          <Welcome currentUser={currentUser} socket={socket} />
        ) : (
          <ChatContainer
            currentChat={currentChat}
            currentUser={currentUser}
            socket={socket}
          />
        )}

        <Contacts
          contacts={contacts}
          currentUser={currentUser}
          changeChat={handleChatChange}
          socket={socket}
        />
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #4eccff;
  .container {
    height: 100vh;
    width: 100vw;
    background-color: #8eabf47c;
    display: grid;
    grid-template-columns: 85% 15%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
//Color codes: light blue- #4ECCFF, dark blue- #19345F, white- #FEFFFE, black- #333333

export default Chat;
