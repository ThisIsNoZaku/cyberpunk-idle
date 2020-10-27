import * as React from "react";
import {useEffect, useState} from "react";
import canAssignToJob from "../canAssignToJob";
import SkillTable from "./SkillTable";

export default function JobSummary(props) {
    const canDrop = props.beingDragged ? canAssignToJob(props.engine.globals.crew[props.beingDragged], props.job) : false;
    const className = ["job", "summary", canDrop ? "available" : props.job.status, "right"].join(" ");
    return <div className={className}
                data-augmented-ui="tr-chip br-chip tl-chip bl-chip border"
                onDragEnter={e => e.preventDefault()}
                onDragOver={e => e.preventDefault()}
                onDrop={(e) => {
                    const crewMember = JSON.parse(e.dataTransfer.getData("crewmember"));
                    const inEngineCm =props.engine.globals.crew[crewMember.id];
                    if (canAssignToJob(inEngineCm, props.job)) {
                        inEngineCm.assignedJob = props.id;
                        const subscribed = inEngineCm.watch(function (changedProperty) {
                            if(changedProperty === "assignedJob") {
                                props.job.assignedCrew.splice(props.job.assignedCrew.indexOf(crewMember.id));
                                subscribed.unsubscribe();
                            }
                        });
                        props.job.assignedCrew.push(crewMember.id);
                    }
                    e.preventDefault();
                }}
                onDropCapture={() => console.log("drop capture")}>
        <div className="container">{props.job.name}</div>
        <div className="container">
            <div className="gridItem">
                Assigned
            </div>
            <div className="gridItem">
                {props.job.assignedCrew ? props.job.assignedCrew.length : 0}
            </div>
        </div>
        <progress max={props.job.timeToComplete} value={props.job.progress}></progress>
        <SkillTable skills={props.job.requiredSkills}/>
    </div>
}