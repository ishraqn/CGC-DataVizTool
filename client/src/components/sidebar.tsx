import React, {useState, useEffect} from "react";
import { FaTimes, FaRegSave, FaAngleRight, FaAngleDown } from "react-icons/fa";
import "./sidebar.css";
import { useToggle } from "../contexts/useToggle";
import ColorPickerComponent from "./ColorPickerComponent";
import ConfirmationDialog from "./ConfirmationDialog";
import ErrorDropdown from "./displayErrors";

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
    { id: "3", name: "Select File" },
	{ id: "1", name: "Map Colors" },
	{ id: "4", name: "Select Crop Region" },
	{ id: "7", name: "Toggle Legend" },
	{ id: "6", name: "Toggle Tile Layer" },
	{ id: "5", name: "Download Map" },
	{ id: "8", name: "Show Errors"}
];

const caruidToProvinceMap: Record<number, string> = {
	10: "Newfoundland and Labrador",
	11: "Prince Edward Island",
	12: "Nova Scotia",
	13: "New Brunswick",
	24: "Quebec",
	35: "Ontario",
	46: "Manitoba",
	47: "Saskatchewan",
	48: "Alberta",
	59: "British Columbia",
	60: "Yukon",
	61: "Northwest Territories",
	62: "Nunavut",
};

