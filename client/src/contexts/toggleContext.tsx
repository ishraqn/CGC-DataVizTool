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
	updateFileErrors: (fileID: string, errors: string []) => void;
	clearFileErrors: (fileID: string) => void;
	userCorrections: string [];
	setCorrections: (userCorrections: string []) => void;
	clearFileCorrections: (fileId: string) => void;
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
	updateFileErrors: () => {},
	clearFileErrors: () => {},
	userCorrections: [],
	setCorrections: () => {},
	clearFileCorrections: () => {},
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

	const [userCorrections, setCorrections] = useState(defaultState.userCorrections);

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

	const updateFileErrors = (fileId: string, errors: string[]) => {
		setFileErrors((prevErrors) => {
			const updatedErrors = { ...prevErrors, [fileId]: errors };
			localStorage.setItem('fileErrors', JSON.stringify(updatedErrors)); // Store updated errors in local storage
			return updatedErrors;
		});
	};
	
	const clearFileErrors = (fileId: string) => {
		setFileErrors((prevErrors) => {
			const updatedErrors = { ...prevErrors };
			delete updatedErrors[fileId];
			localStorage.setItem('fileErrors', JSON.stringify(updatedErrors)); // Update local storage after clearing errors
			return updatedErrors;
		});
	};

	// Initialize fileErrors from local storage, or fallback to default if not found
    const [fileErrors, setFileErrors] = useState<FileErrors>(() => {
        const storedErrors = localStorage.getItem('fileErrors');
        return storedErrors ? JSON.parse(storedErrors) : defaultState.fileErrors;
    });

	const clearFileCorrections = (fileId) => {
		// Implementation depends on how corrections are stored
		// Example: if corrections are stored in a state object with file IDs as keys
		setCorrections(prevCorrections => {
			const updatedCorrections = { ...prevCorrections };
			delete updatedCorrections[fileId]; // Remove corrections for the given file ID
			return updatedCorrections;
		});
	};
	// const [errorFileID, setErrorFileID] = use 


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
				clearFileErrors,
				updateFileErrors,
				userCorrections,
				setCorrections,
				clearFileCorrections,
			}}
		>
			{children}
		</ToggleContext.Provider>
	);
};
