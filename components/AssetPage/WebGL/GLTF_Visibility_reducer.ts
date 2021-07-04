

const ADD_MESH = 'ADD_MESH' as const;

const SOLO_MESH = 'SOLO_MESH' as const;
const TOGGLE_MESH = 'TOGGLE_MESH' as const;
const UNSOLO_MESH = 'UNSOLO_MESH' as const;
    
const SOLO_TEXTURE = 'SOLO_TEXTURE' as const;
const UNSOLO_TEXTURE = 'UNSOLO_TEXTURE' as const;
    
const TOGGLE_WIREFRAME = 'TOGGLE_WIREFRAME' as const;

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
        payload: {
            uuid
        }
    };
};




type AddMeshAction = ReturnType<typeof addMesh>;
type SoloMeshAction = ReturnType<typeof soloMesh>;
type ToggleMeshAction = ReturnType<typeof toggleMesh>;
type UnsoloMeshAction = ReturnType<typeof unsoloMesh>;
type ToggleWireframeAction = ReturnType<typeof toggleWireframe>;

type Action = AddMeshAction
    | SoloMeshAction
    | ToggleMeshAction
    | UnsoloMeshAction
    | ToggleWireframeAction
    ;

interface MeshState {
    readonly mesh: any; // THREE.Mesh
    readonly visibility: boolean;
    readonly wireframe: boolean;
    readonly maps: {
        [s: string]: {
             readonly visibility: boolean;
         };
    };
}

export interface State {
    readonly meshes: MeshState[];
    readonly solo: string; // read before individual state
    readonly wireframe: boolean;
}

export const DefaultState = {
    meshes: [],
    solo: "",
    wireframe: false,
};

export const reducer = (state: State = DefaultState, action: Action): State => {
    switch (action.type) {
        case ADD_MESH:
            return {
                ...state,
                meshes: [
                    ...state.meshes,
                    // [action.payload.mesh.name]: 
                    {
                        mesh: action.payload.mesh,
                        visibility: true,
                        wireframe: false,
                        maps: {
                            // assume we will use meshStandardMaterial (PBR)
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
                ]
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

        case TOGGLE_MESH:
            return {
                ...state,
                meshes: [
                    ...state.meshes.map(mesh => {
                        return {
                            ...mesh,
                            visibility: action.payload.uuid === mesh.mesh.uuid ?
                                !mesh.visibility : mesh.visibility
                        }
                    })
                ]
            };

        case TOGGLE_WIREFRAME:
            if (action.payload.uuid) {
                return {
                    ...state,
                    meshes: [
                        ...state.meshes.map(mesh => {
                            return {
                                ...mesh,
                                wireframe: action.payload.uuid === mesh.mesh.uuid ?
                                    !mesh.wireframe : mesh.wireframe
                            }
                        })
                    ]
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
