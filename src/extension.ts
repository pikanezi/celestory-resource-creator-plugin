import {window, workspace, commands, ExtensionContext, ViewColumn} from 'vscode';

import { generateFiles } from './files';

export function activate(context: ExtensionContext) {

	let disposable = commands.registerCommand('extension.addResource', async () => {
		const workspacePath = workspace.workspaceFolders ? workspace.workspaceFolders[0] : undefined;
		if (!workspacePath) {
			window.showErrorMessage('You must be in a workspace');
			return;
		}

		const name = await window.showInputBox({prompt: 'Resource name (first letter should be lower case)'});
		if (!name) {
			return;
		}
		const properties: string[] = [];
		for (;;) {
			const property = await window.showInputBox({prompt: 'Resource property (esc to finish)'});
			if (property) {
				properties.push(property);
			} else {
				break;
			}
		}
		const icon = await window.showInputBox({prompt: 'Resource icon', value: 'build'});
		if (!icon) {
			return;
		}
		const label = await window.showInputBox({prompt: 'Resource label', value: `resource.${name}`});
		if (!label) {
			return;
		}
		const autofill = (await window.showInputBox({prompt: 'Autofill?', value: `true`})) === 'true' ? true : false;
		const editorIsPreview = (await window.showInputBox({prompt: 'The Editor component should be the DataPreview', value: 'true'})) === 'true' ? true: false;
		try {
			const paths = await generateFiles(workspacePath.uri.path, {
				name,
				icon,
				label,
				autofill,
				properties,
				editorIsPreview,
			});
			for (const path of paths) {
				const doc = await workspace.openTextDocument(path);
				await window.showTextDocument(doc, {preview: false});
			}
			window.showInformationMessage(`Resource ${name} added`);
 		} catch(err) {
			 window.showErrorMessage(err);
		 }

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
