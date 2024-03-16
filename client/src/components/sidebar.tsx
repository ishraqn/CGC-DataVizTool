import React, {useState} from "react";
import "./sidebar.css";
import { useToggle } from "../contexts/useToggle";
import ColorPickerComponent from "./ColorPickerComponent";

type FilterGroup = {
    id: string;
    name: string;
};

interface SidebarProps {
	handleDownload: () => Promise<void>;
}

// mock data
const mockFilterGroups: FilterGroup[] = [
	{ id: "1", name: "Color Picker" },
    { id: "3", name: "Select File" },
	{ id: "4", name: "Download Map" },
];

const Sidebar: React.FC<SidebarProps> = ({handleDownload}) => {
    // const [selectedIds, setSelectedIds] = useState<{ [key: string]: boolean }>({});

    const {
        isTileLayerVisible,
        setIsTileLayerVisible,
        uploadedFiles,
        setCurrentFileIndex,
        setIsUploadedFileVisible,
        colorPickerColor,
        setColorPickerColor,
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
			case "4":
				handleDownload();
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
			<div className="sidebar-title">  Filters</div>
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
								<><label
									htmlFor={`checkbox-${group.id}`}
									className="menu-item-label"
								>
									{group.name}
								</label><ColorPickerComponent
										onColorChange={(colorResult) => setColorPickerColor(colorResult.hex)} /></>
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
										onClick={(event) => {
											handleFileSelection(index);
											event.stopPropagation();
										}}
									>
										<div className="file-item-checkbox">
											<input
												type="checkbox"
												id={`file-checkbox-${index}`}
												checked={index === currentFileIndex}
												onChange={handleCheckboxChange}
												readOnly // This makes the input not clickable, but it's controlled by the label click
											/>
											<label
												htmlFor={`file-checkbox-${index}`}
												className="file-item-label"
											>
												{file.cleanName}
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
