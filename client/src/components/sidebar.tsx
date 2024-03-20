import React, {useState, useEffect} from "react";
import { FaTimes, FaRegSave } from "react-icons/fa";
import "./sidebar.css";
import { useToggle } from "../contexts/useToggle";
import ColorPickerComponent from "./ColorPickerComponent";
import ConfirmationDialog from "./ConfirmationDialog";

type FilterGroup = {
    id: string;
    name: string;
};

interface SidebarProps {
	handleDownload: () => Promise<void>;
	geoJsonData : unknown;
}

// mock data
const mockFilterGroups: FilterGroup[] = [
	{ id: "1", name: "Color Picker" },
    { id: "3", name: "Select File" },
	{ id: "4", name: "Select Crop Region" },
	{ id: "5", name: "Download Map" },
];

const Sidebar: React.FC<SidebarProps> = ({handleDownload, geoJsonData}) => {

    const {
        isTileLayerVisible,
        setIsTileLayerVisible,
        uploadedFiles,
        setCurrentFileIndex,
        setIsUploadedFileVisible,
        colorPickerColor,
        setColorPickerColor,
        currentFileIndex,
		featureVisibility,
        toggleFeatureVisibility,
        setFeatureVisibility,
		removeUploadedFile,
		handleChangeTitle,
    } = useToggle();

    const [showFileList, setShowFileList] = useState(false);
    const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
	const [showFeatureVisibility, setShowFeatureVisibility] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [fileToDeleteIndex, setFileToDeleteIndex] = useState<number | null>(null);
	const [titleInputValue, setTitleInputValue] = useState("");

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
				setShowFeatureVisibility(!showFeatureVisibility);
				break;
			case "5":
				handleDownload();
				break;
			default:
				break;
		}
    };

	const renderFeatureVisibilityToggles = () => {
        if (!geoJsonData || !geoJsonData.features) return null;

		const sortedFeatures = geoJsonData.features.sort((curr, prev) => {
            const currKey = curr.properties?.CARUID || "";
            const prevKey = prev.properties?.CARUID || "";
            if (!currKey || !prevKey) return 0;
            return currKey.localeCompare(prevKey);
        });

        return sortedFeatures.map((feature, index) => {
            const key = feature.properties?.CARUID;
            if (!key) return null;

            return (
                <li key={`feature-${index}`}>
                    <div className="file-item-checkbox">
                        <input
                            type="checkbox"
                            id={`feature-visibility-${key}`}
                            checked={featureVisibility[key] ?? false}
                            onChange={() => toggleFeatureVisibility(key)}
                        />
                        <label htmlFor={`feature-visibility-${key}`}>
                            {`${key}`}
                        </label>
                    </div>
                </li>
            );
        });
	};

    const handleFileSelection = (index: number) => {
        setCurrentFileIndex(index);
        setIsUploadedFileVisible(true);
        setSelectedFileIndex(index);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
    };

	useEffect(() => {
        if (geoJsonData && "features" in geoJsonData) {
            const intialVisibility = {};
            geoJsonData.features.forEach((feature) => {
                if (feature.properties && feature.properties.CARUID) {
                    const key = feature.properties.CARUID;
                    intialVisibility[key] = true;
                }
            });
            setFeatureVisibility(intialVisibility);
        }
    }, [geoJsonData, setFeatureVisibility]);

	const handleNewTitle = (title: string) => {
		console.log(title);
		handleChangeTitle(title);
	};

	const handleRemoveFile = (index: number) => {
		setFileToDeleteIndex(index);
        setShowConfirmation(true);
	};

	const handleDeleteConfirmed = () => {
		if (fileToDeleteIndex !== null) {
			removeUploadedFile(fileToDeleteIndex);
			setShowConfirmation(false);
		}
	};

	const handleCancelDelete = () => {
		setFileToDeleteIndex(null);
		setShowConfirmation(false);
	};
	
    return (
		<div className="sidebar">
			<div className="sidebar-title">  Filters</div>
			<ul className={`sidebar-menu${showConfirmation ? "-dialog-open" : ""}`}>
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
											<FaTimes
											className="remove-icon"
											onClick={() => handleRemoveFile(index)}
											/>
										</div>
									</li>
								))}
							</ul>
						)}
					{group.id === "4" && showFeatureVisibility && (
                            <ul
                                className="file-dropdown"
                                onClick={(event) => event.stopPropagation()}
                            >
                                {renderFeatureVisibilityToggles()}
							</ul>
						)}
					</li>
				))}
				<form className="titleForm">
					<input
                        className="titleInput"
                        type="text"
                        placeholder="Map Title"
                        value={titleInputValue}
                        onChange={(e) => setTitleInputValue(e.target.value)}
                    />
					<FaRegSave
					className="save-icon"
					onClick={() => handleNewTitle(titleInputValue)}
					/>
				</form>
			</ul>
			{showConfirmation && (
                <ConfirmationDialog
                    message="Are you sure you want to delete this file?"
                    onConfirm={handleDeleteConfirmed}
                    onCancel={handleCancelDelete}
                />
            )}
		</div>
	);
};

export default Sidebar;
