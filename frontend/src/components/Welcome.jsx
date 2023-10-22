import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SupportPreview from "./SupportPreview";
import Card from "./Card";
import axios from "axios";
import { getAllPendingRoutes, startChatRoute } from "./../utils/APIRoutes";
import { ToastContainer, toast } from "react-toastify";
import NotificationSound from "../assets/notification.mp3";

export default function Welcome({ currentUser, socket }) {
  const [highPriRequests, setHighPriRequests] = useState([]);
  const [longWaitRequests, setLongWaitRequests] = useState([]);
  const [otherRequests, setOtherRequests] = useState([]);

  useEffect(() => {
    async function getAllRequests() {
      const res = await axios.get(getAllPendingRoutes);
      const allRequests = res.data.requests;
      if (allRequests === undefined) return;
      setHighPriRequests(
        allRequests.filter((request) => {
          return request.priority === 1;
        })
      );
      const now = new Date();

      setLongWaitRequests(
        allRequests.filter((request) => {
          return now - new Date(request.createdAt) >= 300000;
        })
      );

      setOtherRequests(
        allRequests.filter((request) => {
          return (
            request.priority !== 1 && now - new Date(request.createdAt) < 300000
          );
        })
      );
    }
    if (currentUser) {
      getAllRequests();
    }
  }, []);

  useEffect(() => {
    if (socket.current) {
      const audio = new Audio(NotificationSound);
      socket.current.on("request-receive", (request) => {
        if (request.priority === 1) {
          const hpr = [...highPriRequests];
          hpr.push(request);
          setHighPriRequests(hpr);
        }
        if (new Date() - new Date(request.createdAt) >= 300000) {
          const lwr = [...longWaitRequests];
          lwr.push(request);
          setLongWaitRequests(lwr);
        } else {
          if (request.priority !== 1) {
            const otr = [...otherRequests];
            otr.push(request);
            setOtherRequests(otr);
          }
        }
        try {
          audio.play();
        } catch (err) {}
      });

      socket.current.on("remove-request", (reqid) => {
        let remIndex = -1;
        setHighPriRequests(
          highPriRequests.filter((request) => {
            return request._id !== reqid;
          })
        );
        setLongWaitRequests(
          longWaitRequests.filter((request) => {
            return request._id !== reqid;
          })
        );
        setOtherRequests(
          otherRequests.filter((request) => {
            return request._id !== reqid;
          })
        );
      });
    }
  }, [, highPriRequests, longWaitRequests, otherRequests]);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const onRequestClick = async (request) => {
    const { data } = await axios.post(`${startChatRoute}/${request._id}`, {
      agent: currentUser._id,
    });
    if (data.status === true) {
      if (socket.current) {
        socket.current.emit("chat-accepted", request._id);
      }
    } else {
      toast.error("Could not start chat.", toastOptions);
    }
  };

  return (
    <Container>
      <Card title={"Urgent (" + highPriRequests.length + ")"}>
        {highPriRequests.map((request) => {
          return (
            <SupportPreview
              user={request.user.name}
              message={request.messages[0].message}
              time={new Date(request.createdAt).toLocaleString("en-IN")}
              key={request._id}
              handleClick={() => {
                onRequestClick(request);
              }}
            />
          );
        })}
      </Card>
      <Card title={"Waiting from Long (" + longWaitRequests.length + ")"}>
        {longWaitRequests.map((request) => {
          return (
            <SupportPreview
              user={request.user.name}
              message={request.messages[0].message}
              time={new Date(request.createdAt).toLocaleString("en-IN")}
              key={request._id}
              handleClick={() => {
                onRequestClick(request);
              }}
            />
          );
        })}
      </Card>
      <Card title={"Others (" + otherRequests.length + ")"}>
        {otherRequests.map((request) => {
          return (
            <SupportPreview
              user={request.user.name}
              message={request.messages[0].message}
              time={new Date(request.createdAt).toLocaleString("en-IN")}
              key={request._id}
              handleClick={() => {
                onRequestClick(request);
              }}
            />
          );
        })}
      </Card>
      <ToastContainer />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  background-color: #4eccff;
  flex-direction: row;
  color: black;
  padding: 2rem;
  span {
    color: #4a0eff;
  }
`;

//Color codes: light blue- #4ECCFF, dark blue- #19345F, white- #FEFFFE, black- #333333
