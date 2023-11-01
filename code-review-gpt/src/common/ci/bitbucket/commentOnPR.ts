
import { Bitbucket, Params, Schema } from 'bitbucket';

import { logger } from "../../utils/logger";
import { getBitbucketEnvVariables } from '../../../config';

/**
 * Publish a comment on the pull request. If the bot has already commented (i.e. a comment with the same sign off exists), update the comment instead of creating a new one.
 * The comment will be signed off with the provided sign off.
 * @param comment The body of the comment to publish.
 * @param signOff The sign off to use. This also serves as key to check if the bot has already commented and update the comment instead of posting a new one if necessary.
 * @returns
 */
export const commentOnPR = async (
  comment: string,
  signOff: string
): Promise<void> => {
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
    logger.info(`comment: ${comment}`);

    // Create a Bitbucket instance
    const bitbucket = new Bitbucket({
      auth: {
        token: bitbucketToken
      }
    });

    const pullRequestResponse = await bitbucket.pullrequests.get({
      pull_request_id: Number(bitbucketPullRequestId),
      repo_slug: bitbucketRepoSlug,
      workspace: bitbucketWorkspace
    });

    const pullRequestObject: Schema.Pullrequest = pullRequestResponse.data;

    logger.info(`pullRequestObject: ${pullRequestObject}`);

    const commentObject: Schema.PullrequestComment = {
      content: {
        raw: comment
      },
      type: ''
    };

    delete (commentObject as any).type;

    const commentCreateObject: Params.PullrequestsCreateComment = {
      _body: commentObject,
      pull_request_id: Number(bitbucketPullRequestId),
      repo_slug: bitbucketRepoSlug,
      workspace: bitbucketWorkspace
    }

    const response = await bitbucket.repositories.createPullRequestComment(commentCreateObject);

    logger.info(`response: ${response.data}`);
  } catch (error) {
    logger.error(`Failed to comment on PR: ${JSON.stringify(error)}`);
    throw error;
  }
//   try {
//     const githubToken = getToken();
//     const { payload, issue } = context;

//     if (!payload.pull_request) {
//       logger.warn("Not a pull request. Skipping commenting on PR...");

//       return;
//     }

//     const octokit = getOctokit(githubToken);
//     const { owner, repo, number: pull_number } = issue;

//     const { data: comments } = await octokit.rest.issues.listComments({
//       owner,
//       repo,
//       issue_number: pull_number,
//     });

//     const botComment = comments.find(
//       (comment) => comment.body?.includes(signOff)
//     );

//     const botCommentBody = `${comment}\n\n---\n\n${signOff}`;

//     if (botComment) {
//       await octokit.rest.issues.updateComment({
//         owner,
//         repo,
//         comment_id: botComment.id,
//         body: botCommentBody,
//       });
//     } else {
//       // If the bot has not commented yet, create a new comment
//       await octokit.rest.issues.createComment({
//         owner,
//         repo,
//         issue_number: pull_number,
//         body: botCommentBody,
//       });
//     }
//   } catch (error) {
//     logger.error(`Failed to comment on PR: ${JSON.stringify(error)}`);
//     throw error;
//   }
};