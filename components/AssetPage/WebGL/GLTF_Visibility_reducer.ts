const ADD_MESH = 'ADD_MESH' as const;

const SOLO_MESH = 'SOLO_MESH' as const;
const TOGGLE_MESH = 'TOGGLE_MESH' as const;
const UNSOLO_MESH = 'UNSOLO_MESH' as const;

const TOGGLE_ENVIRONMENT = 'TOGGLE_ENVIRONMENT' as const;
const TOGGLE_WIREFRAME = 'TOGGLE_WIREFRAME' as const;

const SOLO_TEXTURE = 'SOLO_TEXTURE' as const;
const UNSOLO_TEXTURE = 'UNSOLO_TEXTURE' as const;

const RESET_DISPLAY = 'RESET_DISPLAY' as const;

export function addMesh(mesh) {
    return {
        type: ADD_MESH,
        payload: { mesh }
    };
};

export const soloMesh = (uuid: string) => {
    return {
        type: SOLO_MESH,
        payload: { uuid }
    };
};

export const unsoloMesh = (uuid: string) => {
    return {
        type: UNSOLO_MESH,
        payload: { uuid }
    };
};

export const toggleMesh = (uuid: string) => {
    return {
        type: TOGGLE_MESH,
        payload: { uuid }
    };
};

export const toggleWireframe = (uuid?: string) => {
    return {
        type: TOGGLE_WIREFRAME,
        payload: { uuid }
    };
};

export const toggleEnvironment = () => {
    return {
        type: TOGGLE_ENVIRONMENT
    };
};

export const resetDisplay = (uuid?: string) => {
    return {
        type: RESET_DISPLAY,
    };
};

type AddMeshAction = ReturnType<typeof addMesh>;
type SoloMeshAction = ReturnType<typeof soloMesh>;
type ToggleMeshAction = ReturnType<typeof toggleMesh>;
type UnsoloMeshAction = ReturnType<typeof unsoloMesh>;
type ToggleEnvironmentAction = ReturnType<typeof toggleEnvironment>;
type ToggleWireframeAction = ReturnType<typeof toggleWireframe>;
type ResetDisplayAction = ReturnType<typeof resetDisplay>;

type Action = AddMeshAction
    | SoloMeshAction
    | ToggleMeshAction
    | UnsoloMeshAction
    | ToggleWireframeAction
    | ToggleEnvironmentAction
    | ResetDisplayAction
    ;

interface MeshState {
    readonly mesh: any;
    readonly visibility: boolean;
    readonly wireframe: boolean;
    readonly maps: {
        [s: string]: {
             readonly visibility: boolean;
         };
    };
}

export interface State {
    readonly meshes: { [s: string]: MeshState };
    readonly solo: string; // read before individual state
    readonly wireframe: boolean;
    readonly showEnvironment: boolean;
}

export const DefaultState = {
    meshes: {},
    solo: "",
    wireframe: false,
    showEnvironment: true,
};

export const reducer = (state: State = DefaultState, action: Action): State => {
    console.log(state)
    switch (action.type) {
        case ADD_MESH:
            return {
                ...state,
                meshes: {
                    ...state.meshes,
                    [action.payload.mesh.uuid]: {
                        mesh: action.payload.mesh,
                        visibility: true,
                        wireframe: false,
                        maps: {
                            // assume we will use meshStandardMaterial (PBR)
                            // TODO these fields are correct, use enum type and generate keyof
                            map: {
                                visibility: true
                            },
                            metalnessMap: {
                                visibility: true
                            },
                            normalMap: {
                                visibility: true
                            },
                            roughnessMap: {
                                visibility: true
                            }
                        }
                    }
                }
            };
        case SOLO_MESH:
            return {
                ...state,
                solo: action.payload.uuid
            };

        case UNSOLO_MESH:
            return {
                ...state,
                solo: ""
            };

        case TOGGLE_ENVIRONMENT:
            return {
                ...state,
                showEnvironment: !state.showEnvironment
            };

        case TOGGLE_MESH:
            return {
                ...state,
                meshes: {
                    ...Object.values(state.meshes).reduce<{[s: string]: MeshState}>((acc, curr) => {
                        
                        acc[curr.mesh.uuid] = {
                            ...curr,
                            visibility: action.payload.uuid === curr.mesh.uuid ?
                                !curr.visibility : curr.visibility
                        }
                        return acc;
                    }, {} as {[s: string]: MeshState})
                }
            };

        case TOGGLE_WIREFRAME:
            if (action.payload.uuid) {
                return {
                    ...state,
                    meshes: {
                        ...Object.values(state.meshes).reduce<{[s: string]: MeshState}>((acc, curr) => {
                            
                            acc[curr.mesh.uuid] = {
                                ...curr,
                                wireframe: action.payload.uuid === curr.mesh.uuid ?
                                    !curr.wireframe : curr.wireframe
                            }
                            return acc;
                        }, {} as {[s: string]: MeshState})
                    }
                };
    
            }
            return {
                ...state,
                wireframe: !state.wireframe
            };

        // case SOLO_TEXTURE:
        // case UNSOLO_TEXTURE:
        // case RESET_DISPLAY:

        default:
            return state;
    }

}
