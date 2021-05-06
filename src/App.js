import './App.css';
import { useEffect, useState } from 'react';
import { csv } from "d3-request";

import data from './onto_x_edit.csv';
import Ontology from "./Ontology";
import GraphRepresentation from "./GraphRepresentation";
import HierarchicalRepresentation from "./HierarchicalRepresentation";
import Search from "./Search";

const App = () => {

    const [error, setCSVError] = useState('');
    const [ontology, setOntology] = useState();
    const [entityClassId, setEntityClassId] = useState();

    const buildEntity = (csvLine) => {
        return {
            classId: csvLine["Class ID"],
            preferredLabel: capitalize(csvLine["Preferred Label"]),
            parents: csvLine["Parents"].split("|"),
        }
    }

    const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    }

    useEffect(() => {
        csv(data, buildEntity, (error, entities) => {
                if (error) {
                    setCSVError(`Error while loading csv file: ${error}`);
                } else {
                    setOntology(new Ontology(entities))
                }
            }
        );
    }, []);

    return <div className="App">
        <div className="error">{error}</div>
        <main>
            <div className="left-fold">
                <Search ontology={ontology} onSearch={setEntityClassId}/>
                <HierarchicalRepresentation ontology={ontology} onClassSelected={setEntityClassId}/>
            </div>
            <div className="right-fold">
                <GraphRepresentation ontology={ontology} entityClassId={entityClassId} width={1600} height={1200}/>
            </div>
        </main>
    </div>;

}

export default App;
