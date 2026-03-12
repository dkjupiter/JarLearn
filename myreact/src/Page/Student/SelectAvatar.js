import { useEffect, useState } from "react";
import { useLocation,useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../../socket";
import { Shirt, Scissors, Smile, Palette } from "lucide-react";

function SelectAvatar() {
  const { joinCode, studentId } = useParams();
  const location = useLocation();
  const { studentNumber } = location.state || {};


  
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const [accessoryOptions, setAccessoryOptions] = useState([]);
  const [maskOptions, setMaskOptions] = useState([]);
  const [costumeOptions, setCostumeOptions] = useState([]);
  const [bodyOptions, setBodyOptions] = useState([]);

  const [selectedAccessory, setSelectedAccessory] = useState({ id: 0 });
  const [selectedMask, setSelectedMask] = useState({ id: 0 });
  const [selectedCostume, setSelectedCostume] = useState({ id: 0 });
  const [selectedBody, setSelectedBody] = useState({ id: 0 });

  const [selectedCategory, setSelectedCategory] = useState("bodies"); // default เป็น bodies

  
  const API_URL = process.env.REACT_APP_SERVER_URL;

  console.log("API_URL =", API_URL);
  // Fetch asset จาก server
  // useEffect(() => {
  //   async function fetchAssets() {
  //     try {
  //       const res = await axios.get(`${API_URL}/avatars/options`);

  //       // const sortZeroFirst = (arr) => {
  //       //   if (!arr) return [];
  //       //   const zero = arr.find((a) => a.id === 0);
  //       //   const others = arr.filter((a) => a.id !== 0);
  //       //   return zero ? [zero, ...others] : others;
  //       // };
  //       const sortZeroFirst = (arr) => {
  //         if (!arr) return [];
  //         return arr.slice().sort((a, b) => (a.id === 0 ? -1 : b.id === 0 ? 1 : 0));
  //       };


  //       setAccessoryOptions(sortZeroFirst(res.data?.accessories));
  //       setMaskOptions(sortZeroFirst(res.data?.masks));
  //       setCostumeOptions(sortZeroFirst(res.data?.costumes));
  //       setBodyOptions(sortZeroFirst(res.data?.bodies));
  //     } catch (err) {
  //       console.error(err);
  //       setAccessoryOptions([]);
  //       setMaskOptions([]);
  //       setCostumeOptions([]);
  //       setBodyOptions([]);
  //     }
  //   }
  //   fetchAssets();
  // }, [API_URL]);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await axios.get(`${API_URL}/avatars/options`);

        const sortZeroFirst = (arr) => {
          if (!arr) return [];
          return arr.slice().sort((a, b) =>
            a.id === 0 ? -1 : b.id === 0 ? 1 : a.id - b.id
          );
        };

        const accessories = sortZeroFirst(res.data?.accessories);
        const masks = sortZeroFirst(res.data?.masks);
        const costumes = sortZeroFirst(res.data?.costumes);
        const bodies = sortZeroFirst(res.data?.bodies);

        setAccessoryOptions(accessories);
        setMaskOptions(masks);
        setCostumeOptions(costumes);
        setBodyOptions(bodies);

        // ✅ set default = id 0
        setSelectedAccessory(accessories.find(a => a.id === 0) || accessories[0]);
        setSelectedMask(masks.find(a => a.id === 0) || masks[0]);
        setSelectedCostume(costumes.find(a => a.id === 0) || costumes[0]);
        setSelectedBody(bodies.find(a => a.id === 0) || bodies[0]);

      } catch (err) {
        console.error(err);
      }
    }

    fetchAssets();
  }, [API_URL]);


  if (!studentId) {
    console.error("❌ studentId missing");
    return null;
  }

  const getOptions = () => {
    switch (selectedCategory) {
      case "accessories":
        return accessoryOptions;
      case "costumes":
        return costumeOptions;
      case "masks":
        return maskOptions;
      default:
        return bodyOptions;
    }
  };

  const handleSelect = (item) => {
    // if (!item) item = { id: 0 };
    if (selectedCategory === "accessories") setSelectedAccessory(item);
    if (selectedCategory === "masks") setSelectedMask(item);
    if (selectedCategory === "costumes") setSelectedCostume(item);
    if (selectedCategory === "bodies") setSelectedBody(item);
  };


  const handleConfirm = async () => {
    try {

      const displayName = name.trim() || String(studentNumber) || "Guest"

      console.log("POST BODY:", {
        studentId: Number(studentId),
        joinCode,
        studentNumber,
        stageName: displayName,
        maskId: selectedMask.id,
        costumeId: selectedCostume.id,
        bodyId: selectedBody.id,
        accessoryId: selectedAccessory.id,
      });


      const res = await axios.post(`${API_URL}/avatars`, {
        studentId: Number(studentId),            // 🔥 ต้องมี
        joinCode,
        studentNumber,   
        stageName: displayName,
        maskId: selectedMask.id,
        costumeId: selectedCostume.id,
        bodyId: selectedBody.id,
        accessoryId: selectedAccessory.id,
      });

      const avatarId = res.data.avatarId;

      const playerData = {
        studentId: Number(studentId),
        studentNumber,
        joinCode,
        stageName: displayName,
        avatarId,
        avatar: {
          maskId: selectedMask.id,
          costumeId: selectedCostume.id,
          bodyId: selectedBody.id,
          accessoryId: selectedAccessory.id,
        },
      };

      if (!studentId) {
        console.error("studentId missing");
        return;
      }

      localStorage.setItem("student_meta", JSON.stringify(playerData));

      socket.emit("update-player", {
        joinCode, 
        studentId: Number(studentId),
        stageName: displayName,
        avatar: {
          maskId: selectedMask.id,
          costumeId: selectedCostume.id,
          bodyId: selectedBody.id,
          accessoryId: selectedAccessory.id,
        }
      });

      socket.emit("join-room", {
        joinCode,
        player: {
          studentId: Number(studentId)
        },
        role: "student"
      });
      navigate(`/class/${joinCode}/lobby`, {
        state: {
          playerData,
          joinCode,
        },
      });

    } catch (err) {
      console.error(err);
    }
  };


  const categories = [
    { key: "bodies", icon: <Palette size={20} />, label: "Skin" },
    { key: "accessories", icon: <Scissors size={20} />, label: "Hair" },
    { key: "masks", icon: <Smile size={20} />, label: "Face" },
    { key: "costumes", icon: <Shirt size={20} />, label: "Costume" },
  ];


  
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-slate-900">

      <h1 className="text-base text-slate-100 mb-6">
        Do you want to change a stage name?
      </h1>

      {/* Name Input */}
      <input
        type="text"
        placeholder={studentNumber}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="text-sm text-slate-100 w-[252px] h-[61px] px-4 py-2 placeholder-slate-400 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-cyan-400 outline-none mb-6"
      />

      {/* Avatar Preview */}
      <div className="relative w-[200px] h-[200px] bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
        <img src={selectedBody?.path} className="absolute inset-0 w-full h-full object-contain" />
        <img src={selectedAccessory?.path} className="absolute inset-0 w-full h-full object-contain" />
        <img src={selectedCostume?.path} className="absolute inset-0 w-full h-full object-contain" />
        <img src={selectedMask?.path} className="absolute inset-0 w-full h-full object-contain" />
      </div>

      {/* Category */}
      <div className="flex gap-6 mt-6">
        {categories.map((cat) => (
          <div key={cat.key} className="flex flex-col items-center">
            <button
              onClick={() => setSelectedCategory(cat.key)}
              className={`w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all duration-200
                ${
                  selectedCategory === cat.key
                    ? "bg-cyan-400 text-slate-900 scale-110"
                    : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                }`}
            >
              {cat.icon}
            </button>

            <span className="text-xs mt-1 text-slate-400">
              {cat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Options */}
      <div className="grid grid-cols-3 gap-3 mt-6 border border-slate-700 p-4 rounded-lg mb-4 bg-slate-800">
        {getOptions().map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelect(item)}
            className={`w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer
              ${
                item.id !== 0 &&
                ((selectedCategory === "bodies" && selectedBody?.id === item.id) ||
                  (selectedCategory === "accessories" && selectedAccessory?.id === item.id) ||
                  (selectedCategory === "masks" && selectedMask?.id === item.id) ||
                  (selectedCategory === "costumes" && selectedCostume?.id === item.id))
                  ? "border-2 border-cyan-400 bg-slate-700"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
          >
            <img
              src={item.path}
              alt="option"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        ))}
      </div>

      {/* Confirm */}
      <button
        onClick={handleConfirm}
        className="text-base w-[196px] h-[46px] py-3 mb-3 bg-cyan-400 text-slate-900 rounded-md hover:bg-cyan-300 transition self-center"
      >
        I'm already!
      </button>

    </div>
  );
}

export default SelectAvatar;