const Sidebar: React.FC<SidebarProps> = ({handleDownload, geoJsonData}) => {

    const {
        isTileLayerVisible,
        setIsTileLayerVisible,
        uploadedFiles,
        setCurrentFileIndex,
		primaryColorPicker,
        setPrimaryColorPicker,
		secondaryColorPicker,
        setSecondaryColorPicker,
		autoColourRange,
		setAutoColourRange,
        currentFileIndex,
		featureVisibility,
        toggleFeatureVisibility,
        setFeatureVisibility,
		provinceVisibility,
		toggleProvinceVisibility,
		setProvinceVisibility,	
		removeUploadedFile,
		toggleTileLayer,
		setToggleTileLayer,
		handleChangeTitle,
		currentFileTitle,
		toggleLegendVisibility,
		setLegendVisibility,
		setTitlesById,
		fileErrors,
		updateFileErrors,
    } = useToggle();

    const [showFileList, setShowFileList] = useState(false);
	const [showFeatureVisibility, setShowFeatureVisibility] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [fileToDeleteIndex, setFileToDeleteIndex] = useState<number | null>(null);
	const [titleInputValue, setTitleInputValue] = useState("");
	const [showMapColorToggle, setShowMapColorToggle] = useState(false);
	const [showErrorTable, setErrorTable] = useState(false);

    const handleCardClick = (id: string) => {
		switch (id) {
			case "1":
				setShowMapColorToggle(prev => !prev);
				break;
			case "2":
				setIsTileLayerVisible(!isTileLayerVisible);
				break;
			case "3":
				setShowFileList(prev => !prev);
				break;
			case "4":
				setShowFeatureVisibility(!showFeatureVisibility);
				break;
			case "5":
				handleDownload();
				break;
			case "6":
				setToggleTileLayer(!toggleTileLayer);
        		break;
			case "7":
				setLegendVisibility(!toggleLegendVisibility);
				break;
			case "8":
				setErrorTable(!showErrorTable);
				break;
			default:
				break;
		}
    };

	const renderProvinceToggles = () => {
		if (!geoJsonData || !geoJsonData.features) return null;
	
		const sortedFeatures = geoJsonData.features.sort((curr: { properties: { CARUID: string; }; }, prev: { properties: { CARUID: string; }; }) => {
			const currKey = curr.properties?.CARUID || "";
			const prevKey = prev.properties?.CARUID || "";
			if (!currKey || !prevKey) return 0;
			return currKey.localeCompare(prevKey);
		});
	
		return Object.keys(caruidToProvinceMap).map((provinceKey) => {
			const provinceName = caruidToProvinceMap[provinceKey];
			const provinceFeatures = sortedFeatures.filter((feature: { properties: { CARUID: number; }; }) => Math.floor(feature.properties?.CARUID / 100) === parseInt(provinceKey));
			const allFeaturesVisible = provinceFeatures.every((feature: { properties: { CARUID: string | number; }; }) => featureVisibility[feature.properties?.CARUID]);
			if (provinceVisibility[provinceKey]) {
				return (
				  <div key={provinceKey} className="file-item-checkbox">
					<FaAngleDown
					  className="expand-carrot"
					  onClick={() => toggleProvinceVisibility(provinceKey)}
					/>
					<input
					  type="checkbox"
					  id={`province-visibility-${provinceKey}`}
					  checked={allFeaturesVisible}
					  onChange={() => handleProvinceToggle(provinceFeatures, !allFeaturesVisible)}
					/>
					<label htmlFor={`province-visibility-${provinceKey}`}>
					  {provinceName}
					</label>
					<ul>
					  {renderFeatureVisibilityToggles(provinceFeatures)}
					</ul>
				  </div>
				);
			  } else {
				return (
				<div key={provinceKey} className="file-item-checkbox">
					<FaAngleRight
					  className="expand-carrot"
					  onClick={() => toggleProvinceVisibility(provinceKey)}
					/>
					<input
					  type="checkbox"
					  id={`province-visibility-${provinceKey}`}
					  checked={allFeaturesVisible}
					  onChange={() => handleProvinceToggle(provinceFeatures, !allFeaturesVisible)}
					/>
					<label htmlFor={`province-visibility-${provinceKey}`}>
					  {provinceName}
					</label>
				  </div>
				  )
			  }
			});
	};
	
	const renderFeatureVisibilityToggles = (provinceFeatures: any[]) => {
		return provinceFeatures.map((feature, index) => {
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

	const handleProvinceToggle = (provinceFeatures: any[], visible: boolean) => {
		provinceFeatures.forEach(feature => {
			const key = feature.properties.CARUID;
			if(featureVisibility[key] != visible) {
				toggleFeatureVisibility(key);
			}
		});
	};

    const handleFileSelection = (index: number) => {
        setCurrentFileIndex(index);
		setTitleInputValue(uploadedFiles[currentFileIndex].title);
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

	useEffect(() => {
		if (uploadedFiles.length > 0){
			setShowFileList(true);
			setTitleInputValue(currentFileTitle);
		}
		if(uploadedFiles.length === 0){
			setShowFileList(false);
			setTitleInputValue("");
			setTitlesById({});
		}
	}, [currentFileTitle, setTitlesById, uploadedFiles.length]);

	const handleSelectAll = () => {
		Object.keys(featureVisibility).forEach((key) => {
			if(!featureVisibility[key]) {
				toggleFeatureVisibility(key);
			}
		});
	};

	const handleDeselectAll = () => {
		Object.keys(featureVisibility).forEach((key) => {
			if(featureVisibility[key]) {
				toggleFeatureVisibility(key);
			}
		});
	};

	const handleInversionSelect = () => {
		Object.keys(featureVisibility).forEach((key) => {
			toggleFeatureVisibility(key);
		});
	};

	const handleNewTitle = (title: string) => {
		handleChangeTitle(title);
		setTitleInputValue(title);
	};

	const handleNonzeroSelect = () => {
		geoJsonData.features.forEach((feature) => {
			const key = feature.properties.CARUID;
			if (feature.properties.totalSamples as number > 0) {
				if(!featureVisibility[key]) {
					toggleFeatureVisibility(key);
				}
			} else {
				if(featureVisibility[key]) {
					toggleFeatureVisibility(key);
				}
			}
		});
	};


	const handleToggleAllProvince = () => {
		if (provinceVisibility[10]){
			Object.keys(caruidToProvinceMap).map((provinceKey) => {
				if (provinceVisibility[provinceKey]){
					toggleProvinceVisibility(provinceKey);
				}
			});
		} else {
			Object.keys(caruidToProvinceMap).map((provinceKey) => {
				if (!provinceVisibility[provinceKey]){
					toggleProvinceVisibility(provinceKey);
				}
			});
		}
		
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

	const handleColorMethodSwitch = () => {
		setAutoColourRange(!autoColourRange);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		handleNewTitle(titleInputValue);
	}
	
    return (
		<div className="sidebar">
			<div className="sidebar-title">  Filters</div>
			<ul className={`sidebar-menu${showConfirmation ? "-dialog-open" : ""}`}>
				{mockFilterGroups.map((group) => (
					<li
						key={group.id}
						className={`menu-item ${
							group.id === "6" && isTileLayerVisible ? "active" : ""
						}`}
						onClick={() => handleCardClick(group.id)}
					>
						<div className="menu-item-checkbox">
							{group.id === "1" && showMapColorToggle ? (
								<>
									<>
										<label className="menu-item-label">
											{group.name}
										</label>
										<button
											className="color-range-toggle-button"
											onClick={(event) => {
												handleColorMethodSwitch();
												event.stopPropagation();
											}}
										>
											{!autoColourRange ? "Auto-Color Range":"Manual Color Range"}
										</button>
										<div className="color-picker-wrapper" onClick={(event) => event.stopPropagation()}>
											<ColorPickerComponent
												onColorChange={(colorResult) => setPrimaryColorPicker(colorResult.hex)}
												backgroundColor={primaryColorPicker}
											/>
											{!autoColourRange && (
												<ColorPickerComponent
													onColorChange={(colorResult) => setSecondaryColorPicker(colorResult.hex)}
													backgroundColor={secondaryColorPicker}
												/>
											)}
										</div>
									</>
								</>
							) : (
								<>
									<label htmlFor={`checkbox-${group.id}`} className="menu-item-label">
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
											index === currentFileIndex ? "file-selected" : ""
										}`}
									>
										<div className="file-item-checkbox"
											onClick={(event) => {
												handleFileSelection(index);
												event.stopPropagation();
											}}
										>
											<input
												type="checkbox"
												id={`file-checkbox-${index}`}
												checked={index === currentFileIndex}
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

						{group.id === "8" && showErrorTable && (
						<>
						<div className="file-dropdown" onClick={(event) => event.stopPropagation()}>
							<button 
								className="error-hide-button" 
								onClick={() => setErrorTable(false)} // Correct way to handle the event
							>
								X
							</button>
							<ErrorDropdown />
						</div>
						</>
						)}
									{group.id === "4" && showFeatureVisibility && (
						<div 
							className="file-dropdown"
							onClick={(event) => event.stopPropagation()}
						>
							<div className='selection-toggles'>
								<span onClick={handleSelectAll} className='selection-toggle'>Select All</span>
								<span onClick={handleDeselectAll} className='selection-toggle'>Deselect All</span>
								<span onClick={handleInversionSelect} className='selection-toggle'>Inversion Select</span>
								<span onClick={handleNonzeroSelect} className='selection-toggle'>Select Regions with Data</span>
								<span onClick={handleToggleAllProvince} className='selection-toggle'>Toggle province display</span>
							</div>
                                {renderProvinceToggles()}
						</div>
						)}
					</li>
				))}
				<form className="titleForm" onSubmit={handleSubmit}>
					<input
                        className="titleInput"
                        type="text"
                        placeholder="Map Title"
						value={titleInputValue}
                        onChange={(e) => setTitleInputValue(e.target.value)}
                    />
				<button type="submit" style={{ display: 'none' }} aria-hidden="true"></button>
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