export default function CanAssignToJob(crewMember, job) {
    const hasSufficientSkill = sufficientSkill(crewMember.skills, job.requiredSkills);
    const jobFull = job.assignedCrew.length >= job.maxCrew;
    return hasSufficientSkill && !jobFull;
}

function sufficientSkill(crewMemberSkills, jobSkillRequirement) {
    if(jobSkillRequirement === undefined) {
        return true;
    }
    return Object.keys(jobSkillRequirement).reduce((meetsOtherSkillRequirements, nextSkill) => {
        const jobSkill = jobSkillRequirement[nextSkill];
        const crewMemberSkill = crewMemberSkills[nextSkill];
        const jobDoesntRequireSkill = jobSkill === undefined;
        const characterMeetsRequirement = crewMemberSkill >= jobSkill;
        return meetsOtherSkillRequirements && ( jobDoesntRequireSkill|| characterMeetsRequirement);
    }, true);
}