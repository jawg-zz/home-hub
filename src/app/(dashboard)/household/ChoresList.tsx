"use client";

import { useState, useCallback, memo } from "react";
import { useToast } from "@/components/Toast";

type Chore = {
  id: string;
  title: string;
  assignedTo: string | null;
  completed: boolean;
};

function ChoreItem({
  chore,
  onToggle,
  onDelete,
  deleteLoading,
}: {
  chore: Chore;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  deleteLoading: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem",
        background: "#151515",
        borderRadius: "8px",
        opacity: chore.completed ? 0.5 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      <input
        type="checkbox"
        checked={chore.completed}
        onChange={() => onToggle(chore.id, chore.completed)}
        aria-label={`Mark ${chore.title} as ${chore.completed ? "incomplete" : "complete"}`}
        style={{ width: "18px", height: "18px", cursor: "pointer" }}
      />
      <span
        style={{
          flex: 1,
          textDecoration: chore.completed ? "line-through" : "none",
          color: chore.completed ? "#999" : "#e0e0e0",
          transition: "color 0.2s ease",
        }}
      >
        {chore.title}
      </span>
      {chore.assignedTo && (
        <span
          style={{
            background: "#222",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px",
            fontSize: "0.75rem",
            color: "#888",
          }}
        >
          {chore.assignedTo}
        </span>
      )}
      <button
        onClick={() => onDelete(chore.id)}
        aria-label={`Delete ${chore.title}`}
        disabled={deleteLoading}
        style={{
          background: "none",
          border: "none",
          color: "#999",
          cursor: deleteLoading ? "not-allowed" : "pointer",
          padding: "0.5rem",
          minWidth: "44px",
          minHeight: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: deleteLoading ? 0.5 : 1,
          outline: "none",
          transition: "color 0.2s ease, transform 0.1s ease",
        }}
        onMouseEnter={(e) => {
          if (!deleteLoading) {
            e.currentTarget.style.color = "#ff6b35";
            e.currentTarget.style.transform = "scale(1.1)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#999";
          e.currentTarget.style.transform = "scale(1)";
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 2px #00d4aa";
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        ✕
      </button>
    </div>
  );
}

const MemoizedChoreItem = memo(ChoreItem);

export default function ChoresList({
  chores: initialChores,
}: {
  chores: Chore[];
}) {
  const [chores, setChores] = useState(initialChores);
  const [newChore, setNewChore] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { showToast } = useToast();

  const addChore = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newChore.trim() || addLoading) return;

      setAddLoading(true);
      try {
        const res = await fetch("/api/chores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newChore }),
        });
        if (!res.ok) throw new Error("Failed to add chore");
        const chore = await res.json();
        setChores([chore, ...chores]);
        setNewChore("");
        showToast("Chore added successfully", "success");
      } catch (error) {
        console.error("Failed to add chore:", error);
        showToast("Failed to add chore", "error");
      } finally {
        setAddLoading(false);
      }
    },
    [newChore, addLoading, chores, showToast],
  );

  const toggleChore = useCallback(
    async (id: string, completed: boolean) => {
      const previousChores = [...chores];
      setChores(
        chores.map((c) => (c.id === id ? { ...c, completed: !completed } : c)),
      );

      try {
        const res = await fetch(`/api/chores/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !completed }),
        });
        if (!res.ok) throw new Error("Failed to toggle chore");
        showToast(
          !completed ? "Chore completed" : "Chore marked incomplete",
          "success",
        );
      } catch (error) {
        setChores(previousChores);
        console.error("Failed to toggle chore:", error);
        showToast("Failed to update chore", "error");
      }
    },
    [chores, showToast],
  );

  const deleteChore = useCallback(
    async (id: string) => {
      const choreToDelete = chores.find((c) => c.id === id);
      if (!choreToDelete) return;

      const previousChores = [...chores];
      setDeleteLoading(id);
      setChores(chores.filter((c) => c.id !== id));

      try {
        const res = await fetch(`/api/chores/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete chore");

        showToast("Chore deleted", "success", {
          label: "Undo",
          onClick: async () => {
            setChores(previousChores);
            try {
              await fetch("/api/chores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: choreToDelete.title,
                  assignedTo: choreToDelete.assignedTo,
                }),
              });
            } catch {
              showToast("Failed to restore chore", "error");
            }
          },
        });
      } catch (error) {
        setChores(previousChores);
        console.error("Failed to delete chore:", error);
        showToast("Failed to delete chore", "error");
      } finally {
        setDeleteLoading(null);
      }
    },
    [chores, showToast],
  );

  return (
    <div>
      <form
        onSubmit={addChore}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
      >
        <label
          htmlFor="chore-input"
          style={{ position: "absolute", left: "-9999px" }}
        >
          Add new chore
        </label>
        <input
          id="chore-input"
          type="text"
          value={newChore}
          onChange={(e) => setNewChore(e.target.value)}
          placeholder="Add chore..."
          disabled={addLoading}
          aria-invalid={false}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={addLoading}
          aria-busy={addLoading}
        >
          {addLoading ? "Loading..." : "Add"}
        </button>
      </form>

      <div
        style={{
          display: "grid",
          gap: "0.5rem",
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        {chores.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
              color: "#999",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>
              No chores yet
            </p>
            <p style={{ fontSize: "0.875rem" }}>
              Add your first chore to get started
            </p>
          </div>
        ) : (
          chores.map((chore) => (
            <MemoizedChoreItem
              key={chore.id}
              chore={chore}
              onToggle={toggleChore}
              onDelete={deleteChore}
              deleteLoading={deleteLoading === chore.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
