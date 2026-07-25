"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  budgetRange: "",
  message: "",
};

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverError, setServerError] = useState("");

  function validate() {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.budgetRange) newErrors.budgetRange = "Please select a budget range.";
    if (!form.message.trim()) newErrors.message = "Message is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setServerError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white shadow-md rounded-2xl p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Let's talk about your project
          </h1>
          <p className="text-gray-500 mb-6">
            Tell us a bit about what you need — we'll get back to you shortly.
          </p>

          {status === "success" ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
              Thanks! Your message has been received. We'll be in touch soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget range
                </label>
                <select
                  name="budgetRange"
                  value={form.budgetRange}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a range</option>
                  <option value="<$1k">Less than $1k</option>
                  <option value="$1k-$5k">$1k - $5k</option>
                  <option value="$5k-$10k">$5k - $10k</option>
                  <option value="$10k+">$10k+</option>
                </select>
                {errors.budgetRange && (
                  <p className="text-sm text-red-600 mt-1">{errors.budgetRange}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.message && (
                  <p className="text-sm text-red-600 mt-1">{errors.message}</p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-red-600">{serverError}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {status === "submitting" ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 py-4">
        Built for Digital Heroes Training Task —{" "}
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          digitalheroesco.com
        </a>
      </footer>
    </main>
  );
}