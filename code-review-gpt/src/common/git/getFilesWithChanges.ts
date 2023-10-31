import { readFile } from "fs/promises";
import path from 'path';
import { exit } from "process";

import { getChangedFileLines } from "./getChangedFileLines";
import { getChangedFilesNames } from "./getChangedFilesNames";
import { ReviewFile } from "../types";
import { logger } from "../utils/logger";

export const getFilesWithChanges = async (
  isCi: string | undefined,
  sourcePath: string | undefined = './'
): Promise<ReviewFile[]> => {
  try {
    const fileNames = await getChangedFilesNames(isCi, sourcePath);

    if (fileNames.length === 0) {
      logger.warn(
        "No files with changes found, you might need to stage your changes."
      );
      exit(0);
    }

    const files = await Promise.all(
      fileNames.map(async (fileName) => {
        const fileContent = await readFile(fileName, "utf8");
        const changedLines = await getChangedFileLines(isCi, fileName, sourcePath);
        return { fileName, fileContent, changedLines };
      })
    );

    return files;
  } catch (error) {
    throw new Error(
      `Failed to get files with changes: ${error}`
    );
  }
};
