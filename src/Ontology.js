class Ontology {
    constructor(entities) {
        this.entityMap = new Map(entities.map(e => ([e.classId, { ...e, childrenIds: [], children: [] }])));
        this.entities = Array.from(this.entityMap.values());

        for (let entity of this.entities) {
            for (let parentId of entity.parents) {
                const parent = this.entityMap.get(parentId);
                if (parent != null && parent.classId !== '') {
                    parent.childrenIds.push(entity.classId);
                    parent.children.push(entity);
                }
            }
        }

        this._roots = [];
        for (let entity of this.entities) {
            if (entity.parents.includes('http://www.w3.org/2002/07/owl#Thing')) {
                this._roots.push(entity);
            }
        }
    }

    get hierarchy() {
        return { classId: 'http://www.w3.org/2002/07/owl#Thing', label: '', children: this._roots};
    }

    entityHierarchy(entityId) {
        const nodes = new Map();
        const links = [];

        this._parentsDFS(entityId, nodes, links, 0, 0);
        nodes.delete(entityId);
        this._childrenDFS(entityId, nodes, links, 0, 0);
        return [Array.from(nodes.values()), links];
    }

    _parentsDFS(entityId, nodes, links, height, position) {
        const entity = this.entityMap.get(entityId);
        if (entity != null && !nodes.has(entityId)) {
            nodes.set(entityId, { id: entity.classId, label: entity.preferredLabel, height, position });
            let filteredParents = entity.parents.filter(p => !['', 'http://www.w3.org/2002/07/owl#Thing'].includes(p));
            filteredParents.forEach((parentId, parentPosition) => {
                links.push({ source: entity.classId, target: parentId, height: 1 })
                this._parentsDFS(parentId, nodes, links, height + 1, position + parentPosition);
            });
        }
    }

    _childrenDFS(entityId, nodes, links, height, position) {
        const entity = this.entityMap.get(entityId);
        if (entity != null && !nodes.has(entityId)) {
            nodes.set(entityId, { id: entity.classId, label: entity.preferredLabel, height, position });
            let filteredChildren = entity.childrenIds.filter(c => !['', 'http://www.w3.org/2002/07/owl#Thing'].includes(c));
            filteredChildren.forEach((childId, childPosition) => {
                links.push({ source: entity.classId, target: childId, height: 1 })
                this._childrenDFS(childId, nodes, links, height - 1, position - childPosition);
            });
        }
    }
}

export default Ontology;
