import React, {useEffect} from 'react';
import './App.css';
import {Engine, EngineConfiguration} from "javascript-idle-engine";
import Sidebar from "./components/Sidebar";
import {useState} from "react";
import CrewMemberSummary from "./components/CrewMemberSummary";
import JobSummary from "./components/JobSummary";
import ResourceBar from "./components/ResourceBar";
import jobCanProceed from "./jobCanProceed";
import jobCanInitiate from "./jobCanInitiate";

const crewMemberIds = [];

function crewMember(id, name, skills, portraitIcon) {
    if (typeof id !== "number") {
        throw new Error("Id must be number");
    }
    if (crewMemberIds.includes(id)) {
        throw new Error("Crew member Id " + id + " already used");
    }
    return EngineConfiguration.configProperty(
        {
            id,
            name,
            skills: EngineConfiguration.configProperty(skills),
            assignedJob: null,
            portraitIcon,
            accumulatedHeat: 0
        })
}

function job(id, name, skills, minCrew, maxCrew, consumedResources, onCompletionResources, timeToComplete, cooldownTime) {
    const config = EngineConfiguration.configProperty({
        id,
        name,
        requiredSkills: skills,
        minCrew,
        maxCrew,
        consumedResources,
        onCompletionResources,
        timeToComplete,
        cooldownTime: cooldownTime || timeToComplete,
        assignedCrew: [],
        status: EngineConfiguration.configProperty("", (current, parent, engine) => {
            const resources = engine.globals["resources"];
            const progress = parent.progress;
            const timeToComplete = parent.timeToComplete;
            const crewAssigned = parent.assignedCrew;
            if ((current == "cooldown" && progress > 0) ||
                current == "active" && !jobCanProceed(parent) ||
                progress >= timeToComplete) {
                return "cooldown";
            }
            if(progress == 0) {
                if( jobCanInitiate(parent, resources)) {
                    for (const resource in parent.consumedResources) {
                        const currentQuantity = resources[resource].quantity;
                        const amountToConsume = parent.consumedResources[resource];
                        resources[resource].quantity =(currentQuantity - amountToConsume);
                    }
                    return "active";
                } else if(crewAssigned.length) {
                    return "blocked";
                }
            }
            if(current == "active" && jobCanProceed(parent)) {
                return "active";
            }
            return "inactive";
        }),
        progress: EngineConfiguration.configProperty(0, (current, parent, engine) => {
            console.log(current);
            switch (parent.status) {
                case "cooldown":
                    const cooldownTime = parent.cooldownTime;
                    const timeToComplete = parent.timeToComplete;
                    return current - (timeToComplete / cooldownTime);
                case "active":
                    if (current + 1 >= parent.timeToComplete) {
                        const resources = parent.onCompletionResources;
                        Object.keys(resources)
                            .forEach(resourceName => {
                                const resource = engine.globals["resources"][resourceName];
                                resource.quantity = resources[resourceName] + resource.quantity;
                            });
                    }
                    return current + 1;
                default:
                    return 0
            }
        })
    });
    return config;
}

const config = new EngineConfiguration()
    .WithGlobalProperties({
        crew: {
            1: crewMember(1, "Steve", {combat: 1, stealth: 0, tech: 0, social: 0, magic: 0}, "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/922a0c75746643.5c551ca8dca2c.jpg"),
            2: crewMember(2, "Bub", {combat: 0, stealth: 1, tech: 0, social: 0, magic: 0}, "https://pbs.twimg.com/media/ELckiVoXsAAMAe0?format=jpg&name=4096x4096")
        },
        jobs: {
            shoplifting: job("shoplifting", "Shoplifting", {stealth: 1}, 1, 1, {}, {
                trivialGoods: 1
            }, 20, 10),
            fencing: job("fencing", "Fence Goods", {}, 1, 1, {
                trivialGoods: 1
            }, {
                nuyen: 1
            }, 10, 1),
            mugging: job("mugging", "Mugging", {combat:1}, 1, 999, {}, {
                nuyen:1
            }, 5, 30)
        },
        resources: EngineConfiguration.configProperty({
            nuyen: {
                name: "¥",
                quantity: 0
            },
            trivialGoods: {
                name: "Trivial Goods",
                quantity: 0
            }
        })
    });
const engine = new Engine(config);
engine.start();

function jobTranslator(job) {
    return {
        id: job.id,
        timeToComplete: job.timeToComplete,
        requiredSkills: job.requiredSkills,
        name: job.name,
        assignedCrew: job.assignedCrew,
        progress: job.progress,
        status: job.status,
        maxCrew: job.maxCrew
    }
}

function App(props) {
    const [expanded, setExpanded] = useState(false);
    const [jobs, setJobs] = useState(engine.globals.jobs);
    const [crew, setCrew] = useState(engine.globals.crew);
    const [resources, setResources] = useState(engine.globals.resources);
    const [beingDragged, setBeingDragged] = useState();
    useEffect(() => {
        const subscription = engine.globals["jobs"].watch(function (changedProperty, newJobs) {
            setJobs({...newJobs});
        });
        return () => subscription.unsubscribe();
    }, [setJobs]);
    // useEffect(() => {
    //     const subscription = engine.globals["crew"].on("changed", function (newCrew) {
    //         setCrew(newCrew);
    //     });
    // });
    // useEffect(() => {
    //     const sub = engine.globals["resources"].on("changed", resources => {
    //         setResources(resources);
    //     });
    //     return () => sub.unsubscribe();
    // }, [resources]);
    return (
        <div className="App" onMouseUp={() => {
            setBeingDragged(false)
        }} onDragEnd={() => {
            setBeingDragged(false)
        }}>
            <ResourceBar resources={resources}></ResourceBar>
            <div className="middle">
                <Sidebar side="left" expanded={expanded || beingDragged}
                         expand={() => setExpanded(true)}
                         collapse={() => setExpanded(false)}>
                    <div className="header">
                        Your Sick AF Crew
                    </div>
                    {Object.keys(crew).map(id => {
                        return <div data-augmented-ui-reset>
                            <CrewMemberSummary engine={engine} crewMember={engine.globals.crew[id]} setBeingDragged={(cm)=>{
                               setBeingDragged(cm);
                            }}/>
                        </div>
                    })}
                </Sidebar>
                <Sidebar side="right" expanded={expanded || beingDragged}
                         expand={() => setExpanded(true)}
                         collapse={() => setExpanded(false)}>
                    <div className="header">
                        Totally Rad Jobs
                    </div>
                    {Object.keys(jobs).map(jobId => {
                        return <JobSummary beingDragged={beingDragged} engine={engine} job={jobs[jobId]} />
                    })}
                </Sidebar>
            </div>
        </div>
    );
}

export default App;
