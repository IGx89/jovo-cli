import * as _ from 'lodash';
import * as fs from 'fs';
import * as Listr from 'listr';
import * as Platforms from '../utils/Platforms';
import { ANSWER_BACKUP } from '../utils/Prompts';
import {
	getProject,
	JovoCliDeploy,
	JovoTaskContext,
	ENDPOINT_NONE,
	TARGET_ALL,
	TARGET_INFO,
	TARGET_MODEL,
	TARGET_ZIP,
	JovoCliPlatform,
} from 'jovo-cli-core';
import * as DeployTargets from '../utils/DeployTargets';

const { promisify } = require('util');
const existsAsync = promisify(fs.exists);

const highlight = require('chalk').white.bold;
const project = getProject();

function addPlatfromToConfig(platform: JovoCliPlatform): Promise<void> {
	return new Promise((resolve, reject) => {
		const config = project.getConfig() || {};

		platform.addPlatfromToConfig(config);

		fs.writeFile(project.getConfigPath(), JSON.stringify(config, null, '\t'), (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
}


// module.exports.initTask = () => {
export function initTask() {
	let appJsonText = `Creating /app.json`;
	if (project.hasConfigFile()) {
		appJsonText = `Updating /app.json`;
	}

	return {
		title: appJsonText,
		task: (ctx: JovoTaskContext, task: Listr.ListrTaskWrapper) => {

			let platform: JovoCliPlatform;
			const tasks: Listr.ListrTask[] = [];

			ctx.types.forEach((type) => {
				platform = Platforms.get(type);

				tasks.push.apply(tasks, [
					{
						title: `Adding ${highlight(type)} as platform`,
						task: (ctx: JovoTaskContext, task: Listr.ListrTaskWrapper) => {
							return addPlatfromToConfig(platform);
						},
					}, {
						title: `Adding platform specific properties to Jovo-Model`,
						task: (ctx: JovoTaskContext, task: Listr.ListrTaskWrapper) => {
							return project.setPlatformDefaults(platform);
						},
					}, {
						title: `Adding ${highlight(ctx.endpoint)} as endpoint`,
						enabled: (ctx: JovoTaskContext) => ctx.endpoint !== ENDPOINT_NONE,
						task: (ctx: JovoTaskContext, task: Listr.ListrTaskWrapper) => {
							let info = 'Info: ';
							const p = Promise.resolve();

							// INFO: Happens only for Jovo Framework v1
							return p.then(() => project.getEndpoint(ctx.endpoint!))
								.then((uri) => {
									info += 'Endpoint uri: ' + uri;
									task.skip(info);
									return project.updateConfigV1({ endpoint: uri });
								}).catch((error) => {
									info += error.message;
									task.skip(info);
								});
						},
					},
				]);
			});

			return new Listr(tasks);
		},
	};
}


export function getTask(ctx: JovoTaskContext): Listr.ListrTask[] {
	const platformsPath = project.getPlatformsPath();
	if (!fs.existsSync(platformsPath)) {
		fs.mkdirSync(platformsPath);
	}

	const returnTasks: Listr.ListrTask[] = [];

	let platform;
	ctx.types.forEach((type) => {
		platform = Platforms.get(type);
		returnTasks.push.apply(returnTasks, platform.getGetTasks(ctx));
	});

	return returnTasks;
}


export function buildTask(ctx: JovoTaskContext) {

	const platformsPath = project.getPlatformsPath();
	if (!fs.existsSync(platformsPath)) {
		fs.mkdirSync(platformsPath);
	}

	const buildPlatformTasks: Listr.ListrTask[] = [];

	// Check if model-file is valid
	const validationTasks: Listr.ListrTask[] = [];
	let modelFileContent: string;
	project.getLocales(ctx.locales).forEach((locale) => {
		validationTasks.push({
			title: locale,
			task: async (ctx: JovoTaskContext, task: Listr.ListrTaskWrapper) => {
				try {
					modelFileContent = await project.getModelFileJsonContent(locale);
				} catch (error) {
					if (error.code === 'ENOENT') {
						// Before failing check if model file is JavaScript module
						if (await existsAsync(project.getModelPath(locale, 'js'))) {
							// File is JavaScript not json
							return task.skip('Model file is JavaScript not JSON so check got skipped.');
						}

						throw new Error(`Language model file could not be found. Expected location: "${error.path}"`);
					}

					throw (error);
				}

				// ensure the model JSON is valid -- this will throw if it isn't
				JSON.parse(modelFileContent);
			}
		});
	});

	buildPlatformTasks.push({
		title: 'Validate Model-Files',
		task: (ctx: JovoTaskContext, task: Listr.ListrTaskWrapper) => {
			return new Listr(validationTasks);
		}
	});


	let platform;
	ctx.types.forEach((type) => {
		platform = Platforms.get(type);
		buildPlatformTasks.push.apply(buildPlatformTasks, platform.getBuildTasks(ctx));
	});

	return buildPlatformTasks;
}


export function buildReverseTask(ctx: JovoTaskContext) {
	const buildReverseSubtasks: Listr.ListrTask[] = [];
	buildReverseSubtasks.push({
		title: 'Creating backups',
		enabled: (ctx) => ctx.reverse === ANSWER_BACKUP,
		task: (ctx) => {
			const backupLocales: Listr.ListrTask[] = [];
			for (const locale of ctx.locales) {
				backupLocales.push({
					title: locale,
					task: () => {
						return project.backupModel(locale);
					},
				});
			}
			return new Listr(backupLocales);
		},
	});

	let platform;
	ctx.types.forEach((type) => {
		platform = Platforms.get(type);
		buildReverseSubtasks.push.apply(buildReverseSubtasks, platform.getBuildReverseTasks(ctx));
	});

	return new Listr(buildReverseSubtasks);
}


export function deployTask(ctx: JovoTaskContext): Listr.ListrTask[] {
	const platformsPath = project.getPlatformsPath();
	if (!fs.existsSync(platformsPath)) {
		fs.mkdirSync(platformsPath);
	}

	// Get the targets to which to deploy to
	// (all except info and model)
	const targets: JovoCliDeploy[] = [];
	let targetNames: string[] = [];

	if (ctx.target === TARGET_ZIP) {
		// Only create a zip of the project-src folder
		return [project.deployTaskZipProjectSource(ctx)];
	}

	if (ctx.target && ![TARGET_ZIP, TARGET_INFO, TARGET_MODEL].includes(ctx.target)) {
		if (ctx.target === TARGET_ALL) {
			targetNames = DeployTargets.getAllAvailable();
		} else {
			targetNames = [ctx.target];
		}
	}
	targetNames.forEach((targetName) => {
		targets.push(DeployTargets.get(targetName));
	});

	const deployPlatformTasks: Listr.ListrTask[] = [];
	let platform;
	ctx.types.forEach((type:string) => {
		platform = Platforms.get(type);
		deployPlatformTasks.push.apply(deployPlatformTasks, platform.getDeployTasks(ctx, targets));
	});

	return deployPlatformTasks;
}
