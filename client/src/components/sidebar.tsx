import React, {useState} from "react";
import "./sidebar.css";
import { useToggle } from "../contexts/useToggle";

type FilterGroup = {
    id: string;
    name: string;
};

// mock data
const mockFilterGroups: FilterGroup[] = [
    { id: "1", name: "Change BaseMap Color" },
    { id: "2", name: "Toggle Tile Layer" },
    { id: "3", name: "Select File" },
];

const Sidebar: React.FC = () => {
    // const [selectedIds, setSelectedIds] = useState<{ [key: string]: boolean }>({});

    const {
        isTileLayerVisible,
        setIsTileLayerVisible,
        uploadedFiles,
        setCurrentFileIndex,
        setIsUploadedFileVisible,
        baseMapColor,
        setBaseMapColor,
        currentFileIndex,
    } = useToggle();

    const [showFileList, setShowFileList] = useState(false);
    const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);

    const handleCardClick = (id: string) => {
		switch (id) {
			case "1":
				break;
			case "2":
				setIsTileLayerVisible(!isTileLayerVisible);
				break;
			case "3":
				setShowFileList(!showFileList);
				break;
			default:
				break;
		}
    };

    const handleFileSelection = (index: number) => {
        setCurrentFileIndex(index);
        setIsUploadedFileVisible(true);
        setSelectedFileIndex(index);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
    };

    return (
		<div className="sidebar">
			<ul className="sidebar-menu">
				{mockFilterGroups.map((group) => (
					<li
						key={group.id}
						className={`menu-item ${
							group.id === "2" && isTileLayerVisible ? "active" : ""
						}`}
						onClick={() => handleCardClick(group.id)}
					>
						<div className="menu-item-checkbox">
							{group.id === "1" ? (
								<input
									type="color"
									value={baseMapColor}
									onChange={(e) => setBaseMapColor(e.target.value)}
								/>
							) : (
								<>
									<input
										type="checkbox"
										id={`checkbox-${group.id}`}
										checked={group.id === "2" && isTileLayerVisible}
										onChange={handleCheckboxChange}
									/>
									<label
										htmlFor={`checkbox-${group.id}`}
										className="menu-item-label"
									>
										{group.name}
									</label>
								</>
							)}
						</div>
						{group.id === "3" && showFileList && (
							<ul className="file-dropdown">
								{uploadedFiles.map((file, index) => (
									<li
										key={index}
										className={`file-item ${
											index === selectedFileIndex ? "file-selected" : ""
										}`}
										onClick={() => handleFileSelection(index)}
									>
										<div className="file-item-checkbox">
											<input
												type="checkbox"
												id={`file-checkbox-${index}`}
												checked={index === currentFileIndex}
												readOnly // This makes the input not clickable, but it's controlled by the label click
											/>
											<label
												htmlFor={`file-checkbox-${index}`}
												className="file-item-label"
											>
												{file.name}
											</label>
										</div>
									</li>
								))}
							</ul>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export default Sidebar;
