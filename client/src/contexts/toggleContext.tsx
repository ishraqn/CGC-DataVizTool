    // ToggleContext.tsx
import React, { createContext, useState, useEffect } from "react";

interface UploadFileData {
	id              : any;
	name            : string;
	path            : string;
	size            : number;
	type            : string;
	lastModifiedDate: Date;
	cleanName: string;
}
type FetchUploadedFilesFunction = () => Promise<UploadFileData[]>;

type ToggleContextType = {
	isTileLayerVisible      : boolean;
	setIsTileLayerVisible   : (isVisible: boolean) => void;
	isUploadedFileVisible   : boolean;
	setIsUploadedFileVisible: (isVisible: boolean) => void;
	uploadedFile            : UploadFileData | null;
	setUploadedFile         : (file: UploadFileData | null) => void;
	mapColor                : string;
	setMapColor             : (color: string) => void;
	uploadedFiles           : UploadFileData[];
	setUploadedFiles        : (files: UploadFileData[]) => void;
	currentFileIndex        : number;
	setCurrentFileIndex     : (index: number) => void;
	fetchUploadedFiles      : FetchUploadedFilesFunction;
	removeUploadedFile: (index: number) => void;
};

const defaultState: ToggleContextType = {
	isTileLayerVisible      : false,
	setIsTileLayerVisible   : () => {},
	isUploadedFileVisible   : false,
	setIsUploadedFileVisible: () => {},
	uploadedFile            : null,
	setUploadedFile         : () => {},
	mapColor                : "white",
	setMapColor             : () => {},
	uploadedFiles           : [],
	setUploadedFiles        : () => {},
	currentFileIndex        : 0,
	setCurrentFileIndex     : () => {},
	fetchUploadedFiles      : async () => [],
	removeUploadedFile		: () => {},
};

export const ToggleContext = createContext<ToggleContextType>(defaultState);

export const ToggleProvider: React.FC = ({ children }) => {
	const [isTileLayerVisible, setIsTileLayerVisible] = useState(
		defaultState.isTileLayerVisible
	);
	const [isUploadedFileVisible, setIsUploadedFileVisible] = useState(
		defaultState.isUploadedFileVisible
	);
	const [uploadedFile, setUploadedFile]   = useState(defaultState.uploadedFile);
	const [mapColor, setMapColor]           = useState(defaultState.mapColor);
	const [uploadedFiles, setUploadedFiles] = useState(
		defaultState.uploadedFiles
	);
	const [currentFileIndex, setCurrentFileIndex] = useState(
		defaultState.currentFileIndex
	);

	const fetchUploadedFiles: FetchUploadedFilesFunction = async () => {
		return fetch("/api/v1/all-uploaded-files")
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((filesObject) => {
				if (typeof filesObject === "object" && filesObject !== null) {
					const filesArray = Object.keys(filesObject).map((key) => {
						const originalName = filesObject[key].name;
						let nameAfterUnderscore = "";
						if (originalName !== undefined) {
							const nameParts = originalName.split('_');
							nameAfterUnderscore = nameParts.length > 1 ? nameParts.slice(1).join('_') : originalName;
						}
						return {
							...filesObject[key],
							id: key,
							cleanName: nameAfterUnderscore,
						};
					});
					setUploadedFiles(filesArray);
					return filesArray;
				} else {
					throw new Error("Invalid response format");
				}
			})
			.catch((error) => {
				console.error("Failed to fetch uploaded files:", error);
				throw error;
			});
	};

	const removeUploadedFile = (index: number) => {
        const newFiles = [...uploadedFiles];
        newFiles.splice(index, 1);
        setUploadedFiles(newFiles);
    };

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
				mapColor,
				setMapColor,
				uploadedFiles,
				setUploadedFiles,
				currentFileIndex,
				setCurrentFileIndex,
				fetchUploadedFiles,
				removeUploadedFile,
			}}
		>
			{children}
		</ToggleContext.Provider>
	);
};
