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
            const resources = engine.globals["resources"].get();
            const progress = parent.progress.get();
            const timeToComplete = parent.timeToComplete.get();
            if ((current == "cooldown" && progress > 0) ||
                current == "active" && !jobCanProceed(parent) ||
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
        crew: [
            crewMember(1, "Steve", {combat: 1, stealth: 1, tech: 1, social: 1, magic: 1}, "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/922a0c75746643.5c551ca8dca2c.jpg"),
            crewMember(2, "Bub", {combat: 1, stealth: 1, tech: 1, social: 1, magic: 1}, "https://pbs.twimg.com/media/ELckiVoXsAAMAe0?format=jpg&name=4096x4096" )
        ],
        jobs: {
            shoplifting: job("shoplifting", "Shoplifting", {stealth: 1}, 1, 1, {}, {
                trivialGoods: 1
            }, 20, 10),
            fencing: job("fencing", "Fence Goods", {social: 1}, 1, 1, {
                trivialGoods: 1
            }, {
                nuyen: 1
            }, 10, 1)
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
    })
const engine = new Engine(config);
engine.start();

function jobTranslator(job) {
    return {
        id: job.id.get(),
        timeToComplete: job.timeToComplete.get(),
        requiredSkills: job.requiredSkills.get(),
        name: job.name.get(),
        assignedCrew: job.assignedCrew.get(),
        progress: job.progress.get(),
        status: job.status.get(),
        maxCrew: job.maxCrew.get()
    }
}

function App(props) {
    const [expanded, setExpanded] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [jobs, setJobs] = useState(engine.globals.jobs.get());
    const [resources, setResources] = useState(engine.globals.resources.get());
    useEffect(() => {
        const subscription = engine.globals["jobs"].on("changed", function (newJobs) {
            const jobs = Object.keys(newJobs).reduce((jobs, job) => {
                const jobId = newJobs[job].id.get();
                jobs[jobId] = jobTranslator(newJobs[jobId]);
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
