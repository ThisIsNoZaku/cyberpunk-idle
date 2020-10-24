import * as React from "react";
import { useState, useEffect } from "react";

function getAugmented(props) {
    return [
        "border",
        props.side === "left" ? "r-rect-y" : "l-rect-y",
        "bl-clip tl-clip tr-clip br-clip"
    ].join(" ");
}

export default function Sidebar(props) {

    const style = ["sidebar",
        props.expanded ? "expanded" : "closed",
        props.side,
    ].join(" ");
    return <div
        data-augmented-ui={getAugmented(props)}
        className={style}
                onMouseOver={props.expand}
                onMouseOut={props.collapse}
                onMouseDown={props.click}
    >
        {props.title}
        {props.children}
    </div>;
}