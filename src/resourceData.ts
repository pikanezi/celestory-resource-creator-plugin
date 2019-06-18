import { promisify } from "util";
import { writeFile, readFile } from "fs";

import { ResourceData } from "./files";
import { join } from "path";
import { stringifyRegex } from "./utils";

const write = promisify(writeFile);

const generateResourceData = (titleName: string, data: ResourceData) => `import {ResourceTypeTree} from '../resourceFactories';
import {Resource, ResourceData, ResourceModel} from '../../models/resource';

export interface ${titleName}Data extends ResourceData {
    ${data.properties.map(prop => `\t${prop};`).join('\n')}
}

export const is${titleName}Resource = (resource: ResourceModel): resource is ResourceModel<${titleName}Data> => {
    return resource.type.startsWith('${titleName}');
};

export const create${titleName}Resource = (typeTree: ResourceTypeTree): Resource<${titleName}Data> => {
    return {
        type: typeTree.fullname,
        data: {
            ${data.properties.map((prop, index)  => `${index === 0 ? '' : '\t\t\t'}${prop.split(' ')[0]} '',`).join('\n')}
        },
    };
};`;

export const createResourceData = async (path: string, data: ResourceData, paths: string[]) => {
    const titleName = data.name.charAt(0).toLocaleUpperCase() + data.name.substr(1);
    const resourceDataPath = join(path, 'src/containers/Resource/data/services');

    paths.push(join(resourceDataPath, 'resources', `${data.name}ResourceData.ts`));
    write(paths[paths.length-1], generateResourceData(titleName, data));

    const importContent = `import {${titleName}Data, create${titleName}Resource} from './resources/${data.name}ResourceData';`;
    const importPredicate = /\nexport enum ResourceUpdateMode {/;
    
    const interfaceContent = `    ${titleName}: (typeTree: ResourceTypeTree) => ResourceFactory<${titleName}Data>;`;
    const interfacePredicate = /export interface ResourceFactories {/;

    const resourceFactoriesContent = `    ${titleName}: (typeTree: ResourceTypeTree) => ({
        icon: '${data.icon}',
        label: '${data.label}',
        autofill: ${data.autofill},
        template: 0,
        typeTree,
        createResource: () => create${titleName}Resource(typeTree),
    }),`;
    const resourceFactoriesPredicate = /export const resourceFactories: ResourceFactories = {/;
    
    const resourceFactoriesPath = join(resourceDataPath, 'resourceFactories.ts');
    paths.push(resourceFactoriesPath);
    const content = (await promisify(readFile)(resourceFactoriesPath)).toString();
    const newContent = content.replace(importPredicate, importContent + '\n\n' + stringifyRegex(importPredicate).substr(2))
                            .replace(interfacePredicate, stringifyRegex(interfacePredicate) + '\n' + interfaceContent)
                            .replace(resourceFactoriesPredicate, stringifyRegex(resourceFactoriesPredicate) + '\n' + resourceFactoriesContent);
    await write(resourceFactoriesPath, newContent);
};