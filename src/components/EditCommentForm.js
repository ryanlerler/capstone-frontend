import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { sanitizeInput } from "../utils/InputSanitizer";

export default function EditCommentForm({ comment, setComments }) {
  const [editMode, setEditMode] = useState(false);
  const [updatedComment, setUpdatedComment] = useState({});
  const { listingId } = useParams();

  const handleUpdateComment = async (commentId) => {
    const token = localStorage.getItem("token");

    const { data } = await axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}/comments/${commentId}`,
      {
        text: updatedComment.text,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setEditMode(false);
    setComments((prev) =>
      prev.map((prevComment) =>
        prevComment.id === commentId ? data : prevComment
      )
    );
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");

    await axios.delete(
      `${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}/comments/${commentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setEditMode(false);
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  return (
    <div>
      <Button onClick={() => setEditMode(!editMode)} className="special-button">
        {editMode ? <>Cancel</> : "Edit"}
      </Button>
      <br />
      {editMode && (
        <div>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              type="text"
              value={updatedComment.text || comment.text}
              onChange={({ target }) =>
                setUpdatedComment((prev) => ({
                  ...prev,
                  text: sanitizeInput(target.value),
                }))
              }
            />
          </Form.Group>

          <Button
            onClick={() => handleUpdateComment(comment.id)}
            className="special-button"
          >
            Update
          </Button>
          <Button
            onClick={() => handleDeleteComment(comment.id)}
            className="special-button"
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
