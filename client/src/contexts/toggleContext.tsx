import React, { createContext, useState, useEffect } from "react";

interface UploadFileData {
	id              : string;
	name            : string;
	path            : string;
	size            : number;
	type            : string;
	lastModifiedDate: Date;
	cleanName       : string;
}


interface FileErrors {
	[fileId: string]: string[]; // Mapping from fileId to array of error messages
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
	fileErrors: FileErrors; // Errors for each uploaded file
	setFileErrors: (errors: FileErrors[]) => void;
	handleRetryConversion: (filePath: string, fileID: string) => void;
	updateFileErrors: (fileID: string, errors: string []) => void;
	clearFileErrors: (fileID: string) => void;
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
	fileErrors: {},
	setFileErrors: () => {},
	handleRetryConversion: () => {},
	updateFileErrors: () => {},
	clearFileErrors: () => {},
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

	const toggleFeatureVisibility = (key: string) => {
		setFeatureVisibility((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

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

	const handleRetryConversion = async (filePath: string, fileId: string) => {
		try {
			const response = await fetch(`api/v1/retry-conversion`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify([filePath, fileId]), // Include filePath and fileId in the request body
			});
	
			if (response.ok) {
				console.log('Conversion retried successfully.');
				// Optionally reset or update any relevant state here, like clearing errors
				setFileErrors([]);
			} else {
				console.error('Failed to retry conversion');
				// It might be helpful to also log the response body for more detailed error messages
				const errorBody = await response.json();
				console.error('Error details:', errorBody);
			}
		} catch (error) {
			console.error('Error retrying conversion:', error);
		}
			// Method to update file errors
	};

	const updateFileErrors = (fileId: string, errors: string[]) => {
		setFileErrors((prevErrors) => ({
			...prevErrors,
			[fileId]: errors,
		}));
	};


	const clearFileErrors = (fileId: string) => {
		setFileErrors(prevErrors => {
			const updatedErrors = { ...prevErrors };
			delete updatedErrors[fileId];
			return updatedErrors;
		});
	};

	const [fileErrors, setFileErrors] = useState<FileErrors>({}); // Initialize as an empty objecty


	useEffect(() => {
		fetchUploadedFiles();
	}, []);

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
				fileErrors,
				setFileErrors,
				handleRetryConversion,
				clearFileErrors,
				updateFileErrors,
			}}
		>
			{children}
		</ToggleContext.Provider>
	);
};
