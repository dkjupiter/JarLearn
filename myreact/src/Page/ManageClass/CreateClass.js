import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import { useTeacher } from "../TeacherContext";
import { socket } from "../../socket";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

export default function CreateClass() {
  const navigate = useNavigate();
  const { teacherId } = useTeacher();

  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const [errors, setErrors] = useState({});

  const generateCode = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  const handleCodeChange = (value) => {
    setCode(value);

    if (!value) return setCodeError("");

    if (!/^[A-Za-z0-9]*$/.test(value))
      return setCodeError("Only English letters or numbers allowed");

    if (value.length !== 8)
      return setCodeError("Code must be exactly 8 characters");

    setCodeError("");
  };

  useEffect(() => {
    socket.on("create_class_result", (data) => {
      if (data.success) {
        toast.success("Class created successfully");
        navigate("/myclass");
      }
      else toast.error("Failed: " + data.message);
    });
    return () => socket.off("create_class_result");
  }, []);

  const handleCreate = () => {
    let newErrors = {};

    if (!name) newErrors.name = "Class name is required";
    if (!section) newErrors.section = "Section is required";
    if (!subject) newErrors.subject = "Subject is required";

    if (!code) {
      newErrors.code = "Code is required";
    } else if (!/^[A-Za-z0-9]{8}$/.test(code)) {
      newErrors.code = "Code must be exactly 8 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    socket.emit("create_class", { name, section, subject, code, teacherId });
  };

  return (
    <>
      {/* <Toaster position="top-right" /> */}
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Sidebar_account />

        <main className="flex flex-col items-center justify-center flex-1 p-6 pt-20">
          {/* Card */}
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">

            <h2 className="text-2xl font-bold text-center text-slate-100 mb-6">
              Create Class
            </h2>

            {/* Inputs */}
            <div className="space-y-4 text-slate-300">

              {/* Class Name */}
              <InputField
                label="Class name"
                value={name}
                onChange={(v) => {
                  setName(v);
                  setErrors((e) => ({ ...e, name: "" }));
                }}
                placeholder="Enter class name"
                error={errors.name}
              />

             

              {/* Section */}
              <InputField
                label="Section"
                value={section}
                onChange={(v) => {
                  setSection(v);
                  setErrors((e) => ({ ...e, section: "" }));
                }}
                placeholder="Enter section"
                error={errors.section}
              />

          

              {/* Subject */}
              <InputField
                label="Subject"
                value={subject}
                onChange={(v) => {
                  setSubject(v);
                  setErrors((e) => ({ ...e, subject: "" }));
                }}
                placeholder="Enter subject"
                error={errors.subject}
              />

           

              {/* Code */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Join Code
                </label>

                <div
                  className={`flex items-center rounded-lg bg-slate-900 border ${codeError ? "border-red-500" : "border-slate-700"
                    } focus-within:ring-2 focus-within:ring-cyan-400`}
                >
                  <input
                    value={code}
                    maxLength={8}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="8 characters"
                    className="flex-1 px-3 py-2 bg-transparent outline-none  text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const newCode = generateCode();
                      setCode(newCode);
                      setCodeError("");
                    }}
                    className="px-3 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Random
                  </button>
                </div>

                {codeError && (
                  <p className="text-red-500 text-xs mt-1">{codeError}</p>
                )}

                <p className="text-xs text-slate-500 mt-1">
                  {<>
                    Password requirements:<br />
                    • 8 characters<br />
                    May include <br />
                    • English letters (A–Z, a–z)<br />
                    • Numbers (0–9)
                  </>}
                </p>
              </div>

            </div>

            {/* Buttons */}
            <div className="mt-6 space-y-3">

              <button
                onClick={handleCreate}
                className="
                w-full py-3 rounded-xl
                bg-cyan-400 text-slate-900 font-semibold
                shadow-lg shadow-cyan-400/30
                hover:bg-cyan-300 hover:scale-[1.01]
                transition
              "
              >
                Create Class
              </button>

              <button
                onClick={() => navigate("/myclass")}
                className="
                w-full py-3 rounded-xl
                bg-slate-700 text-slate-100
                hover:bg-slate-600 transition
              "
              >
                Back
              </button>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}

/* ---------- Reusable Input ---------- */
function InputField({ label, value, onChange, placeholder, error }) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 rounded-lg
          bg-slate-900 border
          ${error ? "border-rose-500 focus:ring-rose-400" : "border-slate-700 focus:ring-cyan-400"}
          focus:ring-2 outline-none
        `}
      />

      {error && (
        <p className="text-rose-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}