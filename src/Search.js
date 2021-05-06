import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";

const Search = (props) => {
    return <div className="search">
        <Autocomplete
            id="combo-box"
            options={props.ontology?.entities ?? []}
            getOptionLabel={option => option.preferredLabel}
            className="search-autocomplete"
            onChange={(_, entity) => {
                props.onSearch(entity?.classId ?? null);
            }}
            renderInput={params => (
                <TextField {...params} label="Entity search" variant="outlined" fullWidth/>
            )}
        />
    </div>
}

export default Search;
