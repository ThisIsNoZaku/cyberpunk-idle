import * as React from "react";

function toRoman(number) {
    switch (number) {
        case undefined:
        case null:
        case 0: return "-";
        case 1: return "I";
        case 2: return "II";
        case 3: return "III";
        case 4: return "IV";
        case 5: return "V";
    }
    return number;
}

export default function (props) {
    return <div className="container" data-augmented-ui-reset>
        <div className="gridItem skill-name combat-skill">Combat</div>
        <div className="gridItem skill-value combat-skill">{ toRoman(props.skills.combat) }</div>
        <div className="gridItem skill-name stealth-skill">Stealth</div>
        <div className="gridItem skill-value stealth-skill">{ toRoman(props.skills.stealth) }</div>
        <div className="gridItem skill-name social-skill">Social</div>
        <div className="gridItem skill-value social-skill">{ toRoman(props.skills.social) }</div>
        <div className="gridItem skill-name magic-skill">Magic</div>
        <div className="gridItem skill-value magic-skill">{ toRoman(props.skills.magic) }</div>
        <div className="gridItem skill-name tech-skill">Tech</div>
        <div className="gridItem skill-value tech-skill">{ toRoman(props.skills.tech) }</div>
    </div>
}