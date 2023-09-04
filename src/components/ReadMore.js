import { useState } from "react";
import { Button } from "react-bootstrap";

export default function ReadMore({ text, maxLength }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div>
      <p>
        {expanded ? text : text.slice(0, maxLength)}
        {text.length > maxLength && !expanded && <span>...</span>}
      </p>
      {text.length > maxLength && (
        <Button onClick={toggleExpand}>
          {expanded ? "Read Less" : "Read More"}
        </Button>
      )}
    </div>
  );
}
