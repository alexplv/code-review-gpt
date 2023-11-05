import { ReviewFile } from "../../types";
import { BitbucketClient } from '../../clients/bitbucketClient';

import { getBitbucketEnvVariables } from '../../../config';
import { logger } from "../../utils/logger";

export const getRemotePullRequestFiles = async (): Promise<ReviewFile[]> => {

	try {
		const {
			bitbucketToken,
			bitbucketWorkspace,
			bitbucketRepoSlug,
			bitbucketPullRequestId
		} = getBitbucketEnvVariables();

		logger.debug(`bitbucketToken: ${bitbucketToken}`);
		logger.debug(`bitbucketWorkspace: ${bitbucketWorkspace}`);
		logger.debug(`bitbucketRepoSlug: ${bitbucketRepoSlug}`);
		logger.debug(`bitbucketPullRequestId: ${bitbucketPullRequestId}`);

		const client = new BitbucketClient(
			bitbucketToken,
			bitbucketWorkspace,
			bitbucketRepoSlug,
			Number(bitbucketPullRequestId)
		);
		const files = client.fetchReviewFiles();

		return files
	} catch (error) {
		throw new Error(
			`Failed to get remote Pull Request files: ${error}`
		);
	}
};