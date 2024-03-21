import React, { createContext, useState, useEffect } from "react";

interface UploadFileData {
	id              : unknown;
	name            : string;
	path            : string;
	size            : number;
	type            : string;
	lastModifiedDate: Date;
	cleanName       : string;
    title           : string;
}

type ToggleContextType = {
	isTileLayerVisible      : boolean;
	setIsTileLayerVisible   : (isVisible: boolean) => void;
	isUploadedFileVisible   : boolean;
	setIsUploadedFileVisible: (isVisible: boolean) => void;
	uploadedFile            : UploadFileData | null;
	setUploadedFile         : (file: UploadFileData | null) => void;
	colorPickerColor        : string;
	setColorPickerColor     : (color: string) => void;
	uploadedFiles           : UploadFileData[];
	setUploadedFiles        : (files: UploadFileData[]) => void;
	currentFileIndex        : number;
	setCurrentFileIndex     : (index: number) => void;
	fetchUploadedFiles      : () => void;
	featureVisibility       : { [key: string]: boolean };
	toggleFeatureVisibility : (feature: string) => void;
	setFeatureVisibility    : (visibility: {[key: string]: boolean}) => void;
	removeUploadedFile		: (index: number) => void;
	handleChangeTitle		: (title: string) => void;
	currentFileTitle		: string;
	setCurrentFileTitle		: (title: string) => void;
};

const defaultState: ToggleContextType = {
	isTileLayerVisible      : false,
	setIsTileLayerVisible   : () => {},
	isUploadedFileVisible   : false,
	setIsUploadedFileVisible: () => {},
	uploadedFile            : null,
	setUploadedFile         : () => {},
	colorPickerColor        : "#98AFC7",
	setColorPickerColor     : () => {},
	uploadedFiles           : [],
	setUploadedFiles        : () => {},
	currentFileIndex        : 0,
	setCurrentFileIndex     : () => {},
	fetchUploadedFiles      : async () => [],
	removeUploadedFile		: () => {},
	featureVisibility       : {},
	toggleFeatureVisibility : () => {},
	setFeatureVisibility    : () => {},
	handleChangeTitle		: () => {},
	currentFileTitle		: "",
	setCurrentFileTitle		: () => {},
};

export const ToggleContext = createContext<ToggleContextType>(defaultState);

export const ToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isTileLayerVisible, setIsTileLayerVisible] = useState(
		defaultState.isTileLayerVisible
	);
	const [isUploadedFileVisible, setIsUploadedFileVisible] = useState(
		defaultState.isUploadedFileVisible
	);
	const [uploadedFile, setUploadedFile]   = useState(defaultState.uploadedFile);
	const [colorPickerColor, setColorPickerColor]           = useState(defaultState.colorPickerColor);
	const [uploadedFiles, setUploadedFiles] = useState(
		defaultState.uploadedFiles
	);
	const [currentFileIndex, setCurrentFileIndex] = useState(
		defaultState.currentFileIndex
	);
	const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
	const [featureVisibility, setFeatureVisibility] = useState<{
		[key: string]: boolean;
	}>(defaultState.featureVisibility);

	const [currentFileTitle, setCurrentFileTitle] = useState(
		uploadedFiles[currentFileIndex]?.title || ""
	);

	const toggleFeatureVisibility = (key: string) => {
		setFeatureVisibility((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const handleChangeTitle = async (newTitle: string) => {
		const fileId = uploadedFiles[currentFileIndex]?.id;
		try {
			const response = await fetch(`/api/v1/changeTitle/${fileId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({title: newTitle}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			setCurrentFileTitle(newTitle);
			uploadedFiles[currentFileIndex].title = newTitle;
			const data = await response.json();
			console.log(data);
		} catch (error) {
			console.error("Error updating title:", error);
		}
	}

	const fetchUploadedFiles = async () => {
		try {
			const response = await fetch("/api/v1/all-uploaded-files");
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const filesObject = await response.json();
			const filesArray: UploadFileData[] = Object.keys(filesObject).map(
				(key) => ({
					...filesObject[key],
					id: key,
					cleanName: filesObject[key].name.includes("_")
						? filesObject[key].name.split("_").slice(1).join("_")
						: filesObject[key].name,
				})
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
		} catch (error) {
			console.error("Failed to remove file:", error);
		}
	};

	useEffect(() => {
		fetchUploadedFiles();
	}, []);

	useEffect(() => {
		if (currentFileIndex >= 0 && currentFileIndex < uploadedFiles.length) {
			setCurrentFileTitle(uploadedFiles[currentFileIndex].title);
		}
	}, [currentFileIndex, uploadedFiles]);

	return (
		<ToggleContext.Provider
			value={{
				isTileLayerVisible,
				setIsTileLayerVisible,
				isUploadedFileVisible,
				setIsUploadedFileVisible,
				uploadedFile,
				setUploadedFile,
				colorPickerColor,
				setColorPickerColor,
				uploadedFiles,
				setUploadedFiles,
				currentFileIndex,
				setCurrentFileIndex,
				fetchUploadedFiles,
				featureVisibility,
				toggleFeatureVisibility,
				setFeatureVisibility,
				removeUploadedFile,
				handleChangeTitle,
				currentFileTitle,
				setCurrentFileTitle
			}}
		>
			{children}
		</ToggleContext.Provider>
	);
};