import * as React from "react";
import {useEffect} from "react";

export default function Resourcebar(props) {
    return <div className="resource-bar" data-augmented-ui="br-2-clip-x b-clip bl-2-clip-x border">

        {Object.keys(props.resources).map(resourceName => {

            return <div data-augmented-ui-reset>
                <div className="resource-display" data-augmented-ui="br-clip bl-clip border">
                    <div className="resource-name">{props.resources[resourceName].get().name.get()}</div>
                    <div className="resource-value">{props.resources[resourceName].get().quantity.get()}</div>
                </div>
            </div>
        })}
    </div>
}