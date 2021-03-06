const tmpTestfolder = 'tmpTestfolderBuild';

import 'jest';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { deleteFolderRecursive } from '../utils/Utils';

const spawn = childProcess.spawn;

beforeAll((done) => {
	deleteFolderRecursive(tmpTestfolder);
	if (!fs.existsSync(tmpTestfolder)) {
		fs.mkdirSync(tmpTestfolder);
	}
	done();
}, 5000);


describe('build v1', () => {
	it('jovo new <project> --init alexaSkill --v1 \n      jovo build', (done) => {
		const projectName = 'helloworld_v1';
		const projectFolder = path.join(tmpTestfolder, projectName);
		const child = spawn('node', ['./../dist/index.js', 'new', projectName,
			'-t', 'helloworldtest',
			'--init', 'alexaSkill',
			'--skip-npminstall',
			'--v1'], {
				cwd: tmpTestfolder,
			});
		child.stderr.on('data', (data) => {
			console.log(data.toString());
			done();
		});
		child.stdout.on('data', (data) => {
			if (data.indexOf('Installation completed.') > -1) {
				child.kill();
				const childBuild = spawn('node', ['./../../dist/index.js',
					'build'], {
						cwd: projectFolder,
					});
				childBuild.stdout.on('data', (data) => {
					if (data.indexOf('Build completed.') > -1) {
						childBuild.kill();
						expect(fs.existsSync(path.join(projectFolder, 'platforms')))
							.toBe(true);
						expect(fs.existsSync(path.join(projectFolder, 'platforms', 'alexaSkill')))
							.toBe(true);
						expect(fs.existsSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'skill.json')))
							.toBe(true);
						const skillJson = JSON.parse(fs.readFileSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'skill.json')).toString());

						expect(skillJson.manifest.publishingInformation.locales['en-US'].name)
							.toBe(projectName);
						expect(skillJson.manifest.apis.custom.endpoint.uri.substr(0, 27))
							.toBe('https://webhook.jovo.cloud/');

						expect(fs.existsSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'models', 'en-US.json')))
							.toBe(true);
						const modelFile = JSON.parse(
							fs.readFileSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'models', 'en-US.json')).toString());

						expect(modelFile.interactionModel.languageModel.invocationName)
							.toBe('my test app');
						done();
					}
				});
			}
		});
	}, 12000);
	it('jovo new <project> --init googleAction --v1 \n      jovo build', (done) => {
		const projectName = 'helloworld2_v1';
		const projectFolder = path.join(tmpTestfolder, projectName);
		const child = spawn('node', ['./../dist/index.js', 'new', projectName,
			'-t', 'helloworldtest',
			'--init', 'googleAction',
			'--skip-npminstall',
			'--v1'], {
				cwd: tmpTestfolder,
			});
		child.stderr.on('data', (data) => {
			console.log(data.toString());
			done();
		});
		child.stdout.on('data', (data) => {
			if (data.indexOf('Installation completed.') > -1) {
				child.kill();
				const childBuild = spawn('node', ['./../../dist/index.js',
					'build'], {
						cwd: projectFolder,
					});
				childBuild.stdout.on('data', (data) => {
					if (data.indexOf('Build completed.') > -1) {
						childBuild.kill();
						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms')))
							.toBe(true);
						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction')))
							.toBe(true);
						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'agent.json')))
							.toBe(true);
						const agentJson = JSON.parse(
							fs.readFileSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'agent.json')).toString());

						expect(agentJson.webhook.url.substr(0, 27))
							.toBe('https://webhook.jovo.cloud/');

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'Default Fallback Intent.json')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'Default Welcome Intent.json')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'HelloWorldIntent.json')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'HelloWorldIntent_usersays_en.json')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'MyNameIsIntent.json')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'MyNameIsIntent_usersays_en.json')))
							.toBe(true);
						done();
					}
				});
			}
		});
	}, 12000);

	it('jovo new <project> --init alexaSkill --build --v1 \n      jovo build --reverse', (done) => {
		const projectName = 'helloworld_reverse_alexaSkill_v1';
		const projectFolder = path.join(tmpTestfolder, projectName);
		const child = spawn('node', ['./../dist/index.js', 'new', projectName,
			'-t', 'helloworldtest',
			'--init', 'alexaSkill',
			'--build',
			'--skip-npminstall',
			'--v1'], {
				cwd: tmpTestfolder,
			});
		child.stderr.on('data', (data) => {
			console.log(data.toString());
			done();
		});
		child.stdout.on('data', (data) => {
			if (data.indexOf('Installation completed.') > -1) {
				child.kill();

				fs.unlinkSync(path.join(projectFolder, 'models', 'en-US.json'));

				const childBuild = spawn('node', ['./../../dist/index.js',
					'build',
					'--reverse'], {
						cwd: projectFolder,
					});

				childBuild.stderr.on('data', (data) => {
					console.log(data.toString());
					done();
				});
				childBuild.stdout.on('data', (data) => {
					if (data.indexOf('Build completed.') > -1) {
						childBuild.kill();
						expect(fs.existsSync(path.join(projectFolder, 'models', 'en-US.json'))).toBe(true);
						const modelJson = JSON.parse(
							fs.readFileSync(path.join(
								projectFolder,
								'models',
								'en-US.json')).toString());
						expect(modelJson.invocation)
							.toBe('my test app');
						done();
					}
				});
			}
		});
	}, 12000);

	it('jovo new <project> --init googleAction --build --v1 \n      jovo build --reverse', (done) => {
		const projectName = 'helloworld_reverse_googleAction_v1';
		const projectFolder = path.join(tmpTestfolder, projectName);
		const child = spawn('node', ['./../dist/index.js', 'new', projectName,
			'-t', 'helloworldtest',
			'--init', 'googleAction',
			'--build',
			'--skip-npminstall',
			'--v1'], {
				cwd: tmpTestfolder,
			});
		child.stderr.on('data', (data) => {
			console.log(data.toString());
			done();
		});
		child.stdout.on('data', (data) => {
			if (data.indexOf('Installation completed.') > -1) {
				child.kill();

				fs.unlinkSync(path.join(projectFolder, 'models', 'en-US.json'));
				const childBuild = spawn('node', ['./../../dist/index.js',
					'build',
					'--reverse'], {
						cwd: projectFolder,
					});

				childBuild.stderr.on('data', (data) => {
					console.log(data.toString());
					done();
				});
				childBuild.stdout.on('data', (data) => {
					if (data.indexOf('Build completed.') > -1) {
						childBuild.kill();
						expect(fs.existsSync(path.join(projectFolder, 'models', 'en.json'))).toBe(true);
						const modelJson = JSON.parse(
							fs.readFileSync(path.join(
								projectFolder,
								'models',
								'en.json')).toString());
						expect(modelJson.invocation.length === 0)
							.toBe(true);
						done();
					}
				});
			}
		});
	}, 12000);
});


