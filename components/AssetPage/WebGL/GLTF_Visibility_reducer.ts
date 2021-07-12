const ADD_MESH = 'ADD_MESH' as const;

export function addMesh(mesh: THREE.Mesh) {
    return {
        type: ADD_MESH,
        payload: { mesh }
    };
};

type AddMeshAction = ReturnType<typeof addMesh>;

type Action = AddMeshAction;

export interface MeshState {
    readonly mesh: THREE.Mesh;
}

export interface State {
    readonly meshes: { [s: string]: MeshState };
    readonly boundingSphereRadius: number;
}

export const DefaultState = {
    meshes: {},
    boundingSphereRadius: 0
};

export const reducer = (state: State = DefaultState, action: Action): State => {
    console.log(state)
    switch (action.type) {
        case ADD_MESH:
            return {
                ...state,
                boundingSphereRadius: action.payload.mesh.geometry.boundingSphere.radius > state.boundingSphereRadius ?
                    action.payload.mesh.geometry.boundingSphere.radius : state.boundingSphereRadius,
                meshes: {
                    ...state.meshes,
                    [action.payload.mesh.uuid]: { mesh: action.payload.mesh }
                }
            };
        default:
            return state;
    }
}
