"use client";
import axios from "axios";
import { useState } from "react";

export default function DataForm() {
  const [goalReachedPercent, setGoalReachedPercent] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.put("/api/habits/records/4", {
        goalReachedPercent: parseInt(goalReachedPercent),
        notes: notes || "",
        date: new Date(date),
      });

      // Reset form on success
      setGoalReachedPercent("");
      setNotes("");
      setDate("");
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <div className="mb-4">
        <label htmlFor="goal" className="block text-gray-700 mb-2">
          Goal Reached (%)
        </label>
        <input
          type="number"
          id="goal"
          value={goalReachedPercent}
          onChange={(e) => setGoalReachedPercent(e.target.value)}
          className="w-full p-2 border rounded-md text-black"
          required
          min="0"
          max="100"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="date" className="block text-gray-700 mb-2 ">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded-md text-black"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="notes" className="block text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border rounded-md h-32 text-black"
          placeholder="Optional notes..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
