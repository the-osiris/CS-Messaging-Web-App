import React from "react";
import styled from "styled-components";
import SupportPreview from "./SupportPreview";

export default function Card(props) {
  return (
    <Container>
      <div className="header">
        <h3>{props.title}</h3>
      </div>
      <div className="body">{props.children}</div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 40%;
  margin: 0.7rem 0.5rem;
  background-color: #fefffe;
  border-radius: 0.8rem;
  overflow: hidden;
  .header {
    /* display: flex; */
    max-height: 100px;
    width: 100%;
    background-color: #19345f;
    padding: 0.5rem;

    h3 {
      color: white;
      text-align: center;
    }
  }

  .body {
    /* max-width: 80%; */
    display: grid;
    grid-auto-flow: row;
    /* overflow: clip; */
    padding: 1rem;
    gap: 1rem;
    overflow-y: auto;
    &::-webkit-scrollbar {
      height: 0.5rem;
      &-thumb {
        background-color: white;
        width: 0.1rem;
        border-radius: 2rem;
      }
    }
  }
`;
//Color codes: light blue- #4ECCFF, dark blue- #19345F, white- #FEFFFE, black- #333333
