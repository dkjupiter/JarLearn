import { createContext, useContext, useState, useEffect } from "react";

const TeacherContext = createContext();

export const useTeacher = () => useContext(TeacherContext);

export const TeacherProvider = ({ children }) => {
  const [teacherId, setTeacherId] = useState(() => {
    return localStorage.getItem("teacherId");
  });

  useEffect(() => {
    if (teacherId) {
      localStorage.setItem("teacherId", teacherId);
    } else {
      localStorage.removeItem("teacherId");
    }
  }, [teacherId]);

  return (
    <TeacherContext.Provider value={{ teacherId, setTeacherId }}>
      {children}
    </TeacherContext.Provider>
  );
};