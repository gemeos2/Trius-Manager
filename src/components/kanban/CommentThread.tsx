"use client";

import { useState, useTransition } from "react";
import { postComment } from "@/app/gestao/(dashboard)/kanban/[boardId]/actions";
import type { CommentDetail } from "@/lib/kanban/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

interface CommentThreadProps {
  boardId: string;
  cardId: string;
  comments: CommentDetail[];
  onChanged: () => void;
}

export function CommentThread({ boardId, cardId, comments, onChanged }: CommentThreadProps) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    const value = body.trim();
    if (!value) return;
    startTransition(async () => {
      await postComment(boardId, cardId, value);
      onChanged();
    });
    setBody("");
  }

  return (
    <div className="card-modal-section">
      <div className="card-modal-section-title">Comentários</div>

      {comments.map((comment) => (
        <div key={comment.id} className="comment-row">
          <div className="comment-meta">
            <span style={{ color: "var(--color-off-blue)" }}>{comment.authorName}</span>
            <time>{formatDateTime(comment.createdAt)}</time>
          </div>
          <div className="comment-body">{comment.body}</div>
        </div>
      ))}

      <div className="comment-form">
        <input
          className="ds-input"
          placeholder="Escreva um comentário…"
          value={body}
          disabled={pending}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
      </div>
    </div>
  );
}
