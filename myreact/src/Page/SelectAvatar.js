import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";

function SelectAvatar() {
  const { joinCode, studentId } = useParams();
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

  // Fetch asset จาก server
  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await axios.get(`${API_URL}/api/avatars/options`);

        // const sortZeroFirst = (arr) => {
        //   if (!arr) return [];
        //   const zero = arr.find((a) => a.id === 0);
        //   const others = arr.filter((a) => a.id !== 0);
        //   return zero ? [zero, ...others] : others;
        // };
        const sortZeroFirst = (arr) => {
          if (!arr) return [];
          return arr.slice().sort((a, b) => (a.id === 0 ? -1 : b.id === 0 ? 1 : 0));
        };


        setAccessoryOptions(sortZeroFirst(res.data?.accessories));
        setMaskOptions(sortZeroFirst(res.data?.masks));
        setCostumeOptions(sortZeroFirst(res.data?.costumes));
        setBodyOptions(sortZeroFirst(res.data?.bodies));
      } catch (err) {
        console.error(err);
        setAccessoryOptions([]);
        setMaskOptions([]);
        setCostumeOptions([]);
        setBodyOptions([]);
      }
    }
    fetchAssets();
  }, [API_URL]);

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
    if (!item) item = { id: 0 };
    if (selectedCategory === "accessories") setSelectedAccessory(item);
    if (selectedCategory === "masks") setSelectedMask(item);
    if (selectedCategory === "costumes") setSelectedCostume(item);
    if (selectedCategory === "bodies") setSelectedBody(item);
  };


  const handleConfirm = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/avatars`, {
        studentNumber: studentId,
        joinCode,
        stageName: name.trim() || studentId,
        maskId: selectedMask.id,
        costumeId: selectedCostume.id,
        bodyId: selectedBody.id,
        accessoryId: selectedAccessory.id,
      });

      const avatarId = res.data.avatarId;

      const playerData = {
        id: studentId,
        joinCode,
        stageName: name.trim() || studentId,
        avatarId,
        avatar: {
          maskId: selectedMask.id,
          costumeId: selectedCostume.id,
          bodyId: selectedBody.id,
          accessoryId: selectedAccessory.id,
        },
      };


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

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-base mb-6">Do you want to change a stage name?</h1>

      {/* Input box */}
      <input
        type="text"
        placeholder={studentId}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="text-sm text-black w-[252px] h-[61px] px-4 py-2 placeholder-gray-700 bg-gray-300 border border-gray-500 rounded-md focus:ring-1 focus:ring-gray-700 outline-none mb-6"
      />

      {/* Avatar Preview */}
      <div className="relative w-[100px] h-[100px] rounded-full bg-gray-200 flex items-center justify-center text-4xl">
        {selectedBody.id !== 0 && (
          <img
            src={selectedBody.path}
            alt="bodies"
            className="absolute w-full bottom-0 object-contain"
          />
        )}
        {selectedMask.id !== 0 && (
          <img
            src={selectedMask.path}
            alt="masks"
            className="absolute w-full h-full object-cover rounded-full"
          />
        )}
        {selectedAccessory.id !== 0 && (
          <img
            src={selectedAccessory.path}
            alt="accessories"
            className="absolute w-1/2 top-0 left-1/4 object-contain"
          />
        )}
        {selectedCostume.id !== 0 && (
          <img
            src={selectedCostume.path}
            alt="costumes"
            className="absolute w-full bottom-0 object-contain"
          />
        )}
      </div>

      {/* Category Selectors */}
      <div className="flex gap-4 mt-6">
        {["bodies", "accessories", "masks", "costumes"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`w-[40px] h-[40px] rounded-full flex items-center justify-center text-lg cursor-pointer
              ${
                selectedCategory === cat
                  ? "bg-gray-400 border-2 border-blue-500"
                  : "bg-gray-200"
              }`}
          >
            {cat === "bodies" && "😀"}
            {cat === "accessories" && "🎩"}
            {cat === "masks" && "😷"}
            {cat === "costumes" && "👕"}
          </button>
        ))}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-3 gap-3 mt-6 border p-4 rounded-lg mb-4">
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
                  ? "border-2 border-blue-500"
                  : "bg-gray-300"
              }`}
          >
            <img
              src={item.path}
              alt="option"
              className={`w-full h-full object-cover rounded-full`}
            />
          </div>
        ))}
      </div>

      {/* Finish Button */}
      <button
        onClick={handleConfirm}
        className="text-base w-[196px] h-[46px] py-3 mb-3 bg-gray-300 text-black rounded-md hover:bg-gray-700 transition self-center"
      >
        I'am already!
      </button>
    </div>
  );
}

export default SelectAvatar;