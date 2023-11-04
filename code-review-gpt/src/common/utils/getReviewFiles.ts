import { PlatformOptions, ReviewFile } from "../types";
import { getRemotePullRequestFiles as getGithubRemotePullRequestFiles } from "../remote/github/getRemotePullRequestFiles";
import { getRemotePullRequestFiles as getBitbucketRemotePullRequestFiles } from "../remote/bitbucket/getRemotePullRequestFiles";

export const getReviewFiles = async (
  isCi: string | undefined,
  remotePullRequest: string | undefined,
  sourcePath: string | undefined
): Promise<ReviewFile[]> => {
  if (remotePullRequest !== undefined) {
    switch (isCi) {
      case PlatformOptions.GITHUB:
        return await getGithubRemotePullRequestFiles(remotePullRequest);
      case PlatformOptions.BITBUCKET:
        return await getBitbucketRemotePullRequestFiles(remotePullRequest);
      default:
        throw new Error(
          `Failed to get remote Pull Request files: this CI does not support remote Pull Request files`
        );
    }
  } else {
    const { getFilesWithChanges } = await import("../git/getFilesWithChanges");
    return await getFilesWithChanges(isCi, sourcePath);
  }
};
