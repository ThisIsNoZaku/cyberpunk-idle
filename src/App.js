import React, {useEffect} from 'react';
import './App.css';
import {Engine, EngineConfiguration} from "javascript-idle-engine";
import Sidebar from "./components/Sidebar";
import Jobs from "./components/Jobs";
import {useState} from "react";
import CrewMemberSummary from "./components/CrewMemberSummary";
import JobSummary from "./components/JobSummary";
import ResourceBar from "./components/ResourceBar";
import jobCanProceed from "./jobCanProceed";
import jobCanInitiate from "./jobCanInitiate";

const crewMemberIds = [];

function crewMember(id, name, skills) {
    if (typeof id !== "number") {
        throw new Error("Id must be number");
    }
    if (crewMemberIds.includes(id)) {
        throw new Error("Crew member Id " + id + " already used");
    }
    return {
        startingValue: {
            id,
            name,
            skills: {
                startingValue: skills
            },
            assignedJob: null
        }
    }
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
            const resources = engine.globals["resources"].get();
            const progress = parent.get().progress.get();
            const timeToComplete = parent.get().timeToComplete.get();
            if ((current == "cooldown" && progress > 0) ||
                current == "active" && !jobCanProceed(parent.get()) ||
                progress >= timeToComplete) {
                return "cooldown";
            }
            if(progress == 0 && jobCanInitiate(parent.get(), resources)) {
                for(const resource in parent.get().consumedResources.get()) {
                    const currentQuantity = resources[resource].get().quantity.get();
                    const amountToConsume = parent.get().consumedResources.get()[resource].get();
                    resources[resource].get().quantity.set(currentQuantity - amountToConsume);
                }
                return "active";
            }
            if(current == "active" && jobCanProceed(parent.get())) {
                return "active";
            }
            return "inactive";
        }),
        progress: EngineConfiguration.configProperty(0, (current, parent, engine) => {
            switch (parent.get().status.get()) {
                case "cooldown":
                    const cooldownTime = parent.get().cooldownTime.get();
                    const timeToComplete = parent.get().timeToComplete.get();
                    return current - (timeToComplete / cooldownTime);
                case "active":
                    if (current + 1 >= parent.get().timeToComplete.get()) {
                        const resources = parent.get().onCompletionResources.get();
                        Object.keys(resources)
                            .forEach(resourceName => {
                                const resource = engine.globals["resources"].get()[resourceName].get();
                                resource.quantity.set(resources[resourceName].get() + resource.quantity.get());
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
        crew: [crewMember(1, "Steve", {combat: 1, stealth: 1, tech: 1, social: 1, magic: 1})],
        jobs: [
            job("shoplifting", "Shoplifting", {stealth: 1}, 1, 1, {}, {
                trivialGoods: 1
            }, 20, 10),
            job("fencing", "Fence Goods", {social: 1}, 1, 1, {
                trivialGoods: 1
            }, {
                nuyen: 1
            }, 10, 1)
        ],
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
    })
const engine = new Engine(config);
engine.start();

function App(props) {
    const [expanded, setExpanded] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [jobs, setJobs] = useState({});
    const [resources, setResources] = useState(engine.globals.resources.get());
    useEffect(() => {
        const subscription = engine.globals["jobs"].on("changed", function (newJobs) {
            const jobs = newJobs.reduce((jobs, job) => {
                const jobId = job.get().id.get();
                jobs[jobId] = {
                    id: job.get().id.get(),
                    timeToComplete: job.get().timeToComplete.get(),
                    requiredSkills: job.get().requiredSkills.get(),
                    name: job.get().name.get(),
                    assignedCrew: job.get().assignedCrew.get(),
                    progress: job.get().progress.get(),
                    status: job.get().status.get(),
                    maxCrew: job.get().maxCrew.get()
                };
                return jobs;
            }, {});
            setJobs(jobs);
        });
        return () => subscription.unsubscribe();
    }, [jobs]);
    useEffect(() => {
        const sub = engine.globals["resources"].on("changed", resources => {
            setResources(resources);
        });
        return () => sub.unsubscribe();
    }, [resources]);
    return (
        <div className="App" onMouseUp={() => setDragging(false)}>
            <ResourceBar resources={resources}></ResourceBar>
            <div className="middle">
                <Sidebar side="left" expanded={expanded || dragging}
                         expand={() => setExpanded(true)}
                         click={() => setDragging(true)}
                         collapse={() => setExpanded(false)}>
                    <div className="container">
                        Your Sick AF Crew
                    </div>
                    {engine.globals["crew"].get().map(crewContainer => {
                        const crew = crewContainer.get();
                        return <div data-augmented-ui-reset>
                            <CrewMemberSummary crewMember={crew}/>
                        </div>
                    })}
                </Sidebar>
                <Sidebar side="right" expanded={expanded || dragging}
                         expand={() => setExpanded(true)}
                         click={() => setDragging(true)}
                         collapse={() => setExpanded(false)}>
                    <div className="container">
                        Totally Rad Jobs
                    </div>
                    {Object.keys(jobs).map(jobId => {
                        const jobData = jobs[jobId];
                        return <JobSummary engine={engine} job={engine.globals.jobs[jobId]} {...jobData} />
                    })}
                </Sidebar>
            </div>
        </div>
    );
}

export default App;
