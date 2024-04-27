import { FormControl, InputLabel, Select, OutlinedInput, SxProps, MenuItem, SelectChangeEvent } from "@mui/material";
import { ChangeEvent } from "react";

export type PopEntity = {
    key: any,
    value: string
}
export type PopListSettings = {
    name: string,
    id: string,
    label_id: string
}

export default function PopListComponent({ popEntityList, popListData, value, outlineLabel, multiple, sx, disabled, handlerSelect }:
    {
        popEntityList: PopEntity[],
        popListData: PopListSettings,
        value: string | undefined ,
        outlineLabel: string,
        multiple?: boolean,
        disabled?:boolean,
        sx?: SxProps,
        handlerSelect?: (event: SelectChangeEvent<string>) => void
    }) {
        
    return (
        <FormControl fullWidth sx={sx} disabled={disabled}>
            <InputLabel id={popListData.label_id}>{outlineLabel}</InputLabel>
            <Select
                labelId={popListData.label_id}
                name={popListData.name}
                id={popListData.id}
                input={<OutlinedInput label={outlineLabel} />}
                value={value}
                onChange={handlerSelect}
                multiple={multiple}
                required
            >
                {
                    popEntityList.map((entity) => (
                        <MenuItem
                            key={entity.key}
                            value={entity.value}
                            id={entity.key}
                        >
                            {entity.value}
                        </MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    )
}