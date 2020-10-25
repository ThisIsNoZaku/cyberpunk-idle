export default function CanAssignToJob(crewMember, job) {
    const hasSufficientSkill = sufficientSkill(crewMember.skills, job.requiredSkills);
    const jobFull = job.assignedCrew.length >= job.maxCrew;
    return hasSufficientSkill && !jobFull;
}

function sufficientSkill(crewMemberSkill, jobSkillRequirement) {
    if(jobSkillRequirement === undefined || jobSkillRequirement === undefined) {
        return true;
    }
    return Object.keys(jobSkillRequirement).reduce((allowed, nextSkill) => {
        const jobSkill = jobSkillRequirement[nextSkill].get();
        return allowed && (jobSkill === undefined || crewMemberSkill[nextSkill] >= jobSkill);
    }, true);
}