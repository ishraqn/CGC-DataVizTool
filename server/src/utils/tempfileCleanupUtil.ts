import { readdir, stat, unlink } from "fs";
import { resolve } from "path";

const tempDir = resolve(__dirname, "..", "data", "uploads", "temp");

// Cleanup function to delete files older than a certain age
const cleanupTempFiles = (maxFileAge: number, contInterval: number) => {
    const deleteFiles = () => {
        readdir(tempDir, (err, files) => {
            if (err) {
                console.error("Failed to list files for cleanup", err);
                return;
            }

            files.forEach((file) => {
                const filePath = resolve(tempDir, file);
                stat(filePath, (err, stats) => {
                    if (err) {
                        console.error(
                            `Failed to retrieve files stats for ${file}`,
                            err
                        );
                        return;
                    }

                    const currentTime = Date.now();
                    if (currentTime - stats.mtime.getTime() > maxFileAge) {
                        unlink(filePath, (err) => {
                            if (err) {
                                console.error(`Failed to delete ${file}`, err);
                                return;
                            }
                            console.log(`${file} was deleted successfully`);
                        });
                    }
                });
            });
        });
        setTimeout(deleteFiles, contInterval);
    };
    deleteFiles();
};

export default cleanupTempFiles;
