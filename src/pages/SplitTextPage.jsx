import React, { useState } from "react";

function splitByFixedLengthAndDot(inputString, m) {
  const result = [];
  let currentChunk = "";
  let charCount = 0;
  let globalIndex = 1;

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    currentChunk += char;

    if (/[a-zA-Z]/.test(char)) {
      charCount++;
    }

    if (charCount === m) {
      const lastDotIndex = currentChunk.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        result.push({
          text: currentChunk.slice(0, lastDotIndex + 1).trim(),
          index: globalIndex++,
        });
        currentChunk = currentChunk.slice(lastDotIndex + 1);
        charCount = currentChunk.replace(/[^a-zA-Z]/g, "").length;
      } else {
        result.push({ text: currentChunk.trim(), index: globalIndex++ });
        currentChunk = "";
        charCount = 0;
      }
    }
  }

  if (currentChunk.trim()) {
    result.push({ text: currentChunk.trim(), index: globalIndex++ });
  }

  return result;
}

const SplitTextPage = () => {
  const [inputText, setInputText] = useState("");
  const [splitText, setSplitText] = useState([]);
  const [copiedIndices, setCopiedIndices] = useState(new Set());

  const handleSplitText = () => {
    const result = splitByFixedLengthAndDot(inputText, 4850);
    setSplitText(result);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndices((prev) => new Set(prev).add(index)); // Đánh dấu mục đã sao chép
  };

  const handleDelete = (index) => {
    const updatedList = splitText.filter((_, i) => i !== index);
    setSplitText(updatedList);
    setCopiedIndices((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.delete(index); // Xóa trạng thái sao chép của mục đã xóa
      return updatedSet;
    });
  };

  return (
    <div style={{ padding: "0px" }}>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste your text here..."
        style={{
          width: "100%",
          height: "100px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          padding: "10px",
          color: "#333",
        }}
      />
      <button onClick={handleSplitText} style={{ marginBottom: "20px" }}>
        Split Text
      </button>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {splitText.map((item, index) => (
          <div
            key={item.index}
            style={{
              marginBottom: "20px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "10px",
            }}
          >
            <div
              style={{
                border: copiedIndices.has(index)
                  ? "2px solid #4caf50"
                  : "1px solid #ccc",
                padding: "10px",
                marginBottom: "20px",
                maxHeight: "200px",
                overflowY: "auto",
                color: "#333",
              }}
            >
              <p>
                <strong>{item.index - 1}.</strong> {item.text}
              </p>
            </div>
            <div>
              <button
                onClick={() => handleCopy(item.text, index)}
                style={{
                  marginRight: "10px",
                  backgroundColor: copiedIndices.has(index) ? "#4caf50" : "",
                  color: copiedIndices.has(index) ? "#fff" : "",
                }}
                disabled={copiedIndices.has(index)}
              >
                {copiedIndices.has(index) ? "Copied" : "Copy"}
              </button>
              <button onClick={() => handleDelete(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  // const [text, setText] = useState("");
  // const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // const handleConvert = async () => {
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:5000/tts",
  //       { text },
  //       { responseType: "blob" }
  //     );
  //     const url = URL.createObjectURL(response.data);
  //     setAudioUrl(url);
  //   } catch (error) {
  //     console.error("Error converting text:", error);
  //   }
  // };

  // return (
  //   <div>
  //     <textarea value={text} onChange={(e) => setText(e.target.value)} />
  //     <button onClick={handleConvert}>Convert to Speech</button>
  //     {audioUrl && <audio controls src={audioUrl} />}
  //   </div>
  // );
};

export default SplitTextPage;
