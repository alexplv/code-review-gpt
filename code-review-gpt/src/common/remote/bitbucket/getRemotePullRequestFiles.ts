import { ReviewFile } from "../../types";
import { BitbucketClient } from '../../clients/bitbucketClient';

import { getBitbucketEnvVariables } from '../../../config';
import { logger } from "../../utils/logger";

export const getRemotePullRequestFiles = async (
  remotePullRequest: string
): Promise<ReviewFile[]> => {

	try {
		const {
			bitbucketToken,
			bitbucketWorkspace,
			bitbucketRepoSlug,
			bitbucketPullRequestId
		} = getBitbucketEnvVariables();

		logger.info(`bitbucketToken: ${bitbucketToken}`);
		logger.info(`bitbucketWorkspace: ${bitbucketWorkspace}`);
		logger.info(`bitbucketRepoSlug: ${bitbucketRepoSlug}`);
		logger.info(`bitbucketPullRequestId: ${bitbucketPullRequestId}`);

		const client = new BitbucketClient(
			bitbucketToken,
			bitbucketWorkspace,
			bitbucketRepoSlug,
			Number(bitbucketPullRequestId)
		);
		const files = client.fetchReviewFiles();

		logger.info(`diff: ${JSON.stringify(files)}`);

		return files
	} catch (error) {
		throw new Error(
			`Failed to get remote Pull Request files: ${error}`
		);
	}
};