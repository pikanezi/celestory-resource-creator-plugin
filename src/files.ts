import { createResourceData } from "./resourceData";
import { createResourceDataEditors } from "./resourceDataEditors";

export interface ResourceData {
    name: string;
    icon: string;
    label: string;
    autofill: boolean;
    properties: string[];
    editorIsPreview: boolean;
}

export const generateFiles = async (path: string, data: ResourceData) => {
    const paths: string[] = [];
    await createResourceData(path, data, paths);
    await createResourceDataEditors(path, data, paths);
    return paths;
};