import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

export default function Unsubscribe() {
  const { token } = useParams();
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const [error, setError] = useState("");

  // A button (not an automatic request), so email scanners opening the link do not unsubscribe anyone
  const confirm = async () => {
    setStatus("sending");
    setError("");
    try {
      await api.post("/newsletter/unsubscribe", { token });
      setStatus("done");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("idle");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="rounded-xl border border-line bg-surface p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">
          {status === "done" ? "You are unsubscribed" : "Unsubscribe from updates?"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {status === "done"
            ? "You will no longer receive email updates from KitabAura."
            : "You will stop receiving email updates from KitabAura."}
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {status !== "done" && (
          <button
            onClick={confirm}
            disabled={status === "sending"}
            className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {status === "sending" ? "Working..." : "Yes, unsubscribe me"}
          </button>
        )}

        <p className="mt-6">
          <Link to="/" className="text-sm font-semibold text-primary underline">
            Back to KitabAura
          </Link>
        </p>
      </div>
    </div>
  );
}