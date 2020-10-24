import * as React from "react";
import {useState} from "react";

export default function CrewMemberSummary(props) {
    const crewMember = props.crewMember;
    crewMember.skills.get().combat.on("change", function (ie, current) {
        setCombat(current);
    });
    const [combat, setCombat] = useState(crewMember.skills.get().combat.get());
    const [tech, setTech] = useState(crewMember.skills.get().tech.get());
    const [social, setSocial] = useState(crewMember.skills.get().social.get());
    const [magic, setMagic] = useState(crewMember.skills.get().magic.get());
    const [stealth, setStealth] = useState(crewMember.skills.get().stealth.get());
    return (<div className="summary" data-augmented-ui="bl-clip tl-clip tr-clip br-clip border">
                <div className="container" data-augmented-ui-reset>
                    <div className="crew-name" data-augmented-ui="tl-clip-x br-clip-x border" >
                        {crewMember.name.get()}
                    </div>
                    <div className="crew-portrait" data-augmented-ui="all-hex-alt border">
                        <img src={crewMember.portraitIcon.get()}
                             height={100}
                             draggable={true}
                             onDragStart={(e) => {
                                 e.dataTransfer.setData("crewmember", JSON.stringify({
                                     type: "crewmember",
                                     id: crewMember.id.get(),
                                     skills : {
                                         combat : crewMember.skills.get().combat.get(),
                                         stealth : crewMember.skills.get().stealth.get(),
                                         tech : crewMember.skills.get().tech.get(),
                                         social : crewMember.skills.get().social.get(),
                                         magic : crewMember.skills.get().magic.get(),
                                     }
                                 }));
                             }}>
                        </img>
                    </div>
                </div>
                <div className="container" data-augmented-ui-reset>
                    <div className="gridItem skill-name" data-augmented-ui="border">Combat</div>
                    <div className="gridItem skill-value" data-augmented-ui="border">{ combat }</div>
                    <div className="gridItem skill-name" data-augmented-ui="border">Stealth</div>
                    <div className="gridItem skill-value" data-augmented-ui="border">{ stealth }</div>
                    <div className="gridItem skill-name" data-augmented-ui="border">Social</div>
                    <div className="gridItem skill-value" data-augmented-ui="border">{ social }</div>
                    <div className="gridItem skill-name" data-augmented-ui="border">Magic</div>
                    <div className="gridItem skill-value" data-augmented-ui="border">{ magic }</div>
                    <div className="gridItem skill-name" data-augmented-ui="border">Tech</div>
                    <div className="gridItem skill-value" data-augmented-ui="border">{ tech }</div>
                </div>
            </div>)
}