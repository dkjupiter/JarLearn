import { createContext, useContext, useState } from "react";

const TeacherContext = createContext();

export const useTeacher = () => useContext(TeacherContext);

export const TeacherProvider = ({ children }) => {
  const [teacherId, setTeacherId] = useState(null);

  return (
    <TeacherContext.Provider value={{ teacherId, setTeacherId }}>
      {children}
    </TeacherContext.Provider>
  );
};
