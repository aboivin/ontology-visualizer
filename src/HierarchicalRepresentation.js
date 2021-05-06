import { TreeItem, TreeView } from "@material-ui/lab";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useEffect, useState } from "react";

const HierarchicalRepresentation = (props) => {

    const [hierarchy, setHierarchy] = useState({});

    useEffect(() => {
        if (props.ontology != null) {
            setHierarchy(props.ontology.hierarchy)
        }
    }, [props]);

    const renderTree = (node) => (
        <TreeItem key={Math.random()}
                  nodeId={node.classId}
                  label={node.preferredLabel}>
            {Array.isArray(node.children) && node.children.length > 0 ? node.children.map((node) => renderTree(node)) : null}
        </TreeItem>
    );

    return (
        <TreeView
            className="hierarchy-root"
            defaultCollapseIcon={<ExpandMoreIcon/>}
            defaultExpanded={['http://www.w3.org/2002/07/owl#Thing']}
            defaultExpandIcon={<ChevronRightIcon/>}
            onNodeSelect={(e, id) => props.onClassSelected(id)}
        >
            {renderTree(hierarchy)}
        </TreeView>
    );
}

export default HierarchicalRepresentation;
