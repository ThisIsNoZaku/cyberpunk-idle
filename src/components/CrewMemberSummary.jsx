import * as React from "react";
import {useEffect, useState} from "react";

export default function CrewMemberSummary(props) {
    const crewMember = props.crewMember;
    useEffect(() => {
        const sub = crewMember.on("changed", function (character, p, engine) {
            setCombat(character.skills.combat.get());
        });
        return ()=> sub.unsubscribe();
    });
    useEffect(() => {
        if(crewMember.assignedJob.get()) {
            const sub = props.engine.globals.jobs[crewMember.assignedJob.get()].on("changed", function (job) {
                setJobStatus(job.status.get());
            })
            return sub.unsubscribe;
        }
    })

    const [jobStatus, setJobStatus] = useState("inactive");
    const [combat, setCombat] = useState(crewMember.skills.get().combat.get());
    const [tech, setTech] = useState(crewMember.skills.get().tech.get());
    const [social, setSocial] = useState(crewMember.skills.get().social.get());
    const [magic, setMagic] = useState(crewMember.skills.get().magic.get());
    const [stealth, setStealth] = useState(crewMember.skills.get().stealth.get());
    const classname = ["summary", "left", jobStatus].join(" ");
    return (<div className={classname} data-augmented-ui="bl-clip tl-clip tr-clip br-clip border">
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