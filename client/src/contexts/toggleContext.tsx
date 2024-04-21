import React, { createContext, useState, useEffect, useRef } from "react";
import isEqual from "lodash/isEqual";

interface UploadFileData {
	id: unknown;
	name: string;
	path: string;
	size: number;
	type: string;
	lastModifiedDate: Date;
	cleanName: string;
	title: string;
}

interface FileErrors {
	[fileId: string]: string[]; // Mapping from fileId to array of error messages
}

type ToggleContextType = {
	isTileLayerVisible: boolean;
	setIsTileLayerVisible: (isVisible: boolean) => void;
	isUploadedFileVisible: boolean;
	setIsUploadedFileVisible: (isVisible: boolean) => void;
	uploadedFile: UploadFileData | null;
	setUploadedFile: (file: UploadFileData | null) => void;
	primaryColorPicker: string;
	setPrimaryColorPicker: (color: string) => void;
	secondaryColorPicker: string;
	setSecondaryColorPicker: (color: string) => void;
	autoColourRange: boolean;
	setAutoColourRange: (isMonochrome: boolean) => void;
	uploadedFiles: UploadFileData[];
	setUploadedFiles: (files: UploadFileData[]) => void;
	currentFileIndex: number;
	setCurrentFileIndex: (index: number) => void;
	fetchUploadedFiles: () => void;
	featureVisibility: { [key: string]: boolean };
	toggleFeatureVisibility: (feature: string) => void;
	setFeatureVisibility: (visibility: { [key: string]: boolean }) => void;
	provinceVisibility: { [key: string]: boolean };
	toggleProvinceVisibility: (feature: string) => void;
	setProvinceVisibility: (visibility: { [key: string]: boolean }) => void;
	removeUploadedFile: (index: number) => void;
	handleChangeTitle: (title: string) => void;
	currentFileTitle: string;
	setCurrentFileTitle: (title: string) => void;
	featureColors: { [key: string]: string };
	setFeatureColors: (colors: { [key: string]: string }) => void;
	toggleTileLayer: boolean;
	setToggleTileLayer: (toggle: boolean) => void;
	toggleLegendVisibility: boolean;
	setLegendVisibility: (isVisible: boolean) => void;
	titlesById: { [key: string]: string };
	setTitlesById: (titles: { [key: string]: string }) => void;
	legendLabels: {lower: string; upper: string; color: unknown; }[];
	setLegendLabels: (labels: {lower: string; upper: string ; color: unknown; }[]) => void;
	handleSetLegendLabels: (labels: {lower: string; upper: string; color: unknown; }[]) => void;
	fileErrors: FileErrors; // Errors for each uploaded file
	setFileErrors: (fileErrors: FileErrors[]) => void;
	updateFileErrors: (fileID: string, errors: string []) => void;
};

const defaultState: ToggleContextType = {
	isTileLayerVisible: false,
	setIsTileLayerVisible: () => {},
	isUploadedFileVisible: false,
	setIsUploadedFileVisible: () => {},
	uploadedFile: null,
	setUploadedFile: () => {},
	primaryColorPicker: "#DDE6B3",
	setPrimaryColorPicker: () => {},
	secondaryColorPicker: "#DDE6B3",
	setSecondaryColorPicker: () => {},
	autoColourRange: true,
	setAutoColourRange: () => {},
	uploadedFiles: [],
	setUploadedFiles: () => {},
	currentFileIndex: 0,
	setCurrentFileIndex: () => {},
	fetchUploadedFiles: async () => [],
	removeUploadedFile: () => {},
	featureVisibility: {},
	toggleFeatureVisibility: () => {},
	setFeatureVisibility: () => {},
	handleChangeTitle: () => {},
	currentFileTitle: "",
	setCurrentFileTitle: () => {},
	featureColors: {},
	setFeatureColors: () => {},
	provinceVisibility: {},
	toggleProvinceVisibility: () => {},
	setProvinceVisibility: () => {},
	toggleTileLayer: false,
	setToggleTileLayer: () => {},
	toggleLegendVisibility: true,
	setLegendVisibility: () => {},
	titlesById: {},
	setTitlesById: () => {},
	legendLabels: [],
	setLegendLabels: () => {},
	handleSetLegendLabels: () => {},
	fileErrors: {},
	setFileErrors: () => {},
	updateFileErrors: () => {},
};

export const ToggleContext = createContext<ToggleContextType>(defaultState);

