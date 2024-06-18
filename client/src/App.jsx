import { Canvas } from "@react-three/fiber";
import "./App.css";
import { SocketManager } from "./components/SocketManager";
import Experience from "./components/Experience";
import { useState } from "react";
import { Html } from "@react-three/drei";
import axios from "axios";
import OpenAI from "openai";

// const openai = new OpenAI({
//   // apiKey: "",
//   // dangerouslyAllowBrowser: true,
// });

function App() {
  const [inputText, setInputText] = useState("");
  const [dialogue, setDialogue] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  async function sendRequest(inputText) {
    setAnswer("Dies ist nur der Test");
    // const completion = await openai.chat.completions.create({
    //   messages: [{ role: "system", content: inputText }],
    //   model: "gpt-3.5-turbo",
    // });

    // console.log(completion.choices[0]);
  }

  const handleSendRequest = async () => {
    setAnswer("Dies ist nur der Test");
    try {
      const apiUrl = "https://api.openai.com/v1/engines/davinci/completions";
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myKey}`,
        // "OpenAI-Organization": projectID,
      };
      const requestData = {
        prompt: inputText,
        max_tokens: 150,
      };
      const response = await axios.post(apiUrl, requestData, { headers });
      console.log(response.data.choices[0].text.trim());
      setAnswer(response.data.choices[0].text.trim());
    } catch (error) {
      console.error("Error fetching data:", error);
      setAnswer("Error fetching response. Please try again later.");
    }
  };

  const sendMessage = () => {
    if (inputText.trim() !== "") {
      // Assume dialogue is an array of objects with 'speaker' and 'message'
      // const newDialogue = [
      //   ...dialogue,
      //   { speaker: "player", message: inputText },
      // ];
      // setDialogue(newDialogue);
      setQuestion(inputText);
      setInputText("");
      // Call function to send inputText to API and handle NPC response
      // handleSendRequest(inputText);
      sendRequest(inputText);
    }
  };
  return (
    <>
      <SocketManager />
      {/* <video src="/models/videos/test_video.mp4"></video> */}
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 30 }}>
        {/* <gridHelper args={[20, 20, 0xff0000, "teal"]} /> */}
        <color attach={"backkground"} args={["#ececec"]} />
        <Experience />
        {answer && (
          <Html key={"answer-ai"} position={[7, 3, 5]}>
            <div
              style={{
                background: "#fdbf4d",
                padding: "10px",
                borderRadius: "5px",
                boxShadow: "3px 3px 3px lightgrey",
                width: "400px",
                fontFamily: "Courier",
                color: "#013d3d",
              }}
            >
              <strong>{"AI"}: </strong>
              {answer}
            </div>
          </Html>
        )}
      </Canvas>
      <div
        style={{
          padding: "10px",
          borderTop: "1px solid #ccc",
          position: "fixed",
          bottom: "0px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {/* Input field and send button */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          style={{ marginRight: "10px" }}
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={() => setDialogue([])}>Clear</button>
      </div>
    </>
  );
}

export default App;
