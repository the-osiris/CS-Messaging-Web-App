import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logout from "./Logout";
import axios from "axios";
import { singleUserRoute } from "../utils/APIRoutes";

export default function Contacts({
  contacts,
  currentUser,
  changeChat,
  socket,
}) {
  const [allContacts, setAllContacts] = useState(contacts);
  const [currentName, setCurrentName] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [filteredContacts, setFilteredContacts] = useState([]);

  useEffect(() => {
    if (currentUser) {
      setCurrentName(currentUser.name);
    }
  }, [currentUser]);

  useEffect(() => {
    setAllContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    setFilteredContacts(allContacts);
  }, [allContacts]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("chat-started", async (chatId) => {
        const { data } = await axios.get(`${singleUserRoute}/${chatId}`);
        if (data) {
          if (!allContacts.allChats.includes(data.chat)) {
            const prevContacts = [data.chat, ...allContacts.allChats];
            const newChats = { allChats: prevContacts };
            setFilteredContacts(newChats);
          }
          changeCurrentChat(0, data.chat);
        }
      });
    }
  }, [allContacts]);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  const filterChats = (keyword) => {
    let allChats = [...allContacts.allChats];
    if (keyword.trim() !== "") {
      allChats = allChats.filter((user) => {
        // console.log(user.user.name);
        return user.user.name.toLowerCase().includes(keyword.toLowerCase());
      });
    }
    const filtered = { allChats: allChats };

    setFilteredContacts(filtered);
  };

  return (
    <>
      {currentUser && (
        <Container>
          <div className="brand">
            <h3>Agent Portal</h3>
          </div>
          <div className="contacts">
            <div
              className="contact home"
              onClick={() => changeCurrentChat(-1, undefined)}
            >
              <div className="name">
                <h3>Home</h3>
              </div>
            </div>
            <hr />
            <div
              className="contact search"
              onClick={() => changeCurrentChat(-1, undefined)}
            >
              <div className="name">
                <input
                  type="text"
                  placeholder="Search chats"
                  onChange={(event) => {
                    filterChats(event.target.value);
                  }}
                />
              </div>
            </div>
            <hr />
            {filteredContacts.allChats &&
            filteredContacts.allChats.length > 0 ? (
              filteredContacts.allChats.map((contact, index) => {
                return (
                  <div
                    className={`contact ${
                      index === currentSelected ? "selected" : ""
                    }`}
                    key={index}
                    onClick={() => changeCurrentChat(index, contact)}
                  >
                    <div className="name">
                      <h3>{contact.user.name}</h3>
                    </div>
                  </div>
                );
              })
            ) : (
              <h3>No chats</h3>
            )}
          </div>
          <div className="current-user">
            <div className="name">
              <h3>{currentName}</h3>
            </div>
            <Logout currentUser={currentUser} socket={socket} />
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 5% 90% 5%;
  overflow: hidden;
  background-color: #19345f;
  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    gap: 1rem;
    h3 {
      color: white;
      text-transform: uppercase;
      text-align: center;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    h3 {
      color: #ffffff95;
      margin: auto;
    }

    hr {
      width: 100%;
      height: 0.1rem;
      color: grey;
      background-color: grey;
      border: none;
    }
    .contact {
      /* background-color: #ffffff39; */
      border-bottom: 0.5px solid #fefffe;
      min-height: 3rem;
      width: 90%;
      cursor: pointer;
      border-radius: 0.2rem;
      padding: 0.4rem;
      gap: 1rem;
      align-items: center;
      display: flex;
      transition: 0.2s ease-in-out;
      .name {
        /* background-color: #4eccff; */
        h3 {
          color: white;
        }
      }
      @media screen and (min-width: 720px) and (max-width: 1080px) {
        gap: 0.5rem;
        .name {
          h3 {
            font-size: 1rem;
            text-align: center;
          }
        }
      }
    }
    .selected {
      background-color: #333333;
    }
    .home {
      background-color: #4eccff;
      /* color: #19345f; */
      border-radius: 2rem;
      min-height: 3rem;
      justify-content: center;
      .name {
        h3 {
          font-size: 1rem;
          text-align: center;
          color: #19345f;
        }
      }
    }

    .search {
      width: 90%;
      border-radius: 2rem;
      min-height: 40px;
      display: flex;
      align-items: center;
      gap: 2rem;
      background-color: #ffffffe3;
      margin: 1rem 0rem;
      cursor: text;
      .name {
        width: 100%;
      }
      input {
        width: 95%;
        height: 60%;
        background-color: transparent;
        color: black;
        border: none;
        padding-left: 0.2rem;
        font-size: 1rem;
        &::selection {
          background-color: #9186f3;
        }
        &:focus {
          outline: none;
        }
      }
      button {
        padding: 0.3rem 1rem;
        border-radius: 3rem;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #9186f3;
        border: none;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          padding: 0.3rem 1rem;
          svg {
            font-size: 1rem;
          }
        }
        svg {
          font-size: 2rem;
          color: white;
        }
      }
    }
  }
  .current-user {
    border: 1px solid white;
    background-color: #19345f;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    padding: 0 0.5rem;
    .name {
      h3 {
        color: white;
        text-align: center;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .name {
        h3 {
          font-size: 1rem;
          text-align: center;
        }
      }
    }
  }
`;

//Color codes: light blue- #4ECCFF, dark blue- #19345F, white- #FEFFFE, black- #333333
