import React, { useState } from "react";
import axios from "axios";
import { gpttextComplete } from "../utils/APIRoutes";
import styled from "styled-components";
import Picker from "emoji-picker-react";
import { IoMdSend } from "react-icons/io";
import { TfiWrite } from "react-icons/tfi";
import { BsEmojiSmileFill } from "react-icons/bs";

export default function ChatAgentInput({ handleSendMsg, disabled }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [msg, setMsg] = useState("");
  // const [response, setResponse] = useState("");

  const handleEmojiPickerHideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (event, emoji) => {
    let message = msg;
    message += emoji.emoji;
    setMsg(message);
    handleEmojiPickerHideShow();
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.trim().length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  const handleGptChange = (e) => {
    e.preventDefault();
    axios
      .post(gpttextComplete, { prompt: msg })
      .then((res) => {
        console.log("GPT returned: ");
        console.log(res.data);
        setMsg(res.data.res);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Container>
      <div className="button-container" disabled={disabled}>
        <div className="emoji">
          <BsEmojiSmileFill onClick={handleEmojiPickerHideShow} />
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
      </div>
      <form className="input-container" onSubmit={(e) => sendChat(e)}>
        <input
          type="text"
          placeholder={
            disabled
              ? "Chat has been marked as complete"
              : "Type your message here"
          }
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          disabled={disabled}
        />

        <button className="gpt">
          <IoMdSend />
        </button>
      </form>
      <button className="gpt" onClick={handleGptChange}>
        <TfiWrite />
      </button>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 2% 94% 4%;
  align-items: center;
  background-color: #19345f;
  padding: 0 1rem;
  padding-bottom: 0.3rem;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0 1rem;
    grid-template-columns: 5% 95%;
  }
  @media screen and (min-width: 360px) and (max-width: 720px) {
    padding: 0 1rem;
    grid-template-columns: 10% 90%;
  }
  .button-container {
    display: flex;
    align-content: center;
    color: white;
    gap: 1rem;
    .emoji {
      position: relative;
      svg {
        font-size: 1.5rem;
        color: #ffff00c8;
      }
      .emoji-picker-react {
        position: absolute;
        top: -350px;
        background-color: #080420;
        box-shadow: 0 5px 10px #9a86f3;
        border-color: #9186f3;

        .emoji-scroll-wrapper::-webkit-scrollbar {
          background-color: #080420;
          width: 5px;
          &-thumb {
            background-color: #9186f3;
          }
        }

        .emoji-categories {
          button {
            filter: contrast(0);
          }
        }

        .emoji-search {
          background-color: transparent;
          border-color: #9186f3;
        }
        .emoji-group:before {
          background-color: #080420;
        }
      }
    }
  }
  button {
    /* font-size: 1rem; */
    /* border-radius: 1rem; */
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    svg {
      font-size: 2rem;
      color: white;
      transition: 0.1s;
    }
    svg:hover {
      font-size: 2.25rem;
      color: white;
    }
  }
  .input-container {
    width: 100%;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    background-color: #fefffe;
    input {
      width: 96%;
      height: 60%;
      background-color: transparent;
      color: black;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;
      &::selection {
        background-color: #9186f3;
      }
      &:focus {
        outline: none;
      }
    }
    button {
      padding: 0.3rem 1rem;
      border-radius: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: green;
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
`;
//Color codes: light blue- #4ECCFF, dark blue- #19345F, white- #FEFFFE, black- #333333
