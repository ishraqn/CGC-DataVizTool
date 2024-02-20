import React, {useState} from "react";
import "./sidebar.css";

type FilterGroup = {
    id: string;
    name: string;
};

// mock data
const mockFilterGroups: FilterGroup[] = [
    { id: "1", name: "Change Color" },
    { id: "2", name: "Toggle Layer" },
];

const Sidebar: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<{ [key: string]: boolean }>({});

    const handleCardClick = (id: string) => {
        setSelectedIds((prevSelectedIds) => ({
            ...prevSelectedIds,
            [id]: !prevSelectedIds[id],
        }));
    };

    return (
        <div className="sidebar">
            <ul className = "sidebar-menu">
                {mockFilterGroups.map((group) => (
                    <li 
                        key={group.id} 
                        className = {`menu-item ${
                        selectedIds[group.id] ? "active" : ""
                        }`}
                        onClick={() => handleCardClick(group.id)}
                    >
                        <div className="menu-item-checkbox">
                            <input 
                                type="checkbox" 
                                id={`checkbox-${group.id}`}
                                checked={!!selectedIds[group.id]} 
                                onChange={() => handleCardClick(group.id)}
                            />
                                <label 
                                    htmlFor={`checkbox-${group.id}`}
                                    className="menu-item-label"
                                >
                                    {group.name}
                            </label>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
