import { readFile } from 'fs';
import { execSync } from 'child_process';

const filePath = 'RELEASE.md';

readFile(filePath, 'utf8', (err, data) => {
	if (err) {
		console.error(`Error reading file: ${err}`);
		return;
	}

	const command = `npm run build:electron -- -c.releaseInfo.releaseNotes="${data}"`;

	// Execute order 66
	execSync(command, { stdio: [0, 1, 2] });
});
