import * as fs from 'fs';
import * as path from 'path';

export const findFiles = (dir: string, mask: RegExp): string[] => {
    const results: string[] = [];
    for (const file of fs.readdirSync(dir)) {
        const stats = fs.lstatSync(path.join(dir, file));
        if (stats.isDirectory()) {
            results.push(...findFiles(path.join(dir, file), mask));
        } else {
            if (mask.test(file)) {
                results.push(path.join(dir, file));
            }
        }
    }
    return results;
};

/**
 * Checks if the project containing the given file has been restored.
 * @param {string} filePath - The path to the file being edited.
 * @returns {boolean} - True if the project is restored, false otherwise.
 */
export const isProjectRestored = (filePath: string): boolean => {
    // Traverse up to find the nearest .csproj file
    let currentDir = path.dirname(filePath);
    while (currentDir && currentDir !== path.parse(currentDir).root) {
        const files = fs.readdirSync(currentDir);
        const csprojFile = files.find(file => file.endsWith('.csproj'));
        if (csprojFile) {
            // Check for the presence of *.csproj.nuget.g.props in the obj directory
            const objDir = path.join(currentDir, 'obj');
            if (fs.existsSync(objDir)) {
                const objFiles = fs.readdirSync(objDir);
                return objFiles.some(file => file.endsWith('.csproj.nuget.g.props'));
            }
            return false; // obj directory not found
        }
        currentDir = path.dirname(currentDir); // Move up a directory
    }
    return false; // No .csproj file found
}