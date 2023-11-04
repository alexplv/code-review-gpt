
export type Link = {
	self: {
		href: string;
	}
};

export type FileReference = {
	path: string | null;
	type: string; // You might want to define an enum for the type if there are fixed possible values
	escaped_path: string;
	links: Link;
};

export class DiffStat {
	type: string;
	lines_added: number;
	lines_removed: number;
	status: string | null;
	old: FileReference;
	new: FileReference;

	// eslint-disable-next-line max-params
	constructor(
		type: string,
		lines_added: number,
		lines_removed: number,
		status: string,
		oldPath: string,
		oldType: string,
		oldEscapedPath: string,
		oldLinks: Link,
		newPath: string,
		newType: string,
		newEscapedPath: string,
		newLinks: Link
	) {
		this.type = type;
		this.lines_added = lines_added;
		this.lines_removed = lines_removed;
		this.status = status;
		this.old = {
			path: oldPath,
			type: oldType,
			escaped_path: oldEscapedPath,
			links: oldLinks
		};
		this.new = {
			path: newPath,
			type: newType,
			escaped_path: newEscapedPath,
			links: newLinks
		};
	}
}