import { Bitbucket, Params, Schema, APIClient } from 'bitbucket';
import { ReviewFile } from '../types';
import { DiffStat } from './types';
import { isEligibleForReview } from '../remote/github/isEligibleForReview';
import { logger } from '../utils/logger';

export class BitbucketClient {
	private client: APIClient;
	private token: string;
  	private workspace: string;
  	private repoSlug: string;
  	private pullRequestId: number;

	constructor(token: string, workspace: string, repoSlug: string, pullRequestId: number) {
		this.token = token;
		this.workspace = workspace;
		this.repoSlug = repoSlug;
		this.pullRequestId = pullRequestId;
		this.client = Bitbucket({
			auth: {
				token: token
			}
		});
	}

	public async fetchReviewFiles(): Promise<ReviewFile[]> {
		const { data: fullDiff } = await this.client.pullrequests.getDiff({
			pull_request_id: this.pullRequestId,
			repo_slug: this.repoSlug,
			workspace: this.workspace
		});

		if (typeof fullDiff !== 'string') {
			throw new TypeError('Expected filesDiff to be a string');
		}

		const filesDiffs = fullDiff.split('diff --git ');

		const { data: diffStat } = await this.client.pullrequests.getDiffStat({
			pull_request_id: this.pullRequestId,
			repo_slug: this.repoSlug,
			workspace: this.workspace
		});

		const reviewFiles: ReviewFile[] = [];

		for (const stat of diffStat.values as DiffStat[]) {
			if (!stat.new) { continue }
			if (!isEligibleForReview(stat.new.path || "", stat.status || "")) {
				continue; // Skip this iteration and continue with the next one
			}
			const reviewFile = await this.fetchPullRequestFile(stat, filesDiffs);
			reviewFiles.push(reviewFile);
		}

		logger.debug(`Files to review: ${reviewFiles.map((file) => file.fileName)}`);

		return reviewFiles
	}

	private async fetchPullRequestFile(stat: DiffStat, filesDiffs: string[]): Promise<ReviewFile> {
		const content = await this.fetchPullRequestFileContent(
			stat.new.links.self.href
		);

		const parts: string[] = stat.new.path?.split('/') || [];
		const fileName: string = parts[parts.length - 1];

		return {
			fileName: fileName,
			fileContent: content,
			changedLines: this.rerteiveChangedLines(stat, filesDiffs),
		};
	}

	private async fetchPullRequestFileContent(url: string): Promise<string> {
		const response: unknown = await this.client.request(`GET ${url}`);
		if (isValidContentResponse(response)) {
			return response.data
		} else {
			throw new Error(
				`Unexpected response from APIClient. Response was ${JSON.stringify(response)}.`
			);
		}
	}

	private rerteiveChangedLines(stat: DiffStat, filesDiffs: string[]): string {
		const filePath = stat.new.path;
		const fileDiff = filesDiffs.find((diff) =>
			diff.startsWith(`a/${filePath} `) || diff.startsWith(`b/${filePath} `)
		);
		return fileDiff || "";
	}
}

type ValidClientResponse = {
	data: string;
};

const isValidContentResponse = (input: unknown): input is ValidClientResponse =>
	typeof input === "object" &&
	input !== null &&
	"data" in input &&
	input.data !== null &&
	typeof input.data === "string";