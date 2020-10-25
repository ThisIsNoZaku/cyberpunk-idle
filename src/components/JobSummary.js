import * as React from "react";
import {useEffect, useState} from "react";
import canAssignToJob from "../canAssignToJob";
import SkillTable from "./SkillTable";

export default function JobSummary(props) {
    const className = ["job", "summary", props.status, "right"].join(" ");
    return <div className={className}
                onDragEnter={e => e.preventDefault()}
                onDragOver={e => e.preventDefault()}
                onDrop={(e) => {
                    const crewMember = JSON.parse(e.dataTransfer.getData("crewmember"));
                    if (canAssignToJob(crewMember, props)) {
                        const inEngineCm =props.engine.globals.crew.get().find(cm => cm.get().id.get() === crewMember.id).get();
                        inEngineCm.assignedJob.set(props.id);
                        const subscribed = inEngineCm.assignedJob.on("changed", function () {
                            props.assignedCrew.splice(props.assignedCrew.indexOf(crewMember.id));
                            subscribed.unsubscribe();
                        });
                        props.job.assignedCrew.push(crewMember.id);
                    }
                    e.preventDefault();
                }}
                onDropCapture={() => console.log("drop capture")}>
        <div className="container">{props.name}</div>
        <div className="container">
            <div className="gridItem">
                Assigned
            </div>
            <div className="gridItem">
                {props.assignedCrew ? props.assignedCrew.length : 0}
            </div>
        </div>
        <progress max={props.timeToComplete} value={props.progress}></progress>
        <SkillTable skills={props.job.requiredSkills}/>
    </div>
}