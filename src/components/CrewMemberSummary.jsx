import * as React from "react";
import {useEffect, useState} from "react";
import SkillTable from "./SkillTable";
import canAssignToJob from "../canAssignToJob";

export default function CrewMemberSummary(props) {
    const crewMember = props.crewMember;
    // useEffect(() => {
    //     if(crewMember.assignedJob) {
    //         const sub = props.engine.globals.jobs[crewMember.assignedJob].on("changed", function (job) {
    //             setJobStatus(job.status);
    //         });
    //         return sub.unsubscribe;
    //     }
    // });

    const [jobStatus, setJobStatus] = useState("inactive");
    const [skills, setSkills] = useState(crewMember.skills);
    const classname = ["summary", "left", jobStatus].join(" ");
    return (<div className={classname} data-augmented-ui="bl-clip tl-clip tr-clip br-clip border">
                <div className="container" data-augmented-ui-reset>
                    <div className="crew-name" data-augmented-ui="tl-clip-x br-clip-x border" >
                        {crewMember.name}
                    </div>
                    <div className="crew-portrait" data-augmented-ui="all-hex-alt border">
                        <img src={crewMember.portraitIcon}
                             height={100}
                             draggable={true}
                             onDragStart={(e) => {
                                 props.setBeingDragged(crewMember.id);
                                 e.dataTransfer.setData("crewmember", JSON.stringify({
                                     type: "crewmember",
                                     id: crewMember.id,
                                     skills : {
                                         combat : crewMember.skills.combat,
                                         stealth : crewMember.skills.stealth,
                                         tech : crewMember.skills.tech,
                                         social : crewMember.skills.social,
                                         magic : crewMember.skills.magic,
                                     }
                                 }));
                             }}>
                        </img>
                    </div>
                </div>
                <SkillTable skills={skills}/>

            </div>)
}