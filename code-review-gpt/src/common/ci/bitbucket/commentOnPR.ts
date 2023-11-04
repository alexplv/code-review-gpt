
import { Bitbucket, Params, Schema } from 'bitbucket';

import { getBitbucketEnvVariables } from '../../../config';
import { logger } from "../../utils/logger";

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

    const formattedComment = `${comment}\n\n---\n\n${signOff}`;

		logger.info(`bitbucketToken: ${bitbucketToken}`);
    logger.info(`bitbucketWorkspace: ${bitbucketWorkspace}`);
    logger.info(`bitbucketRepoSlug: ${bitbucketRepoSlug}`);
    logger.info(`bitbucketPullRequestId: ${bitbucketPullRequestId}`);
    logger.info(`comment: ${formattedComment}`);

    // Create a Bitbucket instance
    const bitbucket = new Bitbucket({
      auth: {
        token: bitbucketToken
      }
    });

    const {data: commentsList} = await bitbucket.pullrequests.listComments({
      pull_request_id: Number(bitbucketPullRequestId),
      repo_slug: bitbucketRepoSlug,
      workspace: bitbucketWorkspace
    });

    let botComment: Schema.PullrequestComment | undefined;
    if (commentsList.values) {
      botComment = commentsList.values.find((comment) => {
        return comment.content?.raw && comment.content.raw.includes(signOff);
      });
    }

    console.log(commentsList.values);
    console.log(botComment);

    const commentObject: Schema.PullrequestComment = {
      content: {
        raw: formattedComment
      },
      type: ''
    };

    delete (commentObject as any).type;

    if (botComment && botComment.id) {
      logger.info(`Updating a comment on PR`);
      const response = await bitbucket.repositories.updatePullRequestComment({
        _body: commentObject,
        comment_id: botComment.id,
        pull_request_id: Number(bitbucketPullRequestId),
        repo_slug: bitbucketRepoSlug,
        workspace: bitbucketWorkspace
      });
      logger.info(`response: ${response.data}`);
    } else {
      logger.info(`Posting a new comment to PR `);
      const commentCreateObject: Params.PullrequestsCreateComment = {
        _body: commentObject,
        pull_request_id: Number(bitbucketPullRequestId),
        repo_slug: bitbucketRepoSlug,
        workspace: bitbucketWorkspace
      }
      const response = await bitbucket.repositories.createPullRequestComment(commentCreateObject);
      logger.info(`response: ${response.data}`);
    }
  } catch (error) {
    logger.error(`Failed to comment on PR: ${JSON.stringify(error)}`);
    throw error;
  }
};