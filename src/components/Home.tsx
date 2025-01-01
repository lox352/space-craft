import React from "react";
import { useNavigate } from "react-router-dom";

const PreviousPatterns: React.FC<{ patterns: string[] }> = ({ patterns }) => {
  const navigate = useNavigate();

  return (
    <div style={{ marginTop: "40px" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>
        Previous Patterns
      </h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {patterns
          .map((storageKey) => storageKey.replace("pattern-", ""))
          .map((key) => (
            <li key={key} style={{ marginBottom: "10px" }}>
              <span style={{ marginRight: "10px" }}>
                Saved on{" "}
                {new Date(
                  parseInt(key.replace("pattern-", ""))
                ).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </span>
              <button
                style={{
                  backgroundColor: "#3f51b5",
                  color: "white",
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/pattern/${key}`)}
              >
                View Pattern
              </button>
              <button
                style={{
                  backgroundColor: "#3f51b5",
                  color: "white",
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
                onClick={() => navigate(`/render/${key}`)}
              >
                Visualise Hat
              </button>
              <button
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this pattern?"
                    )
                  ) {
                    localStorage.removeItem(`pattern-${key}`);
                    window.location.reload();
                  }
                }}
              >
                Delete
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleBegin = () => {
    navigate("/design");
  };

  const previousPatterns = Object.keys(localStorage).filter((key) =>
    key.startsWith("pattern-")
  );

  return (
    <div style={{ textAlign: "left", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
        Hats Which Look Like Earth
      </h1>
      <p style={{ fontSize: "1rem", marginBottom: "20px" }}>
        Knit a hat which looks like Earth. Begin by designing your hat, then
        render it, and finally generate the pattern.
      </p>
      <button
        style={{
          backgroundColor: "#3f51b5",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={handleBegin}
      >
        Begin
      </button>
      {previousPatterns.length > 0 && (
        <PreviousPatterns patterns={previousPatterns} />
      )}
    </div>
  );
};

export default Home;
