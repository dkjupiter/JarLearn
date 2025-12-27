const BottomBar = ({ activeTab, setActiveTab }) => {
  const menus = [
    { key: "activity", label: "Activity", icon: "/icons/activity.png" },
    { key: "plan", label: "Activity Plan", icon: "/icons/plan.png" },
    { key: "report", label: "Report", icon: "/icons/report.png" },
    { key: "management", label: "Management", icon: "/icons/management.png" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-200 h-20 flex justify-around items-center z-50">
      {menus.map((menu) => (
        <button
          key={menu.key}
          onClick={() => setActiveTab(menu.key)}
          className="flex flex-col items-center gap-1"
        >
          <img
            src={menu.icon}
            alt={menu.label}
            className="w-6 h-6"
          />
          <span
            className={`text-xs ${
              activeTab === menu.key
                ? "font-semibold text-black"
                : "text-gray-600"
            }`}
          >
            {menu.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default BottomBar;