describe('build v2', () => {
	it('jovo new <project>\n      jovo build --platform alexaSkill', (done) => {
		const projectName = 'helloworld_v2';
		const projectFolder = path.join(tmpTestfolder, projectName);
		const child = spawn('node', ['./../dist/index.js', 'new', projectName,
			'-t', 'helloworldtest',
			'--skip-npminstall'], {
				cwd: tmpTestfolder,
			});
		child.stderr.on('data', (data) => {
			console.log(data.toString());
			done();
		});
		child.stdout.on('data', (data) => {
			if (data.indexOf('Installation completed.') > -1) {
				child.kill();
				const childBuild = spawn('node', ['./../../dist/index.js',
					'build',
					'platform', 'alexaSkill'], {
						cwd: projectFolder,
					});
				childBuild.stdout.on('data', (data) => {
					if (data.indexOf('Build completed.') > -1) {
						childBuild.kill();
						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms')))
							.toBe(true);

						expect(fs.existsSync(path.join(projectFolder, 'platforms', 'alexaSkill')))
							.toBe(true);
						expect(fs.existsSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'skill.json')))
							.toBe(true);
						const skillJson = JSON.parse(fs.readFileSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'skill.json')).toString());

						expect(skillJson.manifest.publishingInformation.locales['en-US'].name)
							.toBe(projectName);
						expect(skillJson.manifest.apis.custom.endpoint.uri.substr(0, 27))
							.toBe('https://webhook.jovo.cloud/');

						expect(fs.existsSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'models', 'en-US.json')))
							.toBe(true);
						const modelFile = JSON.parse(
							fs.readFileSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'models', 'en-US.json')).toString());

						expect(modelFile.interactionModel.languageModel.invocationName)
							.toBe('my test app');
						done();
					}
				});
			}
		});
	}, 12000);

	it('jovo new <project>\n      jovo build --platform googleAction', (done) => {
		const projectName = 'helloworld2_v2';
		const projectFolder = path.join(tmpTestfolder, projectName);
		const child = spawn('node', ['./../dist/index.js', 'new', projectName,
			'-t', 'helloworldtest',
			'--skip-npminstall'], {
				cwd: tmpTestfolder,
			});
		child.stderr.on('data', (data) => {
			console.log(data.toString());
			done();
		});
		child.stdout.on('data', (data) => {
			if (data.indexOf('Installation completed.') > -1) {
				child.kill();
				const childBuild = spawn('node', ['./../../dist/index.js',
					'build',
					'--platform', 'googleAction'], {
						cwd: projectFolder,
					});
				childBuild.stdout.on('data', (data) => {
					if (data.indexOf('Build completed.') > -1) {
						childBuild.kill();
						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction')))
							.toBe(true);
						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'agent.json')))
							.toBe(true);
						const agentJson = JSON.parse(
							fs.readFileSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'agent.json')).toString());

						expect(agentJson.webhook.url.substr(0, 27))
							.toBe('https://webhook.jovo.cloud/');

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'Default Fallback Intent.json')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'Default Welcome Intent.json')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'HelloWorldIntent.json')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'HelloWorldIntent_usersays_en.json')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'MyNameIsIntent.json')))
							.toBe(true);

						expect(
							fs.existsSync(path.join(projectFolder,
								'platforms',
								'googleAction',
								'dialogflow',
								'intents',
								'MyNameIsIntent_usersays_en.json')))
							.toBe(true);
						done();
					}
				});
			}
		});
	}, 12000);

	it('jovo new <project> --build alexaSkill\n      jovo build --platform alexaSkill --reverse', (done) => {
		const projectName = 'helloworld_reverse_alexaSkill_v2';
		const projectFolder = path.join(tmpTestfolder, projectName);
		const child = spawn('node', ['./../dist/index.js', 'new', projectName,
			'-t', 'helloworldtest',
			'--build', 'alexaSkill',
			'--skip-npminstall'], {
				cwd: tmpTestfolder,
			});
		child.stderr.on('data', (data) => {
			console.log(data.toString());
			done();
		});
		child.stdout.on('data', (data) => {
			if (data.indexOf('Installation completed.') > -1) {
				child.kill();

				fs.unlinkSync(path.join(projectFolder, 'models', 'en-US.json'));

				const childBuild = spawn('node', ['./../../dist/index.js',
					'build',
					'--platform', 'alexaSkill',
					'--reverse'], {
						cwd: projectFolder,
					});

				childBuild.stderr.on('data', (data) => {
					done();
				});
				childBuild.stdout.on('data', (data) => {
					if (data.indexOf('Build completed.') > -1) {
						childBuild.kill();
						expect(fs.existsSync(path.join(projectFolder, 'models', 'en-US.json'))).toBe(true);
						const modelJson = JSON.parse(
							fs.readFileSync(path.join(
								projectFolder,
								'models',
								'en-US.json')).toString());
						expect(modelJson.invocation)
							.toBe('my test app');
						done();
					}
				});
			}
		});
	}, 12000);

	it('jovo new <project> --build googleAction\n      jovo build --platform googleAction --reverse', (done) => {
		const projectName = 'helloworld_reverse_googleAction_v2';
		const projectFolder = path.join(tmpTestfolder, projectName);
		const child = spawn('node', ['./../dist/index.js', 'new', projectName,
			'-t', 'helloworldtest',
			'--build', 'googleAction',
			'--skip-npminstall'], {
				cwd: tmpTestfolder,
			});
		child.stderr.on('data', (data) => {
			console.log(data.toString());
			done();
		});
		child.stdout.on('data', (data) => {
			if (data.indexOf('Installation completed.') > -1) {
				child.kill();

				fs.unlinkSync(path.join(projectFolder, 'models', 'en-US.json'));
				const childBuild = spawn('node', ['./../../dist/index.js',
					'build',
					'--platform', 'googleAction',
					'--reverse'], {
						cwd: projectFolder,
					});

				childBuild.stderr.on('data', (data) => {
					console.log(data.toString());
					done();
				});
				childBuild.stdout.on('data', (data) => {
					if (data.indexOf('Build completed.') > -1) {
						childBuild.kill();
						expect(fs.existsSync(path.join(projectFolder, 'models', 'en.json'))).toBe(true);
						const modelJson = JSON.parse(
							fs.readFileSync(path.join(
								projectFolder,
								'models',
								'en.json')).toString());
						expect(modelJson.invocation.length === 0)
							.toBe(true);
						done();
					}
				});
			}
		});
	}, 12000);
});

afterAll((done) => {
	setTimeout(() => {
		deleteFolderRecursive(tmpTestfolder);
		done();
	}, 3000);
}, 5000);
