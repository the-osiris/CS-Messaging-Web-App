import React from "react";
import styled from "styled-components";

export default function SupportPreview({ user, message, time, handleClick }) {
  return (
    <Container onClick={handleClick}>
      <div className="msg-sender">
        <h4>{user}</h4>
      </div>
      <div className="msg-preview">
        {message.length > 300 ? message.substring(0, 300) + "..." : message}
      </div>
      <div className="msg-datetime">{time}</div>
    </Container>
  );
}

const Container = styled.div`
  height: 16vh;
  width: 100%;
  border: 1px solid black;
  background-color: #fefffe;
  border-radius: 0.5rem;

  display: grid;
  grid-template-rows: 20% 60% 20%;
  cursor: pointer;

  .msg-sender {
    padding: 0.2rem;
    width: 100%;
    color: #121278;
  }

  .msg-preview {
    padding: 0.2rem;
    width: 100%;
    max-lines: 4;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.8rem;
  }

  .msg-datetime {
    padding: 0.3rem;
    font-size: 0.7rem;
    text-align: end;
  }
`;

//Color codes: light blue- #4ECCFF, dark blue- #19345F, white- #FEFFFE, black- #333333
