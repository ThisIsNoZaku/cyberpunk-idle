import * as React from "react";
import {useEffect} from "react";

export default function Resourcebar(props) {
    return <div className="resource-bar" data-augmented-ui="br-2-clip-x bl-2-clip-x border">

        {Object.keys(props.resources).map(resourceName => {

            return <div data-augmented-ui-reset>
                <div className="resource-display" data-augmented-ui="br-clip bl-clip border">
                    <div className="resource-name">{props.resources[resourceName].name}</div>
                    <div className="resource-value">{props.resources[resourceName].quantity}</div>
                </div>
            </div>
        })}
    </div>
}