export const ToggleProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isTileLayerVisible, setIsTileLayerVisible] = useState(
		defaultState.isTileLayerVisible
	);
	const [isUploadedFileVisible, setIsUploadedFileVisible] = useState(
		defaultState.isUploadedFileVisible
	);
	const [uploadedFile, setUploadedFile] = useState(defaultState.uploadedFile);
	const [primaryColorPicker, setPrimaryColorPicker] = useState(
		defaultState.primaryColorPicker
	);
	const [secondaryColorPicker, setSecondaryColorPicker] = useState(
		defaultState.secondaryColorPicker
	);
	const [autoColourRange, setAutoColourRange] = useState(
		defaultState.autoColourRange
	);
	const [uploadedFiles, setUploadedFiles] = useState(
		defaultState.uploadedFiles
	);
	const [currentFileIndex, setCurrentFileIndex] = useState(
		defaultState.currentFileIndex
	);
	const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);

	const [toggleLegendVisibility, setLegendVisibility] = useState(
		defaultState.toggleLegendVisibility
	);

	const [featureColors, setFeatureColors] = useState<{
		[key: string]: string;
	}>(defaultState.featureColors);

	const [toggleTileLayer, setToggleTileLayer] = useState(
		defaultState.toggleTileLayer
	);

	const [featureVisibility, setFeatureVisibility] = useState<{
		[key: string]: boolean;
	}>(defaultState.featureVisibility);

	const [currentFileTitle, setCurrentFileTitle] = useState(
		uploadedFiles[currentFileIndex]?.title || ""
	);

	const [titlesById, setTitlesById] = useState<{ [key: string]: string }>({});

	const [legendLabels, setLegendLabels] = useState<{ lower: string; upper: string; color: unknown; }[]>([]);

	const currentLegendLabels = useRef<{ lower: string; upper: string; color: unknown; }[]>([]);


	const [fileErrors, setFileErrors] = useState<FileErrors>(() => {
        const storedErrors = localStorage.getItem('fileErrors');
        return storedErrors ? JSON.parse(storedErrors) : defaultState.fileErrors;
    });


	const handleSetLegendLabels = (labels: { lower: string; upper: string; color: unknown; }[]) => {
		if(!isEqual(labels, currentLegendLabels.current)){
			currentLegendLabels.current = labels;
			setLegendLabels(labels);
		}
	};

	const toggleFeatureVisibility = (key: string) => {
		setFeatureVisibility((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};
	const [provinceVisibility, setProvinceVisibility] = useState<{
		[key: string]: boolean;
	}>(defaultState.provinceVisibility);

	const toggleProvinceVisibility = (key: string) => {
		setProvinceVisibility((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const handleChangeTitle = (newTitle: string) => {
		if (currentFileIndex >= 0 && currentFileIndex < uploadedFiles.length) {
			const file = uploadedFiles[currentFileIndex];
			if (file && file.id !== undefined) {
				setTitlesById({ ...titlesById, [file.id.toString()]: newTitle });
				setCurrentFileTitle(newTitle);
			}
		}
	};

	const fetchUploadedFiles = async () => {
		try {
			const response = await fetch("/api/v1/all-uploaded-files");
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const filesObject = await response.json();
			const filesArray: UploadFileData[] = Object.keys(filesObject).map(
				(key) => {
					const customTitle = titlesById[key];
					return {
						...filesObject[key],
						id: key,
						cleanName: filesObject[key].name.includes("_")
							? filesObject[key].name.split("_").slice(1).join("_").split('.').slice(0,-1).join('.')
							: filesObject[key].name,
							title: customTitle !== undefined ? customTitle : "",
					};
				}
			);
			setUploadedFiles(filesArray);
		} catch (error) {
			console.error("Failed to fetch uploaded files:", error);
		}
	};

	const removeUploadedFile = async (index: number) => {
		const fileId = uploadedFiles[index]?.id;

		if (!fileId) {
			console.log("File ID not found at index:", index);
			return;
		}

		try {
			const response = await fetch(`/api/v1/remove/${fileId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			console.log("File removed:", await response.json());
			setRemovedFileIds((prevIds) => [...prevIds, fileId.toString()]);
			setUploadedFiles((currentFiles) =>
				currentFiles.filter((_, fileIndex) => fileIndex !== index)
			);	
			updateFileErrors(fileId.toString(), []);
		} catch (error) {
			console.error("Failed to remove file:", error);
		}
	};
	
	const updateFileErrors = (fileId: string, errors: string[]) => {
		setFileErrors((prevErrors) => {
			const updatedErrors = { ...prevErrors, [fileId]: errors };
			localStorage.setItem('fileErrors', JSON.stringify(updatedErrors)); // Store updated errors in local storage
			return updatedErrors;
		});
	};
	
	useEffect(() => {
		fetchUploadedFiles();
	}, []);

	useEffect(() => {
		if (currentFileIndex >= 0 && currentFileIndex < uploadedFiles.length) {
			const file = uploadedFiles[currentFileIndex];
			if (file && file.id) {
				const title =
					titlesById[file.id.toString()] !== undefined
						? titlesById[file.id.toString()]
						: "";
				setCurrentFileTitle(title);
			}
		}
	}, [currentFileIndex, uploadedFiles, titlesById]);

	return (
		<ToggleContext.Provider
			value={{
				isTileLayerVisible,
				setIsTileLayerVisible,
				isUploadedFileVisible,
				setIsUploadedFileVisible,
				uploadedFile,
				setUploadedFile,
				primaryColorPicker,
				setPrimaryColorPicker,
				secondaryColorPicker,
				setSecondaryColorPicker,
				autoColourRange,
				setAutoColourRange,
				uploadedFiles,
				setUploadedFiles,
				currentFileIndex,
				setCurrentFileIndex,
				fetchUploadedFiles,
				featureVisibility,
				toggleFeatureVisibility,
				setFeatureVisibility,
				provinceVisibility,
				toggleProvinceVisibility,
				setProvinceVisibility,
				removeUploadedFile,
				handleChangeTitle,
				currentFileTitle,
				setCurrentFileTitle,
				featureColors,
				setFeatureColors,
				toggleTileLayer,
				setToggleTileLayer,
				toggleLegendVisibility,
				setLegendVisibility,
				titlesById,
				setTitlesById,
				legendLabels,
				setLegendLabels,
				handleSetLegendLabels,
				fileErrors,
				setFileErrors,
				updateFileErrors,
			}}
		>
			{children}
		</ToggleContext.Provider>
	);
};
