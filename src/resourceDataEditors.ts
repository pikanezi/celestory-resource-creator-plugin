import { join } from "path";
import { promisify } from "util";
import { mkdir, writeFile, readFile } from "fs";

import { ResourceData } from './files';
import { stringifyRegex } from "./utils";

const write = promisify(writeFile);

const generateResourceDataPreview = (name: string, titleName: string) => `import * as React from 'react';

import {${titleName}Data} from '../../data/services/resources/${name}ResourceData';
import {ResourceDataPreviewProps} from '../ResourceDataEditors';

interface ${titleName}ResourceDataPreviewProps {}

interface ${titleName}ResourceDataPreviewCombinedProps extends ${titleName}ResourceDataPreviewProps, ResourceDataPreviewProps<${titleName}Data> {}

interface ${titleName}ResourceDataPreviewState {}

export class ${titleName}ResourceDataPreview extends React.PureComponent<${titleName}ResourceDataPreviewCombinedProps, ${titleName}ResourceDataPreviewState> {
    public render(): React.ReactNode {
        return;
    }
}
`;

const generateResourceDataEditorAsPreview = (titleName: string) => `import {${titleName}ResourceDataPreview} from './${titleName}ResourceDataPreview';

export {${titleName}ResourceDataPreview as ${titleName}ResourceDataEditor};`;

const generateResourceDataEditor = (name: string, titleName: string) => `import * as React from 'react';

import {${titleName}Data} from '../../data/services/resources/${name}ResourceData';
import {ResourceDataEditorProps} from '../ResourceDataEditors';

interface ${titleName}ResourceDataEditorProps {}

interface ${titleName}ResourceDataEditorCombinedProps extends ${titleName}ResourceDataEditorProps, ResourceDataEditorProps<${titleName}Data> {}

interface ${titleName}ResourceDataEditorState {}

export class ${titleName}ResourceDataEditor extends React.PureComponent<${titleName}ResourceDataEditorCombinedProps, ${titleName}ResourceDataEditorState> {
    public render(): React.ReactNode {
        return;
    }
}
`;

export const createResourceDataEditors = async (path: string, data: ResourceData, paths: string[]) => {
    const titleName = data.name.charAt(0).toLocaleUpperCase() + data.name.substr(1);
    const dataEditorsDirectoryPath = join(path, `src/containers/Resource/DataEditors/${titleName}`);
    try {
        await promisify(mkdir)(dataEditorsDirectoryPath);
    } catch(err) {
    }
    paths.push(join(dataEditorsDirectoryPath, `${titleName}ResourceDataPreview.tsx`));
    await write(paths[paths.length-1], generateResourceDataPreview(data.name, titleName));
    paths.push(join(dataEditorsDirectoryPath, `${titleName}ResourceDataEditor.tsx`));
    await write(paths[paths.length-1], data.editorIsPreview ? generateResourceDataEditorAsPreview(titleName) : generateResourceDataEditor(data.name, titleName));

    
    const importContent = `import {${titleName}Data} from '../data/services/resources/${data.name}ResourceData';
import {${titleName}ResourceDataEditor} from './${titleName}/${titleName}ResourceDataEditor';
import {${titleName}ResourceDataPreview} from './${titleName}/${titleName}ResourceDataPreview';`;
    const interfaceContent = `    ${titleName}: ResourceDataEditor<${titleName}Data>;`;
    
    const importPredicate = /export interface ResourceDataEditorProps<T extends ResourceData = ResourceData> {/;
    const interfacePredicate = /export interface ResourceDataEditors {/;

    const dataEditorsPredicate = /export const resourceDataEditors: ResourceDataEditors = {/;
    const dataEditorsContent = `    ${titleName}:{
            DataEditor: ${titleName}ResourceDataEditor,
            DataPreview: ${titleName}ResourceDataPreview,
    },`;
    
    const dataEditorsPath = join(path, 'src/containers/Resource/DataEditors/ResourceDataEditors.tsx');
    paths.push(dataEditorsPath);
    const content = (await promisify(readFile)(dataEditorsPath)).toString();
    const newContent = content.replace(importPredicate, importContent + '\n\n' + stringifyRegex(importPredicate))
                            .replace(interfacePredicate, stringifyRegex(interfacePredicate) + '\n' + interfaceContent)
                            .replace(dataEditorsPredicate, stringifyRegex(dataEditorsPredicate) + '\n' + dataEditorsContent);
    promisify(writeFile)(dataEditorsPath, newContent);
};