import { exec } from "child_process";
import { join } from "path";

// import { getGitHubEnvVariables, getGitLabEnvVariables } from "../../config";
// import { PlatformOptions } from "../types";

export const getChangedFilesNamesCommand = (
  isCi: string | undefined,
  sourcePath: string | undefined = './'
): string => {
  // if (isCi === PlatformOptions.GITHUB) {
  //   const { githubSha, baseSha } = getGitHubEnvVariables();

  // } else if (isCi === PlatformOptions.GITLAB) {
  //   return `git diff --name-only --diff-filter=AMRT ${baseSha} ${githubSha}`;
  //   const { gitlabSha, mergeRequestBaseSha } = getGitLabEnvVariables();

  //   return `git diff --name-only --diff-filter=AMRT ${mergeRequestBaseSha} ${gitlabSha}`;
  // }

  return `git -C ${sourcePath} diff --name-only --diff-filter=AMRT --cached`;
};

export const getChangedFilesNames = async (
  isCi: string | undefined,
  sourcePath: string | undefined = './'
): Promise<string[]> => {
  const commandString = getChangedFilesNamesCommand(isCi, sourcePath);

  return new Promise((resolve, reject) => {
    exec(commandString, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to execute command. Error: ${error.message}`));
      } else if (stderr) {
        reject(new Error(`Command execution error: ${stderr}`));
      } else {
        const files = stdout
          .split("\n")
          .filter((fileName) => fileName.trim() !== "")
          .map((fileName) => join(sourcePath, fileName.trim()));
        resolve(files);
      }
    });
  });
};
